// Run: node --test
const test = require('node:test');
const assert = require('node:assert/strict');
const { fmtQty, qtyTotalText } = require('../js/quantities.js');

test('fmtQty strips float noise and trailing zeros', () => {
  assert.equal(fmtQty(0.1 + 0.2), '0.3');
  assert.equal(fmtQty(28), '28');
  assert.equal(fmtQty(28.5), '28.5');
  assert.equal(fmtQty(1.23456), '1.235');
  assert.equal(fmtQty(0), '0');
});

test('fmtQty tolerates bad input', () => {
  assert.equal(fmtQty(NaN), '0');
  assert.equal(fmtQty(undefined), '0');
  assert.equal(fmtQty(Infinity), '0');
});

test('qtyTotalText with a single unit', () => {
  assert.equal(qtyTotalText([{ qty: 0.1, unit: 'METRIC TONNES' }, { qty: 0.2, unit: 'METRIC TONNES' }]), '0.3 METRIC TONNES');
});

test('qtyTotalText groups mixed units in first-seen order', () => {
  assert.equal(
    qtyTotalText([
      { qty: 20, unit: 'METRIC TONNES' },
      { qty: 35, unit: 'BAGS' },
      { qty: 8, unit: 'METRIC TONNES' },
    ]),
    '28 METRIC TONNES + 35 BAGS');
});

test('qtyTotalText edge cases', () => {
  assert.equal(qtyTotalText([]), '0');
  assert.equal(qtyTotalText([{ qty: 5, unit: '' }]), '5');
  assert.equal(qtyTotalText([{ qty: 'x', unit: 'KILOGRAMS' }]), '0 KILOGRAMS');
});
