const STORAGE_KEY = "dsa-tracker-state-v1";
const THEME_KEY = "dsa-tracker-theme";
const STATUS_MASTERED = "Mastered";
const DIFFICULTY_RANK = { Easy: 1, Medium: 2, Hard: 3 };

const elements = {
  problemsBody: document.getElementById("problemsBody"),
  rowTemplate: document.getElementById("problemRowTemplate"),
  searchInput: document.getElementById("searchInput"),
  patternFilter: document.getElementById("patternFilter"),
  difficultyFilter: document.getElementById("difficultyFilter"),
  sortDifficulty: document.getElementById("sortDifficulty"),
  totalCount: document.getElementById("totalCount"),
  completedCount: document.getElementById("completedCount"),
  progressPercent: document.getElementById("progressPercent"),
  progressBar: document.getElementById("progressBar"),
  themeToggle: document.getElementById("themeToggle"),
};

let baseProblems = [];
let trackerState = loadState();

init();

async function init() {
  applyTheme(loadTheme());
  wireControls();

  try {
    const response = await fetch("data.json");
    if (!response.ok) throw new Error("Failed to load data.json");
    const data = await response.json();
    baseProblems = normalizeProblemData(data);

    populateSelect(elements.patternFilter, uniqueValues(baseProblems, "pattern"), "All Patterns");
    populateSelect(elements.difficultyFilter, uniqueValues(baseProblems, "difficulty"), "All Difficulties");
    render();
  } catch (error) {
    elements.problemsBody.innerHTML = `<tr><td colspan="5">Could not load problem list. ${error.message}</td></tr>`;
  }
}

function wireControls() {
  [elements.searchInput, elements.patternFilter, elements.difficultyFilter, elements.sortDifficulty].forEach((control) => {
    control.addEventListener("input", render);
    control.addEventListener("change", render);
  });

  elements.themeToggle.addEventListener("click", () => {
    const nextTheme = document.body.classList.contains("dark") ? "light" : "dark";
    applyTheme(nextTheme);
    localStorage.setItem(THEME_KEY, nextTheme);
  });
}

function normalizeProblemData(items) {
  return items.map((item, index) => {
    const id = item.problem;
    const state = trackerState[id] || { status: "Not Started", notes: "" };

    return {
      id,
      order: index,
      problem: item.problem,
      pattern: item.pattern,
      difficulty: item.difficulty,
      status: state.status,
      notes: state.notes,
    };
  });
}

function render() {
  const filtered = applyFilters(baseProblems);
  const sorted = sortProblems(filtered);
  renderRows(sorted);
  updateSummary(baseProblems);
}

function applyFilters(items) {
  const searchTerm = elements.searchInput.value.trim().toLowerCase();
  const pattern = elements.patternFilter.value;
  const difficulty = elements.difficultyFilter.value;

  return items.filter((item) => {
    const matchesSearch = item.problem.toLowerCase().includes(searchTerm);
    const matchesPattern = pattern === "all" || item.pattern === pattern;
    const matchesDifficulty = difficulty === "all" || item.difficulty === difficulty;
    return matchesSearch && matchesPattern && matchesDifficulty;
  });
}

function sortProblems(items) {
  const sortOrder = elements.sortDifficulty.value;
  if (sortOrder === "none") {
    return [...items].sort((a, b) => a.order - b.order);
  }

  const multiplier = sortOrder === "asc" ? 1 : -1;
  return [...items].sort((a, b) => {
    const rankDiff = (DIFFICULTY_RANK[a.difficulty] - DIFFICULTY_RANK[b.difficulty]) * multiplier;
    if (rankDiff !== 0) return rankDiff;
    return a.problem.localeCompare(b.problem);
  });
}

function renderRows(items) {
  if (!items.length) {
    elements.problemsBody.innerHTML = '<tr><td colspan="5">No problems match your filters.</td></tr>';
    return;
  }

  const fragment = document.createDocumentFragment();

  items.forEach((item) => {
    const row = elements.rowTemplate.content.firstElementChild.cloneNode(true);
    row.querySelector(".problem-name").textContent = item.problem;
    row.querySelector(".problem-pattern").textContent = item.pattern;

    const difficultyBadge = row.querySelector(".difficulty-badge");
    difficultyBadge.textContent = item.difficulty;
    difficultyBadge.classList.add(`difficulty-${item.difficulty.toLowerCase()}`);

    const statusSelect = row.querySelector(".status-select");
    statusSelect.value = item.status;
    statusSelect.addEventListener("change", (event) => {
      updateProblemState(item.id, { status: event.target.value });
    });

    const notesInput = row.querySelector(".notes-input");
    notesInput.value = item.notes;
    notesInput.addEventListener("change", (event) => {
      updateProblemState(item.id, { notes: event.target.value.trim() });
    });

    if (item.status === STATUS_MASTERED) {
      row.classList.add("mastered-row");
    }

    fragment.appendChild(row);
  });

  elements.problemsBody.innerHTML = "";
  elements.problemsBody.appendChild(fragment);
}

function updateProblemState(problemId, partial) {
  trackerState[problemId] = {
    status: trackerState[problemId]?.status || "Not Started",
    notes: trackerState[problemId]?.notes || "",
    ...partial,
  };

  saveState(trackerState);
  baseProblems = baseProblems.map((item) =>
    item.id === problemId ? { ...item, ...trackerState[problemId] } : item
  );
  render();
}

function updateSummary(items) {
  const total = items.length;
  const completed = items.filter((item) => item.status === STATUS_MASTERED).length;
  const percent = total ? Math.round((completed / total) * 100) : 0;

  elements.totalCount.textContent = total;
  elements.completedCount.textContent = completed;
  elements.progressPercent.textContent = `${percent}%`;
  elements.progressBar.style.width = `${percent}%`;
}

function uniqueValues(items, key) {
  return [...new Set(items.map((item) => item[key]))].sort((a, b) => a.localeCompare(b));
}

function populateSelect(selectElement, values, allLabel) {
  selectElement.innerHTML = "";
  const defaultOption = document.createElement("option");
  defaultOption.value = "all";
  defaultOption.textContent = allLabel;
  selectElement.appendChild(defaultOption);

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
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme) return savedTheme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme) {
  document.body.classList.toggle("dark", theme === "dark");
  elements.themeToggle.textContent = theme === "dark" ? "☀️ Light" : "🌙 Dark";
}
