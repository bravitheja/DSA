const STORAGE_KEY = "dsa-tracker-state-v4";
const THEME_KEY = "dsa-tracker-theme";

// Helper to safely get elements
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
    togglePreviewBtn: getEl("togglePreviewBtn")
};

let allProblems = [];
let trackerState = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
let activeNotesId = null;
let saveTimeout;

// Start the app
init();

async function init() {
    applyTheme(localStorage.getItem(THEME_KEY) || "light");
    
    try {
        bindControls();
        const raw = await loadData();
        
        if (!raw || raw.length === 0) {
            throw new Error("Data.json is empty or could not be reached.");
        }

        allProblems = normalizeProblemData(raw);
        populatePatternFilter(allProblems);
        applyAndRender();
        
    } catch (err) {
        console.error("Init Error:", err);
        if (elements.body) {
            elements.body.innerHTML = `<tr><td colspan="7" style="color: #ef4444; padding: 2rem; text-align: center; font-weight: bold;">
                ❌ System Error: ${err.message}<br>
                <small style="display:block; margin-top:0.5rem; opacity:0.7;">Check console for details.</small>
            </td></tr>`;
        }
    }
}

async function loadData() {
    // Relative path for GitHub Pages
    const response = await fetch("./data.json", { cache: "no-cache" });
    if (!response.ok) throw new Error(`HTTP Error ${response.status}: Failed to fetch data.json`);
    return await response.json();
}

function bindControls() {
    if (elements.searchInput) elements.searchInput.addEventListener("input", applyAndRender);
    if (elements.patternFilter) elements.patternFilter.addEventListener("change", applyAndRender);
    if (elements.difficultyFilter) elements.difficultyFilter.addEventListener("change", applyAndRender);

    if (elements.sheetNotesInput) {
        elements.sheetNotesInput.addEventListener("input", () => {
            if (elements.autoSaveStatus) elements.autoSaveStatus.classList.add("show");
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                saveActiveNotes();
                if (elements.autoSaveStatus) elements.autoSaveStatus.classList.remove("show");
            }, 800);
        });
    }

    if (elements.togglePreviewBtn) {
        elements.togglePreviewBtn.addEventListener("click", () => {
            const isHidden = elements.notesPreview.classList.contains("hidden");
            if (isHidden && window.marked) {
                elements.notesPreview.innerHTML = marked.parse(elements.sheetNotesInput.value || "_No notes yet_");
                elements.togglePreviewBtn.textContent = "Edit";
            } else {
                elements.togglePreviewBtn.textContent = "Preview";
            }
            elements.notesPreview.classList.toggle("hidden");
            elements.sheetNotesInput.classList.toggle("hidden");
        });
    }

    if (elements.sheetCloseBtn) elements.sheetCloseBtn.addEventListener("click", closeNotesSheet);
    if (elements.sheetSaveBtn) elements.sheetSaveBtn.addEventListener("click", closeNotesSheet);
    
    if (elements.themeToggle) {
        elements.themeToggle.addEventListener("click", () => {
            const next = document.body.classList.contains("dark") ? "light" : "dark";
            applyTheme(next);
            localStorage.setItem(THEME_KEY, next);
        });
    }
}

function normalizeProblemData(items) {
    return items.map((item, idx) => {
        const id = item.problem || `p-${idx}`;
        const stored = trackerState[id] || {};
        return {
            id,
            problem: item.problem || "Untitled",
            link: item.link || "#",
            pattern: item.pattern || "General",
            subPattern: item.subPattern || "",
            difficulty: item.difficulty || "Medium",
            coreIdea: item.coreIdea || "No core logic available.",
            complexity: item.complexity || "-",
            frequency: parseInt(item.frequency) || 0,
            status: stored.status || "Not Started",
            notes: stored.notes || ""
        };
    });
}

function createProblemRow(p) {
    const row = elements.rowTemplate.content.firstElementChild.cloneNode(true);
    if (p.status === "Mastered") row.classList.add("is-mastered");

    const check = row.querySelector(".mastered-check");
    check.checked = p.status === "Mastered";
    check.addEventListener("change", (e) => {
        patchProblemState(p.id, { status: e.target.checked ? "Mastered" : "Not Started" });
        applyAndRender();
    });

    row.querySelector(".problem-cell").innerHTML = `<a href="${p.link}" target="_blank" class="problem-link">${p.problem}</a>`;

    const heat = Math.min((p.frequency / 650) * 100, 100);
    row.querySelector(".frequency-cell").innerHTML = `
        <div class="freq-container">
            <span class="freq-num">${p.frequency}</span>
            <div class="heat-bar-bg"><div class="heat-bar-fill" style="width: ${heat}%"></div></div>
        </div>`;

    const pClass = `pattern-${p.pattern.toLowerCase().replace(/\s+/g, '-')}`;
    row.querySelector(".concept-cell").innerHTML = `
        <div class="concept-stack">
            <div class="tooltip-wrap" data-tooltip="${p.coreIdea}">
                <span class="badge ${pClass}">${p.pattern}</span>
                <span class="idea-bulb">💡</span>
            </div>
            <span class="sub-pattern">${p.subPattern}</span>
        </div>`;

    row.querySelector(".complexity-cell").textContent = p.complexity;
    row.querySelector(".difficulty-cell").innerHTML = `<span class="badge difficulty-${p.difficulty.toLowerCase()}">${p.difficulty}</span>`;
    
    const noteBtn = row.querySelector(".note-btn");
    noteBtn.addEventListener("click", () => openNotesSheet(p.id));

    return row;
}

function applyAndRender() {
    const query = elements.searchInput.value.toLowerCase();
    const pattern = elements.patternFilter.value;
    const diff = elements.difficultyFilter.value;

    const filtered = allProblems.filter(p => {
        const matchSearch = p.problem.toLowerCase().includes(query) || p.pattern.toLowerCase().includes(query);
        const matchPattern = pattern === "all" || p.pattern === pattern;
        const matchDiff = diff === "all" || p.difficulty === diff;
        return matchSearch && matchPattern && matchDiff;
    });

    if (elements.body) {
        elements.body.innerHTML = "";
        filtered.forEach(p => elements.body.appendChild(createProblemRow(p)));
    }
    updateSidebarStats(allProblems);
}

function updateSidebarStats(items) {
    const solved = items.filter(i => i.status === "Mastered").length;
    if (elements.solvedCount) elements.solvedCount.textContent = `${solved} / ${items.length}`;

    const diffs = ["Easy", "Medium", "Hard"];
    if (elements.breakdown) elements.breakdown.innerHTML = "";

    diffs.forEach(d => {
        const dItems = items.filter(i => i.difficulty === d);
        const dSolved = dItems.filter(i => i.status === "Mastered").length;
        const pct = dItems.length ? Math.round((dSolved / dItems.length) * 100) : 0;
        
        const ring = elements[`${d.toLowerCase()}Ring`];
        if (ring) {
            ring.textContent = `${pct}%`;
            ring.style.background = `conic-gradient(var(--ring-color) ${pct}%, var(--panel-soft) ${pct}% 100%)`;
        }

        if (elements.breakdown) {
            elements.breakdown.innerHTML += `<div class="breakdown-item ${d.toLowerCase()}"><span>${d}</span> <span>${dSolved}/${dItems.length}</span></div>`;
        }
    });
}

// Global functions for inline access
window.openNotesSheet = (id) => {
    const p = allProblems.find(i => i.id === id);
    activeNotesId = id;
    elements.sheetTitle.textContent = p.problem;
    elements.sheetNotesInput.value = p.notes;
    elements.notesPreview.classList.add("hidden");
    elements.sheetNotesInput.classList.remove("hidden");
    elements.togglePreviewBtn.textContent = "Preview";
    elements.notesSheet.classList.add("open");
};

function closeNotesSheet() { 
    if (elements.notesSheet) elements.notesSheet.classList.remove("open"); 
    activeNotesId = null; 
}

function saveActiveNotes() { 
    if (activeNotesId) patchProblemState(activeNotesId, { notes: elements.sheetNotesInput.value }); 
}

function patchProblemState(id, partial) {
    trackerState[id] = { ...trackerState[id], ...partial };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trackerState));
    const idx = allProblems.findIndex(p => p.id === id);
    if (idx !== -1) allProblems[idx] = { ...allProblems[idx], ...partial };
}

function populatePatternFilter(items) {
    const ps = [...new Set(items.map(i => i.pattern))].sort();
    if (elements.patternFilter) {
        elements.patternFilter.innerHTML = `<option value="all">Pattern: All</option>` + ps.map(p => `<option value="${p}">${p}</option>`).join("");
    }
}

function applyTheme(t) { 
    document.body.classList.toggle("dark", t === "dark"); 
    if (elements.themeToggle) elements.themeToggle.textContent = t === "dark" ? "☀️" : "🌙"; 
}
