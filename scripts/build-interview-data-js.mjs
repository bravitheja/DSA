/**
 * Embeds data/sheets/interview-tracker.json for file:// (fetch cannot load local files).
 * Run after generate-interview-sheets.mjs:
 *   node scripts/build-interview-data-js.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const trackerPath = path.join(root, "data", "sheets", "interview-tracker.json");
const out = path.join(root, "interview-data.js");

if (!fs.existsSync(trackerPath)) {
    console.error("Run: node scripts/generate-interview-sheets.mjs first");
    process.exit(1);
}

const tracker = JSON.parse(fs.readFileSync(trackerPath, "utf8"));
const banner =
    "/* Auto-generated from data/sheets/interview-tracker.json — run: node scripts/build-interview-data-js.mjs */\n";
fs.writeFileSync(out, `${banner}window.__INTERVIEW_SHEETS = { tracker: ${JSON.stringify(tracker)} };\n`);
console.log(`Wrote ${path.relative(root, out)} (${(fs.statSync(out).size / 1024).toFixed(1)} KB)`);
