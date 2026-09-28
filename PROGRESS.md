# PROGRESS

## 2026-09-28 — Seal toggle, proforma invoice, quotation weighing unit

**Done**
- Global "Include seal & signature" checkbox (next to doc-type bar) — applies to Invoice, Quotation and Letter. Unticked → the stamp+signature image is replaced by an equally sized blank box, so the printed copy can be stamped/signed by hand without layout shift. Saved in drafts.
- Invoice Type select (Commercial / Proforma) on step ① — invoice only. Proforma: "PROFORMA INVOICE" title + footer, no packing list sheet, logged to the Sheet as `docType: proforma` (Records modal already had a style for it).
- Quotation "Weighing Unit" dropdown (MT / KGS / LBS) on the Goods step, replacing the old free-text "Weight Unit". Drives goods-table headers, row unit names, RATE/<unit>, qty-total unit, and gross/net weight units in the PDF. Old drafts with free-text units are normalised (e.g. "kgs" → KGS).
- Fixed preview modal appending the literal text "undefined" when there is no packing-list sheet (quotation, proforma).

**Decisions**
- Invoices stay hard-wired to MT; unit choice is quotation-only, as requested. Switching doc type relabels rows that use a stock unit name (METRIC TONNES / KILOGRAMS / POUNDS); custom units are untouched.
- Proforma shares the invoice numbering sequence (same `MIPLWB/NNN/FY` prefix). If proformas should not consume invoice numbers, give them their own prefix (e.g. `MIPLWB/PI/`) — the Sheet's `nextInvoiceNo` already handles any prefix.

**Known issues / next**
- `buildDoc` (jsPDF path) is dead code — nothing calls it. Candidate for removal.
- `restoreDraft` passes `polLabel` into `selectPort` as the label, so reloaded drafts show the port as "INCCU — Kolkata Port, India" (code duplicated into the value). Pre-existing; not fixed here.
