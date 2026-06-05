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
    const GENERAL_NOTES_BASE_KEY = "dsa-general-notes-v1";
    const SIGNED_OUT_GENERAL_NOTES_KEY = GENERAL_NOTES_BASE_KEY + ":signed-out";
    const TOKEN_KEY = "dsa-google-id-token";
    const TOKEN_STORED_AT_KEY = "dsa-google-id-token-stored-at";
    const SESSION_MAX_AGE_SEC = 24 * 60 * 60;
    const DEBOUNCE_MS = 4000;

    const cfg = window.__DSA_CONFIG__ || {};

    let pushTimer = null;
    /** @type {Set<string>} */
    const dirty = new Set();
    let pushRetryTimer = null;

    let generalPushTimer = null;
    /** @type {Set<string>} */
    const generalDirty = new Set();

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

    /**
     * Returns stored ID token only if JWT is still valid (Apps Script verifies exp via tokeninfo).
     * Also capped by a local session max age as a safety bound.
     */
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
        if (!payload) {
            try {
                localStorage.removeItem(TOKEN_KEY);
                localStorage.removeItem(TOKEN_STORED_AT_KEY);
            } catch (_) {
                /* ignore */
            }
            return null;
        }
        const now = Math.floor(Date.now() / 1000);
        if (typeof payload.exp === "number" && payload.exp > 0 && now >= payload.exp - 30) {
            try {
                localStorage.removeItem(TOKEN_KEY);
                localStorage.removeItem(TOKEN_STORED_AT_KEY);
            } catch (_) {
                /* ignore */
            }
            return null;
        }
        let storedAt = 0;
        try {
            const raw = localStorage.getItem(TOKEN_STORED_AT_KEY) || "";
            const parsed = Number.parseInt(raw, 10);
            if (Number.isFinite(parsed) && parsed > 0) storedAt = parsed;
        } catch (_) {
            /* ignore */
        }
        if (!storedAt && typeof payload.iat === "number" && payload.iat > 0) {
            storedAt = payload.iat;
        }
        if (!storedAt && typeof payload.exp === "number" && payload.exp > 0) {
            storedAt = payload.exp - 3600;
        }
        if (!storedAt) {
            storedAt = now;
        }
        if (now - storedAt >= SESSION_MAX_AGE_SEC) {
            try {
                localStorage.removeItem(TOKEN_KEY);
                localStorage.removeItem(TOKEN_STORED_AT_KEY);
            } catch (_) {
                /* ignore */
            }
            return null;
        }
        return t;
    }

    function clearGoogleSession() {
        dirty.clear();
        generalDirty.clear();
        clearTimeout(pushTimer);
        clearTimeout(pushRetryTimer);
        clearTimeout(generalPushTimer);
        pushTimer = null;
        pushRetryTimer = null;
        generalPushTimer = null;
        try {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(TOKEN_STORED_AT_KEY);
        } catch (_) {
            /* ignore */
        }
    }

    function handleSyncAuthError(err) {
        const msg = err && err.message ? String(err.message) : String(err || "");
        if (/invalid token|token expired|Missing idToken/i.test(msg)) {
            clearGoogleSession();
            setSyncStatus("Session expired — sign in again to sync", true);
            return true;
        }
        return false;
    }

    function getTrackerStorageKey() {
        const t = getUsableToken();
        if (!t) return SIGNED_OUT_TRACKER_KEY;
        const p = parseJwtPayload(t);
        const sub = p && p.sub != null ? String(p.sub) : "";
        if (!sub) return SIGNED_OUT_TRACKER_KEY;
        return LEGACY_TRACKER_KEY + ":user:" + sub;
    }

    function getGeneralNotesStorageKey() {
        const t = getUsableToken();
        if (!t) return SIGNED_OUT_GENERAL_NOTES_KEY;
        const p = parseJwtPayload(t);
        const sub = p && p.sub != null ? String(p.sub) : "";
        if (!sub) return SIGNED_OUT_GENERAL_NOTES_KEY;
        return GENERAL_NOTES_BASE_KEY + ":user:" + sub;
    }

    function mergeTrackerStateEntry_(prev, incoming) {
        const prevRow = prev && typeof prev === "object" ? prev : {};
        const inRow = incoming && typeof incoming === "object" ? incoming : {};
        const prevTs = prevRow.updatedAt ? Date.parse(prevRow.updatedAt) : 0;
        const inTs = inRow.updatedAt ? Date.parse(inRow.updatedAt) : 0;
        if (!Object.keys(prevRow).length) return { ...inRow };
        if (!Object.keys(inRow).length) return { ...prevRow };
        if (inTs > prevTs) return { ...inRow };
        if (prevTs > inTs) return { ...prevRow };
        if (inRow.status === "Mastered" && prevRow.status !== "Mastered") {
            return {
                ...inRow,
                updatedAt: inRow.updatedAt || prevRow.updatedAt || new Date().toISOString(),
            };
        }
        if (prevRow.status === "Mastered" && inRow.status !== "Mastered") {
            return { ...prevRow };
        }
        return {
            ...prevRow,
            ...inRow,
            updatedAt: prevRow.updatedAt || inRow.updatedAt || new Date().toISOString(),
        };
    }

    function mergeTrackerStates_(base, overlay) {
        const out = { ...(base || {}) };
        for (const [key, row] of Object.entries(overlay || {})) {
            if (!key) continue;
            out[key] = mergeTrackerStateEntry_(out[key], row);
        }
        return out;
    }

    function migrateLegacyTrackerIfNeeded() {
        const t = getUsableToken();
        if (!t) return;
        const key = getTrackerStorageKey();
        if (key === SIGNED_OUT_TRACKER_KEY) return;
        try {
            const legRaw = localStorage.getItem(LEGACY_TRACKER_KEY);
            if (!legRaw || legRaw === "{}") return;
            let leg;
            try {
                leg = JSON.parse(legRaw);
            } catch (_) {
                return;
            }
            if (!leg || typeof leg !== "object" || Object.keys(leg).length === 0) return;

            let existing = {};
            try {
                existing = JSON.parse(localStorage.getItem(key) || "{}") || {};
            } catch (_) {
                existing = {};
            }
            const merged = mergeTrackerStates_(existing, leg);
            localStorage.setItem(key, JSON.stringify(merged));
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
            const merged = mergeTrackerStates_(so, user);
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
    window.dsaGetGeneralNotesStorageKey = getGeneralNotesStorageKey;
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
            const nfmt =
                r.notesFormat === "html" || r.notesFormat === "markdown"
                    ? r.notesFormat
                    : "";
            const remoteRow = {
                status: r.status || "Not Started",
                notes: r.notes != null ? String(r.notes) : "",
                updatedAt: r.updatedAt || new Date().toISOString(),
                noteFlag: r.noteFlag != null ? String(r.noteFlag) : "",
                ...(nfmt ? { notesFormat: nfmt } : {}),
            };
            state[key] = mergeTrackerStateEntry_(prev, remoteRow);
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

    function readGeneralNotesDoc() {
        let doc = { notes: {} };
        try {
            doc = JSON.parse(localStorage.getItem(getGeneralNotesStorageKey()) || "{}") || {};
        } catch (_) {
            doc = { notes: {} };
        }
        if (!doc.notes || typeof doc.notes !== "object") doc.notes = {};
        return doc;
    }

    function writeGeneralNotesDoc(doc) {
        try {
            localStorage.setItem(getGeneralNotesStorageKey(), JSON.stringify(doc));
        } catch (_) {
            /* ignore */
        }
    }

    function mergeGeneralNotesFromCloud(rows) {
        if (!Array.isArray(rows) || !rows.length) return;
        const doc = readGeneralNotesDoc();
        const notes = { ...doc.notes };
        for (const r of rows) {
            const id = String(r.noteId || "").trim();
            if (!id) continue;
            const prev = notes[id] || {};
            const prevTs = prev.updatedAt ? Date.parse(prev.updatedAt) : 0;
            const remoteTs = r.updatedAt ? Date.parse(r.updatedAt) : 0;
            if (remoteTs >= prevTs) {
                notes[id] = {
                    title: r.title != null ? String(r.title) : "",
                    body: r.body != null ? String(r.body) : "",
                    noteFlag: r.noteFlag != null ? String(r.noteFlag) : "",
                    updatedAt: r.updatedAt || new Date().toISOString(),
                    notesFormat: "html",
                };
            }
        }
        writeGeneralNotesDoc({ notes });
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
            const err = new Error(data.error || "Sync request failed");
            handleSyncAuthError(err);
            throw err;
        }
        return data;
    }

    function rowsByProblemKey(rows) {
        const map = new Map();
        for (const r of rows || []) {
            const key = String(r.problemKey || "").trim();
            if (key) map.set(key, r);
        }
        return map;
    }

    function rowsByNoteId(rows) {
        const map = new Map();
        for (const r of rows || []) {
            const id = String(r.noteId || "").trim();
            if (id) map.set(id, r);
        }
        return map;
    }

    function hasMeaningfulProgressRow(row) {
        if (!row || typeof row !== "object") return false;
        if (row.status && row.status !== "Not Started") return true;
        if (row.notes && String(row.notes).trim()) return true;
        if (row.noteFlag && String(row.noteFlag).trim()) return true;
        return false;
    }

    /** Push local rows that are newer than cloud or absent from the last pull. */
    function scheduleReconcilePushAfterPull(remoteRows) {
        const selfSub = getGoogleSubFromUsableToken();
        let state = {};
        try {
            state = JSON.parse(localStorage.getItem(getTrackerStorageKey()) || "{}");
        } catch (_) {
            return 0;
        }
        const remoteByKey = rowsByProblemKey(remoteRows);
        let count = 0;
        for (const [key, local] of Object.entries(state)) {
            if (selfSub && key === selfSub) continue;
            const remote = remoteByKey.get(key);
            const localTs = local.updatedAt ? Date.parse(local.updatedAt) : 0;
            const remoteTs = remote?.updatedAt ? Date.parse(remote.updatedAt) : 0;
            if (!remote && hasMeaningfulProgressRow(local)) {
                dirty.add(key);
                count += 1;
            } else if (remote && localTs > remoteTs) {
                dirty.add(key);
                count += 1;
            }
        }
        return count;
    }

    function scheduleReconcileGeneralNotesAfterPull(remoteRows) {
        const doc = readGeneralNotesDoc();
        const remoteById = rowsByNoteId(remoteRows);
        let count = 0;
        for (const [id, local] of Object.entries(doc.notes || {})) {
            const remote = remoteById.get(id);
            const localTs = local.updatedAt ? Date.parse(local.updatedAt) : 0;
            const remoteTs = remote?.updatedAt ? Date.parse(remote.updatedAt) : 0;
            const hasBody =
                (local.title && String(local.title).trim()) ||
                (local.body && String(local.body).trim()) ||
                (local.noteFlag && String(local.noteFlag).trim());
            if (!remote && hasBody) {
                generalDirty.add(id);
                count += 1;
            } else if (remote && localTs > remoteTs) {
                generalDirty.add(id);
                count += 1;
            }
        }
        return count;
    }

    function schedulePushRetry() {
        clearTimeout(pushRetryTimer);
        pushRetryTimer = setTimeout(() => {
            pushRetryTimer = null;
            void flushPush();
        }, 15000);
    }

    /**
     * Called from app.js init before normalizeProblemData — reloads trackerState from disk after merge.
     */
    window.dsaMergeCloudBeforeNormalize = async function dsaMergeCloudBeforeNormalize() {
        const token = getUsableToken();
        if (!token || !cfg.syncWebAppUrl) return;
        migrateLegacyTrackerIfNeeded();
        let progressRows = [];
        let generalRows = [];
        try {
            const progressData = await api({ action: "pullProgress", idToken: token });
            progressRows = progressData.rows || [];
            if (progressRows.length) {
                mergeCloudIntoLocalStorage(progressRows);
            }
        } catch (e) {
            console.warn("[DSA sync] pullProgress failed:", e);
            if (!handleSyncAuthError(e)) {
                setSyncStatus("Could not load cloud progress — using local data", true);
            }
        }
        try {
            const generalData = await api({ action: "pullGeneralNotes", idToken: token });
            generalRows = generalData.rows || [];
            if (generalRows.length) {
                mergeGeneralNotesFromCloud(generalRows);
            }
        } catch (e) {
            console.warn("[DSA sync] pullGeneralNotes skipped (deploy latest SyncWebApp.gs):", e);
            handleSyncAuthError(e);
        }

        const progressPending = scheduleReconcilePushAfterPull(progressRows);
        const generalPending = scheduleReconcileGeneralNotesAfterPull(generalRows);
        if (progressPending > 0) {
            setSyncActivity("Syncing local changes…");
            await flushPush();
        }
        if (generalPending > 0) {
            setSyncActivity("Syncing notes…");
            await flushGeneralPush();
        }
        if (progressPending === 0 && generalPending === 0) {
            setSyncActivity("");
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
            const payload = {
                problemKey: id,
                status: row.status || "Not Started",
                notes: row.notes != null ? String(row.notes) : "",
                updatedAt: row.updatedAt || new Date().toISOString(),
                noteFlag: row.noteFlag != null ? String(row.noteFlag) : "",
            };
            if (row.notesFormat === "html" || row.notesFormat === "markdown") {
                payload.notesFormat = row.notesFormat;
            }
            rows.push(payload);
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
            setSyncStatus("", false);
        } catch (e) {
            console.warn("[DSA sync] Push failed:", e);
            keys.forEach((k) => dirty.add(k));
            if (!handleSyncAuthError(e)) {
                setSyncStatus("Sync error · retrying", true);
                schedulePushRetry();
            }
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

    function buildGeneralRowsFromDirty() {
        const doc = readGeneralNotesDoc();
        const rows = [];
        for (const id of generalDirty) {
            const row = doc.notes[id];
            if (!row) continue;
            rows.push({
                noteId: id,
                title: row.title != null ? String(row.title) : "",
                body: row.body != null ? String(row.body) : "",
                noteFlag: row.noteFlag != null ? String(row.noteFlag) : "",
                updatedAt: row.updatedAt || new Date().toISOString(),
            });
        }
        return rows;
    }

    async function flushGeneralPush() {
        generalPushTimer = null;
        const token = getUsableToken();
        if (!token || !cfg.syncWebAppUrl || generalDirty.size === 0) return;
        const rows = buildGeneralRowsFromDirty();
        const keys = [...generalDirty];
        generalDirty.clear();
        if (!rows.length) return;
        try {
            await api({ action: "pushGeneralNotes", idToken: token, rows });
            setSyncActivity("Saved");
        } catch (e) {
            console.warn("[DSA sync] General notes push failed:", e);
            keys.forEach((k) => generalDirty.add(k));
            setSyncStatus("Sync error · retrying", true);
        }
    }

    function flushGeneralPushKeepalive() {
        const token = getUsableToken();
        if (!token || !cfg.syncWebAppUrl || generalDirty.size === 0) return;
        const rows = buildGeneralRowsFromDirty();
        if (!rows.length) return;
        generalDirty.clear();
        try {
            fetch(cfg.syncWebAppUrl, {
                method: "POST",
                mode: "cors",
                redirect: "follow",
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify({ action: "pushGeneralNotes", idToken: token, rows }),
                keepalive: true,
            }).catch(() => {});
        } catch (_) {
            /* ignore */
        }
    }

    window.dsaScheduleGeneralNotePush = function dsaScheduleGeneralNotePush(noteId) {
        if (!getUsableToken() || !cfg.syncWebAppUrl) return;
        if (noteId != null && String(noteId)) generalDirty.add(String(noteId));
        setSyncActivity("Saving…");
        clearTimeout(generalPushTimer);
        generalPushTimer = setTimeout(() => {
            flushGeneralPush();
        }, DEBOUNCE_MS);
    };

    window.addEventListener("pagehide", () => {
        flushPushKeepalive();
        flushGeneralPushKeepalive();
    });

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
            localStorage.setItem(TOKEN_STORED_AT_KEY, String(Math.floor(Date.now() / 1000)));
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

        function getGoogleSignInButtonOptions() {
            const narrow = typeof window !== "undefined" && window.matchMedia("(max-width: 640px)").matches;
            const vw =
                typeof window !== "undefined" && Number.isFinite(window.innerWidth)
                    ? window.innerWidth
                    : 400;
            const widthPx = narrow ? Math.max(220, Math.min(340, vw - 40)) : 280;
            return {
                type: "standard",
                theme: "outline",
                size: narrow ? "medium" : "large",
                text: "signin_with",
                shape: "rectangular",
                width: widthPx,
                locale: "en",
            };
        }

        function renderGoogleToolbarButton() {
            if (!btnHost || !window.google?.accounts?.id) return;
            btnHost.innerHTML = "";
            google.accounts.id.renderButton(btnHost, getGoogleSignInButtonOptions());
        }

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
            if (btnHost) {
                btnHost.innerHTML = "";
                btnHost.hidden = true;
                btnHost.style.display = "none";
            }
            if (signedInEl) signedInEl.hidden = false;
        } else {
            if (labelEl) labelEl.hidden = true;
            if (signedInEl) signedInEl.hidden = true;
            if (btnHost) {
                btnHost.hidden = false;
                btnHost.style.display = "";
                renderGoogleToolbarButton();
            }
        }

        if (outBtn) {
            outBtn.onclick = () => {
                clearGoogleSession();
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
