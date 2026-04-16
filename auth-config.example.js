/**
 * Copy to auth-config.js (gitignored) and add as the FIRST script in index.html:
 *   <script src="auth-config.js"></script>
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
 *      googleSub | problemKey | status | notes | updatedAt
 * 2. Extensions → Apps Script → paste scripts/google-apps-script/SyncWebApp.gs
 * 3. Project Settings → Script properties (not in GitHub Secrets for the static site):
 *      GOOGLE_CLIENT_ID = same as googleClientId below
 *      SPREADSHEET_ID   = Sheet ID from the spreadsheet URL (between /d/ and /edit)
 * 4. Deploy → New deployment → Web app → Execute as: Me, Who has access: Anyone
 * 5. Copy the Web app URL into syncWebAppUrl below.
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
