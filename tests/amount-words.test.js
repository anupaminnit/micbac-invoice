// Run: node --test tests/
const test = require('node:test');
const assert = require('node:assert/strict');
const { amountInWords } = require('../js/amount-words.js');

test('small whole amounts', () => {
  assert.equal(amountInWords(0, 'USD'), 'US DOLLARS ZERO ONLY');
  assert.equal(amountInWords(7, 'USD'), 'US DOLLARS SEVEN ONLY');
  assert.equal(amountInWords(21, 'USD'), 'US DOLLARS TWENTY-ONE ONLY');
  assert.equal(amountInWords(100, 'USD'), 'US DOLLARS ONE HUNDRED ONLY');
  assert.equal(amountInWords(11760, 'USD'), 'US DOLLARS ELEVEN THOUSAND SEVEN HUNDRED SIXTY ONLY');
});

test('fractional part', () => {
  assert.equal(amountInWords(10.5, 'USD'), 'US DOLLARS TEN AND FIFTY CENTS ONLY');
  assert.equal(amountInWords(1.01, 'EUR'), 'EUROS ONE AND ONE CENTS ONLY');
  assert.equal(amountInWords(99.99, 'INR'), 'INDIAN RUPEES NINETY-NINE AND NINETY-NINE PAISE ONLY');
});

test('rounding never produces 100 minor units', () => {
  // 0.999 rounds up to the next whole unit rather than "ONE HUNDRED CENTS"
  assert.equal(amountInWords(0.999, 'USD'), 'US DOLLARS ONE ONLY');
  assert.equal(amountInWords(0.1 + 0.2, 'USD'), 'US DOLLARS ZERO AND THIRTY CENTS ONLY');
});

test('international scales (non-INR)', () => {
  assert.equal(amountInWords(2500000, 'USD'), 'US DOLLARS TWO MILLION FIVE HUNDRED THOUSAND ONLY');
  assert.equal(amountInWords(1000001, 'SGD'), 'SINGAPORE DOLLARS ONE MILLION ONE ONLY');
  assert.equal(amountInWords(3e9, 'USD'), 'US DOLLARS THREE BILLION ONLY');
});

test('Indian scales for INR (lakh / crore)', () => {
  // The old implementation printed "undefined HUNDRED THOUSAND" here
  assert.equal(amountInWords(2500000, 'INR'), 'INDIAN RUPEES TWENTY-FIVE LAKH ONLY');
  assert.equal(amountInWords(100000, 'INR'), 'INDIAN RUPEES ONE LAKH ONLY');
  assert.equal(amountInWords(12345678, 'INR'),
    'INDIAN RUPEES ONE CRORE TWENTY-THREE LAKH FORTY-FIVE THOUSAND SIX HUNDRED SEVENTY-EIGHT ONLY');
  assert.equal(amountInWords(1.5e9, 'INR'), 'INDIAN RUPEES ONE HUNDRED FIFTY CRORE ONLY');
});

test('currency minor-unit names', () => {
  assert.equal(amountInWords(1.5, 'GBP'), 'POUNDS STERLING ONE AND FIFTY PENCE ONLY');
  assert.equal(amountInWords(1.5, 'AED'), 'UAE DIRHAMS ONE AND FIFTY FILS ONLY');
});

test('unknown currency and bad input fall back safely', () => {
  assert.equal(amountInWords(5, 'XYZ'), 'US DOLLARS FIVE ONLY');
  assert.equal(amountInWords(NaN, 'USD'), 'US DOLLARS ZERO ONLY');
});
