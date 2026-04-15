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
    togglePreviewBtn: getEl("togglePreviewBtn"),
    prevPageBtn: getEl("prevPageBtn"),
    nextPageBtn: getEl("nextPageBtn"),
    pageInfo: getEl("pageInfo")
};

let allProblems = [];
let trackerState = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
let activeNotesId = null;
let filteredProblems = [];
let currentPage = 1;
const ITEMS_PER_PAGE_DESKTOP = 12;
const ITEMS_PER_PAGE_MOBILE = 6;
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
        console.error(err);
        elements.body.innerHTML = `<tr><td colspan="7" style="color:red; text-align:center; padding:2rem;">Data.json failed to load. Check console.</td></tr>`;
    }
}

async function loadData() {
    const res = await fetch("./data.json", { cache: "no-cache" });
    return await res.json();
}

function bindControls() {
    elements.searchInput.addEventListener("input", applyAndRender);
    elements.patternFilter.addEventListener("change", applyAndRender);
    elements.difficultyFilter.addEventListener("change", applyAndRender);
    elements.sheetCloseBtn.addEventListener("click", closeNotesSheet);
    elements.sheetSaveBtn.addEventListener("click", closeNotesSheet);
    elements.prevPageBtn.addEventListener("click", () => changePage(-1));
    elements.nextPageBtn.addEventListener("click", () => changePage(1));
    elements.themeToggle.addEventListener("click", () => {
        const next = document.body.classList.contains("dark") ? "light" : "dark";
        applyTheme(next);
        localStorage.setItem(THEME_KEY, next);
    });

    window.addEventListener("resize", () => {
        const totalPages = getTotalPages(filteredProblems.length);
        currentPage = Math.min(currentPage, totalPages);
        renderProblems();
        renderPagination(totalPages);
    });
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
    const exploreUrl = `https://www.google.com/search?q=Explain+${encodeURIComponent(p.link)}+solution+GeminiAI`;
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
    row.appendChild(toggleBtn);

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
    row.querySelector(".actions-cell").innerHTML = `<button onclick="openNotesSheet('${p.id}')" class="note-btn">📝 Notes</button>`;

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

window.openNotesSheet = (id) => {
    const p = allProblems.find(i => i.id === id);
    activeNotesId = id;
    elements.sheetTitle.textContent = p.problem;
    elements.sheetNotesInput.value = p.notes;
    elements.notesSheet.classList.add("open");
};

function closeNotesSheet() { elements.notesSheet.classList.remove("open"); activeNotesId = null; }
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
