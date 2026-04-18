/**
 * Google Apps Script — verify Google ID tokens + read/write Progress sheet.
 *
 * Sheet "Progress" columns: googleSub | problemKey | status | notes | updatedAt | noteFlag
 * Row 1 = headers (exact strings above). Legacy 5-column sheets: add column F with header noteFlag.
 *
 * Script properties (Project Settings → Script properties):
 *   GOOGLE_CLIENT_ID — OAuth Web client ID (same as frontend; used to validate token aud).
 *   SPREADSHEET_ID   — Google Sheet ID from URL.
 *
 * Deploy → New deployment → Web app:
 *   Execute as: Me
 *   Who has access: Anyone
 *
 * Put deployment URL in auth-config.js → syncWebAppUrl
 *
 * Logs: prefix "[DSA Sync]" — Apps Script project → Executions, or View → Logs.
 * User ids are redacted (last 6 chars of `sub` only); tokens and note text are never logged.
 */

var PROGRESS_SHEET = "Progress";
/** Columns A–F */
var PROGRESS_NUM_COLS = 6;
/** Google Sheets max characters per cell */
var MAX_NOTE_CHARS = 50000;
/** Allowed noteFlag slugs (must match client); empty string = none */
var ALLOWED_NOTE_FLAGS_ = {
  blue: true,
  green: true,
  grey: true,
  orange: true,
  purple: true,
  red: true,
  yellow: true,
};
var MAX_NOTE_FLAG_CHARS = 32;

/** Normalize noteFlag from client; unknown or too-long values become "". */
function sanitizeNoteFlag_(raw) {
  var s = String(raw != null ? raw : "").trim().toLowerCase();
  if (s.length > MAX_NOTE_FLAG_CHARS) return "";
  if (s === "") return "";
  return ALLOWED_NOTE_FLAGS_[s] ? s : "";
}

/** Ensure row 1 has noteFlag in column F (extends sheet if needed). */
function ensureProgressSheetShape_(sh) {
  var lastCol = sh.getLastColumn();
  var need = PROGRESS_NUM_COLS;
  if (lastCol < need) {
    sh.getRange(1, need).setValue("noteFlag");
  } else {
    var h = sh.getRange(1, need, 1, need).getValue();
    if (String(h).trim() === "") {
      sh.getRange(1, need).setValue("noteFlag");
    }
  }
}

/** Structured log for Apps Script Executions + View → Logs (does not log tokens or full notes). */
function syncLog_(message, detail) {
  var line = "[DSA Sync] " + String(message);
  if (detail != null) {
    try {
      line += " " + JSON.stringify(detail);
    } catch (_) {
      line += " [detail]";
    }
  }
  try {
    console.log(line);
  } catch (_) {
    /* ignore */
  }
  try {
    Logger.log(line);
  } catch (_) {
    /* ignore */
  }
}

/** Last 6 chars of Google `sub` for log correlation (avoid logging full identifiers). */
function redactSub_(sub) {
  var s = String(sub || "");
  if (s.length <= 6) return "(short)";
  return "…" + s.slice(-6);
}

/**
 * Sheets treats values starting with = + - @ as formulas. Prefix with ' to store literal text.
 * (Common when notes use markdown, bullets, or lines starting with =.)
 */
function escapeSheetCell_(text) {
  var s = String(text);
  if (s.length === 0) return s;
  var c = s.charAt(0);
  if (c === "=" || c === "+" || c === "-" || c === "@") {
    return "'" + s;
  }
  return s;
}

/**
 * One data row: Sheet.getRange(row, column, numRows, numColumns) — third arg is row COUNT, not end row.
 * Wrong: getRange(r,1,r,5) when r>1 selects r rows; use getRange(r,1,1,5) for exactly one row.
 */
function getOneRowRange_(sh, rowNum, numCols) {
  return sh.getRange(rowNum, 1, 1, numCols);
}

/** Force these cells to plain text so multiline code (lines starting with =, -, +, @) is not parsed as formulas. */
function setRowPlainTextFormat_(sh, rowNum, numCols) {
  var fmts = [];
  var row = [];
  for (var c = 0; c < numCols; c++) {
    row.push("@");
  }
  fmts.push(row);
  getOneRowRange_(sh, rowNum, numCols).setNumberFormats(fmts);
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    if (!e || !e.postData || !e.postData.contents) {
      syncLog_("doPost rejected", { reason: "empty_body" });
      return jsonOut({ ok: false, error: "Empty body" });
    }
    var body;
    try {
      body = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      syncLog_("doPost rejected", { reason: "invalid_json" });
      return jsonOut({ ok: false, error: "Invalid JSON body" });
    }
    var action = body.action;
    var idToken = body.idToken;
    if (!idToken) {
      syncLog_("doPost rejected", { reason: "missing_id_token", action: String(action || "") });
      return jsonOut({ ok: false, error: "Missing idToken" });
    }
    var user = verifyIdToken_(idToken);
    if (!user) {
      syncLog_("doPost rejected", { reason: "invalid_token", action: String(action || "") });
      return jsonOut({ ok: false, error: "Invalid token" });
    }
    var sub = user.sub;

    if (action === "pullProgress") {
      syncLog_("doPost pullProgress", { sub: redactSub_(sub) });
      return jsonOut(pullProgress_(sub));
    }
    if (action === "pushProgress") {
      var rowsIn = body.rows || [];
      syncLog_("doPost pushProgress", {
        sub: redactSub_(sub),
        incomingRows: rowsIn.length,
      });
      return jsonOut(pushProgress_(String(sub), rowsIn));
    }
    syncLog_("doPost rejected", { reason: "unknown_action", action: String(action || "") });
    return jsonOut({ ok: false, error: "Unknown action" });
  } catch (err) {
    var msg =
      err && err.message
        ? String(err.message)
        : err
          ? String(err)
          : "Unknown error";
    syncLog_("doPost error", { message: msg });
    return jsonOut({ ok: false, error: msg });
  } finally {
    lock.releaseLock();
  }
}

function verifyIdToken_(idToken) {
  var expectedAud = PropertiesService.getScriptProperties().getProperty(
    "GOOGLE_CLIENT_ID"
  );
  if (!expectedAud) {
    throw new Error("Set script property GOOGLE_CLIENT_ID");
  }
  var url =
    "https://oauth2.googleapis.com/tokeninfo?id_token=" +
    encodeURIComponent(idToken);
  var res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  var code = res.getResponseCode();
  if (code !== 200) {
    syncLog_("verifyIdToken failed", { http: code });
    return null;
  }
  var data = JSON.parse(res.getContentText());
  if (String(data.aud) !== String(expectedAud)) {
    syncLog_("verifyIdToken failed", { reason: "aud_mismatch" });
    return null;
  }
  return data;
}

function getSh_() {
  var id = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
  if (!id) {
    throw new Error("Set script property SPREADSHEET_ID");
  }
  return SpreadsheetApp.openById(id);
}

function pullProgress_(googleSub) {
  var sh = getSh_().getSheetByName(PROGRESS_SHEET);
  if (!sh) {
    syncLog_("pullProgress", { sub: redactSub_(googleSub), sheetMissing: true, rowsReturned: 0 });
    return { ok: true, rows: [] };
  }
  ensureProgressSheetShape_(sh);
  var values = sh.getDataRange().getValues();
  var rows = [];
  var skippedSubAsKey = 0;
  for (var r = 1; r < values.length; r++) {
    if (String(values[r][0]) !== String(googleSub)) continue;
    var pkPull = String(values[r][1] || "").trim();
    if (pkPull === String(googleSub)) {
      skippedSubAsKey++;
      continue;
    }
    var rowVals = values[r];
    var nf = "";
    if (rowVals.length > 5) {
      nf = sanitizeNoteFlag_(rowVals[5]);
    }
    rows.push({
      problemKey: pkPull,
      status: String(values[r][2] || "Not Started"),
      notes: String(values[r][3] || ""),
      updatedAt: String(values[r][4] || ""),
      noteFlag: nf,
    });
  }
  syncLog_("pullProgress done", {
    sub: redactSub_(googleSub),
    rowsReturned: rows.length,
    skippedSubAsProblemKey: skippedSubAsKey,
  });
  return { ok: true, rows: rows };
}

function pushProgress_(googleSub, incoming) {
  googleSub = String(googleSub);
  var sh = getSh_().getSheetByName(PROGRESS_SHEET);
  if (!sh) {
    sh = getSh_().insertSheet(PROGRESS_SHEET);
    sh.appendRow([
      "googleSub",
      "problemKey",
      "status",
      "notes",
      "updatedAt",
      "noteFlag",
    ]);
  } else {
    ensureProgressSheetShape_(sh);
  }
  var values = sh.getDataRange().getValues();
  var rowIndexByKey = {};
  for (var r = 1; r < values.length; r++) {
    if (String(values[r][0]) === googleSub) {
      rowIndexByKey[String(values[r][1] || "").trim()] = r + 1;
    }
  }

  var skippedEmpty = 0;
  var skippedSubAsPk = 0;
  var updated = 0;
  var inserted = 0;

  for (var i = 0; i < incoming.length; i++) {
    var row = incoming[i];
    var pk = String(row.problemKey || "").trim();
    if (!pk) {
      skippedEmpty++;
      continue;
    }
    /** Never treat the OAuth subject as a problem id (client bug or bad merge). */
    if (pk === googleSub) {
      skippedSubAsPk++;
      continue;
    }
    var status = String(row.status || "Not Started");
    var notes = String(row.notes != null ? row.notes : "");
    if (notes.length > MAX_NOTE_CHARS) {
      throw new Error(
        "Notes for \"" +
          pk +
          "\" exceed " +
          MAX_NOTE_CHARS +
          " characters (Google Sheets limit). Shorten the note and try again."
      );
    }
    var updatedAt = String(row.updatedAt || new Date().toISOString());
    var noteFlag = sanitizeNoteFlag_(row.noteFlag);
    var existingRow = rowIndexByKey[pk];
    var safeRow = [
      escapeSheetCell_(googleSub),
      escapeSheetCell_(pk),
      escapeSheetCell_(status),
      escapeSheetCell_(notes),
      escapeSheetCell_(updatedAt),
      escapeSheetCell_(noteFlag),
    ];
    if (existingRow) {
      setRowPlainTextFormat_(sh, existingRow, PROGRESS_NUM_COLS);
      getOneRowRange_(sh, existingRow, PROGRESS_NUM_COLS).setValues([safeRow]);
      updated++;
    } else {
      var newRowNum = sh.getLastRow() + 1;
      setRowPlainTextFormat_(sh, newRowNum, PROGRESS_NUM_COLS);
      getOneRowRange_(sh, newRowNum, PROGRESS_NUM_COLS).setValues([safeRow]);
      inserted++;
    }
  }
  syncLog_("pushProgress done", {
    sub: redactSub_(googleSub),
    incoming: incoming.length,
    written: updated + inserted,
    updated: updated,
    inserted: inserted,
    skippedEmpty: skippedEmpty,
    skippedSubAsProblemKey: skippedSubAsPk,
  });
  return { ok: true };
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
