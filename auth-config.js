/**
 * Default (empty) config — no 404 when opening the app. Fill in for local dev, or rely on
 * GitHub Actions (secrets overwrite this file on deploy). See auth-config.example.js.
 */
window.__DSA_CONFIG__ = {
  googleClientId: "",
  syncWebAppUrl: "",
};

window.__DSA_AUTH__ = {
  enabled: false,
  mode: "none",
};
