// Amount-in-words for invoice totals.
// Loaded by index.html as a plain <script> (defines a global) and by the node
// tests via module.exports. INR uses the Indian system (lakh / crore); every
// other currency uses the international one (million / billion).
(function (root) {
  const ONES = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN',
    'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'];
  const TENS = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];
  const SCALES = {
    indian: [[1e7, 'CRORE'], [1e5, 'LAKH'], [1e3, 'THOUSAND']],
    intl:   [[1e9, 'BILLION'], [1e6, 'MILLION'], [1e3, 'THOUSAND']],
  };
  const CURRENCIES = {
    USD: ['US DOLLARS', 'CENTS'],
    EUR: ['EUROS', 'CENTS'],
    GBP: ['POUNDS STERLING', 'PENCE'],
    SGD: ['SINGAPORE DOLLARS', 'CENTS'],
    AED: ['UAE DIRHAMS', 'FILS'],
    INR: ['INDIAN RUPEES', 'PAISE'],
  };

  // 1..999
  function below1000(x) {
    const out = [];
    if (x >= 100) { out.push(ONES[Math.floor(x / 100)] + ' HUNDRED'); x %= 100; }
    if (x >= 20) out.push(TENS[Math.floor(x / 10)] + (x % 10 ? '-' + ONES[x % 10] : ''));
    else if (x > 0) out.push(ONES[x]);
    return out.join(' ');
  }

  function intWords(n, scales) {
    if (n === 0) return 'ZERO';
    const out = [];
    for (const [value, name] of scales) {
      if (n >= value) {
        // Recurse so amounts past the largest scale still read correctly,
        // e.g. 150 crore → "ONE HUNDRED FIFTY CRORE".
        out.push(intWords(Math.floor(n / value), scales) + ' ' + name);
        n %= value;
      }
    }
    if (n > 0) out.push(below1000(n));
    return out.join(' ');
  }

  function amountInWords(amount, currency) {
    const [unit, fracUnit] = CURRENCIES[currency] || CURRENCIES.USD;
    const scales = currency === 'INR' ? SCALES.indian : SCALES.intl;
    // Round once, in minor units, so 0.995-style float noise can't yield "100 CENTS".
    const minor = Math.round(Math.abs(Number(amount) || 0) * 100);
    const whole = Math.floor(minor / 100);
    const frac = minor % 100;
    return unit + ' ' + intWords(whole, scales)
      + (frac ? ' AND ' + intWords(frac, scales) + ' ' + fracUnit : '')
      + ' ONLY';
  }

  root.amountInWords = amountInWords;
  if (typeof module !== 'undefined' && module.exports) module.exports = { amountInWords };
})(typeof window !== 'undefined' ? window : globalThis);
