import {
  doc,
  setDoc,
  increment,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { createEmptyBranchStats, normalizeBranchKey } from "./branchSales";

function getOrderDate(order) {
  return order.createdAt?.toDate?.() ?? new Date();
}

export function getMonthIdFromDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function getDateIdFromDate(date) {
  return `${getMonthIdFromDate(date)}-${String(date.getDate()).padStart(2, "0")}`;
}

function createSummaryBaseFields(date) {
  return {
    monthId: getMonthIdFromDate(date),
    dateId: getDateIdFromDate(date),
    dayNumber: date.getDate(),
  };
}

function buildSalesSummaryUpdate(order) {
  const date = getOrderDate(order);
  const monthId = getMonthIdFromDate(date);
  const ref = doc(db, "sales_summary", monthId);
  const total = Number(order.total ?? 0);
  const branch = normalizeBranchKey(order.branch);

  const update = {
    monthId,
    totalRevenue: increment(total),
    totalOrders: increment(1),
  };

  if (branch) {
    update[`branches.${branch}.revenue`] = increment(total);
    update[`branches.${branch}.orders`] = increment(1);
  }

  return { ref, update };
}

function buildDailySummaryUpdate(order) {
  const date = getOrderDate(order);
  const ref = doc(
    db,
    "sales_summary",
    getMonthIdFromDate(date),
    "days",
    getDateIdFromDate(date)
  );
  const total = Number(order.total ?? 0);
  const branch = normalizeBranchKey(order.branch);
  const update = {
    ...createSummaryBaseFields(date),
    totalRevenue: increment(total),
    totalOrders: increment(1),
    lastCompletedAt: serverTimestamp(),
  };

  if (branch) {
    update[`branches.${branch}.revenue`] = increment(total);
    update[`branches.${branch}.orders`] = increment(1);
  }

  return { ref, update };
}

function normalizeSnapshotBranches(branches = {}) {
  const empty = createEmptyBranchStats();

  for (const branchKey of Object.keys(empty)) {
    empty[branchKey] = {
      revenue: Number(branches?.[branchKey]?.revenue || 0),
      orders: Number(branches?.[branchKey]?.orders || 0),
    };
  }

  return empty;
}

export async function addOrderToSales(order) {
  const { ref, update } = buildSalesSummaryUpdate(order);
  await setDoc(ref, update, { merge: true });
}

export async function saveDailyOrdersSnapshot({
  date = new Date(),
  revenue = 0,
  orders = 0,
  cancelledOrders = 0,
  topItem = null,
  branches = {},
} = {}) {
  // ❌ منع الداتا الفاضية
  if (!orders || orders <= 0) {
    throw new Error("NO_ORDERS");
  }

  const monthId = getMonthIdFromDate(date);
  const dayId = getDateIdFromDate(date);

  const monthRef = doc(db, "sales_summary", monthId);
  const dayRef = doc(db, "sales_summary", monthId, "days", dayId);

  await runTransaction(db, async (transaction) => {
    const existing = await transaction.get(dayRef);

    // ❌ اليوم متقفل قبل كده
    if (existing.exists() && existing.data()?.closedAt) {
      throw new Error("ALREADY_CLOSED");
    }

    // ✅ save month meta
    transaction.set(
      monthRef,
      {
        monthId,
        lastSnapshotAt: serverTimestamp(),
      },
      { merge: true }
    );

    // ✅ save snapshot (مرة واحدة بس)
    transaction.set(dayRef, {
      ...createSummaryBaseFields(date),
      snapshot: {
        revenue: Number(revenue || 0),
        orders: Number(orders || 0),
        cancelledOrders: Number(cancelledOrders || 0),
        branches: normalizeSnapshotBranches(branches),
        topItem: topItem
          ? {
              name: topItem.name || "",
              qty: Number(topItem.qty || 0),
            }
          : null,
      },
      closedAt: serverTimestamp(),
      lastSnapshotAt: serverTimestamp(),
    });
  });
}

export async function completeOrderAndSaveToSales(orderId) {
  const orderRef = doc(db, "orders", orderId);

  await runTransaction(db, async (transaction) => {
    const orderSnap = await transaction.get(orderRef);

    if (!orderSnap.exists()) {
      throw new Error(`Order ${orderId} does not exist`);
    }

    const order = {
      id: orderSnap.id,
      ...orderSnap.data(),
    };
    const orderUpdate = {
      status: "completed",
    };

    if (!order.addedToSales) {
      const { ref: monthRef, update: monthUpdate } = buildSalesSummaryUpdate(order);
      const { ref: dayRef, update: dayUpdate } = buildDailySummaryUpdate(order);
      transaction.set(monthRef, monthUpdate, { merge: true });
      transaction.set(dayRef, dayUpdate, { merge: true });
      orderUpdate.addedToSales = true;
      orderUpdate.completedAt = serverTimestamp();
    }

    transaction.update(orderRef, orderUpdate);
  });
}
