/**
 * Optional login gate (legacy) + optional Google sync (see sync.js + __DSA_CONFIG__).
 *
 * window.__DSA_AUTH__ (legacy password / demo gate — blocks app until login):
 * - enabled: false — no gate (default). App loads immediately; use Google sync from sidebar.
 * - mode: "appsScript" | "demo" — see auth-config.example.js
 *
 * @see scripts/google-apps-script/AuthWebApp.gs (legacy password auth)
 */
(function () {
    const SESSION_KEY = "dsa-auth-session";

    const cfg = window.__DSA_AUTH__ || { enabled: false };

    const overlay = document.getElementById("loginOverlay");
    const appRoot = document.getElementById("appRoot");
    const form = document.getElementById("loginForm");
    const errEl = document.getElementById("loginError");
    const submitBtn = document.getElementById("loginSubmit");
    const logoutBtn = document.getElementById("logoutBtn");

    function showError(msg) {
        if (!errEl) return;
        errEl.textContent = msg;
        errEl.hidden = !msg;
    }

    function showApp() {
        if (overlay) overlay.hidden = true;
        if (appRoot) appRoot.hidden = false;
        if (logoutBtn) logoutBtn.hidden = !cfg.enabled;
        const start = window.__DSA_START_APP__;
        const afterInit = () => {
            setTimeout(() => {
                if (typeof window.dsaInitGoogleSync === "function") {
                    window.dsaInitGoogleSync();
                }
            }, 0);
        };
        if (typeof start === "function") {
            const p = start();
            if (p && typeof p.then === "function") {
                p.then(afterInit).catch(afterInit);
            } else {
                afterInit();
            }
        } else {
            afterInit();
        }
    }

    function showLogin() {
        if (overlay) overlay.hidden = false;
        if (appRoot) appRoot.hidden = true;
        if (logoutBtn) logoutBtn.hidden = true;
    }

    function setSession() {
        try {
            sessionStorage.setItem(SESSION_KEY, "1");
        } catch (_) {
            /* ignore */
        }
    }

    function clearSession() {
        try {
            sessionStorage.removeItem(SESSION_KEY);
        } catch (_) {
            /* ignore */
        }
    }

    async function sha256Hex(str) {
        const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
        return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
    }

    async function loginDemo(password) {
        const expect = cfg.demoPasswordHex;
        if (!expect || typeof expect !== "string") {
            throw new Error("demoPasswordHex missing in auth config");
        }
        const got = await sha256Hex(password.trim());
        return got.toLowerCase() === expect.trim().toLowerCase();
    }

    async function loginAppsScript(username, password) {
        const url = cfg.webAppUrl;
        if (!url || typeof url !== "string") {
            throw new Error("webAppUrl missing in auth config");
        }
        const res = await fetch(url, {
            method: "POST",
            mode: "cors",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify({ username: username.trim(), password }),
        });
        const text = await res.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch {
            throw new Error(
                "Apps Script returned non-JSON. Check deployment URL and CORS (see AuthWebApp.gs comments)."
            );
        }
        if (!data.ok) {
            throw new Error(data.error || "Sign-in failed");
        }
        return true;
    }

    if (!cfg.enabled) {
        showApp();
        return;
    }

    if (cfg.mode === "demo") {
        const u = document.getElementById("loginUser");
        if (u) u.removeAttribute("required");
    }

    try {
        if (sessionStorage.getItem(SESSION_KEY) === "1") {
            showApp();
        } else {
            showLogin();
        }
    } catch (_) {
        showLogin();
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            clearSession();
            showError("");
            const pass = document.getElementById("loginPass");
            if (pass) pass.value = "";
            window.location.reload();
        });
    }

    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        showError("");
        const user = document.getElementById("loginUser")?.value || "";
        const pass = document.getElementById("loginPass")?.value || "";
        if (submitBtn) submitBtn.disabled = true;
        try {
            const mode = cfg.mode || "appsScript";
            let ok = false;
            if (mode === "demo") {
                ok = await loginDemo(pass);
                if (!ok) throw new Error("Invalid password");
            } else {
                ok = await loginAppsScript(user, pass);
            }
            if (ok) {
                setSession();
                showApp();
            }
        } catch (err) {
            showError(err instanceof Error ? err.message : "Sign-in failed");
        } finally {
            if (submitBtn) submitBtn.disabled = false;
        }
    });
})();
