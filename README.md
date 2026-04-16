# Advanced LeetCode-Style DSA Tracker

A static GitHub Pages-ready web app to track DSA preparation with richer interview metadata per problem.

## Features

- Pure **HTML/CSS/JavaScript** (no framework, no build step)
- Problem table with:
  - Problem (clickable LeetCode link)
  - Pattern
  - Sub Pattern
  - Difficulty badge
  - Frequency badge
  - Complexity
  - Status
  - Notes
- Tooltip with core idea/intuition when hovering problem name
- Search + filters for pattern, difficulty, company (interview data)
- Problems listed in curated frequency order (from the dataset)
- Progress dashboard with completion bar
- Dark mode toggle
- Column visibility toggles (show/hide selected columns)
- Local persistence using `localStorage` for:
  - status
  - notes
  - theme
  - column visibility

## Project Structure

- `index.html` – layout + controls + table template
- `style.css` – theme, responsiveness, badges, tooltip, table styles
- `app.js` – data loading, rendering, filters, sort, persistence
- `data.json` – editable problem dataset
- `README.md` – docs

## Data Format

Each problem in `data.json` supports:

```json
{
  "problem": "Two Sum",
  "pattern": "Hashing",
  "subPattern": "Complement lookup",
  "difficulty": "Easy",
  "frequency": "High",
  "complexity": "O(n) time | O(n) space",
  "coreIdea": "Use hashmap to find complement",
  "link": "https://leetcode.com/problems/two-sum"
}
```

Backward compatibility is built in: if any field is missing, defaults are used.

## Run Locally

Use a local server (required for `fetch("data.json")`):

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Deploy on GitHub Pages

1. Push this repo to GitHub.
2. Go to **Settings → Pages**.
3. Choose:
   - **Source:** Deploy from a branch
   - **Branch:** `main`
   - **Folder:** `/ (root)`
4. Save and wait for deployment URL.

## Dev Notes:

### Apps Script changes:
After you edit SyncWebApp.gs, use Deploy → Manage deployments → Edit → New version → Deploy so the web app URL keeps using the latest code.
### OAuth origins:
If you ever change the site URL (custom domain, different repo path), add that origin under the Web client’s Authorized JavaScript origins in Google Cloud.
### Sheet:
Your progress is in localStorage first; sync pushes/pulls against the sheet—useful to know if you clear browser data or use another device.

