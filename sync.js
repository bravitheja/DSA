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
    /** Pre-per-user installs; migrated into per-user key on first Google sign-in. */
    const LEGACY_TRACKER_KEY = "dsa-tracker-state-v4";
    /** Progress when not signed in with Google (cleared on Google sign-out). */
    const SIGNED_OUT_TRACKER_KEY = LEGACY_TRACKER_KEY + ":signed-out";
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

    function getTrackerStorageKey() {
        const t = getUsableToken();
        if (!t) return SIGNED_OUT_TRACKER_KEY;
        const p = parseJwtPayload(t);
        const sub = p && p.sub != null ? String(p.sub) : "";
        if (!sub) return SIGNED_OUT_TRACKER_KEY;
        return LEGACY_TRACKER_KEY + ":user:" + sub;
    }

    function migrateLegacyTrackerIfNeeded() {
        const t = getUsableToken();
        if (!t) return;
        const key = getTrackerStorageKey();
        if (key === SIGNED_OUT_TRACKER_KEY) return;
        try {
            let existing = {};
            try {
                existing = JSON.parse(localStorage.getItem(key) || "{}") || {};
            } catch (_) {
                existing = {};
            }
            if (Object.keys(existing).length > 0) return;
            const legRaw = localStorage.getItem(LEGACY_TRACKER_KEY);
            if (!legRaw || legRaw === "{}") return;
            let leg;
            try {
                leg = JSON.parse(legRaw);
            } catch (_) {
                return;
            }
            if (!leg || typeof leg !== "object" || Object.keys(leg).length === 0) return;
            localStorage.setItem(key, legRaw);
            localStorage.removeItem(LEGACY_TRACKER_KEY);
        } catch (_) {
            /* ignore */
        }
    }

    /** Before storing new token: copy signed-out progress into this account's bucket (user wins on key clash). */
    function mergeSignedOutIntoUserKey_(userKey) {
        if (!userKey) return;
        try {
            let user = {};
            try {
                user = JSON.parse(localStorage.getItem(userKey) || "{}") || {};
            } catch (_) {
                user = {};
            }
            let so = {};
            try {
                so = JSON.parse(localStorage.getItem(SIGNED_OUT_TRACKER_KEY) || "{}") || {};
            } catch (_) {
                so = {};
            }
            if (Object.keys(so).length === 0) return;
            const merged = { ...so, ...user };
            localStorage.setItem(userKey, JSON.stringify(merged));
        } catch (_) {
            /* ignore */
        }
    }

    function userTrackerKeyFromCredentialJwt_(credentialJwt) {
        const p = parseJwtPayload(credentialJwt);
        const sub = p && p.sub != null ? String(p.sub) : "";
        if (!sub) return null;
        return LEGACY_TRACKER_KEY + ":user:" + sub;
    }

    window.dsaGetTrackerStorageKey = getTrackerStorageKey;
    window.dsaMigrateLegacyTrackerIfNeeded = migrateLegacyTrackerIfNeeded;

    /** Google `sub` must never be used as a problem key (corrupt merge / bad sheet row). */
    function getGoogleSubFromUsableToken() {
        const t = getUsableToken();
        if (!t) return "";
        const p = parseJwtPayload(t);
        return p && p.sub != null ? String(p.sub) : "";
    }

    function mergeCloudIntoLocalStorage(rows) {
        if (!Array.isArray(rows) || !rows.length) return;
        const selfSub = getGoogleSubFromUsableToken();
        let state = {};
        try {
            state = JSON.parse(localStorage.getItem(getTrackerStorageKey()) || "{}");
        } catch (_) {
            state = {};
        }
        for (const r of rows) {
            const key = String(r.problemKey || "").trim();
            if (!key) continue;
            if (selfSub && key === selfSub) continue;
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
        if (selfSub && Object.prototype.hasOwnProperty.call(state, selfSub)) {
            delete state[selfSub];
        }
        try {
            localStorage.setItem(getTrackerStorageKey(), JSON.stringify(state));
        } catch (_) {
            /* ignore */
        }
    }

    try {
        sessionStorage.removeItem("dsa-gas-sync-final-url");
        sessionStorage.removeItem("dsa-gas-sync-final-base");
    } catch (_) {
        /* ignore */
    }

    async function api(payload) {
        const url = cfg.syncWebAppUrl;
        if (!url || typeof url !== "string") {
            throw new Error("syncWebAppUrl missing");
        }
        const bodyStr = JSON.stringify(payload);
        const headers = { "Content-Type": "text/plain;charset=utf-8" };
        /**
         * Always POST to the deployed /exec URL from config. Do not cache Response.url — after redirects
         * it may point at a GET-only endpoint (e.g. script.googleusercontent.com), which returns 405 for POST.
         */
        const res = await fetch(url, {
            method: "POST",
            mode: "cors",
            redirect: "follow",
            headers,
            body: bodyStr,
        });
        const text = await res.text();
        if (!res.ok) {
            console.warn("[DSA sync] HTTP", res.status, text.slice(0, 400));
        }
        let data;
        try {
            data = JSON.parse(text);
        } catch {
            throw new Error(
                res.ok
                    ? "Sync server returned non-JSON"
                    : `HTTP ${res.status}: ${text.slice(0, 120)}`
            );
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
        migrateLegacyTrackerIfNeeded();
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
        const selfSub = getGoogleSubFromUsableToken();
        let state = {};
        try {
            state = JSON.parse(localStorage.getItem(getTrackerStorageKey()) || "{}");
        } catch (_) {
            state = {};
        }
        let purgedSubKey = false;
        if (selfSub && Object.prototype.hasOwnProperty.call(state, selfSub)) {
            delete state[selfSub];
            purgedSubKey = true;
        }
        const rows = [];
        for (const id of dirty) {
            if (selfSub && String(id) === selfSub) continue;
            const row = state[id];
            if (!row) continue;
            rows.push({
                problemKey: id,
                status: row.status || "Not Started",
                notes: row.notes != null ? String(row.notes) : "",
                updatedAt: row.updatedAt || new Date().toISOString(),
            });
        }
        if (purgedSubKey) {
            try {
                localStorage.setItem(getTrackerStorageKey(), JSON.stringify(state));
            } catch (_) {
                /* ignore */
            }
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
                redirect: "follow",
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
        const uk = userTrackerKeyFromCredentialJwt_(response.credential);
        if (uk) mergeSignedOutIntoUserKey_(uk);
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
                dirty.clear();
                try {
                    localStorage.removeItem(TOKEN_KEY);
                } catch (_) {
                    /* ignore */
                }
                try {
                    localStorage.setItem(SIGNED_OUT_TRACKER_KEY, "{}");
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
