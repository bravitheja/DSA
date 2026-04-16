/**
 * Google Apps Script — deploy as Web app (POST) to validate logins against a private Sheet.
 *
 * Setup:
 * 1. New Google Sheet → tab name: Users
 *    Row 1 headers: username | passwordHash
 *    Add rows with lowercase username and passwordHash (see hashPassword_ below).
 * 2. Extensions → Apps Script → paste this file.
 * 3. Project Settings → Script properties → Add row: PEPPER = long random secret (same when hashing rows).
 * 4. Replace SPREADSHEET_ID with your Sheet ID (from URL).
 * 5. Deploy → New deployment → Web app:
 *    - Execute as: Me
 *    - Who has access: Anyone (anonymous POST from your GitHub Pages site)
 * 6. Copy Web app URL into auth-config.js → webAppUrl
 *
 * Generate passwordHash for a row (Run in Apps Script editor once per user, then paste hash into Sheet):
 *
 *   function debugHash() {
 *     Logger.log(hashPassword_("alice", "secret-password"));
 *   }
 *
 * Security: This is a lightweight gate, not banking-grade auth. Use strong PEPPER, private sheet,
 * and HTTPS only. Users who can edit the repo/session can still bypass client-side gates.
 *
 * CORS: Browsers may block fetch() from your Pages domain to script.google.com. If login fails
 * with a network/CORS error, use auth mode "demo" for testing, or host a tiny proxy (Cloudflare Worker),
 * or switch to Firebase Auth / Supabase.
 */

var SPREADSHEET_ID = "YOUR_SPREADSHEET_ID_HERE";
var USERS_SHEET_NAME = "Users";

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse_({ ok: false, error: "Bad request" });
    }
    var body = JSON.parse(e.postData.contents);
    var username = String(body.username || "")
      .trim()
      .toLowerCase();
    var password = String(body.password || "");
    if (!username || !password) {
      return jsonResponse_({ ok: false, error: "Missing fields" });
    }

    var expected = hashPassword_(username, password);
    var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(USERS_SHEET_NAME);
    var values = sheet.getDataRange().getValues();
    for (var r = 1; r < values.length; r++) {
      var u = String(values[r][0] || "")
        .trim()
        .toLowerCase();
      var h = String(values[r][1] || "").trim().toLowerCase();
      if (u === username && h === expected) {
        return jsonResponse_({ ok: true });
      }
    }
    return jsonResponse_({ ok: false, error: "Invalid credentials" });
  } catch (err) {
    return jsonResponse_({ ok: false, error: "Server error" });
  } finally {
    lock.releaseLock();
  }
}

function hashPassword_(username, password) {
  var pepper = PropertiesService.getScriptProperties().getProperty("PEPPER");
  if (!pepper) {
    throw new Error("Set Script property PEPPER");
  }
  var sig = Utilities.computeHmacSha256Signature(
    username + "|" + password,
    pepper
  );
  return bytesToHex_(sig);
}

function bytesToHex_(bytes) {
  var hex = "";
  for (var i = 0; i < bytes.length; i++) {
    var b = bytes[i] & 0xff;
    hex += (b < 16 ? "0" : "") + b.toString(16);
  }
  return hex.toLowerCase();
}

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
