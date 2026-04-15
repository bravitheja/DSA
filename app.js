const STORAGE_KEY = "dsa-tracker-state-v4";
const THEME_KEY = "dsa-tracker-theme";

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
  if (raw.length === 0) return;
  
  allProblems = normalizeProblemData(raw);
  populatePatternFilter(allProblems);
  applyAndRender();
}

async function loadData() {
  try {
    const res = await fetch("data.json", { cache: "no-cache" });
    if (!res.ok) throw new Error("Could not find data.json");
    return await res.json();
  } catch (err) {
    elements.body.innerHTML = `<tr><td colspan="7" style="padding: 2rem; text-align: center; color: red;">Error: ${err.message}. Make sure data.json is in the same folder.</td></tr>`;
    return [];
  }
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
      elements.notesPreview.innerHTML = marked.parse(elements.sheetNotesInput.value || "*No notes yet*");
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
    return {
      id,
      problem: item.problem || "Untitled",
      link: item.link || "#",
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
  
  row.querySelector(".note-btn").addEventListener("click", () => openNotesSheet(p.id));

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

function openNotesSheet(id) {
  const p = allProblems.find(i => i.id === id);
  activeNotesId = id;
  elements.sheetTitle.textContent = p.problem;
  elements.sheetNotesInput.value = p.notes;
  elements.notesPreview.classList.add("hidden");
  elements.sheetNotesInput.classList.remove("hidden");
  elements.togglePreviewBtn.textContent = "Preview";
  elements.notesSheet.classList.add("open");
}

function closeNotesSheet() { elements.notesSheet.classList.remove("open"); activeNotesId = null; }
function saveActiveNotes() { if (activeNotesId) patchProblemState(activeNotesId, { notes: elements.sheetNotesInput.value }); }
function patchProblemState(id, partial) {
  trackerState[id] = { ...trackerState[id], ...partial };
  saveState(trackerState);
  const idx = allProblems.findIndex(p => p.id === id);
  if (idx !== -1) allProblems[idx] = { ...allProblems[idx], ...partial };
}
function populatePatternFilter(items) {
  const ps = [...new Set(items.map(i => i.pattern))].sort();
  elements.patternFilter.innerHTML = `<option value="all">Pattern: All</option>` + ps.map(p => `<option value="${p}">${p}</option>`).join("");
}
function loadState() { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
function saveState(s) { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); }
function loadTheme() { return localStorage.getItem(THEME_KEY) || "light"; }
function applyTheme(t) { document.body.classList.toggle("dark", t === "dark"); elements.themeToggle.textContent = t === "dark" ? "☀️" : "🌙"; }
