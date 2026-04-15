# LeetCode-Style DSA Tracker

A clean, responsive, GitHub Pages-friendly web app to track Data Structures & Algorithms practice problems. It provides searchable/filterable problem lists, progress tracking, local status persistence, and personal notes.

## Features

- Pure **HTML + CSS + JavaScript** (no frameworks)
- Uses `data.json` for problem metadata (30+ problems included)
- Table view with columns for:
  - Problem
  - Pattern
  - Difficulty
  - Status (`Not Started`, `Revising`, `Mastered`)
  - Notes
- Search by problem name
- Filter by pattern and difficulty
- Sort by difficulty (Easy → Hard or Hard → Easy)
- Progress summary:
  - Total problems
  - Completed count
  - Completion percentage
  - Visual progress bar
- Dark mode toggle
- Status + notes persisted with `localStorage`
- Responsive layout for desktop and mobile

## Project Structure

- `index.html` – app layout and UI structure
- `style.css` – styles, theming, responsiveness
- `app.js` – rendering, filtering, sorting, state management
- `data.json` – DSA problem list data
- `README.md` – project documentation

## Run Locally

Because this app fetches `data.json`, run it with a local web server instead of opening `index.html` directly as a file.

### Option 1: Python

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

### Option 2: VS Code Live Server

Use the **Live Server** extension and open the project root.

## Deploy to GitHub Pages

1. Push this project to a GitHub repository.
2. On GitHub, go to **Settings → Pages**.
3. Under **Build and deployment**, choose:
   - **Source:** Deploy from a branch
   - **Branch:** `main` (or your default branch)
   - **Folder:** `/ (root)`
4. Save and wait for deployment.
5. GitHub will provide the live URL in the Pages settings.

## Data Customization

Edit `data.json` and add/remove objects in this format:

```json
{
  "problem": "Two Sum",
  "pattern": "Array + Hashing",
  "difficulty": "Easy"
}
```

Status and notes are user-specific and stored in browser `localStorage`, so they are not committed to the repository.
