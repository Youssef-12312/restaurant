import fs from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildBranchAssignmentReport,
  getItemBasePrice,
  getItemSelectedPrice,
  getItemVariants,
  isItemAvailableAtBranch,
  normalizeMenuData,
  normalizeMenuItem,
  validateCartForBranch,
  validateMenuData,
} from './menuSchema.js';

const rawMenuData = JSON.parse(
  fs.readFileSync(new URL('../data/menu.json', import.meta.url), 'utf8')
);
const existingMenu = Array.isArray(rawMenuData.menu) ? rawMenuData.menu : rawMenuData;

test('normalizes legacy price into variants without losing value', () => {
  const item = normalizeMenuItem({
    id: 'sample-item',
    category: 'Chicken Burger',
    name: { ar: 'تشيكن', en: 'Chicken' },
    description: { ar: 'وصف', en: 'Description' },
    price: 120,
    available: true,
    branches: ['mashaya', 'gamaa'],
  });

  assert.deepEqual(getItemVariants(item), [
    {
      id: 'default',
      label: { ar: 'عادي', en: 'Regular' },
      price: 120,
    },
  ]);

  assert.equal(getItemBasePrice(item), 120);
});

test('preserves variant labels from legacy prices object', () => {
  const item = normalizeMenuItem({
    id: 'double-item',
    category: 'Beef Burger',
    name: { ar: 'برجر', en: 'Burger' },
    prices: { single: 165, double: 210 },
    available: true,
    branches: ['gamaa'],
  });

  const variants = getItemVariants(item);
  assert.equal(variants[0].id, 'single');
  assert.equal(variants[0].price, 165);
  assert.equal(variants[1].id, 'double');
  assert.equal(variants[1].price, 210);
});

test('resolves the selected variant price without legacy price fields', () => {
  const item = {
    id: 'selected-variant',
    variants: [
      { id: 'single', label: { ar: 'سنجل', en: 'Single' }, price: 165 },
      { id: 'double', label: { ar: 'دبل', en: 'Double' }, price: 210 },
    ],
    sizeKey: 'double',
  };

  assert.equal(getItemSelectedPrice(item), 210);
  assert.equal(getItemSelectedPrice({ ...item, selectedVariant: item.variants[0] }), 165);
});

test('rejects mixed branch cart for the wrong branch', () => {
  const cart = [
    { id: 'mashaya-only', name: 'Mashaya Item', branches: ['mashaya'], price: 50, qty: 1 },
    { id: 'gamaa-only', name: 'Gamaa Item', branches: ['gamaa'], price: 40, qty: 1 },
  ];

  const result = validateCartForBranch(cart, 'mashaya');
  assert.equal(result.valid, false);
  assert.equal(result.invalidItems.length, 1);
  assert.equal(result.invalidItems[0].itemId, 'gamaa-only');
});

test('branch checks respect item availability', () => {
  const item = normalizeMenuItem({
    id: 'branch-locked',
    category: 'Drinks',
    name: { ar: 'عصير', en: 'Juice' },
    branches: ['gamaa'],
    available: true,
    price: 30,
  });

  assert.equal(isItemAvailableAtBranch(item, 'mashaya'), false);
  assert.equal(isItemAvailableAtBranch(item, 'gamaa'), true);
});

test('final dataset is normalized and validates production menu data', () => {
  const normalized = normalizeMenuData(existingMenu);
  const validation = validateMenuData(normalized);

  assert.equal(normalized.length, 154);
  assert.equal(new Set(normalized.map((item) => item.id)).size, 154);
  assert.equal(validation.count, 154);
  assert.equal(validation.errors.filter((error) => error.message === 'Missing or invalid pricing').length, 0);

  for (const item of normalized) {
    assert.ok(item.id && String(item.id).trim());
    assert.ok(item.category && String(item.category).trim());
    assert.ok(item.name && (item.name.ar || item.name.en));
    assert.ok(Array.isArray(item.branches) && item.branches.length > 0);
    assert.ok(Array.isArray(item.optionGroups));
    assert.ok(Array.isArray(item.variants));
    assert.ok(item.variants.length > 0, `Missing variants for ${item.id}`);
    assert.ok(item.variants.every((variant) => Number(variant.price) > 0));
    assert.ok(item.variants.every((variant) => variant.label?.ar !== undefined && variant.label?.en !== undefined));
    assert.ok(item.branches.every((branch) => ['mashaya', 'gamaa'].includes(branch)));
    assert.ok(!item.branches.includes('university'));
    assert.ok(!('price' in item) || item.price === undefined);
    assert.ok(!('prices' in item) || item.prices === undefined);
    assert.ok(!item.imageUrl || /^https?:\/\/CDN-PLACEHOLDER\.example\/menu\/[^/]+\.webp$/.test(item.imageUrl));
    assert.ok(item.sizeNote === undefined || typeof item.sizeNote === 'string');
    assert.ok(item.priceNote === undefined || typeof item.priceNote === 'string');
    assert.ok(item.description && (item.description.ar !== undefined || item.description.en !== undefined || item.description.fallback !== undefined));
  }

  assert.deepEqual(validation.errors, []);
});

test('real dataset preserves pricing and metadata during migration', () => {
  const normalized = normalizeMenuData(existingMenu);

  for (const legacyItem of existingMenu) {
    const normalizedItem = normalized.find((item) => item.id === legacyItem.id);
    assert.ok(normalizedItem, `Missing normalized item for ${legacyItem.id}`);

    assert.equal(normalizedItem.category, legacyItem.category);
    assert.equal(normalizedItem.id, legacyItem.id);
    assert.ok(normalizedItem.name && (normalizedItem.name.ar || normalizedItem.name.en));
    assert.deepEqual(Array.isArray(normalizedItem.optionGroups) ? normalizedItem.optionGroups : [], Array.isArray(legacyItem.optionGroups) ? legacyItem.optionGroups : []);
    assert.equal(normalizedItem.sizeNote ?? undefined, legacyItem.sizeNote ?? undefined);
    assert.equal(normalizedItem.priceNote ?? undefined, legacyItem.priceNote ?? undefined);
    assert.ok(normalizedItem.description);
  }
});

test('final branch assignments distinguish Gamaa-only products from the normal menu', () => {
  const normalized = normalizeMenuData(existingMenu);
  const gamaaOnly = normalized.filter((item) => item.branches.length === 1 && item.branches[0] === 'gamaa');
  const both = normalized.filter((item) => item.branches.length === 2);

  assert.deepEqual(gamaaOnly.map((item) => item.id).sort(), ['cookie-dough', 'cookies']);
  assert.equal(both.length, 152);
  assert.equal(normalized.filter((item) => item.branches.includes('mashaya') && item.branches.length === 1).length, 0);
  assert.equal(buildBranchAssignmentReport(existingMenu).implicitBranchAssignments, 0);
});

test('final dataset does not depend on local menu image paths', () => {
  const normalized = normalizeMenuData(existingMenu);

  assert.ok(normalized.every((item) => !String(item.imageUrl || '').startsWith('/images/')));
  assert.ok(normalized.every((item) => !String(item.imageUrl || '').includes('/public/menu/')));
});
