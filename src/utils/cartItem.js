function sortValue(value) {
  if (Array.isArray(value)) {
    return value.map(sortValue);
  }

  if (value && typeof value === "object") {
    return Object.keys(value)
      .sort()
      .reduce((acc, key) => {
        const nextValue = value[key];

        if (nextValue !== undefined) {
          acc[key] = sortValue(nextValue);
        }

        return acc;
      }, {});
  }

  return value;
}

export function getCartItemKey(item = {}) {
  return JSON.stringify({
    id: item.id ?? null,
    spicy: item.spicy ?? null,
    size: item.sizeKey ?? item.sizeLabel ?? null,
    options: sortValue(item.options || {}),
  });
}

function normalizeOptionValue(option) {
  if (!option) return "";
  if (typeof option === "string") return option;
  if (typeof option !== "object") return String(option);

  return option.label || option.name || option.value || "";
}

export function getCartItemVariantLabels(item = {}, lang = "en") {
  const labels = [];

  if (item.sizeLabel) {
    labels.push(item.sizeLabel);
  }

  if (item.spicy === true) {
    labels.push(lang === "ar" ? "حار" : "Spicy");
  }

  if (item.spicy === false) {
    labels.push(lang === "ar" ? "مش حار" : "Not Spicy");
  }

  Object.values(item.options || {})
    .map(normalizeOptionValue)
    .filter(Boolean)
    .forEach((option) => labels.push(option));

  return labels;
}

export function getCartItemVariantSuffix(item = {}, lang = "en") {
  return getCartItemVariantLabels(item, lang).join(", ");
}
