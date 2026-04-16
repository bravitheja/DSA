/**
 * Google Sign-In + optional cloud sync (Google Apps Script → Sheets).
 * Local-first: localStorage is updated immediately; push is debounced.
 *
 * Requires window.__DSA_CONFIG__ from auth-config.js:
 *   googleClientId, syncWebAppUrl
 *
 * @see scripts/google-apps-script/SyncWebApp.gs
 */
(function () {
    const TRACKER_KEY = "dsa-tracker-state-v4";
    const TOKEN_KEY = "dsa-google-id-token";
    const DEBOUNCE_MS = 4000;

    const cfg = window.__DSA_CONFIG__ || {};

    let pushTimer = null;
    /** @type {Set<string>} */
    const dirty = new Set();

    function getToken() {
        try {
            return localStorage.getItem(TOKEN_KEY);
        } catch (_) {
            return null;
        }
    }

    function mergeCloudIntoLocalStorage(rows) {
        if (!Array.isArray(rows) || !rows.length) return;
        let state = {};
        try {
            state = JSON.parse(localStorage.getItem(TRACKER_KEY) || "{}");
        } catch (_) {
            state = {};
        }
        for (const r of rows) {
            const key = String(r.problemKey || "").trim();
            if (!key) continue;
            const prev = state[key] || {};
            const prevTs = prev.updatedAt ? Date.parse(prev.updatedAt) : 0;
            const remoteTs = r.updatedAt ? Date.parse(r.updatedAt) : 0;
            if (remoteTs >= prevTs) {
                state[key] = {
                    status: r.status || "Not Started",
                    notes: r.notes != null ? String(r.notes) : "",
                    updatedAt: r.updatedAt || new Date().toISOString(),
                };
            }
        }
        try {
            localStorage.setItem(TRACKER_KEY, JSON.stringify(state));
        } catch (_) {
            /* ignore */
        }
    }

    async function api(payload) {
        const url = cfg.syncWebAppUrl;
        if (!url || typeof url !== "string") {
            throw new Error("syncWebAppUrl missing");
        }
        const res = await fetch(url, {
            method: "POST",
            mode: "cors",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify(payload),
        });
        const text = await res.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch {
            throw new Error("Sync server returned non-JSON");
        }
        if (!data.ok) {
            throw new Error(data.error || "Sync request failed");
        }
        return data;
    }

    /**
     * Called from app.js init before normalizeProblemData — reloads trackerState from disk after merge.
     */
    window.dsaMergeCloudBeforeNormalize = async function dsaMergeCloudBeforeNormalize() {
        const token = getToken();
        if (!token || !cfg.syncWebAppUrl) return;
        try {
            const data = await api({ action: "pullProgress", idToken: token });
            if (data.rows && data.rows.length) {
                mergeCloudIntoLocalStorage(data.rows);
            }
        } catch (e) {
            console.warn("[DSA sync] Pull skipped or failed:", e);
        }
    };

    function buildRowsFromDirty() {
        let state = {};
        try {
            state = JSON.parse(localStorage.getItem(TRACKER_KEY) || "{}");
        } catch (_) {
            state = {};
        }
        const rows = [];
        for (const id of dirty) {
            const row = state[id];
            if (!row) continue;
            rows.push({
                problemKey: id,
                status: row.status || "Not Started",
                notes: row.notes != null ? String(row.notes) : "",
                updatedAt: row.updatedAt || new Date().toISOString(),
            });
        }
        return rows;
    }

    async function flushPush() {
        pushTimer = null;
        const token = getToken();
        if (!token || !cfg.syncWebAppUrl || dirty.size === 0) return;
        const rows = buildRowsFromDirty();
        if (!rows.length) {
            dirty.clear();
            return;
        }
        const keys = [...dirty];
        dirty.clear();
        try {
            await api({ action: "pushProgress", idToken: token, rows });
            setSyncStatus("Synced", false);
        } catch (e) {
            console.warn("[DSA sync] Push failed:", e);
            keys.forEach((k) => dirty.add(k));
            setSyncStatus("Sync failed — will retry", true);
        }
    }

    function flushPushKeepalive() {
        const token = getToken();
        if (!token || !cfg.syncWebAppUrl || dirty.size === 0) return;
        const rows = buildRowsFromDirty();
        if (!rows.length) return;
        dirty.clear();
        try {
            fetch(cfg.syncWebAppUrl, {
                method: "POST",
                mode: "cors",
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify({ action: "pushProgress", idToken: token, rows }),
                keepalive: true,
            }).catch(() => {});
        } catch (_) {
            /* ignore */
        }
    }

    window.dsaSchedulePush = function dsaSchedulePush(problemKey) {
        if (!getToken() || !cfg.syncWebAppUrl) return;
        dirty.add(problemKey);
        setSyncStatus("Saving…", false);
        clearTimeout(pushTimer);
        pushTimer = setTimeout(() => {
            flushPush();
        }, DEBOUNCE_MS);
    };

    window.addEventListener("pagehide", flushPushKeepalive);

    function setSyncStatus(text, isError) {
        const el = document.getElementById("syncStatusText");
        if (!el) return;
        el.textContent = text;
        el.classList.toggle("sync-status--error", !!isError);
    }

    function waitForGsi() {
        return new Promise((resolve) => {
            if (window.google?.accounts?.id) {
                resolve();
                return;
            }
            let n = 0;
            const t = setInterval(() => {
                n += 1;
                if (window.google?.accounts?.id) {
                    clearInterval(t);
                    resolve();
                } else if (n > 200) {
                    clearInterval(t);
                    resolve();
                }
            }, 50);
        });
    }

    function handleCredentialResponse(response) {
        try {
            localStorage.setItem(TOKEN_KEY, response.credential);
        } catch (_) {
            /* ignore */
        }
        window.location.reload();
    }

    window.dsaInitGoogleSync = async function dsaInitGoogleSync() {
        const clientId = cfg.googleClientId;
        const wrap = document.getElementById("googleSyncSection");
        const btnHost = document.getElementById("googleSignInBtn");
        const signedInEl = document.getElementById("googleSignedIn");
        const emailEl = document.getElementById("googleAccountEmail");
        const outBtn = document.getElementById("googleSignOutBtn");

        if (!clientId || !cfg.syncWebAppUrl) {
            if (wrap) wrap.hidden = true;
            return;
        }
        if (wrap) wrap.hidden = false;

        await waitForGsi();
        if (!window.google?.accounts?.id) {
            setSyncStatus("Google script failed to load", true);
            return;
        }

        google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
        });

        const token = getToken();
        if (token) {
            try {
                const p = token.split(".")[1];
                const b64 = p.replace(/-/g, "+").replace(/_/g, "/");
                const payload = JSON.parse(atob(b64));
                if (emailEl) emailEl.textContent = payload.email || payload.sub || "Signed in";
            } catch (_) {
                if (emailEl) emailEl.textContent = "Signed in";
            }
            if (btnHost) btnHost.innerHTML = "";
            if (signedInEl) signedInEl.hidden = false;
        } else {
            if (signedInEl) signedInEl.hidden = true;
            if (btnHost) {
                btnHost.innerHTML = "";
                google.accounts.id.renderButton(btnHost, {
                    type: "standard",
                    theme: "outline",
                    size: "large",
                    text: "signin_with",
                    width: 240,
                });
            }
        }

        if (outBtn) {
            outBtn.onclick = () => {
                try {
                    localStorage.removeItem(TOKEN_KEY);
                } catch (_) {
                    /* ignore */
                }
                google.accounts.id.disableAutoSelect();
                window.location.reload();
            };
        }

        if (token) {
            setSyncStatus("Cloud sync on", false);
        } else {
            setSyncStatus("Sign in to sync across devices", false);
        }
    };
})();
