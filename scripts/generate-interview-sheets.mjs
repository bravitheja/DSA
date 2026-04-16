/**
 * Builds slim JSON "sheets" for GitHub Pages from the full company_questions_by_url.json
 * + data.json (tracker curriculum). Run locally when interview data changes:
 *
 *   node scripts/generate-interview-sheets.mjs
 *
 * Env:
 *   INTERVIEW_JSON — path to company_questions_by_url.json (default: sibling repo path)
 *
 * Output (small, optimal for UI):
 *   data/sheets/interview-tracker.json — byUrl: stats + companies[] for each tracker link
 *   (Company filter builds from companies[]; no separate inverted index to avoid huge duplicate URL lists.)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const DEFAULT_INTERVIEW = path.join(
    root,
    "..",
    "leetcode-companywise-interview-questions",
    "company_questions_by_url.json"
);

function normalizeUrlKey(url) {
    let u = String(url ?? "")
        .trim()
        .replace(/\[|\]|\(.*\)/g, "")
        .trim();
    for (const sep of ["#", "?"]) {
        if (u.includes(sep)) u = u.split(sep, 1)[0];
    }
    return u.replace(/\/+$/, "");
}

function main() {
    const interviewPath = process.env.INTERVIEW_JSON || DEFAULT_INTERVIEW;
    const dataJsonPath = path.join(root, "data.json");
    const outDir = path.join(root, "data", "sheets");

    if (!fs.existsSync(interviewPath)) {
        console.error(`Missing interview JSON: ${interviewPath}`);
        console.error("Set INTERVIEW_JSON or place company_questions_by_url.json in the leetcode-companywise repo next to DSA.");
        process.exit(1);
    }

    console.log(`Reading ${interviewPath} (may take a few seconds)...`);
    const raw = fs.readFileSync(interviewPath, "utf8");
    const byUrlFull = JSON.parse(raw);

    const tracker = JSON.parse(fs.readFileSync(dataJsonPath, "utf8"));
    if (!Array.isArray(tracker)) {
        throw new Error("data.json must be an array");
    }

    const byUrl = {};

    for (const item of tracker) {
        const urlKey = normalizeUrlKey(item.link || "");
        if (!urlKey) continue;

        const row = byUrlFull[urlKey];
        if (!row) {
            byUrl[urlKey] = {
                matched: false,
                appearance_count: 0,
                company_count: 0,
                appearance_frequency_pct: 0,
                companies: [],
            };
            continue;
        }

        const sources = Array.isArray(row.sources) ? row.sources : [];
        const companies = [
            ...new Set(
                sources.map((s) => String(s.company || "").toLowerCase().trim()).filter(Boolean)
            ),
        ].sort();

        byUrl[urlKey] = {
            matched: true,
            appearance_count: row.appearance_count ?? 0,
            company_count: row.company_count ?? companies.length,
            appearance_frequency_pct: row.appearance_frequency_pct ?? 0,
            companies,
        };
    }

    fs.mkdirSync(outDir, { recursive: true });

    const meta = {
        generated: new Date().toISOString(),
        sourceFile: path.basename(interviewPath),
        trackerRows: tracker.length,
        urlsWithInterviewData: Object.values(byUrl).filter((x) => x.matched).length,
    };

    const trackerPath = path.join(outDir, "interview-tracker.json");
    fs.writeFileSync(
        trackerPath,
        JSON.stringify({ __meta: meta, byUrl }, null, 2),
        "utf8"
    );

    console.log(`Wrote ${path.relative(root, trackerPath)}`);
    console.log(meta);
}

main();
