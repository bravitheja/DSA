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

    function parseJwtPayload(token) {
        try {
            const p = token.split(".")[1];
            if (!p) return null;
            const b64 = p.replace(/-/g, "+").replace(/_/g, "/");
            return JSON.parse(atob(b64));
        } catch (_) {
            return null;
        }
    }

    /** Returns stored ID token only if it looks valid and not expired; otherwise removes it. */
    function getUsableToken() {
        const t = getToken();
        if (!t || typeof t !== "string") return null;
        const parts = t.split(".");
        if (parts.length !== 3) {
            try {
                localStorage.removeItem(TOKEN_KEY);
            } catch (_) {
                /* ignore */
            }
            return null;
        }
        const payload = parseJwtPayload(t);
        if (!payload || typeof payload.exp !== "number") {
            try {
                localStorage.removeItem(TOKEN_KEY);
            } catch (_) {
                /* ignore */
            }
            return null;
        }
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp <= now + 30) {
            try {
                localStorage.removeItem(TOKEN_KEY);
            } catch (_) {
                /* ignore */
            }
            return null;
        }
        return t;
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
        const token = getUsableToken();
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
        const token = getUsableToken();
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
            setSyncActivity("Saved");
        } catch (e) {
            console.warn("[DSA sync] Push failed:", e);
            keys.forEach((k) => dirty.add(k));
            setSyncStatus("Sync error · retrying", true);
        }
    }

    function flushPushKeepalive() {
        const token = getUsableToken();
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
        if (!getUsableToken() || !cfg.syncWebAppUrl) return;
        dirty.add(problemKey);
        setSyncActivity("Saving…");
        clearTimeout(pushTimer);
        pushTimer = setTimeout(() => {
            flushPush();
        }, DEBOUNCE_MS);
    };

    window.addEventListener("pagehide", flushPushKeepalive);

    function setSyncStatus(text, isError) {
        const el = document.getElementById("syncStatusText");
        if (!el) return;
        if (!text) {
            el.hidden = true;
            el.textContent = "";
            el.classList.remove("sync-status--error", "sync-status--fullwidth");
            return;
        }
        el.hidden = false;
        el.textContent = text;
        el.classList.toggle("sync-status--error", !!isError);
        const fullWidth = text.includes("\n") || text.length > 90;
        el.classList.toggle("sync-status--fullwidth", fullWidth);
    }

    function setSyncActivity(text) {
        const el = document.getElementById("syncActivity");
        if (!el) return;
        if (!text) {
            el.hidden = true;
            el.textContent = "";
            return;
        }
        el.hidden = false;
        el.textContent = text;
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
        const labelEl = document.getElementById("syncToolbarLabel");
        const btnHost = document.getElementById("googleSignInBtn");
        const signedInEl = document.getElementById("googleSignedIn");
        const emailEl = document.getElementById("googleAccountEmail");
        const outBtn = document.getElementById("googleSignOutBtn");

        if (labelEl) labelEl.hidden = true;
        setSyncActivity("");
        if (!clientId || !cfg.syncWebAppUrl) {
            const section = document.getElementById("googleSyncSection");
            if (section) section.hidden = true;
            setSyncStatus("", false);
            console.warn(
                "[DSA sync] Skipped: set googleClientId and syncWebAppUrl (auth-config.js or CI secrets)."
            );
            return;
        }

        setSyncStatus("", false);
        {
            const section = document.getElementById("googleSyncSection");
            if (section) section.hidden = false;
        }

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

        const token = getUsableToken();
        if (token) {
            try {
                const payload = parseJwtPayload(token);
                if (!payload) throw new Error("bad payload");
                const avatarEl = document.getElementById("googleUserAvatar");
                const chipEl = document.querySelector(".user-chip");
                if (emailEl) {
                    const em = payload.email || payload.sub || "Signed in";
                    const local = em.includes("@") ? em.split("@")[0] : em;
                    emailEl.textContent = local;
                    emailEl.title = em.includes("@") ? em : "";
                    if (chipEl) chipEl.title = em.includes("@") ? em : "";
                    if (avatarEl) {
                        const letters = local.replace(/[^a-zA-Z0-9]/g, "").slice(0, 2);
                        avatarEl.textContent =
                            letters.length >= 2
                                ? letters.toUpperCase()
                                : (local.slice(0, 2) || "?").toUpperCase();
                    }
                }
            } catch (_) {
                if (emailEl) emailEl.textContent = "Signed in";
            }
            if (labelEl) labelEl.hidden = true;
            if (btnHost) btnHost.innerHTML = "";
            if (signedInEl) signedInEl.hidden = false;
        } else {
            if (labelEl) labelEl.hidden = true;
            if (signedInEl) signedInEl.hidden = true;
            if (btnHost) {
                btnHost.innerHTML = "";
                google.accounts.id.renderButton(btnHost, {
                    type: "standard",
                    theme: "outline",
                    size: "medium",
                    text: "signin_with",
                    width: 220,
                    locale: "en",
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

        setSyncActivity("");
    };
})();
