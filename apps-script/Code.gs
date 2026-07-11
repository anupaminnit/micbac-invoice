// MICBAC Invoice Records — Google Apps Script Web App
// Deploy as: Execute as → Me | Who has access → Anyone
// After deploy, copy the Web App URL into index.html → APPS_SCRIPT_URL

const SHEET_NAME = 'Invoice Records';
const COLUMNS = ['id','createdAt','docType','invNo','invDate','buyer','amount','currency','pol','pod','items'];
const HEADERS  = ['ID','Created At','Doc Type','Invoice No.','Invoice Date','Buyer','Amount','Currency','POL','POD','Items'];

function doGet(e) {
  try {
    ensureSheet();
    const action = (e && e.parameter && e.parameter.action) || 'list';
    if (action === 'list') return listRecords();
    return json({ok: false, error: 'Unknown action'});
  } catch(err) {
    return json({ok: false, error: err.message});
  }
}

function doPost(e) {
  try {
    ensureSheet();
    const body = JSON.parse(e.postData.contents);
    if (body.action === 'insert') return insertRecord(body.record);
    if (body.action === 'delete') return deleteRecord(body.id);
    if (body.action === 'clear')  return clearAll();
    return json({ok: false, error: 'Unknown action'});
  } catch(err) {
    return json({ok: false, error: err.message});
  }
}

// ── helpers ────────────────────────────────────────────────────────────

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
}

function ensureSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
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
