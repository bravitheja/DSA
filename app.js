const STORAGE_KEY = "dsa-tracker-state-v2";
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

let baseProblems = [];
let trackerState = loadState();
let hiddenColumns = loadHiddenColumns();

init();

async function init() {
  applyTheme(loadTheme());
  bindControls();
  applyColumnVisibility();

  try {
    const response = await fetch("data.json");
    if (!response.ok) throw new Error("Failed to load data.json");

    const data = await response.json();
    baseProblems = normalizeProblemData(data);

    setupFilters(baseProblems);
    renderTable();
  } catch (error) {
    elements.body.innerHTML = `<tr><td colspan="8">Unable to load problems. ${error.message}</td></tr>`;
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
    control.addEventListener("input", renderTable);
    control.addEventListener("change", renderTable);
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
}

function normalizeProblemData(items) {
  return items.map((item, index) => {
    const id = item.problem;
    const stored = trackerState[id] || {};

    return {
      id,
      order: index,
      problem: item.problem,
      pattern: item.pattern || "General",
      subPattern: item.subPattern || "-",
      difficulty: item.difficulty || "Medium",
      frequency: normalizeFrequency(item.frequency),
      complexity: item.complexity || "N/A",
      coreIdea: item.coreIdea || "No core idea added yet.",
      link: item.link || "#",
      status: stored.status || DEFAULT_STATUS,
      notes: stored.notes || "",
    };
  });
}

function normalizeFrequency(value) {
  if (!value) return "Low";
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

  return "Low";
}

function setupFilters(items) {
  populateSelect(elements.patternFilter, uniqueValues(items, "pattern"), "All Patterns");
  populateSelect(elements.subPatternFilter, uniqueValues(items, "subPattern"), "All Sub Patterns");
  populateSelect(elements.difficultyFilter, ["Easy", "Medium", "Hard"], "All Difficulties");
  populateSelect(elements.frequencyFilter, ["High", "Medium", "Low"], "All Frequencies");
}

function renderTable() {
  const filtered = applyFilters(baseProblems);
  const sorted = applySort(filtered);

  if (!sorted.length) {
    elements.body.innerHTML = '<tr><td colspan="8">No problems match current filters.</td></tr>';
    updateStats(baseProblems);
    return;
  }

  const fragment = document.createDocumentFragment();

  sorted.forEach((problem) => {
    const row = elements.rowTemplate.content.firstElementChild.cloneNode(true);
    fillRow(row, problem);
    fragment.appendChild(row);
  });

  elements.body.innerHTML = "";
  elements.body.appendChild(fragment);
  applyColumnVisibility();
  updateStats(baseProblems);
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
  statusSelect.addEventListener("change", (event) => {
    updateProblemState(problem.id, { status: event.target.value });
  });

  const notesInput = row.querySelector(".notes-input");
  notesInput.value = problem.notes;
  notesInput.addEventListener("change", (event) => {
    updateProblemState(problem.id, { notes: event.target.value.trim() });
  });

  if (problem.status === STATUS_MASTERED) {
    row.classList.add("mastered-row");
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

    return (
      matchesSearch &&
      matchesPattern &&
      matchesSubPattern &&
      matchesDifficulty &&
      matchesFrequency
    );
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

function updateProblemState(problemId, partial) {
  trackerState[problemId] = {
    status: trackerState[problemId]?.status || DEFAULT_STATUS,
    notes: trackerState[problemId]?.notes || "",
    ...partial,
  };

  saveState(trackerState);
  baseProblems = baseProblems.map((problem) =>
    problem.id === problemId ? { ...problem, ...trackerState[problemId] } : problem
  );

  renderTable();
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

  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    selectElement.appendChild(option);
  });
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
