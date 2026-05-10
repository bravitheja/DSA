import { sanitizeNotesHtml } from "./notes-html-sanitize.mjs";

const LEGACY_TRACKER_KEY = "dsa-tracker-state-v4";

function getTrackerLocalStorageKey() {
    return typeof window.dsaGetTrackerStorageKey === "function"
        ? window.dsaGetTrackerStorageKey()
        : LEGACY_TRACKER_KEY;
}

if (typeof window.dsaMigrateLegacyTrackerIfNeeded === "function") {
    window.dsaMigrateLegacyTrackerIfNeeded();
}
const PAGE_SIZE_KEY = "dsa-items-per-page-v1";
const PAGE_SIZE_MIN = 5;
const PAGE_SIZE_MAX = 500;
const THEME_KEY = "dsa-tracker-theme";
const NOTES_SHEET_WIDTH_KEY = "dsa-notes-sheet-width-px";
const NOTES_SHEET_WIDTH_MIN = 300;
const NOTES_SHEET_WIDTH_DEFAULT = 400;
const NOTES_SHEET_WIDTH_MAX = 960;
const TIMER_PREFS_KEY = "dsa-session-timer-prefs-v1";
const TIMER_FLOAT_POS_KEY = "dsa-timer-float-pos-v1";
const TIMER_PIP_ENABLED_KEY = "dsa-timer-pip-enabled-v1";
const TIMER_PIP_POS_KEY = "dsa-timer-pip-pos-v1";
const TIMER_STICKY_KEY = "dsa-timer-sticky-v1";
const TIMER_MAX_DURATION_SEC = 24 * 3600;

/** Post-it backgrounds for the timer sticky card (local only, not synced). */
const TIMER_STICKY_BACKGROUNDS = [
    { id: "lemon", label: "Lemon", color: "#fff8d6" },
    { id: "peach", label: "Peach", color: "#ffe8d6" },
    { id: "mint", label: "Mint", color: "#d8f5e4" },
    { id: "lavender", label: "Lavender", color: "#ebe4ff" },
    { id: "sky", label: "Sky", color: "#d4efff" },
    { id: "rose", label: "Rose", color: "#ffe4ef" },
];

const TIMER_STICKY_STICKERS = ["📌", "🎯", "⭐", "🔥", "💡", "🧠", "✅", "📝", "☕", "🚀"];

/** Must match SyncWebApp.gs ALLOWED_NOTE_FLAGS_ and sync payload. */
const NOTE_FLAG_SLUGS = new Set([
    "blue",
    "green",
    "grey",
    "orange",
    "purple",
    "red",
    "yellow",
]);

const NOTE_FLAG_LABELS = {
    blue: "Blue",
    green: "Green",
    grey: "Grey",
    orange: "Orange",
    purple: "Purple",
    red: "Red",
    yellow: "Yellow",
};

function sanitizeNoteFlag(raw) {
    const s = String(raw ?? "")
        .trim()
        .toLowerCase();
    return NOTE_FLAG_SLUGS.has(s) ? s : "";
}

const getEl = (id) => document.getElementById(id);

/**
 * Directory URL containing app.js (and data.json). Using this for fetch() fixes GitHub Pages
 * project sites where `./data.json` resolves against the wrong path (e.g. repo root vs /repo/).
 */
function getAssetBaseUrl() {
    const el = Array.from(document.scripts).find(
        (s) => s.src && /\/app\.js([?#].*)?$/i.test(s.src)
    );
    if (el) {
        return new URL(".", el.src).href;
    }
    return new URL("./", window.location.href).href;
}

const elements = {
    body: getEl("problemsBody"),
    rowTemplate: getEl("problemRowTemplate"),
    searchInput: getEl("searchInput"),
    patternFilter: getEl("patternFilter"),
    difficultyFilter: getEl("difficultyFilter"),
    companyFilter: getEl("companyFilter"),
    flagFilter: getEl("flagFilter"),
    themeToggle: getEl("themeToggle"),
    solvedCount: getEl("solvedCount"),
    easyRing: getEl("easyRing"),
    mediumRing: getEl("mediumRing"),
    hardRing: getEl("hardRing"),
    breakdown: getEl("sidebarBreakdown"),
    notesSheet: getEl("notesSheet"),
    notesSheetResize: getEl("notesSheetResize"),
    sheetTitle: getEl("sheetTitle"),
    sheetNotesEditorHost: getEl("sheetNotesEditorHost"),
    sheetNotesToolbarHost: getEl("sheetNotesToolbarHost"),
    notesFlagSelect: getEl("notesFlagSelect"),
    notesPreview: getEl("notesPreview"),
    autoSaveStatus: getEl("autoSaveStatus"),
    sheetSaveBtn: getEl("sheetSaveBtn"),
    sheetCloseBtn: getEl("sheetCloseBtn"),
    togglePreviewBtn: getEl("togglePreviewBtn"),
    prevPageBtn: getEl("prevPageBtn"),
    nextPageBtn: getEl("nextPageBtn"),
    pageSizeInput: getEl("pageSizeInput"),
    pageJumpInput: getEl("pageJumpInput"),
    pageTotalHint: getEl("pageTotalHint"),
    timerPanel: getEl("timerPanel"),
    timerTimeInput: getEl("timerTimeInput"),
    timerProgressFill: getEl("timerProgressFill"),
    timerPrimaryBtn: getEl("timerPrimaryBtn"),
    timerPipToggle: getEl("timerPipToggle"),
    timerResetBtn: getEl("timerResetBtn"),
    timerDock: getEl("timerDock"),
    timerMobileToggle: getEl("timerMobileToggle"),
    timerStickyMobileToggle: getEl("timerStickyMobileToggle"),
    timerDragHandle: getEl("timerDragHandle"),
    timerStickySection: getEl("timerStickySection"),
    timerStickyDock: getEl("timerStickyDock"),
    timerStickyPipBanner: getEl("timerStickyPipBanner"),
    timerStickyCardPipToggle: getEl("timerStickyCardPipToggle"),
    timerStickyCardAddBtn: getEl("timerStickyCardAddBtn"),
    timerStickyCardDeleteBtn: getEl("timerStickyCardDeleteBtn"),
    timerStickyCardPrevBtn: getEl("timerStickyCardPrevBtn"),
    timerStickyCardNextBtn: getEl("timerStickyCardNextBtn"),
    timerStickyCarousel: getEl("timerStickyCarousel"),
    timerStickyCarouselDots: getEl("timerStickyCarouselDots"),
    timerStickyActiveLabel: getEl("timerStickyActiveLabel"),
    timerStickyColorRow: getEl("timerStickyColorRow"),
    timerStickyEditorHost: getEl("timerStickyEditorHost"),
    timerStickyEditorMount: getEl("timerStickyEditorMount"),
    timerStickyToolbarHost: getEl("timerStickyToolbarHost"),
    generalNotesOpenBtn: getEl("generalNotesOpenBtn"),
    generalNotesModal: getEl("generalNotesModal"),
    generalNotesBackdrop: getEl("generalNotesBackdrop"),
    generalNotesCard: getEl("generalNotesCard"),
    generalNotesExpandBtn: getEl("generalNotesExpandBtn"),
    generalNotesPickerBtn: getEl("generalNotesPickerBtn"),
    generalNotesPickerLabel: getEl("generalNotesPickerLabel"),
    generalNotesPickerMenu: getEl("generalNotesPickerMenu"),
    generalNotesOverflowBtn: getEl("generalNotesOverflowBtn"),
    generalNotesOverflowMenu: getEl("generalNotesOverflowMenu"),
    generalNotesTitleInput: getEl("generalNotesTitleInput"),
    generalNotesToolbarHost: getEl("generalNotesToolbarHost"),
    generalNotesEditorHost: getEl("generalNotesEditorHost"),
    /** TipTap mounts here; outer `#generalNotesEditorHost` stays full width so scrollbar hugs modal edge. */
    generalNotesEditorMount: getEl("generalNotesEditorMount"),
};

let allProblems = [];
let trackerState =
    JSON.parse(localStorage.getItem(getTrackerLocalStorageKey()) || "{}") || {};
let activeNotesId = null;
let filteredProblems = [];
let currentPage = 1;
const ITEMS_PER_PAGE_DESKTOP = 12;
const ITEMS_PER_PAGE_MOBILE = 6;
/** @type {boolean} */
let pageSizeUserSet = false;
try {
    pageSizeUserSet = localStorage.getItem(PAGE_SIZE_KEY) != null;
} catch (_) {
    /* ignore */
}
/** @type {number} */
let itemsPerPageOverride = loadStoredPageSize();
let saveTimeout;
let previewMode = false;

let richNotesEditorPromise = null;
/**
 * @type {null | {
 *   getHtml: () => string;
 *   setHtml?: (h: string) => void;
 *   getText?: () => string;
 *   setText?: (t: string) => void;
 *   focus: () => void;
 *   setDark: (d: boolean) => void;
 *   destroy: () => void;
 * }}
 */
let notesEditorHandle = null;
/** `"markdown"` when plain textarea fallback is active; otherwise `"html"`. */
let activeNotesFormat = "markdown";
/** When the sheet is open but the editor has not mounted yet (or failed), read/write this string so saves never wipe notes. */
let notesOpenFallbackText = /** @type {string | null} */ (null);
/** Bumped on each `openNotesSheet` so stale async mounts are ignored. */
let notesSheetMountGeneration = 0;

function loadRichNotesEditorModule() {
    if (!richNotesEditorPromise) {
        richNotesEditorPromise = import("./notes-tiptap-editor.mjs");
    }
    return richNotesEditorPromise;
}

function looksLikeStoredHtml(s) {
    const t = String(s || "").trim();
    if (!t) return false;
    if (!/^\s*</.test(t)) return false;
    return /<(p|div|ul|ol|h[1-6]|blockquote|pre|span|table|thead|tbody|tr|td|th|colgroup|col)\b/i.test(t);
}

function normalizeStoredNotesFormat(stored) {
    const raw = stored.notes != null ? String(stored.notes) : "";
    if (stored.notesFormat === "html" || stored.notesFormat === "markdown") {
        return stored.notesFormat;
    }
    return looksLikeStoredHtml(raw) ? "html" : "markdown";
}

function problemNotesInitialHtml(p) {
    const raw = p.notes || "";
    const fmt = p.notesFormat === "html" || p.notesFormat === "markdown" ? p.notesFormat : "markdown";
    if (fmt === "html" || looksLikeStoredHtml(raw)) {
        return sanitizeNotesHtml(raw) || "<p></p>";
    }
    if (window.marked?.parse) {
        return sanitizeNotesHtml(window.marked.parse(raw)) || "<p></p>";
    }
    return "<p></p>";
}

function destroyNotesEditor() {
    if (notesEditorHandle) {
        notesEditorHandle.destroy();
        notesEditorHandle = null;
    }
    if (elements.sheetNotesToolbarHost) {
        elements.sheetNotesToolbarHost.replaceChildren();
    }
    if (elements.sheetNotesEditorHost) {
        elements.sheetNotesEditorHost.replaceChildren();
    }
}

function getActiveNotesText() {
    if (notesEditorHandle) {
        if (typeof notesEditorHandle.getHtml === "function") {
            return notesEditorHandle.getHtml();
        }
        if (typeof notesEditorHandle.getText === "function") {
            return notesEditorHandle.getText();
        }
    }
    if (notesOpenFallbackText !== null) return notesOpenFallbackText;
    return "";
}

function syncHljsThemeForNotes() {
    const light = document.getElementById("hljs-theme-github-light");
    const dark = document.getElementById("hljs-theme-github-dark");
    if (!light || !dark) return;
    const isDark = document.body.classList.contains("dark");
    light.disabled = isDark;
    dark.disabled = !isDark;
}

/**
 * Plain textarea when CodeMirror cannot load (file://, offline, or esm.sh blocked).
 * Same handle shape as `mountNotesEditor` from notes-editor.mjs.
 * @param {HTMLElement} host
 * @param {{ initial: string; onChange: () => void; placeholder?: string; hint: string }} opts
 */
function mountPlainNotesEditor(host, opts) {
    host.replaceChildren();
    const wrap = document.createElement("div");
    wrap.className = "notes-plain-editor-wrap";
    const hint = document.createElement("p");
    hint.className = "notes-editor-fallback";
    hint.textContent = opts.hint;
    const ta = document.createElement("textarea");
    ta.className = "notes-plain-editor";
    ta.value = opts.initial ?? "";
    ta.placeholder =
        opts.placeholder ??
        "Capture intuition, pitfalls, or code snippets (Markdown supported).";
    ta.setAttribute("aria-label", "Problem notes");
    ta.addEventListener("input", () => opts.onChange?.());
    wrap.appendChild(hint);
    wrap.appendChild(ta);
    host.appendChild(wrap);
    return {
        getText: () => ta.value,
        getHtml: () =>
            window.marked?.parse ? sanitizeNotesHtml(window.marked.parse(ta.value)) : `<p></p>`,
        setText: (t) => {
            ta.value = t;
        },
        focus: () => ta.focus(),
        setDark: () => {},
        destroy: () => {
            wrap.remove();
        },
    };
}

let timerTotalSeconds = 20 * 60;
let timerRemainingSeconds = 20 * 60;
/** @type {'idle' | 'running' | 'paused'} */
let timerState = "idle";
let timerIntervalId = null;
let timerTitleFlashId = null;
let timerPipEnabled = false;
let timerPipDocumentWindow = null;
let timerPipDocumentControls = null;
let timerPipClosingByCode = false;
/** @type {null | 'timer' | 'sticky'} */
let pipDocumentMode = null;
const appPageTitle = document.title;

/** @type {Map<string, number>} problem id -> index in data.json order */
let curatedOrderIndex = new Map();

/** Started once after optional login (see auth.js). */
window.__DSA_START_APP__ = init;

let __dsaAppStarted = false;
/** False until data load + optional cloud merge finish — avoids saving empty notes before pull completes. */
let __dsaAppReady = false;

async function init() {
    if (__dsaAppStarted) return;
    __dsaAppStarted = true;
    __dsaAppReady = false;
    window.__DSA_APP_READY__ = false;
    applyTheme(localStorage.getItem(THEME_KEY) || "light");
    try {
        bindControls();
        setGeneralNotesUiReady(false);
        installNotesPersistenceFlushListeners();
        timerPipEnabled = loadDesktopTimerPipEnabled();
        setDesktopTimerPip(timerPipEnabled, false);
        applyNotesSheetWidth(loadStoredNotesSheetWidth(), false);
        initPaginationControls();
        initSessionTimer();
        const raw = await loadData();
        if (typeof window.dsaMergeCloudBeforeNormalize === "function") {
            await window.dsaMergeCloudBeforeNormalize();
        }
        __dsaAppReady = true;
        window.__DSA_APP_READY__ = true;
        setGeneralNotesUiReady(true);
        trackerState =
            JSON.parse(localStorage.getItem(getTrackerLocalStorageKey()) || "{}") || {};
        let items = normalizeProblemData(raw);
        const interviewSheets = await loadInterviewSheets();
        if (interviewSheets?.tracker?.byUrl) {
            items = mergeInterviewFromSheets(items, interviewSheets.tracker.byUrl);
        } else {
            items = mergeInterviewFromSheets(items, {});
        }
        allProblems = items;
        refreshCuratedOrderIndex();
        populatePatternFilter(allProblems);
        populateCompanyFilter(allProblems);
        applyAndRender();
    } catch (err) {
        console.error(err);
        __dsaAppReady = true;
        window.__DSA_APP_READY__ = true;
        setGeneralNotesUiReady(true);
        elements.body.innerHTML = `<tr><td colspan="7" style="color:red; text-align:center; padding:2rem;">Could not load problem data. Use a local server (e.g. <code>python3 -m http.server</code>) or ensure <code>data.js</code> exists next to index.html (run <code>node scripts/build-data-js.mjs</code>). See console for details.</td></tr>`;
    }
}

/**
 * Over http(s), load fresh data.json. Opening index.html as file:// cannot use fetch()
 * for sibling files (origin is "null", CORS blocks it). data.js defines window.__DSA_DATA
 * for that case — load data.js before app.js in index.html.
 */
async function loadData() {
    if (window.location.protocol === "file:" && Array.isArray(window.__DSA_DATA)) {
        return window.__DSA_DATA;
    }
    const dataUrl = new URL("data.json", getAssetBaseUrl()).href;
    try {
        const res = await fetch(dataUrl, { cache: "no-cache" });
        if (!res.ok) throw new Error(`HTTP ${res.status} ${dataUrl}`);
        return await res.json();
    } catch (e) {
        if (Array.isArray(window.__DSA_DATA)) {
            console.warn("fetch failed; using embedded __DSA_DATA from data.js", e);
            return window.__DSA_DATA;
        }
        throw e;
    }
}

/**
 * Slim sheet: data/sheets/interview-tracker.json (from company_questions_by_url.json + data.json).
 * file:// uses window.__INTERVIEW_SHEETS from interview-data.js.
 */
async function loadInterviewSheets() {
    if (window.location.protocol === "file:" && window.__INTERVIEW_SHEETS?.tracker) {
        return window.__INTERVIEW_SHEETS;
    }
    const interviewUrl = new URL("data/sheets/interview-tracker.json", getAssetBaseUrl()).href;
    try {
        const res = await fetch(interviewUrl, { cache: "no-cache" });
        if (!res.ok) {
            console.warn("interview-tracker.json missing; interview columns empty", interviewUrl);
            return window.__INTERVIEW_SHEETS || null;
        }
        return { tracker: await res.json() };
    } catch (e) {
        if (window.__INTERVIEW_SHEETS?.tracker) {
            console.warn("fetch interview sheet failed; using interview-data.js", e);
            return window.__INTERVIEW_SHEETS;
        }
        console.warn("Interview data not available", e);
        return null;
    }
}

function normalizeUrlKey(url) {
    let u = String(url ?? "")
        .trim()
        .replace(/\[|\]|\(.*\)/g, "")
        .trim();
    for (const sep of ["#", "?"]) {
        if (u.includes(sep)) u = u.split(sep, 1)[0];
    }
    return u.replace(/\/+$/, "");
}

function mergeInterviewFromSheets(items, byUrl) {
    return items.map((p) => {
        const key = normalizeUrlKey(p.link);
        const iv = byUrl[key];
        if (!iv) {
            return {
                ...p,
                interviewMatched: false,
                interviewCompanies: [],
                interviewAppearanceCount: 0,
                interviewCompanyCount: 0,
                interviewFrequencyPct: 0,
            };
        }
        return {
            ...p,
            interviewMatched: !!iv.matched,
            interviewCompanies: Array.isArray(iv.companies) ? iv.companies : [],
            interviewAppearanceCount: iv.appearance_count ?? 0,
            interviewCompanyCount: iv.company_count ?? 0,
            interviewFrequencyPct: iv.appearance_frequency_pct ?? 0,
        };
    });
}

function refreshCuratedOrderIndex() {
    curatedOrderIndex = new Map(allProblems.map((p, i) => [p.id, i]));
}

function getDefaultPageSize() {
    return window.innerWidth <= 850 ? ITEMS_PER_PAGE_MOBILE : ITEMS_PER_PAGE_DESKTOP;
}

function loadStoredPageSize() {
    try {
        const raw = localStorage.getItem(PAGE_SIZE_KEY);
        if (raw == null) return getDefaultPageSize();
        const n = parseInt(raw, 10);
        if (Number.isFinite(n)) {
            return Math.min(PAGE_SIZE_MAX, Math.max(PAGE_SIZE_MIN, n));
        }
    } catch (_) {
        /* ignore */
    }
    return getDefaultPageSize();
}

function syncPageSizeFromViewportIfAuto() {
    if (!pageSizeUserSet) {
        itemsPerPageOverride = getDefaultPageSize();
        if (elements.pageSizeInput) {
            elements.pageSizeInput.value = String(itemsPerPageOverride);
        }
    }
}

function onPageSizeChange() {
    const raw = elements.pageSizeInput.value;
    const n = parseInt(raw, 10);
    if (!Number.isFinite(n)) return;
    const v = Math.min(PAGE_SIZE_MAX, Math.max(PAGE_SIZE_MIN, n));
    itemsPerPageOverride = v;
    elements.pageSizeInput.value = String(v);
    pageSizeUserSet = true;
    try {
        localStorage.setItem(PAGE_SIZE_KEY, String(v));
    } catch (_) {
        /* ignore */
    }
    const totalPages = getTotalPages(filteredProblems.length);
    currentPage = Math.min(currentPage, totalPages);
    renderProblems();
    renderPagination(totalPages);
}

function initPaginationControls() {
    elements.pageSizeInput.min = String(PAGE_SIZE_MIN);
    elements.pageSizeInput.max = String(PAGE_SIZE_MAX);
    elements.pageSizeInput.value = String(itemsPerPageOverride);
    elements.pageSizeInput.addEventListener("change", onPageSizeChange);
    elements.pageSizeInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            onPageSizeChange();
        }
    });
}

function bindControls() {
    elements.searchInput.addEventListener("input", applyAndRender);
    elements.patternFilter.addEventListener("change", applyAndRender);
    elements.difficultyFilter.addEventListener("change", applyAndRender);
    elements.companyFilter.addEventListener("change", applyAndRender);
    if (elements.flagFilter) elements.flagFilter.addEventListener("change", applyAndRender);
    elements.sheetCloseBtn.addEventListener("click", closeNotesSheet);
    elements.sheetSaveBtn.addEventListener("click", closeNotesSheet);
    if (elements.notesFlagSelect) {
        elements.notesFlagSelect.addEventListener("change", onNotesFlagChange);
    }
    elements.togglePreviewBtn.addEventListener("click", toggleNotesPreview);
    elements.prevPageBtn.addEventListener("click", () => changePage(-1));
    elements.nextPageBtn.addEventListener("click", () => changePage(1));
    elements.pageJumpInput.addEventListener("change", () => {
        goToPage(elements.pageJumpInput.value);
    });
    elements.pageJumpInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            goToPage(elements.pageJumpInput.value);
        }
    });
    elements.themeToggle.addEventListener("click", () => {
        const next = document.body.classList.contains("dark") ? "light" : "dark";
        applyTheme(next);
        localStorage.setItem(THEME_KEY, next);
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && elements.notesSheet.classList.contains("open")) closeNotesSheet();
        if (e.key === "Escape" && generalNotesModalOpen) closeGeneralNotesModal();
        if (e.key === "Escape" && elements.timerDock?.classList.contains("timer-dock--open")) {
            closeMobileTimerDock();
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 850) closeMobileTimerDock();
        else clampTimerFloatToViewport();
        setDesktopTimerPip(timerPipEnabled, false);
        if (window.innerWidth > 850 && timerPipEnabled) {
            clampDesktopTimerPipToViewport();
        }
        syncPageSizeFromViewportIfAuto();
        clampNotesSheetWidthToViewport();
        const totalPages = getTotalPages(filteredProblems.length);
        currentPage = Math.min(currentPage, totalPages);
        renderProblems();
        renderPagination(totalPages);
    });

    initNotesSheetResize();
    bindSessionTimer();
    initGeneralNotesModal();
    initTimerSticky();
}

function clampNotesSheetWidth(w) {
    const max = Math.min(NOTES_SHEET_WIDTH_MAX, Math.floor(window.innerWidth * 0.92));
    return Math.max(NOTES_SHEET_WIDTH_MIN, Math.min(max, Math.round(w)));
}

function loadStoredNotesSheetWidth() {
    try {
        const raw = localStorage.getItem(NOTES_SHEET_WIDTH_KEY);
        if (raw == null) return NOTES_SHEET_WIDTH_DEFAULT;
        const n = parseInt(raw, 10);
        if (!Number.isFinite(n)) return NOTES_SHEET_WIDTH_DEFAULT;
        return clampNotesSheetWidth(n);
    } catch (_) {
        return NOTES_SHEET_WIDTH_DEFAULT;
    }
}

function applyNotesSheetWidth(px, persist) {
    if (!elements.notesSheet) return;
    const w = clampNotesSheetWidth(px);
    elements.notesSheet.style.setProperty("--notes-sheet-w", `${w}px`);
    if (persist) {
        try {
            localStorage.setItem(NOTES_SHEET_WIDTH_KEY, String(w));
        } catch (_) {
            /* ignore */
        }
    }
}

function clampNotesSheetWidthToViewport() {
    if (!elements.notesSheet) return;
    const raw = elements.notesSheet.style.getPropertyValue("--notes-sheet-w").trim();
    if (!raw) return;
    const n = parseInt(raw, 10);
    if (!Number.isFinite(n)) return;
    const next = clampNotesSheetWidth(n);
    if (next !== n) {
        applyNotesSheetWidth(next, true);
    }
}

function initNotesSheetResize() {
    const handle = elements.notesSheetResize;
    if (!handle || !elements.notesSheet) return;

    let dragging = false;
    let startX = 0;
    let startW = NOTES_SHEET_WIDTH_DEFAULT;

    const endDrag = (e) => {
        if (!dragging) return;
        dragging = false;
        elements.notesSheet.classList.remove("notes-sheet--dragging");
        document.body.classList.remove("notes-sheet-resizing");
        try {
            handle.releasePointerCapture(e.pointerId);
        } catch (_) {
            /* ignore */
        }
        const raw = elements.notesSheet.style.getPropertyValue("--notes-sheet-w").trim();
        const w = parseInt(raw, 10);
        if (Number.isFinite(w)) {
            applyNotesSheetWidth(w, true);
        }
    };

    handle.addEventListener("pointerdown", (e) => {
        if (window.innerWidth <= 850) return;
        if (!elements.notesSheet.classList.contains("open")) return;
        if (e.button !== 0) return;
        e.preventDefault();
        dragging = true;
        startX = e.clientX;
        startW = elements.notesSheet.getBoundingClientRect().width;
        elements.notesSheet.classList.add("notes-sheet--dragging");
        document.body.classList.add("notes-sheet-resizing");
        handle.setPointerCapture(e.pointerId);
    });

    handle.addEventListener("pointermove", (e) => {
        if (!dragging) return;
        const delta = startX - e.clientX;
        applyNotesSheetWidth(startW + delta, false);
    });

    handle.addEventListener("pointerup", endDrag);
    handle.addEventListener("pointercancel", endDrag);

    handle.addEventListener("dblclick", () => {
        if (window.innerWidth <= 850) return;
        applyNotesSheetWidth(NOTES_SHEET_WIDTH_DEFAULT, true);
    });

    handle.addEventListener("keydown", (e) => {
        if (window.innerWidth <= 850) return;
        if (!elements.notesSheet.classList.contains("open")) return;
        const step = e.shiftKey ? 40 : 16;
        const raw = elements.notesSheet.style.getPropertyValue("--notes-sheet-w").trim();
        const cur = parseInt(raw, 10) || NOTES_SHEET_WIDTH_DEFAULT;
        if (e.key === "ArrowLeft") {
            e.preventDefault();
            applyNotesSheetWidth(cur + step, true);
        } else if (e.key === "ArrowRight") {
            e.preventDefault();
            applyNotesSheetWidth(cur - step, true);
        } else if (e.key === "Home") {
            e.preventDefault();
            applyNotesSheetWidth(NOTES_SHEET_WIDTH_DEFAULT, true);
        }
    });
}

function loadSavedDurationSeconds() {
    try {
        const raw = localStorage.getItem(TIMER_PREFS_KEY);
        if (!raw) return 20 * 60;
        const o = JSON.parse(raw);
        if (typeof o.durationSec === "number" && o.durationSec > 0) {
            return clampDurationSec(o.durationSec);
        }
        if (typeof o.defaultMinutes === "number" && o.defaultMinutes > 0) {
            return clampDurationSec(o.defaultMinutes * 60);
        }
        return 20 * 60;
    } catch {
        return 20 * 60;
    }
}

function clampDurationSec(sec) {
    return Math.min(TIMER_MAX_DURATION_SEC, Math.max(1, Math.floor(sec)));
}

function initSessionTimer() {
    timerTotalSeconds = loadSavedDurationSeconds();
    timerRemainingSeconds = timerTotalSeconds;
    updateSessionTimerUI();
}

function persistTimerPrefs() {
    localStorage.setItem(
        TIMER_PREFS_KEY,
        JSON.stringify({ durationSec: timerTotalSeconds })
    );
}

/** Parse "MM:SS" or "M:SS" or "H:MM:SS" → seconds */
function parseTimeToSeconds(str) {
    const t = String(str).trim();
    if (!t.includes(":")) return null;
    const parts = t.split(":").map((p) => parseInt(p, 10));
    if (parts.some((n) => Number.isNaN(n) || n < 0)) return null;
    if (parts.length === 2) {
        return parts[0] * 60 + parts[1];
    }
    if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return null;
}

function formatTimeForInput(totalSec) {
    const s = Math.max(0, Math.floor(totalSec));
    if (s >= 3600) {
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
    }
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
}

function clearTimerInterval() {
    if (timerIntervalId !== null) {
        clearInterval(timerIntervalId);
        timerIntervalId = null;
    }
}

function applyDurationFromInput(persist) {
    const parsed = parseTimeToSeconds(elements.timerTimeInput.value);
    if (parsed === null) return false;
    timerTotalSeconds = clampDurationSec(parsed);
    timerRemainingSeconds = timerTotalSeconds;
    elements.timerTimeInput.value = formatTimeForInput(timerTotalSeconds);
    if (persist) persistTimerPrefs();
    return true;
}

function applyDurationFromRawInput(rawValue, persist) {
    const parsed = parseTimeToSeconds(rawValue);
    if (parsed === null) return false;
    timerTotalSeconds = clampDurationSec(parsed);
    timerRemainingSeconds = timerTotalSeconds;
    elements.timerTimeInput.value = formatTimeForInput(timerTotalSeconds);
    if (persist) persistTimerPrefs();
    return true;
}

function updateTimerControlsUI(ctrl) {
    if (!ctrl?.timeInput || !ctrl?.progressFill || !ctrl?.primaryBtn) return;
    ctrl.timeInput.readOnly = timerState !== "idle";
    ctrl.timeInput.setAttribute("aria-live", timerState === "idle" ? "off" : "polite");
    ctrl.timeInput.value = formatTimeForInput(
        timerState === "idle" ? timerTotalSeconds : timerRemainingSeconds
    );
    ctrl.timeInput.classList.toggle(
        "timer-expired",
        timerRemainingSeconds <= 0 && timerState === "idle"
    );
    const pct = timerTotalSeconds > 0 ? (timerRemainingSeconds / timerTotalSeconds) * 100 : 0;
    ctrl.progressFill.style.width = `${pct}%`;

    if (timerState === "idle") {
        ctrl.primaryBtn.textContent = "▶";
        ctrl.primaryBtn.setAttribute("aria-label", "Start timer");
        ctrl.primaryBtn.disabled = timerRemainingSeconds <= 0;
    } else if (timerState === "running") {
        ctrl.primaryBtn.textContent = "⏸";
        ctrl.primaryBtn.setAttribute("aria-label", "Pause timer");
        ctrl.primaryBtn.disabled = false;
    } else {
        ctrl.primaryBtn.textContent = "▶";
        ctrl.primaryBtn.setAttribute("aria-label", "Resume timer");
        ctrl.primaryBtn.disabled = timerRemainingSeconds <= 0;
    }
}

function updateSessionTimerUI() {
    updateTimerControlsUI({
        timeInput: elements.timerTimeInput,
        progressFill: elements.timerProgressFill,
        primaryBtn: elements.timerPrimaryBtn,
    });
    updateTimerControlsUI(timerPipDocumentControls);
    document.body.classList.toggle("session-timer-running", timerState === "running");
}

function timerTick() {
    timerRemainingSeconds -= 1;
    updateSessionTimerUI();
    if (timerRemainingSeconds <= 0) {
        clearTimerInterval();
        timerState = "idle";
        timerRemainingSeconds = 0;
        updateSessionTimerUI();
        onSessionTimerComplete();
    }
}

function startSessionTimer() {
    if (timerState === "idle" && !applyDurationFromInput(false)) return;
    if (timerRemainingSeconds <= 0) return;
    clearTimerInterval();
    timerState = "running";
    timerIntervalId = setInterval(timerTick, 1000);
    updateSessionTimerUI();
}

function pauseSessionTimer() {
    clearTimerInterval();
    timerState = "paused";
    updateSessionTimerUI();
}

function resumeSessionTimer() {
    if (timerRemainingSeconds <= 0) return;
    startSessionTimer();
}

function resetSessionTimer() {
    clearTimerInterval();
    if (timerTitleFlashId !== null) {
        clearInterval(timerTitleFlashId);
        timerTitleFlashId = null;
    }
    timerState = "idle";
    timerRemainingSeconds = timerTotalSeconds;
    elements.timerTimeInput.classList.remove("timer-expired");
    document.title = appPageTitle;
    updateSessionTimerUI();
}

function onSessionTimerComplete() {
    playTimerBeep();
    let flash = true;
    timerTitleFlashId = setInterval(() => {
        document.title = flash ? `⏰ Time's up! — ${appPageTitle}` : appPageTitle;
        flash = !flash;
    }, 700);
    setTimeout(() => {
        if (timerTitleFlashId !== null) {
            clearInterval(timerTitleFlashId);
            timerTitleFlashId = null;
        }
        document.title = appPageTitle;
    }, 6000);
}

function playTimerBeep() {
    try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return;
        const ctx = new Ctx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.25);
    } catch {
        /* ignore */
    }
}

function setMobileTimerDockOpen(open) {
    if (!elements.timerDock) return;
    const mobileView = open
        ? elements.timerDock.classList.contains("timer-dock--mobile-sticky")
            ? "sticky"
            : "timer"
        : null;
    const showTimer = mobileView === "timer";
    const showSticky = mobileView === "sticky";
    elements.timerDock.classList.toggle("timer-dock--open", open);
    elements.timerDock.classList.toggle("timer-dock--mobile-timer", showTimer);
    elements.timerDock.classList.toggle("timer-dock--mobile-sticky", showSticky);
    if (elements.timerMobileToggle) {
        elements.timerMobileToggle.setAttribute("aria-expanded", showTimer ? "true" : "false");
        elements.timerMobileToggle.setAttribute("aria-label", showTimer ? "Hide timer" : "Show timer");
    }
    if (elements.timerStickyMobileToggle) {
        elements.timerStickyMobileToggle.setAttribute("aria-expanded", showSticky ? "true" : "false");
        elements.timerStickyMobileToggle.setAttribute(
            "aria-label",
            showSticky ? "Hide stickies" : "Show stickies"
        );
    }
    if (open && window.innerWidth <= 850) {
        applyTimerFloatPosition();
        clampTimerFloatToViewport();
    }
}

/**
 * @param {null | "timer" | "sticky"} mode
 */
function setMobileTimerDockMode(mode) {
    if (!elements.timerDock) return;
    if (mode === null) {
        elements.timerDock.classList.remove("timer-dock--mobile-timer", "timer-dock--mobile-sticky");
        setMobileTimerDockOpen(false);
        return;
    }
    elements.timerDock.classList.toggle("timer-dock--mobile-timer", mode === "timer");
    elements.timerDock.classList.toggle("timer-dock--mobile-sticky", mode === "sticky");
    setMobileTimerDockOpen(true);
}

function closeMobileTimerDock() {
    setMobileTimerDockMode(null);
}

function loadDesktopTimerPipEnabled() {
    try {
        return localStorage.getItem(TIMER_PIP_ENABLED_KEY) === "1";
    } catch (_) {
        return false;
    }
}

function supportsDocumentTimerPip() {
    return (
        typeof window !== "undefined" &&
        "documentPictureInPicture" in window &&
        typeof window.documentPictureInPicture?.requestWindow === "function"
    );
}

function updateTimerPipToggleUI() {
    if (!elements.timerPipToggle) return;
    const desktop = window.innerWidth > 850;
    const docPipTimer =
        desktop &&
        timerPipDocumentWindow &&
        !timerPipDocumentWindow.closed &&
        pipDocumentMode === "timer";
    const fallbackPip = desktop && elements.timerDock?.classList.contains("timer-dock--pip");
    const pressed = docPipTimer || fallbackPip;
    elements.timerPipToggle.textContent = pressed ? "🗗" : "⧉";
    elements.timerPipToggle.setAttribute("aria-pressed", pressed ? "true" : "false");
    elements.timerPipToggle.setAttribute(
        "aria-label",
        pressed ? "Close timer picture in picture" : "Open timer picture in picture"
    );
    elements.timerPipToggle.title = pressed ? "Close Picture in Picture" : "Timer in Picture in Picture";
}

function updateStickyPipToggleUI() {
    const btn = elements.timerStickyCardPipToggle;
    if (!btn) return;
    const desktop = window.innerWidth > 850;
    const pressed =
        desktop &&
        timerPipDocumentWindow &&
        !timerPipDocumentWindow.closed &&
        pipDocumentMode === "sticky";
    btn.setAttribute("aria-pressed", pressed ? "true" : "false");
    btn.setAttribute(
        "aria-label",
        pressed ? "Close stickies picture in picture" : "Open stickies picture in picture"
    );
    btn.title = pressed ? "Close stickies Picture in Picture" : "Stickies in Picture in Picture";
}

function refreshDocumentPipToggleUIs() {
    updateTimerPipToggleUI();
    updateStickyPipToggleUI();
}

/**
 * Shrink (or grow) the Document PiP outer window to match laid-out content.
 * @param {Window} pipWin
 * @param {Document} pipDoc
 * @param {{ w: number; h: number }} lastApplied — skip if change is negligible (ResizeObserver loops).
 */
function fitDocumentPipToContent(pipWin, pipDoc, lastApplied) {
    if (!pipWin || pipWin.closed || !pipDoc) return;
    const root = pipDoc.querySelector(".timer-pip-root");
    if (!root) return;
    const padX = 20;
    const padY = 32;
    const rect = root.getBoundingClientRect();
    const contentW = Math.ceil(Math.max(rect.width, root.scrollWidth) + padX);
    const contentH = Math.ceil(
        Math.max(
            pipDoc.body.scrollHeight,
            pipDoc.documentElement.scrollHeight,
            rect.height,
            root.scrollHeight
        ) + padY
    );
    const minW = 292;
    const minH = 120;
    const maxW = Math.min(560, window.screen?.availWidth ? window.screen.availWidth - 24 : 560);
    const maxH = Math.min(900, window.screen?.availHeight ? window.screen.availHeight - 48 : 900);
    const finalW = Math.min(maxW, Math.max(minW, contentW));
    const finalH = Math.min(maxH, Math.max(minH, contentH));
    if (Math.abs(finalW - lastApplied.w) < 3 && Math.abs(finalH - lastApplied.h) < 3) return;
    lastApplied.w = finalW;
    lastApplied.h = finalH;
    try {
        pipWin.resizeTo(finalW, finalH);
    } catch (_) {
        /* Some builds require transient activation for resizeTo */
    }
}

function disconnectDocumentPipFit(pipWin) {
    if (!pipWin) return;
    const obs = pipWin.__dsaPipFitObserver;
    const st = pipWin.__dsaPipFitState;
    if (obs && typeof obs.disconnect === "function") obs.disconnect();
    if (st?.timerId) clearTimeout(st.timerId);
    pipWin.__dsaPipFitObserver = null;
    pipWin.__dsaPipFitState = null;
}

function closeDocumentTimerPipWindow() {
    const win = timerPipDocumentWindow;
    const mode = pipDocumentMode;
    disconnectDocumentPipFit(win);
    timerPipDocumentWindow = null;
    timerPipDocumentControls = null;
    pipDocumentMode = null;
    if (!win || win.closed) return;
    if (mode === "sticky") {
        void disposeTimerStickyPipAndRemountMain(win);
    }
    timerPipClosingByCode = true;
    try {
        win.close();
    } catch (_) {
        /* ignore */
    } finally {
        setTimeout(() => {
            timerPipClosingByCode = false;
        }, 0);
    }
}

function attachDocumentPipResizeFit(pipWin, pipDoc, root) {
    const state = { timerId: null, last: { w: 0, h: 0 } };
    pipWin.__dsaPipFitState = state;
    const scheduleFitDocumentPip = () => {
        if (state.timerId) clearTimeout(state.timerId);
        state.timerId = setTimeout(() => {
            state.timerId = null;
            fitDocumentPipToContent(pipWin, pipDoc, state.last);
        }, 48);
    };
    const pipFitObserver = new ResizeObserver(() => scheduleFitDocumentPip());
    pipFitObserver.observe(root);
    pipWin.__dsaPipFitObserver = pipFitObserver;
}

function scheduleDocumentPipInitialFits(pipWin, pipDoc) {
    const st = pipWin.__dsaPipFitState;
    const pipFitLast = st?.last || { w: 0, h: 0 };
    fitDocumentPipToContent(pipWin, pipDoc, pipFitLast);
    requestAnimationFrame(() => {
        fitDocumentPipToContent(pipWin, pipDoc, pipFitLast);
        requestAnimationFrame(() => fitDocumentPipToContent(pipWin, pipDoc, pipFitLast));
    });
    setTimeout(() => fitDocumentPipToContent(pipWin, pipDoc, pipFitLast), 120);
    setTimeout(() => fitDocumentPipToContent(pipWin, pipDoc, pipFitLast), 400);
}

function wireTimerPipControls(pipWin, pipDoc) {
    const pipControls = {
        timeInput: pipDoc.getElementById("timerTimeInput"),
        progressFill: pipDoc.getElementById("timerProgressFill"),
        primaryBtn: pipDoc.getElementById("timerPrimaryBtn"),
        resetBtn: pipDoc.getElementById("timerResetBtn"),
        pipToggleBtn: pipDoc.getElementById("timerPipToggle"),
    };
    timerPipDocumentControls = pipControls;

    if (pipControls.primaryBtn) {
        pipControls.primaryBtn.addEventListener("click", () => {
            if (timerState === "idle") startSessionTimer();
            else if (timerState === "running") pauseSessionTimer();
            else resumeSessionTimer();
        });
    }
    if (pipControls.resetBtn) {
        pipControls.resetBtn.addEventListener("click", () => {
            resetSessionTimer();
        });
    }
    if (pipControls.timeInput) {
        pipControls.timeInput.addEventListener("change", () => {
            if (timerState !== "idle") return;
            if (applyDurationFromRawInput(pipControls.timeInput.value, true)) {
                updateSessionTimerUI();
            } else {
                pipControls.timeInput.value = formatTimeForInput(timerTotalSeconds);
            }
        });
        pipControls.timeInput.addEventListener("blur", () => {
            if (timerState !== "idle") return;
            const parsed = parseTimeToSeconds(pipControls.timeInput.value);
            if (parsed === null) {
                pipControls.timeInput.value = formatTimeForInput(timerTotalSeconds);
                return;
            }
            timerTotalSeconds = clampDurationSec(parsed);
            timerRemainingSeconds = timerTotalSeconds;
            persistTimerPrefs();
            updateSessionTimerUI();
        });
    }
    if (pipControls.pipToggleBtn) {
        pipControls.pipToggleBtn.textContent = "✕";
        pipControls.pipToggleBtn.setAttribute("aria-label", "Close timer picture in picture");
        pipControls.pipToggleBtn.title = "Close Picture in Picture";
        pipControls.pipToggleBtn.addEventListener("click", () => {
            setDesktopTimerPip(false, true);
        });
    }
}

function installDocumentPipPagehide(pipWin, pipDoc) {
    if (pipWin.__dsaPagehideBound) return;
    pipWin.__dsaPagehideBound = true;
    pipWin.addEventListener("pagehide", () => {
        disconnectDocumentPipFit(pipWin);
        const mode = pipDocumentMode;
        timerPipDocumentWindow = null;
        timerPipDocumentControls = null;
        pipDocumentMode = null;
        if (mode === "sticky") {
            void disposeTimerStickyPipAndRemountMain(pipWin);
        }
        if (!timerPipClosingByCode && window.innerWidth > 850) {
            if (mode === "timer") {
                timerPipEnabled = false;
                try {
                    localStorage.setItem(TIMER_PIP_ENABLED_KEY, "0");
                } catch (_) {
                    /* ignore */
                }
            }
            refreshDocumentPipToggleUIs();
        }
    });
}

/**
 * @param {'timer' | 'sticky'} mode
 */
// async function openDocumentPipWindow(mode) {
//     if (!supportsDocumentTimerPip()) return false;
//     if (timerPipDocumentWindow && !timerPipDocumentWindow.closed) {
//         if (pipDocumentMode === mode) {
//             timerPipDocumentWindow.focus();
//             return true;
//         }
//         return swapDocumentPipMode(mode);
//     }

//     persistTimerStickyStateFromUi();

//     if (mode === "sticky") {
//         destroyTimerStickyEditor();
//         if (elements.timerStickyPipBanner) elements.timerStickyPipBanner.classList.remove("hidden");
//     }

//     // let pipWin;
//     // try {
//     //     pipWin = await window.documentPictureInPicture.requestWindow({
//     //         width: mode === "timer" ? 320 : 340,
//     //         height: mode === "timer" ? 130 : 300,
//     //     });
//     // } catch (err) {
//     //     console.error("Document Picture-in-Picture failed:", err);
//     //     if (mode === "sticky") {
//     //         if (elements.timerStickyPipBanner) elements.timerStickyPipBanner.classList.add("hidden");
//     //         await remountTimerStickyMainAfterPip();
//     //     }
//     //     return false;
//     // }
//     let pipWin;
//     try {
//         pipWin = await window.documentPictureInPicture.requestWindow({
//             width: mode === "timer" ? 320 : 340,
//             height: mode === "timer" ? 85 : 300,
//         });

//         const doc = pipWin.document;

//         // 🔥 CRITICAL FIX
//         doc.documentElement.style.background = "transparent";
//         doc.body.style.background = "transparent";
//         doc.body.style.margin = "0";
//         doc.body.style.padding = "0";

//     } catch (err) {
//         console.error("Document Picture-in-Picture failed:", err);
//         if (mode === "sticky") {
//             if (elements.timerStickyPipBanner) elements.timerStickyPipBanner.classList.add("hidden");
//             await remountTimerStickyMainAfterPip();
//         }
//         return false;
//     }

//     timerPipDocumentWindow = pipWin;
//     pipDocumentMode = mode;

//     const pipDoc = pipWin.document;
//     pipDoc.documentElement.lang = "en";
//     pipDoc.head.innerHTML = "";
//     pipDoc.body.innerHTML = "";
//     pipDoc.title = mode === "timer" ? "Timer" : "Session stickies";

//     document.querySelectorAll('link[rel="stylesheet"], style').forEach((node) => {
//         pipDoc.head.appendChild(node.cloneNode(true));
//     });
//     const runtimeStyle = pipDoc.createElement("style");
//     runtimeStyle.textContent = `
//       html, body {
//         margin: 0;
//         padding: 0;
//         background: transparent !important;
//         min-height: 0 !important;
//         height: auto !important;
//         overflow-x: hidden;
//       }
//       body { font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
//       .timer-pip-root {
//         padding: 0;
//         box-sizing: border-box;
//         width: max-content;
//         max-width: min(520px, 100vw);
//         min-height: 0;
//       }
//       .timer-panel.sidebar-card { margin: 0 !important; display: flex; flex-direction: column; }
//       .timer-sticky-dock.sidebar-card {
//         margin: 0 !important;
//         margin-top: 0 !important;
//         padding: 0 !important;
//         border: none !important;
//         box-shadow: none !important;
//         background: transparent !important;
//       }
//       .timer-pip-root .timer-sticky-card {
//         box-shadow: none;
//       }
//       #timerDragHandle { display: none !important; }
//       .timer-pip-root .timer-sticky-editor-host .notes-rich-prose-host { min-height: 3rem; }
//       .timer-pip-root .timer-sticky-editor-host .notes-rich-prosemirror {
//         min-height: 2.75rem;
//         max-height: min(58vh, 26rem);
//       }
//     `;
//     pipDoc.head.appendChild(runtimeStyle);

//     const root = pipDoc.createElement("div");
//     root.className = "timer-pip-root";
//     pipDoc.body.appendChild(root);
//     pipDoc.body.classList.toggle("dark", document.body.classList.contains("dark"));

//     if (mode === "timer") {
//         const panelClone = elements.timerPanel.cloneNode(true);
//         panelClone.id = "timerPanelPip";
//         root.appendChild(panelClone);
//         wireTimerPipControls(pipWin, pipDoc);
//     } else {
//         const dockClone = elements.timerStickyDock.cloneNode(true);
//         dockClone.id = "timerStickyDockPip";
//         root.appendChild(dockClone);
//         pipDoc.getElementById("timerStickyPipBanner")?.classList.add("hidden");
//         pipDoc.getElementById("timerStickyEditorMount")?.replaceChildren();
//         pipDoc.getElementById("timerStickyToolbarHost")?.replaceChildren();
//         await setupStickyPipSurface(pipWin, pipDoc);
//         timerPipDocumentControls = null;
//     }

//     attachDocumentPipResizeFit(pipWin, pipDoc, root);
//     installDocumentPipPagehide(pipWin, pipDoc);

//     updateSessionTimerUI();
//     scheduleDocumentPipInitialFits(pipWin, pipDoc);
//     refreshDocumentPipToggleUIs();
//     return true;
// }
async function openDocumentPipWindow(mode) {
    if (!supportsDocumentTimerPip()) return false;

    if (timerPipDocumentWindow && !timerPipDocumentWindow.closed) {
        if (pipDocumentMode === mode) {
            timerPipDocumentWindow.focus();
            return true;
        }
        return swapDocumentPipMode(mode);
    }

    persistTimerStickyStateFromUi();

    if (mode === "sticky") {
        destroyTimerStickyEditor();
        if (elements.timerStickyPipBanner) {
            elements.timerStickyPipBanner.classList.remove("hidden");
        }
    }

    let pipWin;
    try {
        pipWin = await window.documentPictureInPicture.requestWindow({
            width: mode === "timer" ? 320 : 340,
            height: mode === "timer" ? 85 : 300,
        });
    } catch (err) {
        console.error("Document Picture-in-Picture failed:", err);
        if (mode === "sticky") {
            if (elements.timerStickyPipBanner) {
                elements.timerStickyPipBanner.classList.add("hidden");
            }
            await remountTimerStickyMainAfterPip();
        }
        return false;
    }

    timerPipDocumentWindow = pipWin;
    pipDocumentMode = mode;

    const pipDoc = pipWin.document;

    // 🧹 Reset document
    pipDoc.documentElement.lang = "en";
    pipDoc.head.innerHTML = "";
    pipDoc.body.innerHTML = "";
    pipDoc.title = mode === "timer" ? "Timer" : "Session stickies";

    // 🔥 CRITICAL: apply AFTER reset
    pipDoc.documentElement.style.background = "transparent";
    pipDoc.body.style.background = "transparent";
    pipDoc.body.style.margin = "0";
    pipDoc.body.style.padding = "0";
    pipDoc.body.style.height = "100%";

    // 🎨 Copy styles
    document.querySelectorAll('link[rel="stylesheet"], style').forEach((node) => {
        pipDoc.head.appendChild(node.cloneNode(true));
    });

    // 🎯 Runtime styles
    const runtimeStyle = pipDoc.createElement("style");
    runtimeStyle.textContent = `
        html, body {
            margin: 0;
            padding: 0;
            background: transparent !important;
            height: 100%;
            width: 100%;
            overflow: hidden;
        }

        body {
            font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
        }

        .timer-pip-root {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
        }

        /* Optional: nicer floating feel */
        .timer-pip-card {
            background: transparent;
            backdrop-filter: blur(8px);
            border-radius: 12px;
        }

        .timer-panel.sidebar-card,
        .timer-sticky-dock.sidebar-card {
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: transparent !important;
        }

        #timerDragHandle { display: none !important; }
    `;
    pipDoc.head.appendChild(runtimeStyle);

    // 🧱 Root container
    const root = pipDoc.createElement("div");
    root.className = "timer-pip-root";
    pipDoc.body.appendChild(root);

    // 🌗 Dark mode sync
    pipDoc.body.classList.toggle("dark", document.body.classList.contains("dark"));

    if (mode === "timer") {
        const panelClone = elements.timerPanel.cloneNode(true);
        panelClone.id = "timerPanelPip";
        panelClone.classList.add("timer-pip-card");

        root.appendChild(panelClone);
        wireTimerPipControls(pipWin, pipDoc);

    } else {
        const dockClone = elements.timerStickyDock.cloneNode(true);
        dockClone.id = "timerStickyDockPip";
        dockClone.classList.add("timer-pip-card");

        root.appendChild(dockClone);

        pipDoc.getElementById("timerStickyPipBanner")?.classList.add("hidden");
        pipDoc.getElementById("timerStickyEditorMount")?.replaceChildren();
        pipDoc.getElementById("timerStickyToolbarHost")?.replaceChildren();

        await setupStickyPipSurface(pipWin, pipDoc);
        timerPipDocumentControls = null;
    }

    attachDocumentPipResizeFit(pipWin, pipDoc, root);
    installDocumentPipPagehide(pipWin, pipDoc);

    updateSessionTimerUI();
    scheduleDocumentPipInitialFits(pipWin, pipDoc);
    refreshDocumentPipToggleUIs();

    return true;
}

/**
 * @param {'timer' | 'sticky'} mode
 */
async function swapDocumentPipMode(mode) {
    const pipWin = timerPipDocumentWindow;
    if (!pipWin || pipWin.closed) return openDocumentPipWindow(mode);
    const pipDoc = pipWin.document;
    const prev = pipDocumentMode;

    persistTimerStickyStateFromUi();
    disconnectDocumentPipFit(pipWin);

    if (prev === "sticky") {
        try {
            if (pipWin.document && timerStickyPipEditorHandle) {
                persistTimerStickyFromEditor(timerStickyPipEditorHandle, pipWin.document);
                destroyTimerStickyPipEditor(pipWin.document);
            }
        } catch (_) {
            /* ignore */
        }
        await remountTimerStickyMainAfterPip();
        if (elements.timerStickyPipBanner) elements.timerStickyPipBanner.classList.add("hidden");
    }

    if (mode === "sticky") {
        destroyTimerStickyEditor();
        if (elements.timerStickyPipBanner) elements.timerStickyPipBanner.classList.remove("hidden");
    }

    pipDocumentMode = mode;
    timerPipDocumentControls = null;

    const root = pipDoc.querySelector(".timer-pip-root");
    if (root) root.replaceChildren();

    if (mode === "timer") {
        const panelClone = elements.timerPanel.cloneNode(true);
        panelClone.id = "timerPanelPip";
        root?.appendChild(panelClone);
        wireTimerPipControls(pipWin, pipDoc);
    } else {
        const dockClone = elements.timerStickyDock.cloneNode(true);
        dockClone.id = "timerStickyDockPip";
        root?.appendChild(dockClone);
        pipDoc.getElementById("timerStickyPipBanner")?.classList.add("hidden");
        pipDoc.getElementById("timerStickyEditorMount")?.replaceChildren();
        pipDoc.getElementById("timerStickyToolbarHost")?.replaceChildren();
        await setupStickyPipSurface(pipWin, pipDoc);
    }

    pipDoc.title = mode === "timer" ? "Timer" : "Session stickies";
    if (root) attachDocumentPipResizeFit(pipWin, pipDoc, root);

    updateSessionTimerUI();
    scheduleDocumentPipInitialFits(pipWin, pipDoc);
    refreshDocumentPipToggleUIs();
    return true;
}

async function openDocumentTimerPipWindow() {
    return openDocumentPipWindow("timer");
}

function clearDesktopTimerPipPositionStyles() {
    const dock = elements.timerDock;
    if (!dock) return;
    dock.style.removeProperty("left");
    dock.style.removeProperty("top");
    dock.style.removeProperty("right");
    dock.style.removeProperty("bottom");
    dock.style.removeProperty("transform");
}

function applyDesktopTimerPipPosition() {
    const dock = elements.timerDock;
    if (!dock || window.innerWidth <= 850 || !timerPipEnabled) return;
    try {
        const raw = localStorage.getItem(TIMER_PIP_POS_KEY);
        if (raw) {
            const { left, top } = JSON.parse(raw);
            if (typeof left === "number" && typeof top === "number") {
                dock.style.left = `${left}px`;
                dock.style.top = `${top}px`;
                dock.style.right = "auto";
                dock.style.bottom = "auto";
                dock.style.transform = "none";
                return;
            }
        }
    } catch {
        /* ignore */
    }
    dock.style.right = "16px";
    dock.style.bottom = "16px";
    dock.style.left = "auto";
    dock.style.top = "auto";
    dock.style.transform = "none";
}

function saveDesktopTimerPipPosition() {
    const dock = elements.timerDock;
    if (!dock || window.innerWidth <= 850 || !timerPipEnabled) return;
    const rect = dock.getBoundingClientRect();
    try {
        localStorage.setItem(
            TIMER_PIP_POS_KEY,
            JSON.stringify({ left: rect.left, top: rect.top })
        );
    } catch (_) {
        /* ignore */
    }
}

function clampDesktopTimerPipToViewport() {
    const dock = elements.timerDock;
    if (!dock || window.innerWidth <= 850 || !timerPipEnabled) return;
    const rect = dock.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    let left = rect.left;
    let top = rect.top;
    left = Math.max(0, Math.min(left, window.innerWidth - w));
    top = Math.max(0, Math.min(top, window.innerHeight - h));
    dock.style.left = `${left}px`;
    dock.style.top = `${top}px`;
    dock.style.right = "auto";
    dock.style.bottom = "auto";
    dock.style.transform = "none";
}

async function setDesktopTimerPip(enabled, persist = true) {
    timerPipEnabled = !!enabled;
    if (persist) {
        try {
            localStorage.setItem(TIMER_PIP_ENABLED_KEY, timerPipEnabled ? "1" : "0");
        } catch (_) {
            /* ignore */
        }
    }
    if (!elements.timerDock) return;
    const active = timerPipEnabled && window.innerWidth > 850;
    if (!active) {
        const preserveStickyOnlyPip =
            !persist &&
            timerPipDocumentWindow &&
            !timerPipDocumentWindow.closed &&
            pipDocumentMode === "sticky" &&
            window.innerWidth > 850;
        if (!preserveStickyOnlyPip) {
            closeDocumentTimerPipWindow();
        }
        elements.timerDock.classList.remove("timer-dock--pip");
        clearDesktopTimerPipPositionStyles();
        refreshDocumentPipToggleUIs();
        return;
    }
    if (supportsDocumentTimerPip()) {
        if (!persist && (!timerPipDocumentWindow || timerPipDocumentWindow.closed)) {
            refreshDocumentPipToggleUIs();
            return;
        }
        elements.timerDock.classList.remove("timer-dock--pip");
        clearDesktopTimerPipPositionStyles();
        try {
            await openDocumentPipWindow("timer");
        } catch (err) {
            console.error("Document PiP failed; disabling timer PiP to avoid coupling sticky dock:", err);
            timerPipEnabled = false;
            try {
                localStorage.setItem(TIMER_PIP_ENABLED_KEY, "0");
            } catch (_) {
                /* ignore */
            }
            elements.timerDock.classList.remove("timer-dock--pip");
            clearDesktopTimerPipPositionStyles();
        }
        refreshDocumentPipToggleUIs();
        return;
    }
    // No in-page fallback: it repositions the whole timer dock and unintentionally
    // carries sticky notes with timer PiP. Keep them decoupled.
    timerPipEnabled = false;
    if (persist) {
        try {
            localStorage.setItem(TIMER_PIP_ENABLED_KEY, "0");
        } catch (_) {
            /* ignore */
        }
    }
    elements.timerDock.classList.remove("timer-dock--pip");
    clearDesktopTimerPipPositionStyles();
    refreshDocumentPipToggleUIs();
}

function applyTimerFloatPosition() {
    const dock = elements.timerDock;
    if (!dock || window.innerWidth > 850) return;
    try {
        const raw = localStorage.getItem(TIMER_FLOAT_POS_KEY);
        if (raw) {
            const { left, top } = JSON.parse(raw);
            if (typeof left === "number" && typeof top === "number") {
                dock.style.left = `${left}px`;
                dock.style.top = `${top}px`;
                dock.style.right = "auto";
                dock.style.bottom = "auto";
                dock.style.transform = "none";
                return;
            }
        }
    } catch {
        /* ignore */
    }
    dock.style.removeProperty("left");
    dock.style.removeProperty("top");
    dock.style.right = "auto";
    dock.style.bottom = "auto";
    dock.style.transform = "none";
}

function saveTimerFloatPosition() {
    const dock = elements.timerDock;
    if (!dock || window.innerWidth > 850) return;
    const rect = dock.getBoundingClientRect();
    localStorage.setItem(
        TIMER_FLOAT_POS_KEY,
        JSON.stringify({ left: rect.left, top: rect.top })
    );
}

function clampTimerFloatToViewport() {
    const dock = elements.timerDock;
    if (!dock || !dock.classList.contains("timer-dock--open") || window.innerWidth > 850) return;
    const rect = dock.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    let left = rect.left;
    let top = rect.top;
    left = Math.max(0, Math.min(left, window.innerWidth - w));
    top = Math.max(0, Math.min(top, window.innerHeight - h));
    dock.style.left = `${left}px`;
    dock.style.top = `${top}px`;
    dock.style.right = "auto";
    dock.style.bottom = "auto";
    dock.style.transform = "none";
}

function bindTimerFloatDrag() {
    const handle = elements.timerDragHandle;
    const dock = elements.timerDock;
    if (!handle || !dock) return;

    handle.addEventListener("pointerdown", (e) => {
        const mobileFloat = window.innerWidth <= 850 && dock.classList.contains("timer-dock--open");
        const desktopPip = window.innerWidth > 850 && dock.classList.contains("timer-dock--pip");
        if (!mobileFloat && !desktopPip) return;
        e.preventDefault();
        handle.setPointerCapture(e.pointerId);
        const startX = e.clientX;
        const startY = e.clientY;
        const rect = dock.getBoundingClientRect();
        const origLeft = rect.left;
        const origTop = rect.top;
        dock.style.left = `${origLeft}px`;
        dock.style.top = `${origTop}px`;
        dock.style.right = "auto";
        dock.style.bottom = "auto";
        dock.style.transform = "none";

        const move = (ev) => {
            let nx = origLeft + (ev.clientX - startX);
            let ny = origTop + (ev.clientY - startY);
            const dw = dock.offsetWidth;
            const dh = dock.offsetHeight;
            nx = Math.max(0, Math.min(nx, window.innerWidth - dw));
            ny = Math.max(0, Math.min(ny, window.innerHeight - dh));
            dock.style.left = `${nx}px`;
            dock.style.top = `${ny}px`;
        };

        const up = () => {
            window.removeEventListener("pointermove", move);
            window.removeEventListener("pointerup", up);
            window.removeEventListener("pointercancel", up);
            try {
                handle.releasePointerCapture(e.pointerId);
            } catch {
                /* ignore */
            }
            if (mobileFloat) saveTimerFloatPosition();
            if (desktopPip) saveDesktopTimerPipPosition();
        };

        window.addEventListener("pointermove", move);
        window.addEventListener("pointerup", up);
        window.addEventListener("pointercancel", up);
    });
}

function bindSessionTimer() {
    elements.timerTimeInput.addEventListener("change", () => {
        if (timerState !== "idle") return;
        if (applyDurationFromInput(true)) updateSessionTimerUI();
    });
    elements.timerTimeInput.addEventListener("blur", () => {
        if (timerState !== "idle") return;
        const parsed = parseTimeToSeconds(elements.timerTimeInput.value);
        if (parsed === null) {
            elements.timerTimeInput.value = formatTimeForInput(timerTotalSeconds);
            return;
        }
        timerTotalSeconds = clampDurationSec(parsed);
        timerRemainingSeconds = timerTotalSeconds;
        elements.timerTimeInput.value = formatTimeForInput(timerTotalSeconds);
        persistTimerPrefs();
        updateSessionTimerUI();
    });

    elements.timerPrimaryBtn.addEventListener("click", () => {
        if (timerState === "idle") startSessionTimer();
        else if (timerState === "running") pauseSessionTimer();
        else resumeSessionTimer();
    });

    elements.timerResetBtn.addEventListener("click", () => {
        resetSessionTimer();
    });

    if (elements.timerPipToggle) {
        elements.timerPipToggle.addEventListener("click", async () => {
            if (window.innerWidth <= 850) return;
            await setDesktopTimerPip(!timerPipEnabled, true);
        });
    }

    if (elements.timerMobileToggle) {
        elements.timerMobileToggle.addEventListener("click", () => {
            const showingTimer =
                elements.timerDock.classList.contains("timer-dock--open") &&
                elements.timerDock.classList.contains("timer-dock--mobile-timer");
            setMobileTimerDockMode(showingTimer ? null : "timer");
        });
    }
    if (elements.timerStickyMobileToggle) {
        elements.timerStickyMobileToggle.addEventListener("click", () => {
            const showingSticky =
                elements.timerDock.classList.contains("timer-dock--open") &&
                elements.timerDock.classList.contains("timer-dock--mobile-sticky");
            setMobileTimerDockMode(showingSticky ? null : "sticky");
        });
    }

    bindTimerFloatDrag();
}

/** @type {null | { getHtml: () => string; setDark: (d: boolean) => void; destroy: () => void }} */
let timerStickyEditorHandle = null;
/** @type {null | { getHtml: () => string; setDark: (d: boolean) => void; destroy: () => void }} */
let timerStickyPipEditorHandle = null;
let timerStickySaveTimer = null;
let timerStickyChromeListenersBound = false;
let timerStickyInited = false;
let timerStickyDockActionsBound = false;
let timerStickyCarouselScrollBound = false;
/** Shared active note index between main UI and Document PiP (sticky mode). */
let timerStickyActiveIndex = 0;
let timerStickyCarouselScrollTimer = null;
let timerStickyCarouselSuppress = false;

function newStickyNoteId() {
    return typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `sn-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function getDefaultTimerStickyBgId() {
    return TIMER_STICKY_BACKGROUNDS[0].id;
}

function timerStickyBgMeta(id) {
    return TIMER_STICKY_BACKGROUNDS.find((b) => b.id === id) || TIMER_STICKY_BACKGROUNDS[0];
}

/** @param {unknown} n */
function normalizeTimerStickyNote(n) {
    const o = n && typeof n === "object" ? /** @type {Record<string, unknown>} */ (n) : {};
    const htmlRaw = typeof o.html === "string" ? o.html : "<p></p>";
    const html = sanitizeNotesHtml(htmlRaw) || "<p></p>";
    const bgId =
        typeof o.bgId === "string" && TIMER_STICKY_BACKGROUNDS.some((b) => b.id === o.bgId)
            ? o.bgId
            : getDefaultTimerStickyBgId();
    const sticker =
        typeof o.sticker === "string" && TIMER_STICKY_STICKERS.includes(o.sticker)
            ? o.sticker
            : TIMER_STICKY_STICKERS[0];
    return {
        id: typeof o.id === "string" ? o.id : newStickyNoteId(),
        html,
        bgId,
        sticker,
    };
}

/** @param {unknown} raw */
function migrateRawToTimerStickyStore(raw) {
    if (!raw || typeof raw !== "object") {
        return {
            v: 2,
            activeIndex: 0,
            notes: [
                {
                    id: newStickyNoteId(),
                    html: "<p></p>",
                    bgId: getDefaultTimerStickyBgId(),
                    sticker: TIMER_STICKY_STICKERS[0],
                },
            ],
        };
    }
    const o = /** @type {Record<string, unknown>} */ (raw);
    if (Array.isArray(o.notes) && o.notes.length) {
        const notes = o.notes.map((n) => normalizeTimerStickyNote(n));
        const ai = Math.max(0, Math.min(notes.length - 1, Math.floor(Number(o.activeIndex)) || 0));
        return { v: 2, activeIndex: ai, notes };
    }
    const legacyHtml = typeof o.html === "string" ? o.html : "<p></p>";
    const legacyBg =
        typeof o.bgId === "string" && TIMER_STICKY_BACKGROUNDS.some((b) => b.id === o.bgId)
            ? o.bgId
            : getDefaultTimerStickyBgId();
    const legacySticker =
        typeof o.sticker === "string" && TIMER_STICKY_STICKERS.includes(o.sticker)
            ? o.sticker
            : TIMER_STICKY_STICKERS[0];
    return {
        v: 2,
        activeIndex: 0,
        notes: [
            {
                id: newStickyNoteId(),
                html: sanitizeNotesHtml(legacyHtml) || "<p></p>",
                bgId: legacyBg,
                sticker: legacySticker,
            },
        ],
    };
}

function readTimerStickyStore() {
    try {
        const raw = JSON.parse(localStorage.getItem(TIMER_STICKY_KEY) || "null");
        return migrateRawToTimerStickyStore(raw);
    } catch (_) {
        return migrateRawToTimerStickyStore(null);
    }
}

function writeTimerStickyStore(store) {
    try {
        localStorage.setItem(
            TIMER_STICKY_KEY,
            JSON.stringify({
                v: 2,
                activeIndex: store.activeIndex,
                notes: store.notes,
            })
        );
    } catch (_) {
        /* ignore */
    }
}

function stickyNoteTextPreview(html, maxLen = 72) {
    const t = String(html || "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    if (!t) return "Empty note";
    return t.length > maxLen ? `${t.slice(0, maxLen)}…` : t;
}

/** @param {Document} [doc] */
function applyTimerStickyCardChrome(bgId, sticker, doc = document) {
    const card = doc.getElementById("timerStickySection");
    if (!card) return;
    const bg = timerStickyBgMeta(bgId);
    card.style.setProperty("--timer-sticky-paper", bg.color);
    card.dataset.stickyBg = bg.id;
}

function syncTimerStickyColorSwatchesForDoc(bgId, doc) {
    const row = doc.getElementById("timerStickyColorRow");
    if (!row) return;
    row.querySelectorAll(".timer-sticky-color-swatch").forEach((btn) => {
        const el = /** @type {HTMLElement} */ (btn);
        el.classList.toggle("timer-sticky-color-swatch--active", el.dataset.bgId === bgId);
    });
}

function persistCurrentTimerStickyEditor() {
    const win = timerPipDocumentWindow;
    if (win && !win.closed && pipDocumentMode === "sticky" && timerStickyPipEditorHandle) {
        persistTimerStickyFromEditor(timerStickyPipEditorHandle, win.document);
    } else if (timerStickyEditorHandle) {
        persistTimerStickyFromEditor(timerStickyEditorHandle, document);
    }
}

/**
 * @param {null | { getHtml?: () => string }} editorHandle
 * @param {Document} doc
 */
function persistTimerStickyFromEditor(editorHandle, doc) {
    const card = doc.getElementById("timerStickySection");
    if (!card) return;
    const bgId = card.dataset.stickyBg || getDefaultTimerStickyBgId();
    const store = readTimerStickyStore();
    const idx = Math.max(0, Math.min(store.notes.length - 1, timerStickyActiveIndex));
    const prev = store.notes[idx] || { id: newStickyNoteId(), html: "<p></p>", bgId };
    /** Never overwrite note HTML when the editor isn't mounted (race during remount / failed load). */
    let html =
        prev.html != null && String(prev.html).trim() !== "" ? String(prev.html) : "<p></p>";
    if (editorHandle && typeof editorHandle.getHtml === "function") {
        html = sanitizeNotesHtml(editorHandle.getHtml()) || "<p></p>";
    }
    store.notes[idx] = { ...prev, html, bgId };
    store.activeIndex = idx;
    writeTimerStickyStore(store);
}

function persistTimerStickyStateFromUi() {
    persistCurrentTimerStickyEditor();
}

function scheduleTimerStickyPersist() {
    if (timerStickySaveTimer) clearTimeout(timerStickySaveTimer);
    timerStickySaveTimer = setTimeout(() => {
        timerStickySaveTimer = null;
        const win = timerPipDocumentWindow;
        if (win && !win.closed && pipDocumentMode === "sticky" && timerStickyPipEditorHandle) {
            persistTimerStickyFromEditor(timerStickyPipEditorHandle, win.document);
        } else {
            persistTimerStickyFromEditor(timerStickyEditorHandle, document);
        }
    }, 250);
}

function destroyTimerStickyEditor() {
    if (timerStickySaveTimer) {
        clearTimeout(timerStickySaveTimer);
        timerStickySaveTimer = null;
    }
    if (timerStickyEditorHandle) {
        timerStickyEditorHandle.destroy();
        timerStickyEditorHandle = null;
    }
    if (elements.timerStickyToolbarHost) elements.timerStickyToolbarHost.replaceChildren();
    const mount = elements.timerStickyEditorMount || elements.timerStickyEditorHost;
    if (mount) mount.replaceChildren();
}

/** @param {Document | null} pipDoc */
function destroyTimerStickyPipEditor(pipDoc) {
    if (timerStickySaveTimer) {
        clearTimeout(timerStickySaveTimer);
        timerStickySaveTimer = null;
    }
    if (timerStickyPipEditorHandle) {
        timerStickyPipEditorHandle.destroy();
        timerStickyPipEditorHandle = null;
    }
    if (pipDoc) {
        pipDoc.getElementById("timerStickyToolbarHost")?.replaceChildren();
        pipDoc.getElementById("timerStickyEditorMount")?.replaceChildren();
    }
}

/** @param {Document} pipDoc */
/**
 * Last-resort sticky editor when TipTap/esm.sh fails (still persists sanitized HTML).
 * @param {string} initialHtml
 * @param {Document | null} pipDoc
 */
function mountTimerStickyPlainFallback(initialHtml, pipDoc = null) {
    const mount = pipDoc
        ? pipDoc.getElementById("timerStickyEditorMount")
        : elements.timerStickyEditorMount && elements.timerStickyEditorHost?.contains(elements.timerStickyEditorMount)
          ? elements.timerStickyEditorMount
          : elements.timerStickyEditorHost;
    if (!mount) return;
    mount.replaceChildren();
    const wrap = document.createElement("div");
    wrap.className = "timer-sticky-fallback-wrap";
    const hint = document.createElement("p");
    hint.className = "timer-sticky-fallback-hint";
    hint.textContent =
        "Rich editor failed to load — check the browser console. You can edit raw HTML below or reload.";
    const ta = document.createElement("textarea");
    ta.className = "timer-sticky-fallback-ta";
    ta.setAttribute("aria-label", "Session sticky note");
    ta.value = initialHtml && String(initialHtml).trim() ? String(initialHtml) : "<p></p>";
    ta.addEventListener("input", () => scheduleTimerStickyPersist());
    wrap.appendChild(hint);
    wrap.appendChild(ta);
    mount.appendChild(wrap);
    const handle = {
        getHtml: () => sanitizeNotesHtml(ta.value) || "<p></p>",
        focus: () => ta.focus(),
        setDark: () => {},
        destroy: () => {
            wrap.remove();
        },
    };
    if (pipDoc) {
        timerStickyPipEditorHandle = handle;
    } else {
        timerStickyEditorHandle = handle;
    }
}

async function mountTimerStickyPipEditor(initialHtml, pipDoc) {
    destroyTimerStickyPipEditor(pipDoc);
    const mount = pipDoc.getElementById("timerStickyEditorMount");
    const tb = pipDoc.getElementById("timerStickyToolbarHost");
    if (!mount) return;
    try {
        const mod = await loadRichNotesEditorModule();
        timerStickyPipEditorHandle = mod.mountRichNotesEditor(tb, mount, {
            initialHtml: initialHtml || "<p></p>",
            isDark: pipDoc.body.classList.contains("dark"),
            placeholder:
                "Session todos — select text for bold and colors. Tap ☐ in the bubble for checklist rows; or end a line with [ ] then space.",
            onChange: () => scheduleTimerStickyPersist(),
            documentSurface: true,
        });
    } catch (e) {
        console.error("Timer sticky PiP editor failed:", e);
        mountTimerStickyPlainFallback(initialHtml || "<p></p>", pipDoc);
    }
}

/** @param {Window} pipWin */
async function disposeTimerStickyPipAndRemountMain(pipWin) {
    try {
        if (pipWin && !pipWin.closed && pipWin.document && timerStickyPipEditorHandle) {
            persistTimerStickyFromEditor(timerStickyPipEditorHandle, pipWin.document);
            destroyTimerStickyPipEditor(pipWin.document);
        }
        if (elements.timerStickyPipBanner) elements.timerStickyPipBanner.classList.add("hidden");
        await remountTimerStickyMainAfterPip();
    } catch (e) {
        console.error("Timer PiP sticky teardown:", e);
    }
}

async function refreshTimerStickyEditors() {
    const store = readTimerStickyStore();
    const idx = Math.max(0, Math.min(store.notes.length - 1, timerStickyActiveIndex));
    const note = store.notes[idx];
    const html = sanitizeNotesHtml(note?.html || "<p></p>");
    const pipOpen = timerPipDocumentWindow && !timerPipDocumentWindow.closed;
    const stickyPip = pipOpen && pipDocumentMode === "sticky";
    if (stickyPip) {
        destroyTimerStickyEditor();
        await mountTimerStickyPipEditor(html, timerPipDocumentWindow.document);
    } else {
        destroyTimerStickyPipEditor(null);
        await mountTimerStickyEditor(html);
    }
}

async function selectTimerStickyIndex(nextIdx, opts = {}) {
    const { skipPersist = false, force = false } = opts;
    const store = readTimerStickyStore();
    const clamped = Math.max(0, Math.min(store.notes.length - 1, nextIdx));
    if (!force && clamped === timerStickyActiveIndex) return;
    if (!skipPersist) persistCurrentTimerStickyEditor();
    timerStickyActiveIndex = clamped;
    store.activeIndex = clamped;
    writeTimerStickyStore(store);
    const note = store.notes[clamped];
    applyTimerStickyCardChrome(note.bgId, note.sticker, document);
    syncTimerStickyColorSwatchesForDoc(note.bgId, document);
    const pipDoc = timerPipDocumentWindow?.document;
    if (pipDoc && pipDocumentMode === "sticky") {
        applyTimerStickyCardChrome(note.bgId, note.sticker, pipDoc);
        syncTimerStickyColorSwatchesForDoc(note.bgId, pipDoc);
    }
    await refreshTimerStickyEditors();
    timerStickyCarouselSuppress = true;
    renderTimerStickyCarouselInDoc(document);
    scrollTimerStickyCarouselToIndex(document, clamped);
    if (pipDoc && pipDocumentMode === "sticky") {
        renderTimerStickyCarouselInDoc(pipDoc);
        scrollTimerStickyCarouselToIndex(pipDoc, clamped);
    }
    setTimeout(() => {
        timerStickyCarouselSuppress = false;
    }, 160);
    syncTimerStickyNavControls();
}

function syncTimerStickyNavControls() {
    const store = readTimerStickyStore();
    const n = store.notes.length;
    const i = timerStickyActiveIndex;

    if (elements.timerStickyCardDeleteBtn) {
        elements.timerStickyCardDeleteBtn.disabled = n <= 1;
    }
    if (elements.timerStickyCardPrevBtn) {
        elements.timerStickyCardPrevBtn.disabled = i <= 0;
    }
    if (elements.timerStickyCardNextBtn) {
        elements.timerStickyCardNextBtn.disabled = i >= n - 1;
    }
    const pipDoc = timerPipDocumentWindow?.document;
    if (pipDoc && pipDocumentMode === "sticky") {
        /** Document PiP uses another realm; `instanceof HTMLButtonElement` from this window is false. */
        const del = pipDoc.getElementById("timerStickyCardDeleteBtn");
        if (del) del.disabled = n <= 1;
        const prev = pipDoc.getElementById("timerStickyCardPrevBtn");
        if (prev) prev.disabled = i <= 0;
        const next = pipDoc.getElementById("timerStickyCardNextBtn");
        if (next) next.disabled = i >= n - 1;
    }
}

/** @param {Document} doc */
function renderTimerStickyCarouselInDoc(doc) {
    const carousel = doc.getElementById("timerStickyCarousel");
    if (!carousel) return;
    const store = readTimerStickyStore();
    const w = Math.max(120, carousel.clientWidth || 260);
    carousel.replaceChildren();
    store.notes.forEach((note, i) => {
        const slide = doc.createElement("div");
        slide.className = "timer-sticky-carousel-slide";
        if (i === timerStickyActiveIndex) slide.classList.add("timer-sticky-carousel-slide--active");
        slide.dataset.index = String(i);
        slide.style.flex = `0 0 ${w}px`;
        slide.style.minWidth = `${w}px`;
        slide.textContent = `${i + 1}/${store.notes.length}`;
        carousel.appendChild(slide);
    });
    const dotsHost = doc.getElementById("timerStickyCarouselDots");
    if (dotsHost) {
        dotsHost.replaceChildren();
        store.notes.forEach((_, i) => {
            const dot = doc.createElement("button");
            dot.type = "button";
            dot.className = "timer-sticky-carousel-dot";
            if (i === timerStickyActiveIndex) dot.classList.add("timer-sticky-carousel-dot--active");
            dot.setAttribute("aria-label", `Go to note ${i + 1}`);
            dot.addEventListener("click", () => {
                void selectTimerStickyIndex(i);
            });
            dotsHost.appendChild(dot);
        });
    }
}

/** @param {Document} doc */
function scrollTimerStickyCarouselToIndex(doc, idx) {
    const carousel = doc.getElementById("timerStickyCarousel");
    if (!carousel) return;
    const w = Math.max(1, carousel.clientWidth);
    carousel.scrollTo({ left: idx * w, behavior: "auto" });
}

/** @param {Document} doc */
function bindTimerStickyCarouselScroll(doc) {
    const carousel = doc.getElementById("timerStickyCarousel");
    if (!carousel || carousel.dataset.dsaScrollBound === "1") return;
    carousel.dataset.dsaScrollBound = "1";
    carousel.addEventListener(
        "scroll",
        () => {
            if (timerStickyCarouselSuppress) return;
            if (timerStickyCarouselScrollTimer) clearTimeout(timerStickyCarouselScrollTimer);
            timerStickyCarouselScrollTimer = setTimeout(() => {
                timerStickyCarouselScrollTimer = null;
                const w = Math.max(1, carousel.clientWidth);
                const idx = Math.round(carousel.scrollLeft / w);
                const store = readTimerStickyStore();
                if (idx >= 0 && idx < store.notes.length && idx !== timerStickyActiveIndex) {
                    void selectTimerStickyIndex(idx, { skipPersist: false });
                }
            }, 80);
        },
        { passive: true }
    );
}

async function addTimerStickyNote() {
    persistCurrentTimerStickyEditor();
    const store = readTimerStickyStore();
    store.notes.push({
        id: newStickyNoteId(),
        html: "<p></p>",
        bgId: getDefaultTimerStickyBgId(),
        sticker: TIMER_STICKY_STICKERS[0],
    });
    timerStickyActiveIndex = store.notes.length - 1;
    store.activeIndex = timerStickyActiveIndex;
    writeTimerStickyStore(store);
    await selectTimerStickyIndex(timerStickyActiveIndex, { skipPersist: true, force: true });
}

async function deleteActiveTimerStickyNote() {
    const store = readTimerStickyStore();
    if (store.notes.length <= 1) return;
    persistCurrentTimerStickyEditor();
    store.notes.splice(timerStickyActiveIndex, 1);
    timerStickyActiveIndex = Math.min(timerStickyActiveIndex, store.notes.length - 1);
    store.activeIndex = timerStickyActiveIndex;
    writeTimerStickyStore(store);
    await selectTimerStickyIndex(timerStickyActiveIndex, { skipPersist: true, force: true });
}

/** @param {Window} pipWin @param {Document} pipDoc */
async function setupStickyPipSurface(pipWin, pipDoc) {
    renderTimerStickyColorRow(pipDoc);
    const store = readTimerStickyStore();
    timerStickyActiveIndex = Math.max(0, Math.min(store.notes.length - 1, store.activeIndex | 0));
    const note = store.notes[timerStickyActiveIndex];

    applyTimerStickyCardChrome(note.bgId, note.sticker, pipDoc);
    syncTimerStickyColorSwatchesForDoc(note.bgId, pipDoc);

    pipDoc.getElementById("timerStickyCardPipToggle")?.addEventListener("click", () => {
        closeDocumentTimerPipWindow();
    });
    pipDoc.getElementById("timerStickyCardPrevBtn")?.addEventListener(
        "click",
        () => {
            void selectTimerStickyIndex(timerStickyActiveIndex - 1);
        },
        true
    );
    pipDoc.getElementById("timerStickyCardNextBtn")?.addEventListener(
        "click",
        () => {
            void selectTimerStickyIndex(timerStickyActiveIndex + 1);
        },
        true
    );
    pipDoc.getElementById("timerStickyCardAddBtn")?.addEventListener("click", () => {
        void addTimerStickyNote();
    });
    pipDoc.getElementById("timerStickyCardDeleteBtn")?.addEventListener("click", () => {
        void deleteActiveTimerStickyNote();
    });

    renderTimerStickyCarouselInDoc(pipDoc);
    requestAnimationFrame(() => {
        renderTimerStickyCarouselInDoc(pipDoc);
        scrollTimerStickyCarouselToIndex(pipDoc, timerStickyActiveIndex);
    });
    bindTimerStickyCarouselScroll(pipDoc);
    const pipCarousel = pipDoc.getElementById("timerStickyCarousel");
    if (pipCarousel && pipWin && pipCarousel.dataset.dsaPipScrollFit !== "1") {
        pipCarousel.dataset.dsaPipScrollFit = "1";
        pipCarousel.addEventListener(
            "scroll",
            () => {
                const st = pipWin.__dsaPipFitState;
                if (!st) return;
                if (st.timerId) clearTimeout(st.timerId);
                st.timerId = setTimeout(() => {
                    st.timerId = null;
                    fitDocumentPipToContent(pipWin, pipDoc, st.last);
                }, 120);
            },
            { passive: true }
        );
    }
    await mountTimerStickyPipEditor(sanitizeNotesHtml(note.html || "<p></p>"), pipDoc);
    syncTimerStickyNavControls();
}

/** @param {Document} doc @param {Window | null} pipWin */
async function remountTimerStickyMainAfterPip() {
    if (!elements.timerStickyEditorMount) return;
    const store = readTimerStickyStore();
    timerStickyActiveIndex = Math.max(0, Math.min(store.notes.length - 1, store.activeIndex | 0));
    const note = store.notes[timerStickyActiveIndex];
    applyTimerStickyCardChrome(note.bgId, note.sticker, document);
    syncTimerStickyColorSwatchesForDoc(note.bgId, document);
    renderTimerStickyCarouselInDoc(document);
    scrollTimerStickyCarouselToIndex(document, timerStickyActiveIndex);
    await mountTimerStickyEditor(sanitizeNotesHtml(note.html || "<p></p>"));
    syncTimerStickyNavControls();
}

async function mountTimerStickyEditor(initialHtml) {
    destroyTimerStickyEditor();
    const mount =
        elements.timerStickyEditorMount && elements.timerStickyEditorHost?.contains(elements.timerStickyEditorMount)
            ? elements.timerStickyEditorMount
            : elements.timerStickyEditorHost;
    if (!mount) return;
    try {
        const mod = await loadRichNotesEditorModule();
        timerStickyEditorHandle = mod.mountRichNotesEditor(
            elements.timerStickyToolbarHost,
            mount,
            {
                initialHtml: initialHtml || "<p></p>",
                isDark: document.body.classList.contains("dark"),
                placeholder:
                    "Session todos — select text for bold and colors. Tap ☐ in the bubble for checklist rows; or end a line with [ ] then space.",
                onChange: () => scheduleTimerStickyPersist(),
                documentSurface: true,
            }
        );
    } catch (e) {
        console.error("Timer sticky editor failed:", e);
        mountTimerStickyPlainFallback(initialHtml || "<p></p>", null);
    }
}

/** @param {Document} [doc] */
function renderTimerStickyColorRow(doc = document) {
    const row = doc.getElementById("timerStickyColorRow");
    if (!row) return;
    row.replaceChildren();
    TIMER_STICKY_BACKGROUNDS.forEach((bg) => {
        const b = doc.createElement("button");
        b.type = "button";
        b.className = "timer-sticky-color-swatch";
        b.title = bg.label;
        b.dataset.bgId = bg.id;
        b.style.setProperty("--swatch", bg.color);
        b.addEventListener("click", () => {
            const st = readTimerStickyStore();
            const ix = Math.max(0, Math.min(st.notes.length - 1, timerStickyActiveIndex));
            const sticker = st.notes[ix]?.sticker || TIMER_STICKY_STICKERS[0];
            applyTimerStickyCardChrome(bg.id, sticker, doc);
            scheduleTimerStickyPersist();
            row.querySelectorAll(".timer-sticky-color-swatch").forEach((x) => {
                x.classList.toggle("timer-sticky-color-swatch--active", x === b);
            });
        });
        row.appendChild(b);
    });
}

async function toggleDesktopStickyPip() {
    if (window.innerWidth <= 850) return;
    if (timerPipDocumentWindow && !timerPipDocumentWindow.closed && pipDocumentMode === "sticky") {
        closeDocumentTimerPipWindow();
        return;
    }
    await openDocumentPipWindow("sticky");
}

function initTimerSticky() {
    if (timerStickyInited) return;
    if (!elements.timerStickySection || !elements.timerStickyEditorHost) return;

    renderTimerStickyColorRow(document);

    const store = readTimerStickyStore();
    timerStickyActiveIndex = Math.max(0, Math.min(store.notes.length - 1, store.activeIndex | 0));
    const note = store.notes[timerStickyActiveIndex];

    applyTimerStickyCardChrome(note.bgId, note.sticker, document);
    syncTimerStickyColorSwatchesForDoc(note.bgId, document);

    if (!timerStickyDockActionsBound) {
        timerStickyDockActionsBound = true;
        elements.timerStickyCardPipToggle?.addEventListener("click", () => {
            void toggleDesktopStickyPip();
        });
        elements.timerStickyCardPrevBtn?.addEventListener(
            "click",
            () => {
                void selectTimerStickyIndex(timerStickyActiveIndex - 1);
            },
            true
        );
        elements.timerStickyCardNextBtn?.addEventListener(
            "click",
            () => {
                void selectTimerStickyIndex(timerStickyActiveIndex + 1);
            },
            true
        );
        elements.timerStickyCardAddBtn?.addEventListener("click", () => {
            void addTimerStickyNote();
        });
        elements.timerStickyCardDeleteBtn?.addEventListener("click", () => {
            void deleteActiveTimerStickyNote();
        });
    }

    if (!timerStickyCarouselScrollBound) {
        timerStickyCarouselScrollBound = true;
        bindTimerStickyCarouselScroll(document);
        window.addEventListener("resize", () => {
            renderTimerStickyCarouselInDoc(document);
            scrollTimerStickyCarouselToIndex(document, timerStickyActiveIndex);
            const pipDoc = timerPipDocumentWindow?.document;
            if (pipDoc && pipDocumentMode === "sticky") {
                renderTimerStickyCarouselInDoc(pipDoc);
                scrollTimerStickyCarouselToIndex(pipDoc, timerStickyActiveIndex);
            }
        });
    }

    void mountTimerStickyEditor(sanitizeNotesHtml(note.html || "<p></p>"));
    renderTimerStickyCarouselInDoc(document);
    requestAnimationFrame(() => {
        renderTimerStickyCarouselInDoc(document);
        scrollTimerStickyCarouselToIndex(document, timerStickyActiveIndex);
    });
    syncTimerStickyNavControls();

    timerStickyInited = true;
}

function normalizeProblemData(items) {
    return items.map((item, idx) => {
        const id = item.problem || `p-${idx}`;
        const stored = trackerState[id] || {};
        const notesFormat = normalizeStoredNotesFormat(stored);
        return {
            id,
            problem: item.problem || "Untitled",
            link: (item.link || "").replace(/\[|\]|\(.*\)/g, "").trim(),
            pattern: item.pattern || "General",
            subPattern: item.subPattern || "",
            difficulty: item.difficulty || "Medium",
            coreIdea: item.coreIdea || "No core logic added.",
            complexity: item.complexity || "-",
            frequency: parseInt(item.frequency) || 0,
            status: stored.status || "Not Started",
            notes: stored.notes || "",
            notesFormat,
            noteFlag: sanitizeNoteFlag(stored.noteFlag),
        };
    });
}

function createProblemRow(p) {
    const row = elements.rowTemplate.content.firstElementChild.cloneNode(true);
    const exploreUrl = `https://www.google.com/search?q=Hey+Gemini+Explain+Leetcode+${encodeURIComponent(p.problem)}+problem+and+solution+in+python+like+chatGpt`;
    if (p.status === "Mastered") row.classList.add("is-mastered");

    const cells = row.querySelectorAll('td');
    const labels = ['Done', 'Problem', 'Frequency', 'Concept', 'Complexity', 'Difficulty', 'Actions'];
    cells.forEach((cell, i) => cell.setAttribute('data-label', labels[i]));

    const nf = sanitizeNoteFlag(p.noteFlag);
    if (nf) {
        row.classList.add("problem-row--flag", `problem-row--flag--${nf}`);
    }

    // Accordion toggle button (single tap, explicit target)
    const toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.className = "accordion-toggle";
    toggleBtn.setAttribute("aria-label", "Toggle problem details");
    toggleBtn.setAttribute("aria-expanded", "false");
    toggleBtn.textContent = "▼";
    toggleBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (window.innerWidth > 850) return;
        const expanded = row.classList.toggle("is-expanded");
        toggleBtn.setAttribute("aria-expanded", expanded ? "true" : "false");
    });

    const check = row.querySelector(".mastered-check");
    check.checked = p.status === "Mastered";
    check.addEventListener("change", (e) => {
        patchProblemState(p.id, { status: e.target.checked ? "Mastered" : "Not Started" });
        applyAndRender({ resetPage: false });
    });

    const problemCell = row.querySelector(".problem-cell");
    const titleRow = document.createElement("div");
    titleRow.className = "problem-title-row";
    const linkEl = document.createElement("a");
    linkEl.href = p.link;
    linkEl.target = "_blank";
    linkEl.rel = "noopener noreferrer";
    linkEl.className = "problem-link";
    linkEl.textContent = p.problem;
    titleRow.appendChild(linkEl);
    titleRow.appendChild(toggleBtn);
    problemCell.appendChild(titleRow);

    const heat = Math.min((p.frequency / 650) * 100, 100);
    const ivPct = typeof p.interviewFrequencyPct === "number" ? p.interviewFrequencyPct : 0;
    const ivHeat = Math.min(ivPct, 100);
    const interviewLine =
        p.interviewMatched && (p.interviewAppearanceCount > 0 || p.interviewCompanyCount > 0)
            ? `<div class="interview-freq" title="From company_questions_by_url aggregate">
            <span class="interview-pct">${ivPct.toFixed(1)}%</span> exposure
            <span class="interview-meta"> · ${p.interviewCompanyCount} companies · ${p.interviewAppearanceCount} listings</span>
          </div>
          <div class="heat-bar-bg interview-heat" style="width:100px;"><div class="heat-bar-fill heat-bar-fill--interview" style="width: ${ivHeat}%"></div></div>`
            : `<div class="interview-freq interview-freq--empty">No interview sheet match</div>`;
    row.querySelector(".frequency-cell").innerHTML = `
        <div class="freq-container">
            <span class="freq-num">${p.frequency}</span>
            <span class="freq-label">curated</span>
            <div class="heat-bar-bg" style="width:100px;"><div class="heat-bar-fill" style="width: ${heat}%"></div></div>
        </div>
        <div class="freq-interview-block">${interviewLine}</div>`;

    row.querySelector(".concept-cell").innerHTML = `
        <div class="concept-stack">
            <div><span class="badge pattern-default">${p.pattern}</span></div>
            <div class="sub-pattern">${p.subPattern}</div>
            <div class="idea-row">
              <span class="idea-icon" aria-hidden="true">💡</span>
              <a href="${exploreUrl}" target="_blank" rel="noopener noreferrer" class="explore-link">Explore 🔍</a>
            </div>
            <div class="core-idea">${p.coreIdea}</div>
        </div>`;

    row.querySelector(".complexity-cell").innerHTML = `<span>${p.complexity}</span>`;
    row.querySelector(".difficulty-cell").innerHTML = `<div><span class="badge difficulty-${p.difficulty.toLowerCase()}">${p.difficulty}</span></div>`;
    // row.querySelector(".actions-cell").innerHTML = `<button onclick="openNotesSheet('${p.id}')" class="note-btn">📝 Notes</button>`;
        
    // --- FIXED NOTES BUTTON ---
    const actionCell = row.querySelector(".actions-cell");
    actionCell.innerHTML = ""; // Clear any template junk
    const noteBtn = document.createElement("button");
    noteBtn.type = "button";
    noteBtn.className = "note-btn";
    if (nf) {
        noteBtn.classList.add("note-btn--flag", `note-btn--flag--${nf}`);
        noteBtn.setAttribute(
            "title",
            `Notes (flag: ${NOTE_FLAG_LABELS[nf] || nf})`
        );
    } else {
        noteBtn.setAttribute("title", "Notes");
    }
    noteBtn.textContent = "📝 Notes";
    noteBtn.setAttribute("data-problem-id", p.id);
    noteBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        openNotesSheet(p.id);
    });

    actionCell.appendChild(noteBtn);
    return row;
}

/**
 * Recompute filters and re-render the table.
 * @param {{ resetPage?: boolean }} [opts] — pass `{ resetPage: false }` when filters did not change (e.g. mastered checkbox) so the current page is kept.
 */
function applyAndRender(opts) {
    const resetPage = !opts || opts.resetPage !== false;
    const query = elements.searchInput.value.toLowerCase();
    const pattern = elements.patternFilter.value;
    const diff = elements.difficultyFilter.value;
    const company = elements.companyFilter.value;
    const flag = elements.flagFilter ? elements.flagFilter.value : "all";
    /** @type {"curated"} */
    const sortOrder = "curated";

    let list = allProblems.filter((p) => {
        const textOk =
            p.problem.toLowerCase().includes(query) ||
            p.pattern.toLowerCase().includes(query) ||
            p.coreIdea.toLowerCase().includes(query);
        const companyOk =
            company === "all" ||
            (p.interviewCompanies && p.interviewCompanies.includes(company));
        const pf = sanitizeNoteFlag(p.noteFlag);
        let flagOk = true;
        if (flag === "none") flagOk = !pf;
        else if (flag !== "all") flagOk = pf === flag;
        return (
            textOk &&
            (pattern === "all" || p.pattern === pattern) &&
            (diff === "all" || p.difficulty === diff) &&
            companyOk &&
            flagOk
        );
    });

    list = sortProblemsForDisplay(list, sortOrder);

    filteredProblems = list;

    if (resetPage) {
        currentPage = 1;
    } else {
        const totalPages = getTotalPages(filteredProblems.length);
        currentPage = Math.min(currentPage, totalPages);
    }
    renderProblems();
    renderPagination(getTotalPages(filteredProblems.length));
    updateSidebarStats(allProblems);
}

/**
 * @param {typeof allProblems} list
 * @param {string} sortOrder
 */
function sortProblemsForDisplay(list, sortOrder) {
    const copy = [...list];
    if (sortOrder === "interview") {
        copy.sort(
            (a, b) => (b.interviewFrequencyPct || 0) - (a.interviewFrequencyPct || 0)
        );
    } else if (sortOrder === "companies") {
        copy.sort(
            (a, b) =>
                (b.interviewCompanyCount || 0) - (a.interviewCompanyCount || 0)
        );
    } else {
        copy.sort(
            (a, b) =>
                (curatedOrderIndex.get(a.id) ?? 0) -
                (curatedOrderIndex.get(b.id) ?? 0)
        );
    }
    return copy;
}

function renderProblems() {
    const perPage = getItemsPerPage();
    const start = (currentPage - 1) * perPage;
    const pageItems = filteredProblems.slice(start, start + perPage);

    elements.body.innerHTML = "";
    if (!pageItems.length) {
        elements.body.innerHTML = `<tr><td colspan="7" class="loading-state">No problems match current filters.</td></tr>`;
        return;
    }

    pageItems.forEach(p => elements.body.appendChild(createProblemRow(p)));
}

function getItemsPerPage() {
    return itemsPerPageOverride;
}

function getTotalPages(totalItems) {
    return Math.max(1, Math.ceil(totalItems / getItemsPerPage()));
}

function goToPage(rawPage) {
    const totalPages = getTotalPages(filteredProblems.length);
    const n = Math.floor(Number(rawPage));
    const target = Number.isFinite(n) ? n : currentPage;
    currentPage = Math.min(totalPages, Math.max(1, target));
    renderProblems();
    renderPagination(totalPages);
}

function changePage(delta) {
    goToPage(currentPage + delta);
}

function renderPagination(totalPages) {
    elements.prevPageBtn.disabled = currentPage === 1;
    elements.nextPageBtn.disabled = currentPage === totalPages;
    const jumpDisabled = totalPages <= 1;
    elements.pageJumpInput.disabled = jumpDisabled;
    elements.pageJumpInput.min = "1";
    elements.pageJumpInput.max = String(totalPages);
    elements.pageJumpInput.value = String(currentPage);
    elements.pageTotalHint.textContent = totalPages > 0 ? ` / ${totalPages}` : "";
}

function updateSidebarStats(items) {
    const solved = items.filter(i => i.status === "Mastered").length;
    elements.solvedCount.textContent = `${solved} / ${items.length}`;
    ["easy", "medium", "hard"].forEach(d => {
        const dItems = items.filter(i => i.difficulty.toLowerCase() === d);
        const dSolved = dItems.filter(i => i.status === "Mastered").length;
        const pct = dItems.length ? Math.round((dSolved / dItems.length) * 100) : 0;
        const ring = elements[`${d}Ring`];
        ring.textContent = `${pct}%`;
        ring.style.background = `conic-gradient(var(--ring-color) ${pct}%, var(--panel-soft) ${pct}% 100%)`;
    });
}

/** @type {null | { getHtml: () => string; setHtml?: (h: string) => void; focus: () => void; setDark: (d: boolean) => void; destroy: () => void }} */
let generalNotesEditorHandle = null;
let activeGeneralNoteId = /** @type {string | null} */ (null);
let generalNotesModalOpen = false;
let generalNotesPickerOpen = false;
let generalNotesOverflowOpen = false;
let generalNotesMountGeneration = 0;
let generalNotesSaveTimer = null;

function setGeneralNotesUiReady(ready) {
    const btn = elements.generalNotesOpenBtn;
    if (!btn) return;
    btn.disabled = !ready;
    btn.toggleAttribute("aria-busy", !ready);
    btn.title = ready ? "" : "Loading workspace…";
}

function cancelGeneralNotesSaveTimer() {
    if (generalNotesSaveTimer) {
        clearTimeout(generalNotesSaveTimer);
        generalNotesSaveTimer = null;
    }
}

function getGeneralNotesStorageKey() {
    return typeof window.dsaGetGeneralNotesStorageKey === "function"
        ? window.dsaGetGeneralNotesStorageKey()
        : "dsa-general-notes-v1:signed-out";
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

function newGeneralNoteId() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }
    return `gn-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function ensureGeneralNotesBootstrap() {
    const doc = readGeneralNotesDoc();
    const ids = Object.keys(doc.notes);
    if (ids.length) return doc;
    const id = newGeneralNoteId();
    const now = new Date().toISOString();
    doc.notes[id] = {
        title: "",
        body: "<p></p>",
        noteFlag: "",
        updatedAt: now,
        notesFormat: "html",
    };
    writeGeneralNotesDoc(doc);
    return doc;
}

function scheduleGeneralNotePersist() {
    if (generalNotesSaveTimer) clearTimeout(generalNotesSaveTimer);
    generalNotesSaveTimer = setTimeout(() => {
        generalNotesSaveTimer = null;
        persistActiveGeneralNote();
    }, 200);
}

function persistActiveGeneralNote() {
    if (!activeGeneralNoteId || !elements.generalNotesTitleInput) return;
    const doc = readGeneralNotesDoc();
    const prev = doc.notes[activeGeneralNoteId] || {};
    const title = elements.generalNotesTitleInput.value.trim();
    let body;
    if (generalNotesEditorHandle && typeof generalNotesEditorHandle.getHtml === "function") {
        body = sanitizeNotesHtml(generalNotesEditorHandle.getHtml()) || "<p></p>";
    } else {
        /* Editor still loading or already destroyed — never replace real HTML with empty doc */
        const prevBody = prev.body != null ? String(prev.body) : "";
        body = prevBody.trim() ? sanitizeNotesHtml(prevBody) : "<p></p>";
        if (!body || !String(body).trim()) body = "<p></p>";
    }
    const noteFlag = sanitizeNoteFlag(prev.noteFlag);
    const updatedAt = new Date().toISOString();
    doc.notes[activeGeneralNoteId] = {
        ...prev,
        title,
        body,
        noteFlag,
        updatedAt,
        notesFormat: "html",
    };
    writeGeneralNotesDoc(doc);
    if (typeof window.dsaScheduleGeneralNotePush === "function") {
        window.dsaScheduleGeneralNotePush(activeGeneralNoteId);
    }
    renderGeneralNotesPickerLabel();
}

/** Flush debounced note writes before reload/navigation so tables/HTML are not lost mid-timeout. */
function flushDebouncedNotesPersistence() {
    if (saveTimeout) {
        clearTimeout(saveTimeout);
        saveTimeout = undefined;
        saveNotesNow();
    }
    if (generalNotesSaveTimer) {
        clearTimeout(generalNotesSaveTimer);
        generalNotesSaveTimer = null;
        persistActiveGeneralNote();
    }
}

let notesPersistenceFlushInstalled = false;
function installNotesPersistenceFlushListeners() {
    if (notesPersistenceFlushInstalled) return;
    notesPersistenceFlushInstalled = true;
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") flushDebouncedNotesPersistence();
    });
    window.addEventListener("pagehide", flushDebouncedNotesPersistence);
}

function renderGeneralNotesPickerLabel() {
    if (!elements.generalNotesPickerLabel || !activeGeneralNoteId) return;
    const doc = readGeneralNotesDoc();
    const n = doc.notes[activeGeneralNoteId];
    const t = (n && n.title) || "";
    elements.generalNotesPickerLabel.textContent = t.trim() ? t.trim() : "Untitled";
}

function renderGeneralNotesPickerMenu() {
    if (!elements.generalNotesPickerMenu) return;
    const doc = readGeneralNotesDoc();
    elements.generalNotesPickerMenu.replaceChildren();
    const ids = Object.keys(doc.notes).sort((a, b) => {
        const ta = doc.notes[a]?.updatedAt || "";
        const tb = doc.notes[b]?.updatedAt || "";
        return tb.localeCompare(ta);
    });
    const mkItem = (label, id, isNew) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = isNew
            ? "general-notes-picker-item general-notes-picker-item--new"
            : "general-notes-picker-item";
        b.textContent = label;
        b.addEventListener("click", () => {
            if (isNew) {
                createGeneralNoteAndSelect();
            } else {
                void selectGeneralNote(id);
            }
            closeGeneralNotesPicker();
        });
        elements.generalNotesPickerMenu.appendChild(b);
    };
    mkItem("+ New note", "", true);
    for (const id of ids) {
        const n = doc.notes[id];
        const lab = (n && n.title && String(n.title).trim()) || "Untitled";
        mkItem(lab, id, false);
    }
}

function closeGeneralNotesPicker() {
    generalNotesPickerOpen = false;
    if (elements.generalNotesPickerMenu) {
        elements.generalNotesPickerMenu.classList.add("hidden");
        elements.generalNotesPickerMenu.hidden = true;
    }
    if (elements.generalNotesPickerBtn) {
        elements.generalNotesPickerBtn.setAttribute("aria-expanded", "false");
    }
}

function closeGeneralNotesOverflow() {
    generalNotesOverflowOpen = false;
    if (elements.generalNotesOverflowMenu) {
        elements.generalNotesOverflowMenu.classList.add("hidden");
        elements.generalNotesOverflowMenu.hidden = true;
    }
    if (elements.generalNotesOverflowBtn) {
        elements.generalNotesOverflowBtn.setAttribute("aria-expanded", "false");
    }
}

function toggleGeneralNotesPicker() {
    generalNotesPickerOpen = !generalNotesPickerOpen;
    if (!elements.generalNotesPickerMenu) return;
    if (generalNotesPickerOpen) {
        renderGeneralNotesPickerMenu();
        elements.generalNotesPickerMenu.classList.remove("hidden");
        elements.generalNotesPickerMenu.hidden = false;
        elements.generalNotesPickerBtn.setAttribute("aria-expanded", "true");
    } else {
        closeGeneralNotesPicker();
    }
}

function renderGeneralNotesOverflow() {
    if (!elements.generalNotesOverflowMenu) return;
    elements.generalNotesOverflowMenu.replaceChildren();
    const mk = (text, fn) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "general-notes-overflow-item";
        b.textContent = text;
        b.addEventListener("click", () => {
            closeGeneralNotesOverflow();
            fn();
        });
        elements.generalNotesOverflowMenu.appendChild(b);
    };
    mk("New note", () => createGeneralNoteAndSelect());
    mk("Duplicate", () => duplicateActiveGeneralNote());
    mk("Delete", () => deleteActiveGeneralNote());
}

function toggleGeneralNotesOverflow() {
    generalNotesOverflowOpen = !generalNotesOverflowOpen;
    if (!elements.generalNotesOverflowMenu) return;
    if (generalNotesOverflowOpen) {
        renderGeneralNotesOverflow();
        elements.generalNotesOverflowMenu.classList.remove("hidden");
        elements.generalNotesOverflowMenu.hidden = false;
        elements.generalNotesOverflowBtn?.setAttribute("aria-expanded", "true");
    } else {
        closeGeneralNotesOverflow();
    }
}

function duplicateActiveGeneralNote() {
    if (!activeGeneralNoteId) return;
    const doc = readGeneralNotesDoc();
    const cur = doc.notes[activeGeneralNoteId];
    if (!cur) return;
    const id = newGeneralNoteId();
    const now = new Date().toISOString();
    doc.notes[id] = {
        title: (cur.title && String(cur.title).trim() ? `${cur.title} (copy)` : "Untitled (copy)").slice(
            0,
            240
        ),
        body: cur.body || "<p></p>",
        noteFlag: sanitizeNoteFlag(cur.noteFlag),
        updatedAt: now,
        notesFormat: "html",
    };
    writeGeneralNotesDoc(doc);
    void selectGeneralNote(id);
    if (typeof window.dsaScheduleGeneralNotePush === "function") {
        window.dsaScheduleGeneralNotePush(id);
    }
}

function deleteActiveGeneralNote() {
    if (!activeGeneralNoteId) return;
    if (!window.confirm("Delete this note? This cannot be undone.")) return;
    cancelGeneralNotesSaveTimer();
    const doc = readGeneralNotesDoc();
    delete doc.notes[activeGeneralNoteId];
    writeGeneralNotesDoc(doc);
    activeGeneralNoteId = null;
    const ids = Object.keys(doc.notes);
    if (ids.length) {
        void selectGeneralNote(
            ids.sort((a, b) => (doc.notes[b].updatedAt || "").localeCompare(doc.notes[a].updatedAt || ""))[0]
        );
    } else {
        const id = newGeneralNoteId();
        const now = new Date().toISOString();
        doc.notes[id] = {
            title: "",
            body: "<p></p>",
            noteFlag: "",
            updatedAt: now,
            notesFormat: "html",
        };
        writeGeneralNotesDoc(doc);
        void selectGeneralNote(id);
    }
}

function createGeneralNoteAndSelect() {
    const doc = readGeneralNotesDoc();
    const id = newGeneralNoteId();
    const now = new Date().toISOString();
    doc.notes[id] = {
        title: "",
        body: "<p></p>",
        noteFlag: "",
        updatedAt: now,
        notesFormat: "html",
    };
    writeGeneralNotesDoc(doc);
    void selectGeneralNote(id);
    if (typeof window.dsaScheduleGeneralNotePush === "function") {
        window.dsaScheduleGeneralNotePush(id);
    }
}

function destroyGeneralNotesEditor() {
    if (generalNotesEditorHandle) {
        generalNotesEditorHandle.destroy();
        generalNotesEditorHandle = null;
    }
    if (elements.generalNotesToolbarHost) elements.generalNotesToolbarHost.replaceChildren();
    const mountEl = elements.generalNotesEditorMount || elements.generalNotesEditorHost;
    if (mountEl) mountEl.replaceChildren();
}

async function mountGeneralNotesEditor(html) {
    destroyGeneralNotesEditor();
    const mountGen = generalNotesMountGeneration;
    const editorMount =
        elements.generalNotesEditorMount && elements.generalNotesEditorHost?.contains(elements.generalNotesEditorMount)
            ? elements.generalNotesEditorMount
            : elements.generalNotesEditorHost;
    try {
        const mod = await loadRichNotesEditorModule();
        if (mountGen !== generalNotesMountGeneration || !generalNotesModalOpen) return;
        generalNotesEditorHandle = mod.mountRichNotesEditor(
            elements.generalNotesToolbarHost,
            editorMount,
            {
                initialHtml: html || "<p></p>",
                isDark: document.body.classList.contains("dark"),
                placeholder: "Write freely — select text for bold, colors, and highlights.",
                onChange: () => scheduleGeneralNotePersist(),
                documentSurface: true,
            }
        );
    } catch (e) {
        console.error("General notes editor failed:", e);
    }
}

async function selectGeneralNote(id) {
    cancelGeneralNotesSaveTimer();
    const outgoing = activeGeneralNoteId;
    if (outgoing && outgoing !== id) {
        const snap = readGeneralNotesDoc();
        if (snap.notes[outgoing]) {
            persistActiveGeneralNote();
        }
    }
    activeGeneralNoteId = id;
    const doc = readGeneralNotesDoc();
    const n = doc.notes[id];
    if (!n) return;
    if (elements.generalNotesTitleInput) {
        elements.generalNotesTitleInput.value = n.title != null ? String(n.title) : "";
    }
    renderGeneralNotesPickerLabel();
    generalNotesMountGeneration += 1;
    const gen = generalNotesMountGeneration;
    const body = n.body != null ? String(n.body) : "<p></p>";
    await mountGeneralNotesEditor(sanitizeNotesHtml(body));
    if (gen !== generalNotesMountGeneration || !generalNotesModalOpen) return;
    if (generalNotesEditorHandle && typeof generalNotesEditorHandle.focus === "function") {
        const h = generalNotesEditorHandle;
        const bumpFocus = () => h.focus();
        bumpFocus();
        queueMicrotask(bumpFocus);
        requestAnimationFrame(bumpFocus);
        setTimeout(bumpFocus, 0);
        setTimeout(bumpFocus, 32);
    }
}

function openGeneralNotesModal() {
    if (!__dsaAppReady) return;
    closeGeneralNotesPicker();
    closeGeneralNotesOverflow();
    generalNotesModalOpen = true;
    const doc = ensureGeneralNotesBootstrap();
    const ids = Object.keys(doc.notes).sort((a, b) =>
        (doc.notes[b].updatedAt || "").localeCompare(doc.notes[a].updatedAt || "")
    );
    if (!elements.generalNotesModal) return;
    elements.generalNotesModal.hidden = false;
    document.body.classList.add("general-notes-modal-open");
    const pick = activeGeneralNoteId && doc.notes[activeGeneralNoteId] ? activeGeneralNoteId : ids[0];
    void selectGeneralNote(pick || ids[0]);
}

function closeGeneralNotesModal() {
    cancelGeneralNotesSaveTimer();
    persistActiveGeneralNote();
    generalNotesModalOpen = false;
    generalNotesMountGeneration += 1;
    destroyGeneralNotesEditor();
    closeGeneralNotesPicker();
    closeGeneralNotesOverflow();
    if (elements.generalNotesModal) elements.generalNotesModal.hidden = true;
    document.body.classList.remove("general-notes-modal-open");
}

function initGeneralNotesModal() {
    if (elements.generalNotesOpenBtn) {
        elements.generalNotesOpenBtn.addEventListener("click", () => openGeneralNotesModal());
    }
    if (elements.generalNotesBackdrop) {
        elements.generalNotesBackdrop.addEventListener("click", () => {
            if (!generalNotesPickerOpen && !generalNotesOverflowOpen) closeGeneralNotesModal();
        });
    }
    if (elements.generalNotesExpandBtn && elements.generalNotesCard) {
        elements.generalNotesExpandBtn.addEventListener("click", () => {
            const maxed = elements.generalNotesCard.classList.toggle("general-notes-card--max");
            elements.generalNotesExpandBtn.setAttribute("aria-pressed", maxed ? "true" : "false");
        });
    }
    if (elements.generalNotesPickerBtn) {
        elements.generalNotesPickerBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            toggleGeneralNotesPicker();
        });
    }
    if (elements.generalNotesOverflowBtn) {
        elements.generalNotesOverflowBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            toggleGeneralNotesOverflow();
        });
    }
    if (elements.generalNotesTitleInput) {
        elements.generalNotesTitleInput.addEventListener("input", () => {
            renderGeneralNotesPickerLabel();
            scheduleGeneralNotePersist();
        });
        const isTitleEnter = (e) =>
            !e.isComposing &&
            (e.key === "Enter" ||
                e.key === "NumpadEnter" ||
                e.code === "Enter" ||
                e.code === "NumpadEnter" ||
                e.keyCode === 13);

        const moveTitleToBody = (e) => {
            if (e.isComposing) return;
            if (e.key === "Tab" && e.shiftKey) return;
            if (e.key === "Tab") {
                e.preventDefault();
                e.stopPropagation();
                elements.generalNotesTitleInput.blur();
                generalNotesEditorHandle?.focus?.();
                requestAnimationFrame(() => generalNotesEditorHandle?.focus?.());
                return;
            }
            if (!isTitleEnter(e)) return;
            e.preventDefault();
            e.stopPropagation();
            elements.generalNotesTitleInput.blur();
            const shift = !!e.shiftKey;
            const run = () => {
                if (generalNotesEditorHandle?.focusFromTitle) {
                    generalNotesEditorHandle.focusFromTitle({ shiftKey: shift });
                } else {
                    generalNotesEditorHandle?.focus?.();
                }
            };
            run();
            if (!generalNotesEditorHandle) {
                requestAnimationFrame(() => {
                    run();
                    if (!generalNotesEditorHandle) {
                        setTimeout(run, 50);
                    }
                });
            }
        };
        elements.generalNotesTitleInput.addEventListener("keydown", moveTitleToBody, true);
    }
    document.addEventListener("click", (e) => {
        if (!generalNotesModalOpen) return;
        const t = /** @type {Node} */ (e.target);
        if (elements.generalNotesPickerBtn?.contains(t)) return;
        if (elements.generalNotesPickerMenu?.contains(t)) return;
        if (elements.generalNotesOverflowBtn?.contains(t)) return;
        if (elements.generalNotesOverflowMenu?.contains(t)) return;
        closeGeneralNotesPicker();
        closeGeneralNotesOverflow();
    });
}

window.pickRandom = () => {
    const todo = allProblems.filter(p => p.status !== "Mastered");
    if (todo.length) window.open(todo[Math.floor(Math.random() * todo.length)].link, '_blank');
};

async function openNotesSheet(id) {
    const p = allProblems.find(i => i.id === id);
    if (!p) return;
    activeNotesId = id;
    activeNotesFormat = p.notesFormat === "html" ? "html" : "markdown";
    elements.sheetTitle.textContent = p.problem;
    if (elements.notesFlagSelect) {
        elements.notesFlagSelect.value = sanitizeNoteFlag(p.noteFlag) || "";
    }
    setAutoSaveStatus("Saved");
    notesOpenFallbackText = p.notes ?? "";
    elements.notesSheet.classList.add("open");
    elements.notesSheet.setAttribute("aria-hidden", "false");
    document.body.classList.add("notes-sheet-open");

    const mountGen = ++notesSheetMountGeneration;
    destroyNotesEditor();
    setPreviewMode(true);
    try {
        const mod = await loadRichNotesEditorModule();
        if (mountGen !== notesSheetMountGeneration || activeNotesId !== id) {
            return;
        }
        const initialHtml = problemNotesInitialHtml(p);
        notesEditorHandle = mod.mountRichNotesEditor(
            elements.sheetNotesToolbarHost,
            elements.sheetNotesEditorHost,
            {
                initialHtml,
                isDark: document.body.classList.contains("dark"),
                placeholder: "Capture intuition, pitfalls, or code snippets…",
                onChange: onNotesInput,
            }
        );
        activeNotesFormat = "html";
        notesOpenFallbackText = null;
        if (!previewMode) {
            notesEditorHandle.focus();
        }
    } catch (err) {
        console.error("Rich notes editor load failed:", err);
        if (mountGen !== notesSheetMountGeneration || activeNotesId !== id) {
            return;
        }
        const msg = err instanceof Error ? err.message : String(err);
        const fileHint =
            window.location.protocol === "file:"
                ? "This page was opened as a file (file://). Browsers often block or break ES module loading. Run a local server in the project folder, for example: python3 -m http.server 8080 — then open http://localhost:8080/ instead of double-clicking index.html. "
                : "";
        const hint = `${fileHint}The rich editor loads TipTap from the network (esm.sh). If you are already on http(s), check your connection, VPN, corporate firewall, or ad/privacy blockers. (${msg}) You can still edit notes as plain Markdown below.`;
        notesEditorHandle = mountPlainNotesEditor(elements.sheetNotesEditorHost, {
            initial: p.notes || "",
            placeholder: "Markdown notes (plain editor fallback).",
            onChange: onNotesInput,
            hint,
        });
        activeNotesFormat = "markdown";
        notesOpenFallbackText = null;
        if (!previewMode) {
            notesEditorHandle.focus();
        }
    }
}

window.openNotesSheet = openNotesSheet;

function closeNotesSheet() {
    saveNotesNow();
    destroyNotesEditor();
    notesOpenFallbackText = null;
    applyAndRender({ resetPage: false });
    if (document.activeElement && elements.notesSheet.contains(document.activeElement)) {
        document.activeElement.blur();
    }
    elements.notesSheet.classList.remove("open");
    elements.notesSheet.setAttribute("aria-hidden", "true");
    document.body.classList.remove("notes-sheet-open");
    activeNotesId = null;
}

function onNotesInput() {
    if (!activeNotesId) return;
    setAutoSaveStatus("Saving...");
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(saveNotesNow, 250);
    if (previewMode) renderNotesPreview();
}

function onNotesFlagChange() {
    if (!activeNotesId) return;
    setAutoSaveStatus("Saving...");
    saveNotesNow();
    applyAndRender({ resetPage: false });
}

function saveNotesNow() {
    if (!activeNotesId) return;
    const raw = getActiveNotesText();
    const noteFlag = elements.notesFlagSelect
        ? sanitizeNoteFlag(elements.notesFlagSelect.value)
        : "";
    let notes = raw;
    let notesFormat = activeNotesFormat;
    if (activeNotesFormat === "html" && typeof notesEditorHandle?.getHtml === "function") {
        notes = sanitizeNotesHtml(raw);
        notesFormat = "html";
    } else {
        notesFormat = "markdown";
    }
    patchProblemState(activeNotesId, { notes, noteFlag, notesFormat });
    const idx = allProblems.findIndex(i => i.id === activeNotesId);
    if (idx !== -1) {
        allProblems[idx].notes = notes;
        allProblems[idx].noteFlag = noteFlag;
        allProblems[idx].notesFormat = notesFormat;
    }
    setAutoSaveStatus("Saved");
}

function setAutoSaveStatus(text) {
    elements.autoSaveStatus.textContent = text;
}

function toggleNotesPreview() {
    setPreviewMode(!previewMode);
}

function setPreviewMode(nextPreviewMode) {
    previewMode = nextPreviewMode;
    elements.togglePreviewBtn.textContent = previewMode ? "Edit" : "Preview";
    elements.sheetNotesEditorHost.classList.toggle("hidden", previewMode);
    elements.notesPreview.classList.toggle("hidden", !previewMode);
    if (previewMode) renderNotesPreview();
}

function renderNotesPreview() {
    const body = getActiveNotesText().trim();
    if (!body) {
        elements.notesPreview.innerHTML = `<p class="preview-placeholder">Nothing to preview yet.</p>`;
        return;
    }
    if (activeNotesFormat === "html") {
        const safe = sanitizeNotesHtml(body);
        elements.notesPreview.innerHTML = safe || `<p class="preview-placeholder">Nothing to preview yet.</p>`;
        if (window.hljs?.highlightElement) {
            elements.notesPreview.querySelectorAll("pre code").forEach((block) => {
                try {
                    window.hljs.highlightElement(block);
                } catch (_) {
                    /* ignore unknown grammar */
                }
            });
        }
        return;
    }
    if (window.marked?.parse) {
        elements.notesPreview.innerHTML = window.marked.parse(body);
        if (window.hljs?.highlightElement) {
            elements.notesPreview.querySelectorAll("pre code").forEach((block) => {
                try {
                    window.hljs.highlightElement(block);
                } catch (_) {
                    /* ignore unknown grammar */
                }
            });
        }
        return;
    }
    elements.notesPreview.textContent = body;
}
function patchProblemState(id, partial) {
    const next = {
        ...trackerState[id],
        ...partial,
        updatedAt: new Date().toISOString(),
    };
    trackerState[id] = next;
    const problem = allProblems.find((item) => item.id === id);
    if (problem) Object.assign(problem, partial);
    localStorage.setItem(getTrackerLocalStorageKey(), JSON.stringify(trackerState));
    if (typeof window.dsaSchedulePush === "function") {
        window.dsaSchedulePush(id);
    }
}
function populatePatternFilter(items) {
    const ps = [...new Set(items.map(i => i.pattern))].sort();
    elements.patternFilter.innerHTML = `<option value="all">Pattern: All</option>` + ps.map(p => `<option value="${p}">${p}</option>`).join("");
}

function populateCompanyFilter(items) {
    const sel = elements.companyFilter;
    const set = new Set();
    items.forEach((p) => {
        (p.interviewCompanies || []).forEach((c) => set.add(c));
    });
    const companies = [...set].sort();
    sel.innerHTML = "";
    const allOpt = document.createElement("option");
    allOpt.value = "all";
    allOpt.textContent = "Company: All";
    sel.appendChild(allOpt);
    companies.forEach((c) => {
        const o = document.createElement("option");
        o.value = c;
        o.textContent = c.length ? c.charAt(0).toUpperCase() + c.slice(1) : c;
        sel.appendChild(o);
    });
}
function applyTheme(t) {
    document.body.classList.toggle("dark", t === "dark");
    elements.themeToggle.textContent = t === "dark" ? "☀️" : "🌙";
    syncHljsThemeForNotes();
    if (notesEditorHandle && typeof notesEditorHandle.setDark === "function") {
        notesEditorHandle.setDark(t === "dark");
    }
    if (generalNotesEditorHandle && typeof generalNotesEditorHandle.setDark === "function") {
        generalNotesEditorHandle.setDark(t === "dark");
    }
    if (timerStickyEditorHandle && typeof timerStickyEditorHandle.setDark === "function") {
        timerStickyEditorHandle.setDark(t === "dark");
    }
    if (timerPipDocumentWindow && !timerPipDocumentWindow.closed) {
        timerPipDocumentWindow.document.body.classList.toggle("dark", t === "dark");
    }
    if (timerStickyPipEditorHandle && typeof timerStickyPipEditorHandle.setDark === "function") {
        timerStickyPipEditorHandle.setDark(t === "dark");
    }
}
