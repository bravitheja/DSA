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
  notesSheet: document.getElementById("notesSheet"),
  sheetTitle: document.getElementById("sheetTitle"),
  sheetNotesInput: document.getElementById("sheetNotesInput"),
  sheetSaveBtn: document.getElementById("sheetSaveBtn"),
  sheetCloseBtn: document.getElementById("sheetCloseBtn"),
};

let allProblems = [];
let filteredProblems = [];
let trackerState = loadState();
let activeNotesId = null;

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

  elements.themeToggle.addEventListener("click", () => {
    const nextTheme = document.body.classList.contains("dark") ? "light" : "dark";
    applyTheme(nextTheme);
    localStorage.setItem(THEME_KEY, nextTheme);
  });

  elements.sheetCloseBtn.addEventListener("click", closeNotesSheet);
  elements.sheetSaveBtn.addEventListener("click", saveActiveNotes);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeNotesSheet();
  });
}

async function loadData() {
  try {
    const response = await fetch("data.json", { cache: "no-cache" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const payload = await response.json();
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.problems)) return payload.problems;
    throw new Error("data.json must be an array or { problems: [] }");
  } catch (error) {
    showErrorRow(`Unable to load problems. ${error.message}`);
    return [];
  }
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
      coreIdea: item.coreIdea || "No core idea available yet.",
      complexity: item.complexity || "-",
      status: stored.status || item.status || "Not Started",
      notes: stored.notes || item.notes || "",
    };
  });
}

function normalizeDifficulty(value) {
  if (!value) return "Medium";
  const normalized = String(value).trim().toLowerCase();
  if (normalized === "easy") return "Easy";
  if (normalized === "hard") return "Hard";
  return "Medium";
}

function applyAndRender() {
  filteredProblems = applyFilters(allProblems);
  filteredProblems.sort((a, b) => {
    const difficultyDiff = DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty];
    if (difficultyDiff !== 0) return difficultyDiff;
    return a.problem.localeCompare(b.problem);
  });

  renderTable(filteredProblems);
  updateSidebarStats(filteredProblems);
}

function applyFilters(items) {
  const query = elements.searchInput.value.trim().toLowerCase();
  const pattern = elements.patternFilter.value;
  const difficulty = elements.difficultyFilter.value;

  return items.filter((item) => {
    const matchesQuery = item.problem.toLowerCase().includes(query);
    const matchesPattern = pattern === "all" || item.pattern === pattern;
    const matchesDifficulty = difficulty === "all" || item.difficulty === difficulty;
    return matchesQuery && matchesPattern && matchesDifficulty;
  });
}

function renderTable(items) {
  if (!items.length) {
    showErrorRow("No problems match your current filters.");
    return;
  }

  const fragment = document.createDocumentFragment();

  for (const problem of items) {
    const row = createProblemRow(problem);
    fragment.appendChild(row);
  }

  elements.body.innerHTML = "";
  elements.body.appendChild(fragment);
}

function createProblemRow(problem) {
  const row = elements.rowTemplate.content.firstElementChild.cloneNode(true);

  const problemCell = row.querySelector(".problem-cell");
  const problemWrap = document.createElement("span");
  problemWrap.className = "tooltip-wrap";
  problemWrap.dataset.tooltip = problem.coreIdea;

  const problemMain = document.createElement("span");
  problemMain.className = "problem-main";

  const link = document.createElement("a");
  link.className = "problem-link";
  link.href = problem.link;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = problem.problem;

  const externalIcon = document.createElement("span");
  externalIcon.textContent = "↗";
  externalIcon.setAttribute("aria-hidden", "true");

  const lightbulbIcon = document.createElement("span");
  lightbulbIcon.className = "core-idea-icon";
  lightbulbIcon.textContent = "💡";
  lightbulbIcon.setAttribute("aria-label", "Show core idea");

  problemMain.append(link, externalIcon, lightbulbIcon);
  problemWrap.append(problemMain);
  problemCell.append(problemWrap);

  const patternCell = row.querySelector(".pattern-cell");
  const patternBadge = document.createElement("span");
  patternBadge.className = `badge ${patternClassName(problem.pattern)}`;
  patternBadge.textContent = problem.pattern;
  patternBadge.title = problem.subPattern ? `Sub-pattern: ${problem.subPattern}` : "";
  patternCell.append(patternBadge);

  row.querySelector(".complexity-cell").textContent = problem.complexity;

  const difficultyCell = row.querySelector(".difficulty-cell");
  const difficultyBadge = document.createElement("span");
  difficultyBadge.className = `badge difficulty-${problem.difficulty.toLowerCase()}`;
  difficultyBadge.textContent = problem.difficulty;
  difficultyCell.append(difficultyBadge);

  const actionCell = row.querySelector(".actions-cell");
  const noteButton = document.createElement("button");
  noteButton.type = "button";
  noteButton.className = "note-btn";
  noteButton.textContent = "📝";
  noteButton.setAttribute("aria-label", `Open notes for ${problem.problem}`);
  noteButton.addEventListener("click", () => openNotesSheet(problem.id));
  actionCell.append(noteButton);

  return row;
}

function openNotesSheet(problemId) {
  const problem = allProblems.find((item) => item.id === problemId);
  if (!problem) return;

  activeNotesId = problemId;
  elements.sheetTitle.textContent = `${problem.problem} · Notes`;
  elements.sheetNotesInput.value = problem.notes || "";
  elements.notesSheet.classList.add("open");
  elements.notesSheet.setAttribute("aria-hidden", "false");
}

function closeNotesSheet() {
  activeNotesId = null;
  elements.notesSheet.classList.remove("open");
  elements.notesSheet.setAttribute("aria-hidden", "true");
}

function saveActiveNotes() {
  if (!activeNotesId) return;

  const notes = elements.sheetNotesInput.value.trim();
  patchProblemState(activeNotesId, { notes });
  closeNotesSheet();
}

function patternClassName(pattern) {
  const normalized = pattern.toLowerCase();
  if (normalized.includes("sliding window")) return "pattern-sliding-window";
  if (normalized.includes("dp") || normalized.includes("dynamic")) return "pattern-dp";
  if (normalized.includes("graph")) return "pattern-graph";
  if (normalized.includes("tree")) return "pattern-tree";
  return "pattern-default";
}

function updateSidebarStats(items) {
  const total = items.length;
  const solved = items.filter((item) => ["Solved", "Mastered"].includes(item.status)).length;

  elements.solvedCount.textContent = `${solved} / ${total}`;

  updateRing(elements.easyRing, items, "Easy");
  updateRing(elements.mediumRing, items, "Medium");
  updateRing(elements.hardRing, items, "Hard");
}

function updateRing(target, items, difficulty) {
  const total = items.length;
  const count = items.filter((item) => item.difficulty === difficulty).length;
  const pct = total === 0 ? 0 : Math.round((count / total) * 100);

  target.textContent = `${pct}%`;
  target.style.background = `conic-gradient(var(--ring-color) ${pct}%, var(--panel-soft) ${pct}% 100%)`;
}

function populatePatternFilter(items) {
  const patterns = [...new Set(items.map((item) => item.pattern).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  );

  elements.patternFilter.innerHTML = "";

  const all = document.createElement("option");
  all.value = "all";
  all.textContent = "Pattern: All";
  elements.patternFilter.append(all);

  for (const pattern of patterns) {
    const option = document.createElement("option");
    option.value = pattern;
    option.textContent = `Pattern: ${pattern}`;
    elements.patternFilter.append(option);
  }
}

function showErrorRow(message) {
  elements.body.innerHTML = `<tr><td colspan="5" class="empty-state">${message}</td></tr>`;
}

function patchProblemState(problemId, partial) {
  trackerState[problemId] = {
    status: trackerState[problemId]?.status || "Not Started",
    notes: trackerState[problemId]?.notes || "",
    ...partial,
  };

  saveState(trackerState);

  const index = allProblems.findIndex((problem) => problem.id === problemId);
  if (index !== -1) {
    allProblems[index] = { ...allProblems[index], ...trackerState[problemId] };
  }
}

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadTheme() {
  const theme = localStorage.getItem(THEME_KEY);
  if (theme) return theme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme) {
  document.body.classList.toggle("dark", theme === "dark");
  elements.themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
}
