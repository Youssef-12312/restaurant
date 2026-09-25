/* global require, exports */

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

initializeApp();
const db = getFirestore();

const BRANCHES = {
  mashaya: { lat: 31.047131947583605, lng: 31.372379203189183 },
  gamaa: { lat: 31.03632326743449, lng: 31.357770867506485 },
};
const VAT_RATE = 0.12;
const DELIVERY_FEE = 25;

function fail(message) {
  throw new HttpsError("invalid-argument", message);
}

function finiteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function money(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function text(value, field, max = 500) {
  if (typeof value !== "string" || value.trim().length === 0 || value.length > max) {
    fail(`Invalid ${field}`);
  }
  return value.trim();
}

function optionLabel(option) {
  if (typeof option === "string") return option;
  if (!option || typeof option !== "object") return null;
  return option.label ?? option.name ?? option.value ?? null;
}

function sameOptionLabel(left, right) {
  const leftValues = typeof left === "object" ? Object.values(left || {}) : [left];
  const rightValues = typeof right === "object" ? Object.values(right || {}) : [right];
  return leftValues.some((leftValue) =>
    rightValues.some((rightValue) => String(leftValue).trim() === String(rightValue).trim())
  );
}

function distanceInKm(lat1, lng1, lat2, lng2) {
  const radians = Math.PI / 180;
  const dLat = (lat2 - lat1) * radians;
  const dLng = (lng2 - lng1) * radians;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * radians) * Math.cos(lat2 * radians) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function closestBranch(lat, lng) {
  return distanceInKm(lat, lng, BRANCHES.mashaya.lat, BRANCHES.mashaya.lng) <=
    distanceInKm(lat, lng, BRANCHES.gamaa.lat, BRANCHES.gamaa.lng)
    ? "mashaya"
    : "gamaa";
}

function calculateItem(menuItem, requested) {
  if (!requested || typeof requested !== "object") fail("Invalid cart item");
  const productId = typeof requested.id === "string" ? requested.id : "";
  if (!productId || !menuItem || menuItem.id !== productId || menuItem.available === false) {
    fail("Unknown or unavailable product");
  }

  const quantity = requested.qty;
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) fail("Invalid quantity");

  let unitPrice;
  let sizeKey = null;
  if (menuItem.prices && typeof menuItem.prices === "object" && !Array.isArray(menuItem.prices)) {
    sizeKey = typeof requested.sizeKey === "string" ? requested.sizeKey : "";
    if (!sizeKey || !Object.prototype.hasOwnProperty.call(menuItem.prices, sizeKey)) {
      fail("Invalid size");
    }
    const sizePrice = menuItem.prices[sizeKey];
    if (sizePrice === null || sizePrice === "" || !Number.isFinite(Number(sizePrice)) || Number(sizePrice) < 0) {
      fail("Invalid size");
    }
    unitPrice = Number(sizePrice);
  } else {
    if (menuItem.price === null || menuItem.price === undefined || menuItem.price === "") {
      fail("Invalid product price");
    }
    unitPrice = Number(menuItem.price);
    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      fail("Invalid product price");
    }
  }

  const selected = requested.options && typeof requested.options === "object" ? requested.options : {};
  const snapshots = {};
  for (const [groupKey, requestedOption] of Object.entries(selected)) {
    if (requestedOption == null) continue;
    const group = Array.isArray(menuItem.optionGroups) ? menuItem.optionGroups[Number(groupKey)] : null;
    if (!group || !Array.isArray(group.options)) fail("Invalid option group");
    const matched = group.options.find((option) => sameOptionLabel(optionLabel(requestedOption), optionLabel(option)));
    if (matched === undefined) fail("Invalid option");
    const hasExtra = matched && typeof matched === "object" && Object.prototype.hasOwnProperty.call(matched, "extra");
    const rawExtra = hasExtra ? matched.extra : 0;
    const extra = Number(rawExtra);
    if (rawExtra === null || rawExtra === "" || !Number.isFinite(extra) || extra < 0) {
      fail("Invalid option price");
    }
    const label = optionLabel(matched);
    snapshots[groupKey] = label;
    unitPrice += extra;
  }

  return {
    productId,
    name: menuItem.name,
    sizeKey,
    sizeLabel: sizeKey ? sizeKey.charAt(0).toUpperCase() + sizeKey.slice(1) : null,
    spicy: requested.spicy === true || requested.spicy === false ? requested.spicy : null,
    options: snapshots,
    qty: quantity,
    price: money(unitPrice),
    quantity,
    unitPrice: money(unitPrice),
    lineTotal: money(unitPrice * quantity),
  };
}

exports.createOrder = onCall({
  region: "us-central1",
  enforceAppCheck: false,
  cors: [
    "http://localhost:5173",
    "https://shelter-restaurant1.vercel.app"
  ]
}, async (request) => {  const data = request.data || {};
  const customerName = text(data.customerName, "customer name", 120);
  const orderType = data.orderType;
  if (!["delivery", "pickup", "dine-in"].includes(orderType)) fail("Invalid order type");
  const requestedItems = Array.isArray(data.items) ? data.items : [];
  if (requestedItems.length === 0 || requestedItems.length > 50) fail("Invalid items");

  const menuSnapshot = await db.doc("menu_v2/active_menu").get();
  if (!menuSnapshot.exists || !Array.isArray(menuSnapshot.data().items)) {
    throw new HttpsError("failed-precondition", "Menu is unavailable");
  }
  const menuById = new Map(menuSnapshot.data().items.map((item) => [item.id, item]));
  const items = requestedItems.map((item) => calculateItem(menuById.get(item?.id), item));
  const subtotal = money(items.reduce((sum, item) => sum + item.lineTotal, 0));
  const vat = money(subtotal * VAT_RATE);

  let branch;
  let table = null;
  let tableToken = null;
  if (orderType === "delivery") {
    if (!finiteNumber(data.lat) || !finiteNumber(data.lng)) fail("Location is required");
    branch = closestBranch(data.lat, data.lng);
  } else if (orderType === "pickup") {
    if (!["mashaya", "gamaa"].includes(data.branch)) fail("Invalid branch");
    branch = data.branch;
  } else {
    tableToken = text(data.tableToken, "table token", 200);
    const tableSnapshot = await db.doc(`tables/${tableToken}`).get();
    if (!tableSnapshot.exists) fail("Invalid table");
    const tableData = tableSnapshot.data();
    branch = tableData.branch;
    table = Number(data.table);
    if (!["mashaya", "gamaa"].includes(branch) || !Number.isInteger(table) || tableData.table !== table) {
      fail("Invalid table assignment");
    }
  }

  const deliveryFee = orderType === "delivery" ? DELIVERY_FEE : 0;
  const total = money(subtotal + vat + deliveryFee);
  if (total < 100) fail("Minimum order is 100 EGP");

  const orderRef = db.collection("orders").doc();
  const counterRef = db.doc("counters/orderNumbers");
  let orderNumber;
  await db.runTransaction(async (transaction) => {
    const counter = await transaction.get(counterRef);
    const next = Number(counter.exists ? counter.data().next : 100000);
    orderNumber = String(next >= 100000 && next <= 999999 ? next : 100000);
    transaction.set(counterRef, { next: Number(orderNumber) + 1 }, { merge: true });
    transaction.set(orderRef, {
      orderNumber,
      customerName,
      phone: orderType === "dine-in" ? "" : text(data.phone, "phone", 30),
      address: orderType === "dine-in" ? "" : String(data.address || "").slice(0, 500),
      manualAddress: String(data.manualAddress || "").slice(0, 500),
      notes: String(data.notes || "").slice(0, 1000),
      orderType,
      table,
      branch,
      tableToken,
      items,
      subtotal,
      vat,
      deliveryFee,
      total,
      status: "new",
      createdAt: FieldValue.serverTimestamp(),
      lat: finiteNumber(data.lat) ? data.lat : null,
      lng: finiteNumber(data.lng) ? data.lng : null,
    });
  });

  return { orderId: orderRef.id, orderNumber };
});