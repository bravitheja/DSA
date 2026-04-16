const STORAGE_KEY = "dsa-tracker-state-v4";
const THEME_KEY = "dsa-tracker-theme";
const TIMER_PREFS_KEY = "dsa-session-timer-prefs-v1";
const TIMER_FLOAT_POS_KEY = "dsa-timer-float-pos-v1";
const TIMER_MAX_DURATION_SEC = 24 * 3600;

const getEl = (id) => document.getElementById(id);

const elements = {
    body: getEl("problemsBody"),
    rowTemplate: getEl("problemRowTemplate"),
    searchInput: getEl("searchInput"),
    patternFilter: getEl("patternFilter"),
    difficultyFilter: getEl("difficultyFilter"),
    themeToggle: getEl("themeToggle"),
    solvedCount: getEl("solvedCount"),
    easyRing: getEl("easyRing"),
    mediumRing: getEl("mediumRing"),
    hardRing: getEl("hardRing"),
    breakdown: getEl("sidebarBreakdown"),
    notesSheet: getEl("notesSheet"),
    sheetTitle: getEl("sheetTitle"),
    sheetNotesInput: getEl("sheetNotesInput"),
    notesPreview: getEl("notesPreview"),
    autoSaveStatus: getEl("autoSaveStatus"),
    sheetSaveBtn: getEl("sheetSaveBtn"),
    sheetCloseBtn: getEl("sheetCloseBtn"),
    togglePreviewBtn: getEl("togglePreviewBtn"),
    prevPageBtn: getEl("prevPageBtn"),
    nextPageBtn: getEl("nextPageBtn"),
    pageInfo: getEl("pageInfo"),
    timerPanel: getEl("timerPanel"),
    timerTimeInput: getEl("timerTimeInput"),
    timerProgressFill: getEl("timerProgressFill"),
    timerPrimaryBtn: getEl("timerPrimaryBtn"),
    timerResetBtn: getEl("timerResetBtn"),
    timerDock: getEl("timerDock"),
    timerMobileToggle: getEl("timerMobileToggle"),
    timerDragHandle: getEl("timerDragHandle")
};

let allProblems = [];
let trackerState = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
let activeNotesId = null;
let filteredProblems = [];
let currentPage = 1;
const ITEMS_PER_PAGE_DESKTOP = 12;
const ITEMS_PER_PAGE_MOBILE = 6;
let saveTimeout;
let previewMode = false;

let timerTotalSeconds = 20 * 60;
let timerRemainingSeconds = 20 * 60;
/** @type {'idle' | 'running' | 'paused'} */
let timerState = "idle";
let timerIntervalId = null;
let timerTitleFlashId = null;
const appPageTitle = document.title;

init();

async function init() {
    applyTheme(localStorage.getItem(THEME_KEY) || "light");
    try {
        bindControls();
        initSessionTimer();
        const raw = await loadData();
        allProblems = normalizeProblemData(raw);
        populatePatternFilter(allProblems);
        applyAndRender();
    } catch (err) {
        console.error(err);
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
    try {
        const res = await fetch("./data.json", { cache: "no-cache" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } catch (e) {
        if (Array.isArray(window.__DSA_DATA)) {
            console.warn("fetch failed; using embedded __DSA_DATA from data.js", e);
            return window.__DSA_DATA;
        }
        throw e;
    }
}

function bindControls() {
    elements.searchInput.addEventListener("input", applyAndRender);
    elements.patternFilter.addEventListener("change", applyAndRender);
    elements.difficultyFilter.addEventListener("change", applyAndRender);
    elements.sheetCloseBtn.addEventListener("click", closeNotesSheet);
    elements.sheetSaveBtn.addEventListener("click", closeNotesSheet);
    elements.sheetNotesInput.addEventListener("input", onNotesInput);
    elements.togglePreviewBtn.addEventListener("click", toggleNotesPreview);
    elements.prevPageBtn.addEventListener("click", () => changePage(-1));
    elements.nextPageBtn.addEventListener("click", () => changePage(1));
    elements.themeToggle.addEventListener("click", () => {
        const next = document.body.classList.contains("dark") ? "light" : "dark";
        applyTheme(next);
        localStorage.setItem(THEME_KEY, next);
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && elements.notesSheet.classList.contains("open")) closeNotesSheet();
        if (e.key === "Escape" && elements.timerDock?.classList.contains("timer-dock--open")) {
            closeMobileTimerDock();
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 850) closeMobileTimerDock();
        else clampTimerFloatToViewport();
        const totalPages = getTotalPages(filteredProblems.length);
        currentPage = Math.min(currentPage, totalPages);
        renderProblems();
        renderPagination(totalPages);
    });

    bindSessionTimer();
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

function updateSessionTimerUI() {
    elements.timerTimeInput.readOnly = timerState !== "idle";
    elements.timerTimeInput.setAttribute("aria-live", timerState === "idle" ? "off" : "polite");
    elements.timerTimeInput.value = formatTimeForInput(
        timerState === "idle" ? timerTotalSeconds : timerRemainingSeconds
    );
    elements.timerTimeInput.classList.toggle("timer-expired", timerRemainingSeconds <= 0 && timerState === "idle");

    const pct = timerTotalSeconds > 0 ? (timerRemainingSeconds / timerTotalSeconds) * 100 : 0;
    elements.timerProgressFill.style.width = `${pct}%`;

    if (timerState === "idle") {
        elements.timerPrimaryBtn.textContent = "▶";
        elements.timerPrimaryBtn.setAttribute("aria-label", "Start timer");
        elements.timerPrimaryBtn.disabled = timerRemainingSeconds <= 0;
    } else if (timerState === "running") {
        elements.timerPrimaryBtn.textContent = "⏸";
        elements.timerPrimaryBtn.setAttribute("aria-label", "Pause timer");
        elements.timerPrimaryBtn.disabled = false;
    } else {
        elements.timerPrimaryBtn.textContent = "▶";
        elements.timerPrimaryBtn.setAttribute("aria-label", "Resume timer");
        elements.timerPrimaryBtn.disabled = timerRemainingSeconds <= 0;
    }

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
    if (!elements.timerDock || !elements.timerMobileToggle) return;
    elements.timerDock.classList.toggle("timer-dock--open", open);
    elements.timerMobileToggle.setAttribute("aria-expanded", open ? "true" : "false");
    elements.timerMobileToggle.setAttribute("aria-label", open ? "Hide timer" : "Show timer");
    if (open && window.innerWidth <= 850) {
        applyTimerFloatPosition();
        clampTimerFloatToViewport();
    }
}

function closeMobileTimerDock() {
    setMobileTimerDockOpen(false);
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
        if (window.innerWidth > 850 || !dock.classList.contains("timer-dock--open")) return;
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
            saveTimerFloatPosition();
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

    if (elements.timerMobileToggle) {
        elements.timerMobileToggle.addEventListener("click", () => {
            const open = !elements.timerDock.classList.contains("timer-dock--open");
            setMobileTimerDockOpen(open);
        });
    }

    bindTimerFloatDrag();
}

function normalizeProblemData(items) {
    return items.map((item, idx) => {
        const id = item.problem || `p-${idx}`;
        const stored = trackerState[id] || {};
        return {
            id,
            problem: item.problem || "Untitled",
            link: (item.link || "").replace(/\[|\]|\(.*\)/g, '').trim(),
            pattern: item.pattern || "General",
            subPattern: item.subPattern || "",
            difficulty: item.difficulty || "Medium",
            coreIdea: item.coreIdea || "No core logic added.",
            complexity: item.complexity || "-",
            frequency: parseInt(item.frequency) || 0,
            status: stored.status || "Not Started",
            notes: stored.notes || ""
        };
    });
}

function createProblemRow(p) {
    const row = elements.rowTemplate.content.firstElementChild.cloneNode(true);
    const exploreUrl = `https://www.google.com/search?q=Explain+Leetcode+${encodeURIComponent(p.problem)}+solution+chatGPT`;
    if (p.status === "Mastered") row.classList.add("is-mastered");

    const cells = row.querySelectorAll('td');
    const labels = ['Done', 'Problem', 'Frequency', 'Concept', 'Complexity', 'Difficulty', 'Actions'];
    cells.forEach((cell, i) => cell.setAttribute('data-label', labels[i]));

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
        applyAndRender();
    });

    const problemCell = row.querySelector(".problem-cell");
    problemCell.innerHTML = `<a href="${p.link}" target="_blank" class="problem-link">${p.problem}</a>`;
    problemCell.appendChild(toggleBtn);

    const heat = Math.min((p.frequency / 650) * 100, 100);
    row.querySelector(".frequency-cell").innerHTML = `
        <div class="freq-container">
            <span class="freq-num">${p.frequency}</span>
            <div class="heat-bar-bg" style="width:100px;"><div class="heat-bar-fill" style="width: ${heat}%"></div></div>
        </div>`;

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

function applyAndRender() {
    const query = elements.searchInput.value.toLowerCase();
    const pattern = elements.patternFilter.value;
    const diff = elements.difficultyFilter.value;

    filteredProblems = allProblems.filter(p => {
        return (p.problem.toLowerCase().includes(query)) &&
               (pattern === "all" || p.pattern === pattern) &&
               (diff === "all" || p.difficulty === diff);
    });

    currentPage = 1;
    renderProblems();
    renderPagination(getTotalPages(filteredProblems.length));
    updateSidebarStats(allProblems);
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
    return window.innerWidth <= 850 ? ITEMS_PER_PAGE_MOBILE : ITEMS_PER_PAGE_DESKTOP;
}

function getTotalPages(totalItems) {
    return Math.max(1, Math.ceil(totalItems / getItemsPerPage()));
}

function changePage(delta) {
    const totalPages = getTotalPages(filteredProblems.length);
    currentPage = Math.min(totalPages, Math.max(1, currentPage + delta));
    renderProblems();
    renderPagination(totalPages);
}

function renderPagination(totalPages) {
    elements.pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    elements.prevPageBtn.disabled = currentPage === 1;
    elements.nextPageBtn.disabled = currentPage === totalPages;
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

window.pickRandom = () => {
    const todo = allProblems.filter(p => p.status !== "Mastered");
    if (todo.length) window.open(todo[Math.floor(Math.random() * todo.length)].link, '_blank');
};

function openNotesSheet(id) {
    const p = allProblems.find(i => i.id === id);
    if (!p) return;
    activeNotesId = id;
    elements.sheetTitle.textContent = p.problem;
    elements.sheetNotesInput.value = p.notes;
    setAutoSaveStatus("Saved");
    setPreviewMode(false);
    elements.notesSheet.classList.add("open");
    elements.notesSheet.setAttribute("aria-hidden", "false");
    document.body.classList.add("notes-sheet-open");
}

window.openNotesSheet = openNotesSheet;

function closeNotesSheet() {
    saveNotesNow();
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

function saveNotesNow() {
    if (!activeNotesId) return;
    const notes = elements.sheetNotesInput.value;
    patchProblemState(activeNotesId, { notes });
    const idx = allProblems.findIndex(i => i.id === activeNotesId);
    if (idx !== -1) allProblems[idx].notes = notes;
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
    elements.sheetNotesInput.classList.toggle("hidden", previewMode);
    elements.notesPreview.classList.toggle("hidden", !previewMode);
    if (previewMode) renderNotesPreview();
}

function renderNotesPreview() {
    const markdown = elements.sheetNotesInput.value.trim();
    if (!markdown) {
        elements.notesPreview.innerHTML = `<p class="preview-placeholder">Nothing to preview yet.</p>`;
        return;
    }
    if (window.marked?.parse) {
        elements.notesPreview.innerHTML = window.marked.parse(markdown);
        return;
    }
    elements.notesPreview.textContent = markdown;
}
function patchProblemState(id, partial) {
    trackerState[id] = { ...trackerState[id], ...partial };
    const problem = allProblems.find((item) => item.id === id);
    if (problem) Object.assign(problem, partial);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trackerState));
}
function populatePatternFilter(items) {
    const ps = [...new Set(items.map(i => i.pattern))].sort();
    elements.patternFilter.innerHTML = `<option value="all">Pattern: All</option>` + ps.map(p => `<option value="${p}">${p}</option>`).join("");
}
function applyTheme(t) { document.body.classList.toggle("dark", t === "dark"); elements.themeToggle.textContent = t === "dark" ? "☀️" : "🌙"; }
