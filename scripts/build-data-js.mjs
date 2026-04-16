/**
 * Regenerates data.js from data.json so the app works when opened as file://
 * Run from repo root: node scripts/build-data-js.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const src = path.join(root, "data.json");
const out = path.join(root, "data.js");

const json = fs.readFileSync(src, "utf8");
JSON.parse(json);
const banner =
    "/* Auto-generated from data.json — run: node scripts/build-data-js.mjs */\n";
fs.writeFileSync(out, `${banner}window.__DSA_DATA = ${json};\n`);
console.log(`Wrote ${path.relative(root, out)} (${(fs.statSync(out).size / 1024).toFixed(1)} KB)`);
