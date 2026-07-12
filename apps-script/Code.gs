// MICBAC Invoice Records — Google Apps Script Web App
// Deploy as: Execute as → Me | Who has access → Anyone
// After deploy, copy the Web App URL into index.html → APPS_SCRIPT_URL
//
// SETUP: This is a standalone script, so you must point it at a spreadsheet.
// 1. Go to sheets.google.com → create a new sheet (name it anything)
// 2. Copy the ID from the URL:  .../spreadsheets/d/<ID>/edit
// 3. Paste it below as SPREADSHEET_ID, then save and redeploy.

const SPREADSHEET_ID = ''; // ← paste your Google Sheet ID here
const SHEET_NAME = 'Invoice Records';
// Must match APPS_SCRIPT_TOKEN in index.html exactly. Not a real secret (this
// repo is public) — it only stops the bare Web App URL, if it leaks on its
// own without the surrounding code, from granting read/wipe access by itself.
const TOKEN = 'de1345c4ac01c9d50cdd504003e5799fdcbf361b';
const COLUMNS = ['id','createdAt','docType','invNo','invDate','buyer','amount','currency','pol','pod','items','draftJson'];
const HEADERS  = ['ID','Created At','Doc Type','Invoice No.','Invoice Date','Buyer','Amount','Currency','POL','POD','Items','Draft JSON'];

function doGet(e) {
  try {
    if (!checkToken(e && e.parameter && e.parameter.token)) return json({ok: false, error: 'Unauthorized'});
    ensureSheet();
    const action = (e && e.parameter && e.parameter.action) || 'list';
    if (action === 'list') return listRecords();
    if (action === 'nextInvoiceNo') return nextInvoiceNo(e.parameter.prefix || 'MIPLWB/', e.parameter.fy || '');
    return json({ok: false, error: 'Unknown action'});
  } catch(err) {
    return json({ok: false, error: err.message});
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    if (!checkToken(body.token)) return json({ok: false, error: 'Unauthorized'});
    ensureSheet();
    if (body.action === 'insert') return insertRecord(body.record);
    if (body.action === 'delete') return deleteRecord(body.id);
    if (body.action === 'clear')  return clearAll();
    return json({ok: false, error: 'Unknown action'});
  } catch(err) {
    return json({ok: false, error: err.message});
  }
}

// ── helpers ────────────────────────────────────────────────────────────

// Fails closed: an empty TOKEN constant means every request is rejected,
// not accepted — you must set TOKEN before this deployment is usable.
function checkToken(t) {
  return !!TOKEN && t === TOKEN;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet() {
  return SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
}

function ensureSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  if (!ss.getSheetByName(SHEET_NAME)) {
    const sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold')
      .setBackground('#0B0B0F').setFontColor('#C8F23A');
    sheet.setColumnWidth(1, 130);
    sheet.setColumnWidth(2, 160);
    sheet.setColumnWidth(4, 160);
    sheet.setColumnWidth(6, 200);
  }
}

// ── operations ─────────────────────────────────────────────────────────

function listRecords() {
  const sheet = getSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return json({ok: true, records: []});

  const values = sheet.getRange(2, 1, lastRow - 1, COLUMNS.length).getValues();
  const records = values
    .map(row => {
      const rec = {};
      COLUMNS.forEach((col, i) => rec[col] = row[i]);
      return rec;
    })
    .filter(r => r.id)   // skip any empty rows
    .reverse();           // most recent first

  return json({ok: true, records});
}

// Scans existing invNo values for "<prefix><NNN>/<fy>" and returns the next
// sequence number — the Sheet is the source of truth, not the browser's
// localStorage, so numbering stays unique across devices/browsers.
function nextInvoiceNo(prefix, fy) {
  const sheet = getSheet();
  const lastRow = sheet.getLastRow();
  let maxSeq = 0;
  if (lastRow > 1) {
    const col = COLUMNS.indexOf('invNo') + 1;
    const invNos = sheet.getRange(2, col, lastRow - 1, 1).getValues().flat();
    const re = new RegExp('^' + escapeRegex(prefix) + '(\\d+)/' + escapeRegex(fy) + '$');
    invNos.forEach(v => {
      const m = String(v).match(re);
      if (m) { const n = parseInt(m[1], 10); if (n > maxSeq) maxSeq = n; }
    });
  }
  const next = String(maxSeq + 1).padStart(3, '0');
  return json({ok: true, invNo: prefix + next + '/' + fy});
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function insertRecord(rec) {
  const sheet = getSheet();
  sheet.appendRow(COLUMNS.map(col => rec[col] !== undefined ? rec[col] : ''));
  return json({ok: true});
}

function deleteRecord(id) {
  const sheet = getSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return json({ok: true});

  const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat();
  // id is stored as a number; coerce both sides for comparison
  const rowIdx = ids.findIndex(v => String(v) === String(id));
  if (rowIdx !== -1) sheet.deleteRow(rowIdx + 2); // +2: header + 0-index offset

  return json({ok: true});
}

function clearAll() {
  const sheet = getSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) sheet.deleteRows(2, lastRow - 1);
  return json({ok: true});
}
