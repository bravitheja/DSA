/**
 * Google Apps Script — verify Google ID tokens + read/write Progress sheet.
 *
 * Sheet "Progress" columns: googleSub | problemKey | status | notes | updatedAt
 * Row 1 = headers (exact strings above).
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
 */

var PROGRESS_SHEET = "Progress";

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonOut({ ok: false, error: "Empty body" });
    }
    var body = JSON.parse(e.postData.contents);
    var action = body.action;
    var idToken = body.idToken;
    if (!idToken) {
      return jsonOut({ ok: false, error: "Missing idToken" });
    }
    var user = verifyIdToken_(idToken);
    if (!user) {
      return jsonOut({ ok: false, error: "Invalid token" });
    }
    var sub = user.sub;

    if (action === "pullProgress") {
      return jsonOut(pullProgress_(sub));
    }
    if (action === "pushProgress") {
      return jsonOut(pushProgress_(sub, body.rows || []));
    }
    return jsonOut({ ok: false, error: "Unknown action" });
  } catch (err) {
    return jsonOut({ ok: false, error: "Server error" });
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
  if (res.getResponseCode() !== 200) {
    return null;
  }
  var data = JSON.parse(res.getContentText());
  if (String(data.aud) !== String(expectedAud)) {
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
    return { ok: true, rows: [] };
  }
  var values = sh.getDataRange().getValues();
  var rows = [];
  for (var r = 1; r < values.length; r++) {
    if (String(values[r][0]) !== String(googleSub)) continue;
    rows.push({
      problemKey: String(values[r][1] || ""),
      status: String(values[r][2] || "Not Started"),
      notes: String(values[r][3] || ""),
      updatedAt: String(values[r][4] || ""),
    });
  }
  return { ok: true, rows: rows };
}

function pushProgress_(googleSub, incoming) {
  var sh = getSh_().getSheetByName(PROGRESS_SHEET);
  if (!sh) {
    sh = getSh_().insertSheet(PROGRESS_SHEET);
    sh.appendRow(["googleSub", "problemKey", "status", "notes", "updatedAt"]);
  }
  var values = sh.getDataRange().getValues();
  var rowIndexByKey = {};
  for (var r = 1; r < values.length; r++) {
    if (String(values[r][0]) === String(googleSub)) {
      rowIndexByKey[String(values[r][1])] = r + 1;
    }
  }

  for (var i = 0; i < incoming.length; i++) {
    var row = incoming[i];
    var pk = String(row.problemKey || "").trim();
    if (!pk) continue;
    var status = String(row.status || "Not Started");
    var notes = String(row.notes != null ? row.notes : "");
    var updatedAt = String(row.updatedAt || new Date().toISOString());
    var existingRow = rowIndexByKey[pk];
    if (existingRow) {
      sh.getRange(existingRow, 1, existingRow, 5).setValues([
        [googleSub, pk, status, notes, updatedAt],
      ]);
    } else {
      sh.appendRow([googleSub, pk, status, notes, updatedAt]);
    }
  }
  return { ok: true };
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
