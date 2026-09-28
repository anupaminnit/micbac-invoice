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


## 2026-09-28 — Dead-code cleanup + bug audit

**Done** (index.html 443 KB → 320 KB, no behaviour change; e2e checks pass)
- Removed the unused jsPDF path: `buildDoc`, the jsPDF + autotable CDN scripts, and the `LOGO` base64 it alone used.
- Removed the unused `LH_LOGO` base64; the nav bar now reuses `LTR_LOGO` (the two logos were byte-identical).
- Removed the preview modal's dead iframe path (`previewFrame`, `_previewBlobUrl`, `if(false)` branch).
- Removed reads of the non-existent `notifyCountry` field, the unused `.tp`/`.tr` CSS, unused id attributes, and duplicate guards in the CSV/Excel export.

**Bug audit** — 19 issues found; top 6 fixed in the next session.

## 2026-09-28 — Bug fixes 1–6

**Done** (one commit each)
1. Escaped all user/Sheet data in the document builders, step-4 summary and Records table; record ids coerced to numbers in inline handlers.
2. Port restore via `restorePort` — matches by label, repairs already-corrupted records, clears the picker when a record has no port (also fixes the stale-POD issue).
3. Amount in words moved to `js/amount-words.js` with unit tests (`node --test`): lakh/crore for INR, million/billion otherwise; PENCE/FILS for GBP/AED.
4. Letter placeholder tagged with `.rte-ph`, never printed; empty letters can't be downloaded; button label restored correctly.
5. Record insert skipped when the same (type, number) was already saved with an identical form state (FNV hash in localStorage `micbac_saved_fp`).
6. Number series per type: `MIPLWB/` invoice, `MIPLWB/PI/` proforma, `MIPLWB/QT/` quotation; new FY restarts at 001; Clone asks the Sheet.

**Decisions / deviations**
- `js/amount-words.js` is the first file outside index.html — needed for unit tests; GitHub Pages serves it alongside.
- Duplicate-record guard is per browser (localStorage). A different device reprinting the same doc can still add a row; a server-side upsert in Code.gs would fix that but needs a redeploy.
- Historic quotations numbered `MIPLWB/NNN` stay in the Sheet and still count toward the invoice series max; no data was changed.

**Next — remaining audit items** — all fixed in the following session.

## 2026-09-28 — Remaining audit items (7–19)

**Done** (one commit each; 89 browser checks + 12 unit tests pass)
- Qty totals: `js/quantities.js` (unit-tested) — no float noise, totalled per unit ("28 METRIC TONNES + 18 BAGS").
- Documents: named consignee prints its own name/address; tax code under notify party; addresses keep line breaks; quotation prints Agent/Distributor; cleared Tolerance stays cleared.
- Progress-bar jumps validate every skipped step and land on the first incomplete one.
- Goods table escapes qty/rate/bags/weight (gap from the earlier escaping pass).
- Preview injects the sheets directly — packing list visible, no #s0/#s1 id clash.
- Invoice numbers normalised to upper-case (field on change, records, number tracking).
- Email Draft opens one window (the document) with an "Open Gmail draft" link in its toolbar — second popup was blocked by browsers.
- Letter fields included in Save/Load Draft; body sanitised on restore (`sanitizeRichText`); Sheet records omit letter fields.
- Letter date dd.mm.yyyy; `todayISO()` local-time helper replaces UTC/duplicated date code.

**Decisions**
- Email flow is now two clicks (save PDF, then "Open Gmail draft") — the only way both windows open reliably.
- Record fingerprints changed shape (letter fields excluded), so the first re-download of each already-saved doc after deploy adds one more row.

**Open / next**
- Invoice RATE column always says "/MT", even for rows in another unit (e.g. BAGS).

