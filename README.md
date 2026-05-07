# AlgoInsight – DSA Tracker, Notes & Interview Prep Workspace

AlgoInsight is a lightweight **Vanilla JS SPA** hosted on GitHub Pages for structured **DSA tracking**, **coding interview preparation**, and **note-driven productivity**.

- **Live Demo:** https://bravitheja.github.io/DSA/
- **Repository:** https://github.com/bravitheja/DSA

## Why AlgoInsight

AlgoInsight helps you move from random problem-solving to a focused interview workflow:
- Track solved progress and mastery by difficulty
- Filter by pattern/company/frequency to prioritize high-impact practice
- Capture rich notes and revision flags
- Use timer + sticky notes for deep-focus sessions

## Features

- Pure **HTML/CSS/JavaScript** (no framework migration)
- DSA tracker table with difficulty, complexity, frequency, and problem links
- Search + filters (pattern, difficulty, company, note flag)
- Per-problem rich notes + global general notes
- Timer and sticky note workflow for productivity
- Optional Google sign-in + sync
- SEO-ready metadata, sitemap, robots, and structured data for search discoverability

## Screenshots

> Add screenshots to an `assets/` folder and link them here.

Example markdown:

```md
![AlgoInsight dashboard](assets/screenshot-dashboard.png)
![AlgoInsight notes workflow](assets/screenshot-notes.png)
```

## SEO & Discoverability (GitHub Pages Compatible)

This project includes static SEO improvements designed for GitHub Pages:

- Semantic landing content crawlable before SPA interactions
- Canonical URL, robots directives, Open Graph, and Twitter card metadata
- JSON-LD `SoftwareApplication` schema
- `robots.txt`, `sitemap.xml`, and `llms.txt`
- Social preview placeholder (`assets/og-image.md`) with recommended OG dimensions

## Run Locally

Use a local server (required for `fetch("data.json")`):

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Deploy on GitHub Pages

1. Push this repo to GitHub.
2. Go to **Settings → Pages**.
3. Configure:
   - **Source:** Deploy from a branch
   - **Branch:** `main`
   - **Folder:** `/ (root)`
4. Save and wait for the Pages deployment URL.

## Notes

- Rich notes and sync flows continue to work with the existing architecture.
- No framework migration is required; all optimizations are static and lightweight.
