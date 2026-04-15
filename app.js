const STORAGE_KEY = "dsa-tracker-state-v4";
const THEME_KEY = "dsa-tracker-theme";

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

init();

async function init() {
    applyTheme(localStorage.getItem(THEME_KEY) || "light");
    try {
        bindControls();
        const raw = await loadData();
        allProblems = normalizeProblemData(raw);
        populatePatternFilter(allProblems);
        applyAndRender();
    } catch (err) {
        console.error("Initialization failed:", err);
        elements.body.innerHTML = `<tr><td colspan="7" style="color:red; text-align:center; padding:2rem;">Failed to load data.json. Check console for details.</td></tr>`;
    }
}

async function loadData() {
    const res = await fetch("./data.json", { cache: "no-cache" });
    if (!res.ok) throw new Error("Could not find data.json");
    return await res.json();
}

function bindControls() {
    elements.searchInput.addEventListener("input", applyAndRender);
    elements.patternFilter.addEventListener("change", applyAndRender);
    elements.difficultyFilter.addEventListener("change", applyAndRender);

    elements.sheetNotesInput.addEventListener("input", () => {
        elements.autoSaveStatus.classList.add("show");
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            saveActiveNotes();
            elements.autoSaveStatus.classList.remove("show");
        }, 1000);
    });

    elements.togglePreviewBtn.addEventListener("click", () => {
        const isHidden = elements.notesPreview.classList.contains("hidden");
        if (isHidden) {
            elements.notesPreview.innerHTML = window.marked ? marked.parse(elements.sheetNotesInput.value || "*No notes available.*") : elements.sheetNotesInput.value;
            elements.togglePreviewBtn.textContent = "Edit";
        } else {
            elements.togglePreviewBtn.textContent = "Preview";
        }
        elements.notesPreview.classList.toggle("hidden");
        elements.sheetNotesInput.classList.toggle("hidden");
    });

    elements.sheetCloseBtn.addEventListener("click", closeNotesSheet);
    elements.sheetSaveBtn.addEventListener("click", closeNotesSheet);
    
    elements.themeToggle.addEventListener("click", () => {
        const next = document.body.classList.contains("dark") ? "light" : "dark";
        applyTheme(next);
        localStorage.setItem(THEME_KEY, next);
    });
}

function normalizeProblemData(items) {
    return items.map((item, idx) => {
        const id = item.problem || `p-${idx}`;
        const stored = trackerState[id] || {};
        
        // --- NEW CLEANING LOGIC ---
        let rawLink = (item.link || "").trim();
        let cleanLink = rawLink;

        // Check for Markdown format: [link](url)
        const markdownRegex = /\[.*?\]\((https?:\/\/.*?)\)/;
        const match = rawLink.match(markdownRegex);
        
        if (match && match[1]) {
            cleanLink = match[1]; // Extract just the URL part
        } else if (rawLink.startsWith('[') && rawLink.includes(']')) {
            // Fallback for weirdly formatted brackets
            cleanLink = rawLink.split('](')[1]?.replace(')', '') || rawLink.replace(/[\[\]]/g, '');
        }

        // Final safety check: if it contains a Google redirect
        if (cleanLink.includes('google.com/url')) {
            try {
                const urlObj = new URL(cleanLink);
                cleanLink = urlObj.searchParams.get('q') || cleanLink;
            } catch (e) { console.error("URL Parsing failed", e); }
        }

        return {
            id,
            problem: item.problem || "Untitled",
            link: cleanLink, // This is now always clean
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

    // Add labels for mobile cards
    const cells = row.querySelectorAll('td');
    const labels = ['Done', 'Problem', 'Frequency', 'Concept', 'Complexity', 'Difficulty', 'Actions'];
    cells.forEach((cell, i) => cell.setAttribute('data-label', labels[i]));

    // Checkbox
    const check = row.querySelector(".mastered-check");
    check.checked = p.status === "Mastered";
    check.addEventListener("change", (e) => {
        patchProblemState(p.id, { status: e.target.checked ? "Mastered" : "Not Started" });
        applyAndRender();
    });

    // Problem Title
    row.querySelector(".problem-cell").innerHTML = `<div><a href="${p.link}" target="_blank" class="problem-link">${p.problem}</a></div>`;

    // Frequency (Wrapped in a div for flex control)
    const heat = Math.min((p.frequency / 650) * 100, 100);
    row.querySelector(".frequency-cell").innerHTML = `
        <div class="freq-container">
            <span class="freq-num">${p.frequency}</span>
            <div class="heat-bar-bg"><div class="heat-bar-fill" style="width: ${heat}%"></div></div>
        </div>`;

    // Concept (Wrapped in a div for flex control)
    const pClass = `pattern-${p.pattern.toLowerCase().replace(/\s+/g, '-')}`;
    row.querySelector(".concept-cell").innerHTML = `
        <div class="concept-stack">
            <div class="tooltip-wrap" data-tooltip="${p.coreIdea}">
                <span class="badge ${pClass}">${p.pattern}</span>
                <span class="idea-bulb">💡</span>
            </div>
            <span class="sub-pattern">${p.subPattern}</span>
        </div>`;

    // Complexity & Difficulty
    row.querySelector(".complexity-cell").innerHTML = `<span>${p.complexity}</span>`;
    row.querySelector(".difficulty-cell").innerHTML = `<div><span class="badge difficulty-${p.difficulty.toLowerCase()}">${p.difficulty}</span></div>`;
    
    // Notes Button
    row.querySelector(".actions-cell").innerHTML = `<button onclick="openNotesSheet('${p.id}')" class="note-btn">📝 Open Notes</button>`;

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

    elements.body.innerHTML = "";
    filtered.forEach(p => elements.body.appendChild(createProblemRow(p)));
    updateSidebarStats(allProblems);
}

function updateSidebarStats(items) {
    const solved = items.filter(i => i.status === "Mastered").length;
    elements.solvedCount.textContent = `${solved} / ${items.length}`;

    const diffs = ["Easy", "Medium", "Hard"];
    elements.breakdown.innerHTML = "";

    diffs.forEach(d => {
        const dItems = items.filter(i => i.difficulty === d);
        const dSolved = dItems.filter(i => i.status === "Mastered").length;
        const pct = dItems.length ? Math.round((dSolved / dItems.length) * 100) : 0;
        
        const ring = elements[`${d.toLowerCase()}Ring`];
        ring.textContent = `${pct}%`;
        ring.style.background = `conic-gradient(var(--ring-color) ${pct}%, var(--panel-soft) ${pct}% 100%)`;

        elements.breakdown.innerHTML += `<div class="breakdown-item ${d.toLowerCase()}"><span>${d}</span> <span>${dSolved}/${dItems.length}</span></div>`;
    });
}

// Randomizer
window.pickRandom = () => {
    const todo = allProblems.filter(p => p.status !== "Mastered");
    if (todo.length === 0) return alert("Everything mastered! 🏆");
    
    const r = todo[Math.floor(Math.random() * todo.length)];
    
    // Safety check to ensure we have a valid URL
    if (r.link && r.link.startsWith('http')) {
        window.open(r.link, '_blank');
    } else {
        alert("Found a broken link for: " + r.problem);
    }
};

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

function closeNotesSheet() { elements.notesSheet.classList.remove("open"); activeNotesId = null; }
function saveActiveNotes() { if (activeNotesId) patchProblemState(activeNotesId, { notes: elements.sheetNotesInput.value }); }

function patchProblemState(id, partial) {
    trackerState[id] = { ...trackerState[id], ...partial };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trackerState));
    const idx = allProblems.findIndex(p => p.id === id);
    if (idx !== -1) allProblems[idx] = { ...allProblems[idx], ...partial };
}

function populatePatternFilter(items) {
    const ps = [...new Set(items.map(i => i.pattern))].sort();
    elements.patternFilter.innerHTML = `<option value="all">Pattern: All</option>` + ps.map(p => `<option value="${p}">${p}</option>`).join("");
}

function applyTheme(t) { document.body.classList.toggle("dark", t === "dark"); elements.themeToggle.textContent = t === "dark" ? "☀️" : "🌙"; }
