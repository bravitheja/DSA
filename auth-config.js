/**
 * Default (empty) config — no 404 when opening the app. Fill in for local dev, or rely on
 * GitHub Actions (secrets overwrite this file on deploy). See auth-config.example.js.
 */
window.__DSA_CONFIG__ = {
  googleClientId: "874606922470-4jjkok1e2ilitucb5ajfe3ffv9qicf7o.apps.googleusercontent.com",
  syncWebAppUrl: "https://script.google.com/macros/s/AKfycbwKIpVVn31rEqBIv1K9MWCRIjTkP197ZZAIMYE2VhU-FRnl8lOvKwRp6zzNw4Mf1SZ1/exec",
};

window.__DSA_AUTH__ = {
  enabled: false,
  mode: "none",
};
