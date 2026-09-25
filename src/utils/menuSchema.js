import { normalizeBranchKey } from "../services/branchSales.js";

export const DEFAULT_BRANCHES = ["mashaya", "gamaa"];
const VALID_BRANCHES = new Set(DEFAULT_BRANCHES);
const CDN_URL_PATTERN = /^https?:\/\/[^\s/]+(?:\/[^\s]*)?$/i;

function isFiniteNumber(value) {
  return typeof value === "number" ? Number.isFinite(value) : Number.isFinite(Number(value));
}

function parseValidPrice(value) {
  if (value === null || value === undefined || value === "") return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric >= 0 ? numeric : null;
}

function normalizeVariantLabel(key, index) {
  const normalizedKey = String(key || "").toLowerCase();
  if (normalizedKey.includes("single")) return { ar: "سنجل", en: "Single" };
  if (normalizedKey.includes("double")) return { ar: "دبل", en: "Double" };
  if (normalizedKey.includes("triple")) return { ar: "تريل", en: "Triple" };
  if (normalizedKey.includes("regular") || normalizedKey === "default" || normalizedKey === "normal") {
    return { ar: "عادي", en: "Regular" };
  }
  return index === 0 ? { ar: "الخيار الأول", en: "Option 1" } : { ar: "الخيار الثاني", en: "Option 2" };
}

export function toText(value, lang = "en") {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return "";
  return value[lang] || value.ar || value.en || value.fallback || Object.values(value)[0] || "";
}

export function getItemBranches(item = {}) {
  const rawBranches = item?.branches;

  if (Array.isArray(rawBranches) && rawBranches.length > 0) {
    const normalized = [...new Set(rawBranches.map((entry) => normalizeBranchKey(entry)).filter(Boolean))];
    return normalized.length > 0 ? normalized : [...DEFAULT_BRANCHES];
  }

  if (typeof rawBranches === "string" && rawBranches.trim()) {
    const normalized = normalizeBranchKey(rawBranches);
    return normalized ? [normalized] : [...DEFAULT_BRANCHES];
  }

  return [...DEFAULT_BRANCHES];
}

function normalizeVariantObject(variant, index) {
  if (!variant || typeof variant !== "object") return null;

  const numericPrice = parseValidPrice(variant.price);
  if (numericPrice === null) return null;

  return {
    id: String(variant.id || `variant-${index + 1}`),
    label: {
      ar: variant.label?.ar || variant.label?.en || normalizeVariantLabel(variant.id || String(index), index).ar,
      en: variant.label?.en || variant.label?.ar || normalizeVariantLabel(variant.id || String(index), index).en,
    },
    price: numericPrice,
  };
}

function normalizeLegacyPricesObject(rawPrices) {
  if (!rawPrices || typeof rawPrices !== "object" || Array.isArray(rawPrices)) return [];

  return Object.entries(rawPrices)
    .map(([key, value], index) => {
      const numericPrice = parseValidPrice(value);
      if (numericPrice === null) return null;

      const keyName = String(key || "").trim();
      const isDefault = keyName === "default" || keyName === "regular" || keyName === "normal";

      return {
        id: isDefault ? "default" : keyName || `variant-${index + 1}`,
        label: isDefault ? { ar: "عادي", en: "Regular" } : normalizeVariantLabel(keyName, index),
        price: numericPrice,
      };
    })
    .filter(Boolean);
}

function normalizeLegacyPriceValue(value) {
  const numericPrice = parseValidPrice(value);
  if (numericPrice === null) return [];
  return [{ id: "default", label: { ar: "عادي", en: "Regular" }, price: numericPrice }];
}

function buildPricingState(item = {}) {
  const variantsFromArray = Array.isArray(item?.variants)
    ? item.variants.map(normalizeVariantObject).filter(Boolean)
    : [];

  if (variantsFromArray.length > 0) {
    return { variants: variantsFromArray, errors: [] };
  }

  const hasLegacyPrice = item?.price !== null && item?.price !== undefined && item?.price !== "";
  const legacyPriceValue = parseValidPrice(item?.price);
  const legacyPrices = normalizeLegacyPricesObject(item?.prices);
  const hasLegacyPrices = legacyPrices.length > 0;

  if (hasLegacyPrice && hasLegacyPrices) {
    return {
      variants: [],
      errors: [{ message: "Ambiguous pricing: both price and prices are present." }],
      ambiguous: true,
    };
  }

  if (hasLegacyPrices) {
    return { variants: legacyPrices, errors: [] };
  }

  if (legacyPriceValue !== null) {
    return { variants: [{ id: "default", label: { ar: "عادي", en: "Regular" }, price: legacyPriceValue }], errors: [] };
  }

  return { variants: [], errors: [{ message: "Missing or invalid pricing" }] };
}

export function getItemVariants(item = {}) {
  return buildPricingState(item).variants;
}

export function getItemBasePrice(item = {}) {
  const variants = getItemVariants(item);
  const [first] = variants;
  return first?.price ?? null;
}

export function getItemSelectedPrice(item = {}) {
  const variants = getItemVariants(item);
  const selectedVariantId = item?.selectedVariant?.id ?? item?.sizeKey ?? item?.variantId;

  if (selectedVariantId !== undefined && selectedVariantId !== null) {
    const selectedVariant = variants.find((variant) => variant.id === String(selectedVariantId));
    if (selectedVariant) return selectedVariant.price;
  }

  return getItemBasePrice(item);
}

export function getVariantLabel(variant, lang = "en") {
  if (!variant || typeof variant !== "object") return "";
  if (typeof variant.label === "string") return variant.label;
  if (variant.label && typeof variant.label === "object") {
    return variant.label[lang] || variant.label.ar || variant.label.en || variant.id || "";
  }
  return variant.id || "";
}

export function isItemAvailableAtBranch(item = {}, branch) {
  if (item?.available === false) return false;

  const normalizedBranch = normalizeBranchKey(branch);
  if (!normalizedBranch) return true;

  const itemBranches = getItemBranches(item);
  if (itemBranches.length === 0) return true;

  return itemBranches.includes(normalizedBranch);
}

export function normalizeMenuItem(item = {}, fallbackLang = "en") {
  if (!item || typeof item !== "object") {
    return {
      id: "",
      category: "",
      name: { ar: "", en: "" },
      description: { ar: "", en: "", fallback: "" },
      imageUrl: "",
      variants: [],
      optionGroups: [],
      branches: [...DEFAULT_BRANCHES],
      available: true,
      sortOrder: 0,
      _legacy: {
        originalPrice: null,
        originalPrices: null,
        pricingErrors: ["Missing or invalid pricing"],
        fallbackLang,
      },
    };
  }

  const normalizedName =
    typeof item.name === "string"
      ? { ar: item.name, en: item.name }
      : {
          ar: item.name?.ar ?? item.name?.en ?? "",
          en: item.name?.en ?? item.name?.ar ?? "",
        };

  const normalizedDescription =
    typeof item.description === "string"
      ? { ar: item.description, en: item.description, fallback: item.description }
      : {
          ar: item.description?.ar ?? item.description?.en ?? item.description?.fallback ?? "",
          en: item.description?.en ?? item.description?.ar ?? item.description?.fallback ?? "",
          fallback: item.description?.fallback ?? item.description?.ar ?? item.description?.en ?? "",
        };

  const priceState = buildPricingState(item);
  const normalizedImageUrl = typeof item.imageUrl === "string" && CDN_URL_PATTERN.test(item.imageUrl.trim())
    ? item.imageUrl.trim()
    : "";

  return {
    ...item,
    id: item.id || "",
    category: item.category || "",
    name: normalizedName,
    description: normalizedDescription,
    imageUrl: normalizedImageUrl,
    image: normalizedImageUrl,
    variants: priceState.variants,
    branches: getItemBranches(item),
    optionGroups: Array.isArray(item.optionGroups) ? item.optionGroups : [],
    available: item.available !== false,
    sortOrder: Number(item.sortOrder ?? 0),
    price: undefined,
    prices: undefined,
    priceNote: item.priceNote ?? undefined,
    sizeNote: item.sizeNote ?? undefined,
    _legacy: {
      originalPrice: item.price ?? null,
      originalPrices: item.prices ?? null,
      pricingErrors: priceState.errors.map((entry) => entry.message),
      fallbackLang,
    },
  };
}

export function normalizeMenuData(items = []) {
  if (!Array.isArray(items)) return [];
  return items.map((item) => normalizeMenuItem(item));
}

export function buildBranchAssignmentReport(items = []) {
  const report = {
    total: Array.isArray(items) ? items.length : 0,
    explicitBranchAssignments: 0,
    implicitBranchAssignments: 0,
    itemsNeedingBranchReview: [],
  };

  if (!Array.isArray(items)) {
    return report;
  }

  items.forEach((item) => {
    const rawBranches = item?.branches;
    const hasExplicitBranches = Array.isArray(rawBranches)
      ? rawBranches.length > 0
      : typeof rawBranches === "string"
        ? rawBranches.trim().length > 0
        : false;

    if (hasExplicitBranches) {
      report.explicitBranchAssignments += 1;
      return;
    }

    report.implicitBranchAssignments += 1;
    report.itemsNeedingBranchReview.push({
      id: item?.id || "",
      category: item?.category || "",
      name: toText(item?.name, "en") || item?.id || "Unknown item",
      reason: "Missing branches field; defaulted to mashaya and gamaa for compatibility.",
    });
  });

  return report;
}

export function validateMenuData(items = []) {
  const errors = [];
  const seenIds = new Set();

  items.forEach((item, index) => {
    const normalized = normalizeMenuItem(item);
    const pricingState = buildPricingState(item);

    if (!normalized.id || !String(normalized.id).trim()) {
      errors.push({ index, field: "id", message: "Missing item id" });
    } else if (seenIds.has(normalized.id)) {
      errors.push({ index, field: "id", message: `Duplicate id: ${normalized.id}` });
    } else {
      seenIds.add(normalized.id);
    }

    if (!normalized.category || !String(normalized.category).trim()) {
      errors.push({ index, field: "category", message: `Missing category for item ${normalized.id || index}` });
    }

    if (!normalized.name?.ar && !normalized.name?.en) {
      errors.push({ index, field: "name", message: `Missing name for item ${normalized.id || index}` });
    }

    if (pricingState.variants.length === 0 || pricingState.errors.length > 0) {
      const hasAmbiguousPricing = pricingState.errors.some((entry) => entry.message.includes("Ambiguous pricing"));
      if (hasAmbiguousPricing) {
        errors.push({ index, field: "pricing", message: `Ambiguous pricing for item ${normalized.id || index}` });
      }
      errors.push({ index, field: "pricing", message: `Missing or invalid pricing` });
    }

    if (!normalized.variants.every((variant) => (
      variant.id &&
      variant.label?.ar !== undefined &&
      variant.label?.en !== undefined &&
      Number.isFinite(Number(variant.price)) &&
      Number(variant.price) > 0
    ))) {
      errors.push({ index, field: "variants", message: `Invalid variants for item ${normalized.id || index}` });
    }

    if (!Array.isArray(normalized.branches) || normalized.branches.length === 0) {
      errors.push({ index, field: "branches", message: `Invalid branches for item ${normalized.id || index}` });
    } else if (!normalized.branches.every((branch) => VALID_BRANCHES.has(branch))) {
      errors.push({ index, field: "branches", message: `Unsupported branch assignment for item ${normalized.id || index}` });
    }

    if (normalized.imageUrl && (typeof normalized.imageUrl !== "string" || !CDN_URL_PATTERN.test(normalized.imageUrl))) {
      errors.push({ index, field: "imageUrl", message: `Invalid imageUrl for item ${normalized.id || index}` });
    }

    if (!normalized.description || typeof normalized.description !== "object") {
      errors.push({ index, field: "description", message: `Invalid description for item ${normalized.id || index}` });
    }

    if (typeof normalized.available !== "boolean") {
      errors.push({ index, field: "available", message: `Invalid available value for item ${normalized.id || index}` });
    }

    if (!Array.isArray(normalized.optionGroups)) {
      errors.push({ index, field: "optionGroups", message: `Invalid optionGroups for item ${normalized.id || index}` });
    } else if (normalized.optionGroups.some((group) => (
      !group || typeof group !== "object" || !group.title || !Array.isArray(group.options)
    ))) {
      errors.push({ index, field: "optionGroups", message: `Invalid option group for item ${normalized.id || index}` });
    }

    if (normalized.sizeNote !== undefined && typeof normalized.sizeNote !== "string") {
      errors.push({ index, field: "sizeNote", message: `Invalid sizeNote for item ${normalized.id || index}` });
    }

    if (normalized.priceNote !== undefined && typeof normalized.priceNote !== "string") {
      errors.push({ index, field: "priceNote", message: `Invalid priceNote for item ${normalized.id || index}` });
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    count: items.length,
    branchReport: buildBranchAssignmentReport(items),
  };
}

export function validateCartForBranch(cart = [], branch) {
  const normalizedBranch = normalizeBranchKey(branch);

  if (!normalizedBranch) {
    return {
      valid: false,
      invalidItems: cart.map((item) => ({
        itemId: item?.id || "",
        itemName: toText(item?.name, "en") || item?.id || "Unknown item",
        allowedBranches: [...DEFAULT_BRANCHES],
        reason: "Invalid branch selection.",
      })),
      branch: null,
    };
  }

  const invalidItems = [];

  cart.forEach((item) => {
    if (!item) return;

    if (!isItemAvailableAtBranch(item, normalizedBranch)) {
      const allowedBranches = getItemBranches(item);
      invalidItems.push({
        itemId: item?.id || "",
        itemName: toText(item?.name, "en") || item?.id || "Unknown item",
        allowedBranches,
        branch: normalizedBranch,
        reason: `This item is only available at ${allowedBranches.join(" / ")}.`,
      });
    }
  });

  return {
    valid: invalidItems.length === 0,
    invalidItems,
    branch: normalizedBranch,
  };
}

export function getCartBranchConflicts(cart = [], branch) {
  return validateCartForBranch(cart, branch);
}

export function getItemPriceDisplay(item = {}, lang = "en") {
  const variants = getItemVariants(item);
  if (variants.length === 1) {
    return `${getItemBasePrice(item)} EGP`;
  }

  const labels = variants
    .map((variant) => `${getVariantLabel(variant, lang)} ${variant.price} EGP`)
    .join(" • ");

  return labels;
}
