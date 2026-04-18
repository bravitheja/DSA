/**
 * The repo includes auth-config.js (empty placeholders) so the app loads without 404s.
 * Edit auth-config.js for local Google sync, or set GitHub Secrets and let CI overwrite on deploy.
 * index.html loads: <script src="auth-config.js"></script>
 *
 * ── Secrets set but site still shows “Missing googleClientId”? ────────────────
 * GitHub Pages must be published from the Actions workflow, not from the branch.
 * Repo → Settings → Pages → Build and deployment → Source: “GitHub Actions”.
 * If it says “Deploy from a branch”, the live site uses the committed empty auth-config.js.
 * Then Actions → re-run “Deploy GitHub Pages”.
 *
 * ── Google Cloud ─────────────────────────────────────────────────────────────
 * 1. Google Cloud Console → APIs & Services → OAuth consent screen (External or Internal).
 * 2. Credentials → Create OAuth client ID → Web application.
 * 3. Authorized JavaScript origins (add your GitHub Pages URLs), e.g.:
 *      https://YOURNAME.github.io
 *      https://YOURNAME.github.io/YOUR-REPO/
 * 4. Copy the Client ID into googleClientId below.
 *
 * ── Apps Script (backend) ────────────────────────────────────────────────────
 * 1. New Google Sheet → tab "Progress" with header row:
 *      googleSub | problemKey | status | notes | updatedAt | noteFlag
 *    Existing 5-column sheets: add column F with header noteFlag (or deploy latest SyncWebApp.gs — it extends the sheet on first sync).
 * 2. Extensions → Apps Script → paste scripts/google-apps-script/SyncWebApp.gs
 * 3. Project Settings → Script properties (not in GitHub Secrets for the static site):
 *      GOOGLE_CLIENT_ID = same as googleClientId below
 *      SPREADSHEET_ID   = Sheet ID from the spreadsheet URL (between /d/ and /edit)
 * 4. Deploy → New deployment → Web app → Execute as: Me, Who has access: Anyone
 * 5. Copy the Web app URL into syncWebAppUrl below.
 *
 * ── Local dev (http://localhost) + CORS ───────────────────────────────────────
 * Add http://localhost:PORT to OAuth “Authorized JavaScript origins” for your dev server.
 * Use the Web app URL from Deploy → Manage deployments (ends with /exec) as syncWebAppUrl.
 *
 * ── Legacy optional password gate (blocks entire app until login) ────────────
 * Set window.__DSA_AUTH__ = { enabled: true, mode: "demo", ... } — see older docs.
 */

window.__DSA_CONFIG__ = {
  /** OAuth 2.0 Web client ID */
  googleClientId: "",

  /** Deployed SyncWebApp.gs URL */
  syncWebAppUrl: "",
};

/** Optional: block app behind username/password or demo hash (not required for Google sync). */
window.__DSA_AUTH__ = {
  enabled: false,
  mode: "none",
};
