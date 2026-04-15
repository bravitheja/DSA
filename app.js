const STORAGE_KEY = "dsa-tracker-state-v3";
const THEME_KEY = "dsa-tracker-theme";
const COLUMN_PREF_KEY = "dsa-tracker-columns";

const STATUS_MASTERED = "Mastered";
const DEFAULT_STATUS = "Not Started";
const DIFFICULTY_RANK = { Easy: 1, Medium: 2, Hard: 3 };
const FREQUENCY_RANK = { High: 3, Medium: 2, Low: 1 };

const elements = {
  body: document.getElementById("problemsBody"),
  rowTemplate: document.getElementById("problemRowTemplate"),
  searchInput: document.getElementById("searchInput"),
  patternFilter: document.getElementById("patternFilter"),
  subPatternFilter: document.getElementById("subPatternFilter"),
  difficultyFilter: document.getElementById("difficultyFilter"),
  frequencyFilter: document.getElementById("frequencyFilter"),
  sortSelect: document.getElementById("sortSelect"),
  totalCount: document.getElementById("totalCount"),
  completedCount: document.getElementById("completedCount"),
  progressPercent: document.getElementById("progressPercent"),
  progressBar: document.getElementById("progressBar"),
  themeToggle: document.getElementById("themeToggle"),
  columnToggles: document.querySelectorAll(".column-toggle"),
};

let allProblems = [];
let filteredProblems = [];
let trackerState = loadState();
let hiddenColumns = loadHiddenColumns();

init();

async function init() {
  applyTheme(loadTheme());
  bindControls();
  applyColumnVisibility();

  const data = await loadData();
  allProblems = normalizeProblemData(data);
  filteredProblems = allProblems;

  setupFilters(allProblems);
  renderTable(filteredProblems);
  updateStats(allProblems);
}

async function loadData() {
  try {
    const response = await fetch("data.json", { cache: "no-cache" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();

    if (Array.isArray(payload)) {
      return payload;
    }

    if (Array.isArray(payload?.problems)) {
      return payload.problems;
    }

    throw new Error("data.json must be an array or { problems: [] }");
  } catch (error) {
    console.error("Failed to load data.json", error);
    showErrorRow(`Unable to load problems. ${error.message}`);
    return [];
  }
}

function bindControls() {
  [
    elements.searchInput,
    elements.patternFilter,
    elements.subPatternFilter,
    elements.difficultyFilter,
    elements.frequencyFilter,
    elements.sortSelect,
  ].forEach((control) => {
    control.addEventListener("input", applyAndRender);
    control.addEventListener("change", applyAndRender);
  });

  elements.themeToggle.addEventListener("click", () => {
    const nextTheme = document.body.classList.contains("dark") ? "light" : "dark";
    applyTheme(nextTheme);
    localStorage.setItem(THEME_KEY, nextTheme);
  });

  elements.columnToggles.forEach((checkbox) => {
    checkbox.addEventListener("change", (event) => {
      const column = event.target.dataset.column;
      if (event.target.checked) hiddenColumns.delete(column);
      else hiddenColumns.add(column);

      saveHiddenColumns(hiddenColumns);
      applyColumnVisibility();
    });
  });

  elements.body.addEventListener("change", handleTableChange);
}

function normalizeProblemData(items) {
  return items.map((item, index) => {
    const id = item.problem || `problem-${index}`;
    const stored = trackerState[id] || {};

    return {
      id,
      order: index,
      problem: item.problem || "Untitled Problem",
      pattern: item.pattern || "General",
      subPattern: item.subPattern || "-",
      difficulty: normalizeDifficulty(item.difficulty),
      frequency: normalizeFrequency(item.frequency || "Medium"),
      complexity: item.complexity || "-",
      coreIdea: item.coreIdea || "No core idea available yet.",
      link: item.link || "#",
      status: stored.status || DEFAULT_STATUS,
      notes: stored.notes || "",
    };
  });
}

function normalizeDifficulty(value) {
  if (!value) return "Medium";
  const text = String(value).trim().toLowerCase();
  if (text === "easy") return "Easy";
  if (text === "hard") return "Hard";
  return "Medium";
}

function normalizeFrequency(value) {
  const cleaned = String(value).trim().toLowerCase();
  if (cleaned === "high") return "High";
  if (cleaned === "medium") return "Medium";
  if (cleaned === "low") return "Low";

  const numeric = Number(cleaned);
  if (!Number.isNaN(numeric)) {
    if (numeric >= 7) return "High";
    if (numeric >= 4) return "Medium";
    return "Low";
  }

  return "Medium";
}

function setupFilters(items) {
  populateSelect(elements.patternFilter, uniqueValues(items, "pattern"), "All Patterns");
  populateSelect(elements.subPatternFilter, uniqueValues(items, "subPattern"), "All Sub Patterns");
  populateSelect(elements.difficultyFilter, ["Easy", "Medium", "Hard"], "All Difficulties");
  populateSelect(elements.frequencyFilter, ["High", "Medium", "Low"], "All Frequencies");
}

function applyAndRender() {
  filteredProblems = applyFilters(allProblems);
  const sorted = applySort(filteredProblems);
  renderTable(sorted);
  updateStats(allProblems);
}

function renderTable(items) {
  if (!items.length) {
    showErrorRow("No problems match current filters.");
    return;
  }

  const fragment = document.createDocumentFragment();

  for (const problem of items) {
    const row = elements.rowTemplate.content.firstElementChild.cloneNode(true);
    row.dataset.problemId = problem.id;
    fillRow(row, problem);
    fragment.appendChild(row);
  }

  elements.body.innerHTML = "";
  elements.body.appendChild(fragment);
  applyColumnVisibility();
}

function fillRow(row, problem) {
  const problemCell = row.querySelector(".problem-cell");
  const anchorWrap = document.createElement("span");
  anchorWrap.className = "tooltip-wrap";
  anchorWrap.dataset.tooltip = problem.coreIdea;

  const link = document.createElement("a");
  link.className = "problem-link";
  link.href = problem.link;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = problem.problem;
  anchorWrap.appendChild(link);
  problemCell.appendChild(anchorWrap);

  row.querySelector(".pattern-cell").textContent = problem.pattern;
  row.querySelector(".sub-pattern-cell").textContent = problem.subPattern;

  const diffBadge = row.querySelector(".difficulty-badge");
  diffBadge.textContent = problem.difficulty;
  diffBadge.classList.add(`difficulty-${problem.difficulty.toLowerCase()}`);

  const freqBadge = row.querySelector(".frequency-badge");
  freqBadge.textContent = problem.frequency;
  freqBadge.classList.add(`freq-${problem.frequency.toLowerCase()}`);

  row.querySelector(".complexity-cell").textContent = problem.complexity;

  const statusSelect = row.querySelector(".status-select");
  statusSelect.value = problem.status;
  statusSelect.dataset.problemId = problem.id;

  const notesInput = row.querySelector(".notes-input");
  notesInput.value = problem.notes;
  notesInput.dataset.problemId = problem.id;

  if (problem.status === STATUS_MASTERED) {
    row.classList.add("mastered-row");
  }
}

function handleTableChange(event) {
  const target = event.target;
  const problemId = target.dataset.problemId;
  if (!problemId) return;

  if (target.classList.contains("status-select")) {
    patchProblemState(problemId, { status: target.value });
    const row = target.closest("tr");
    if (row) row.classList.toggle("mastered-row", target.value === STATUS_MASTERED);
    updateStats(allProblems);
    return;
  }

  if (target.classList.contains("notes-input")) {
    patchProblemState(problemId, { notes: target.value.trim() });
  }
}

function patchProblemState(problemId, partial) {
  trackerState[problemId] = {
    status: trackerState[problemId]?.status || DEFAULT_STATUS,
    notes: trackerState[problemId]?.notes || "",
    ...partial,
  };

  saveState(trackerState);

  const index = allProblems.findIndex((problem) => problem.id === problemId);
  if (index !== -1) {
    allProblems[index] = { ...allProblems[index], ...trackerState[problemId] };
  }
}

function applyFilters(items) {
  const search = elements.searchInput.value.trim().toLowerCase();
  const pattern = elements.patternFilter.value;
  const subPattern = elements.subPatternFilter.value;
  const difficulty = elements.difficultyFilter.value;
  const frequency = elements.frequencyFilter.value;

  return items.filter((item) => {
    const matchesSearch = item.problem.toLowerCase().includes(search);
    const matchesPattern = pattern === "all" || item.pattern === pattern;
    const matchesSubPattern = subPattern === "all" || item.subPattern === subPattern;
    const matchesDifficulty = difficulty === "all" || item.difficulty === difficulty;
    const matchesFrequency = frequency === "all" || item.frequency === frequency;

    return matchesSearch && matchesPattern && matchesSubPattern && matchesDifficulty && matchesFrequency;
  });
}

function applySort(items) {
  const mode = elements.sortSelect.value;

  if (mode === "alpha") {
    return [...items].sort((a, b) => a.problem.localeCompare(b.problem));
  }

  if (mode === "difficulty") {
    return [...items].sort((a, b) => {
      const rankDiff = DIFFICULTY_RANK[a.difficulty] - DIFFICULTY_RANK[b.difficulty];
      return rankDiff || a.problem.localeCompare(b.problem);
    });
  }

  if (mode === "frequency") {
    return [...items].sort((a, b) => {
      const rankDiff = FREQUENCY_RANK[b.frequency] - FREQUENCY_RANK[a.frequency];
      return rankDiff || a.problem.localeCompare(b.problem);
    });
  }

  return [...items].sort((a, b) => a.order - b.order);
}

function updateStats(items) {
  const total = items.length;
  const completed = items.filter((item) => item.status === STATUS_MASTERED).length;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  elements.totalCount.textContent = total;
  elements.completedCount.textContent = completed;
  elements.progressPercent.textContent = `${progress}%`;
  elements.progressBar.style.width = `${progress}%`;
}

function showErrorRow(message) {
  elements.body.innerHTML = `<tr><td colspan="8" class="empty-state">${message}</td></tr>`;
}

function applyColumnVisibility() {
  elements.columnToggles.forEach((checkbox) => {
    checkbox.checked = !hiddenColumns.has(checkbox.dataset.column);
  });

  document.querySelectorAll("[data-col]").forEach((cell) => {
    const col = cell.dataset.col;
    cell.classList.toggle("hidden-column", hiddenColumns.has(col));
  });
}

function uniqueValues(items, key) {
  return [...new Set(items.map((item) => item[key]).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  );
}

function populateSelect(selectElement, values, allLabel) {
  selectElement.innerHTML = "";
  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = allLabel;
  selectElement.appendChild(allOption);

  for (const value of values) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    selectElement.appendChild(option);
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
  elements.themeToggle.textContent = theme === "dark" ? "☀️ Light" : "🌙 Dark";
}

function loadHiddenColumns() {
  try {
    const saved = JSON.parse(localStorage.getItem(COLUMN_PREF_KEY)) || [];
    return new Set(saved);
  } catch {
    return new Set();
  }
}

function saveHiddenColumns(hiddenSet) {
  localStorage.setItem(COLUMN_PREF_KEY, JSON.stringify([...hiddenSet]));
}
