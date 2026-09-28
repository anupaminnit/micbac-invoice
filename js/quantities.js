// Quantity formatting for document totals.
// Loaded by index.html as a plain <script> (defines globals) and by the node
// tests via module.exports.
(function (root) {
  // Up to 3 decimals, trailing zeros dropped: 0.1+0.2 → "0.3", 28 → "28".
  // Summing float inputs otherwise prints "0.30000000000000004".
  function fmtQty(n) {
    const v = Number(n);
    if (!isFinite(v)) return '0';
    return String(Math.round(v * 1000) / 1000);
  }

  // "28 METRIC TONNES", or "28 METRIC TONNES + 35 BAGS" when rows use different
  // units — adding tonnes to bags into one number would be meaningless.
  // items: [{qty, unit}] with unit already upper-cased; order of first appearance kept.
  function qtyTotalText(items) {
    const totals = new Map();
    for (const it of items) {
      const unit = String(it.unit || '').trim();
      totals.set(unit, (totals.get(unit) || 0) + (Number(it.qty) || 0));
    }
    if (!totals.size) return '0';
    return [...totals].map(([unit, qty]) => (fmtQty(qty) + ' ' + unit).trim()).join(' + ');
  }

  root.fmtQty = fmtQty;
  root.qtyTotalText = qtyTotalText;
  if (typeof module !== 'undefined' && module.exports) module.exports = { fmtQty, qtyTotalText };
})(typeof window !== 'undefined' ? window : globalThis);
