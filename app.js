const STORAGE_KEY = "dsa-tracker-state-v4";
const THEME_KEY = "dsa-tracker-theme";
const DIFFICULTY_ORDER = { Easy: 1, Medium: 2, Hard: 3 };

const elements = {
  body: document.getElementById("problemsBody"),
  rowTemplate: document.getElementById("problemRowTemplate"),
  searchInput: document.getElementById("searchInput"),
  patternFilter: document.getElementById("patternFilter"),
  difficultyFilter: document.getElementById("difficultyFilter"),
  themeToggle: document.getElementById("themeToggle"),
  solvedCount: document.getElementById("solvedCount"),
  easyRing: document.getElementById("easyRing"),
  mediumRing: document.getElementById("mediumRing"),
  hardRing: document.getElementById("hardRing"),
  breakdown: document.getElementById("sidebarBreakdown"),
  notesSheet: document.getElementById("notesSheet"),
  sheetTitle: document.getElementById("sheetTitle"),
  sheetNotesInput: document.getElementById("sheetNotesInput"),
  notesPreview: document.getElementById("notesPreview"),
  autoSaveStatus: document.getElementById("autoSaveStatus"),
  sheetSaveBtn: document.getElementById("sheetSaveBtn"),
  sheetCloseBtn: document.getElementById("sheetCloseBtn"),
  togglePreviewBtn: document.getElementById("togglePreviewBtn")
};

let allProblems = [];
let trackerState = loadState();
let activeNotesId = null;
let saveTimeout;

init();

async function init() {
  applyTheme(loadTheme());
  bindControls();
  const raw = await loadData();
  allProblems = normalizeProblemData(raw);
  populatePatternFilter(allProblems);
  applyAndRender();
}

function bindControls() {
  elements.searchInput.addEventListener("input", applyAndRender);
  elements.patternFilter.addEventListener("change", applyAndRender);
  elements.difficultyFilter.addEventListener("change", applyAndRender);

  // Auto-save logic for notes
  elements.sheetNotesInput.addEventListener("input", () => {
    showAutoSaveStatus();
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(saveActiveNotes, 1000);
  });

  elements.togglePreviewBtn.addEventListener("click", () => {
    const isShowingPreview = !elements.notesPreview.classList.contains("hidden");
    if (!isShowingPreview) {
      elements.notesPreview.innerHTML = marked.parse(elements.sheetNotesInput.value);
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
    const nextTheme = document.body.classList.contains("dark") ? "light" : "dark";
    applyTheme(nextTheme);
    localStorage.setItem(THEME_KEY, nextTheme);
  });
}

function normalizeProblemData(items) {
  return items.map((item, index) => {
    const id = item.problem || `problem-${index}`;
    const stored = trackerState[id] || {};
    return {
      id,
      problem: item.problem || "Untitled",
      link: item.link || "#",
      pattern: item.pattern || "General",
      subPattern: item.subPattern || "",
      difficulty: normalizeDifficulty(item.difficulty),
      coreIdea: item.coreIdea || "No intuition added.",
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

  // Checkbox
  const check = row.querySelector(".mastered-check");
  check.checked = p.status === "Mastered";
  check.addEventListener("change", (e) => {
    const status = e.target.checked ? "Mastered" : "Not Started";
    patchProblemState(p.id, { status });
    applyAndRender();
  });

  // Problem Link
  const problemCell = row.querySelector(".problem-cell");
  problemCell.innerHTML = `<a href="${p.link}" target="_blank" class="problem-link">${p.problem}</a>`;

  // Frequency + Heat Bar
  const freqCell = row.querySelector(".frequency-cell");
  const heatWidth = Math.min((p.frequency / 650) * 100, 100);
  freqCell.innerHTML = `
    <div class="freq-container">
      <span class="freq-num">${p.frequency}</span>
      <div class="heat-bar-bg"><div class="heat-bar-fill" style="width: ${heatWidth}%"></div></div>
    </div>
  `;

  // Concept Column (Pattern + Sub + Idea)
  const conceptCell = row.querySelector(".concept-cell");
  conceptCell.innerHTML = `
    <div class="concept-stack">
      <div class="tooltip-wrap" data-tooltip="${p.coreIdea}">
        <span class="badge ${getPatternClass(p.pattern)}">${p.pattern}</span>
        <span class="idea-bulb">💡</span>
      </div>
      <span class="sub-pattern">${p.subPattern}</span>
    </div>
  `;

  row.querySelector(".complexity-cell").textContent = p.complexity;
  
  const diffBadge = row.querySelector(".difficulty-cell");
  diffBadge.innerHTML = `<span class="badge difficulty-${p.difficulty.toLowerCase()}">${p.difficulty}</span>`;

  const actionCell = row.querySelector(".actions-cell");
  actionCell.innerHTML = `<button onclick="openNotesSheet('${p.id}')" class="note-btn">📝</button>`;

  return row;
}

function updateSidebarStats(items) {
  const total = items.length;
  const solved = items.filter(i => i.status === "Mastered").length;
  elements.solvedCount.textContent = `${solved} / ${total}`;

  const difficulties = ["Easy", "Medium", "Hard"];
  elements.breakdown.innerHTML = "";

  difficulties.forEach(diff => {
    const diffItems = items.filter(i => i.difficulty === diff);
    const diffSolved = diffItems.filter(i => i.status === "Mastered").length;
    const ring = elements[`${diff.toLowerCase()}Ring`];
    
    // Update Rings
    const pct = diffItems.length ? Math.round((diffSolved / diffItems.length) * 100) : 0;
    ring.textContent = `${pct}%`;
    ring.style.background = `conic-gradient(var(--ring-color) ${pct}%, var(--panel-soft) ${pct}% 100%)`;

    // Update Text Breakdown
    const item = document.createElement("div");
    item.className = `breakdown-item ${diff.toLowerCase()}`;
    item.innerHTML = `<span>${diff}</span> <span>${diffSolved} / ${diffItems.length}</span>`;
    elements.breakdown.appendChild(item);
  });
}

function getPatternClass(p) {
  const n = p.toLowerCase();
  if (n.includes("dp")) return "pattern-dp";
  if (n.includes("graph") || n.includes("tree")) return "pattern-graph";
  if (n.includes("pointer")) return "pattern-two-pointers";
  if (n.includes("hash")) return "pattern-hashing";
  return "pattern-default";
}

// Global logic helpers (Reuse from original with small tweaks)
function openNotesSheet(id) {
  const p = allProblems.find(i => i.id === id);
  activeNotesId = id;
  elements.sheetTitle.textContent = p.problem;
  elements.sheetNotesInput.value = p.notes;
  elements.notesPreview.classList.add("hidden");
  elements.sheetNotesInput.classList.remove("hidden");
  elements.notesSheet.classList.add("open");
}

function closeNotesSheet() {
  elements.notesSheet.classList.remove("open");
  activeNotesId = null;
}

function showAutoSaveStatus() {
  elements.autoSaveStatus.classList.add("show");
  setTimeout(() => elements.autoSaveStatus.classList.remove("show"), 2000);
}

function saveActiveNotes() {
  if (!activeNotesId) return;
  const notes = elements.sheetNotesInput.value;
  patchProblemState(activeNotesId, { notes });
}

// Standard Utility functions
function patchProblemState(id, partial) {
  trackerState[id] = { ...trackerState[id], ...partial };
  saveState(trackerState);
  const idx = allProblems.findIndex(p => p.id === id);
  if (idx !== -1) allProblems[idx] = { ...allProblems[idx], ...partial };
}

function applyAndRender() {
  const query = elements.searchInput.value.toLowerCase();
  const pattern = elements.patternFilter.value;
  const diff = elements.difficultyFilter.value;

  const filtered = allProblems.filter(p => {
    return (p.problem.toLowerCase().includes(query) || p.coreIdea.toLowerCase().includes(query)) &&
           (pattern === "all" || p.pattern === pattern) &&
           (diff === "all" || p.difficulty === diff);
  });

  elements.body.innerHTML = "";
  filtered.forEach(p => elements.body.appendChild(createProblemRow(p)));
  updateSidebarStats(allProblems);
}

async function loadData() {
  const res = await fetch("data.json");
  return await res.json();
}

function normalizeDifficulty(v) {
  const n = String(v).toLowerCase();
  return n === "easy" ? "Easy" : n === "hard" ? "Hard" : "Medium";
}

function populatePatternFilter(items) {
  const patterns = [...new Set(items.map(i => i.pattern))].sort();
  elements.patternFilter.innerHTML = '<option value="all">Pattern: All</option>';
  patterns.forEach(p => {
    const opt = document.createElement("option");
    opt.value = opt.textContent = p;
    elements.patternFilter.appendChild(opt);
  });
}

function loadState() { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
function saveState(s) { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); }
function loadTheme() { return localStorage.getItem(THEME_KEY) || "light"; }
function applyTheme(t) { document.body.classList.toggle("dark", t === "dark"); elements.themeToggle.textContent = t === "dark" ? "☀️" : "🌙"; }
