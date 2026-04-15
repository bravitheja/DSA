const STORAGE_KEY = "dsa-tracker-state-v3";
const THEME_KEY = "dsa-tracker-theme";
const COLUMN_PREF_KEY = "dsa-tracker-columns";

const STATUS_MASTERED = "Mastered";
const DEFAULT_STATUS = "Not Started";
const DIFFICULTY_RANK = { Easy: 1, Medium: 2, Hard: 3 };
const FREQUENCY_RANK = { High: 3, Medium: 2, Low: 1 };
const DEFAULT_PAGE_SIZE = 10;
const HEAT_BAR_MAX = 650;
const NOTES_SAVE_DELAY_MS = 500;

const elements = {
  body: document.getElementById("problemsBody"),
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
  easyBreakdown: document.getElementById("easyBreakdown"),
  mediumBreakdown: document.getElementById("mediumBreakdown"),
  hardBreakdown: document.getElementById("hardBreakdown"),
  themeToggle: document.getElementById("themeToggle"),
  columnToggles: document.querySelectorAll(".column-toggle"),
  filterPills: document.querySelectorAll(".filter-pill"),
  pageSizeSelect: document.getElementById("pageSizeSelect"),
  prevPageBtn: document.getElementById("prevPageBtn"),
  nextPageBtn: document.getElementById("nextPageBtn"),
  pageIndicator: document.getElementById("pageIndicator"),
  paginationInfo: document.getElementById("paginationInfo"),
  notesDrawer: document.getElementById("notesDrawer"),
  notesDrawerTitle: document.getElementById("notesDrawerTitle"),
  notesTextarea: document.getElementById("notesTextarea"),
  notesPreview: document.getElementById("notesPreview"),
  notesStatus: document.getElementById("notesStatus"),
  closeNotesDrawerBtn: document.getElementById("closeNotesDrawerBtn"),
};

let allProblems = [];
let filteredProblems = [];
let trackerState = loadState();
let hiddenColumns = loadHiddenColumns();
let currentPage = 1;
let pageSize = DEFAULT_PAGE_SIZE;
let activeNotesProblemId = null;
let notesSaveTimer = null;

init();

async function init() {
  applyTheme(loadTheme());
  bindControls();
  applyColumnVisibility();

  const data = await loadData();
  allProblems = normalizeProblemData(data);
  filteredProblems = allProblems;

  setupFilters(allProblems);
  syncFilterPills();
  applyAndRender();
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
    control.addEventListener("input", resetToPageOneAndRender);
    control.addEventListener("change", resetToPageOneAndRender);
  });

  elements.pageSizeSelect.value = String(DEFAULT_PAGE_SIZE);
  elements.pageSizeSelect.addEventListener("change", () => {
    const nextSize = Number(elements.pageSizeSelect.value);
    pageSize = Number.isFinite(nextSize) && nextSize > 0 ? nextSize : DEFAULT_PAGE_SIZE;
    resetToPageOneAndRender();
  });

  elements.prevPageBtn.addEventListener("click", () => {
    if (currentPage <= 1) return;
    currentPage -= 1;
    applyAndRender();
  });

  elements.nextPageBtn.addEventListener("click", () => {
    const totalPages = getTotalPages(filteredProblems.length);
    if (currentPage >= totalPages) return;
    currentPage += 1;
    applyAndRender();
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

  elements.filterPills.forEach((pill) => {
    pill.addEventListener("click", () => {
      const target = elements[pill.dataset.target];
      if (!target) return;
      target.value = pill.dataset.value;
      syncFilterPills();
      resetToPageOneAndRender();
    });
  });

  elements.body.addEventListener("change", handleTableChange);
  elements.body.addEventListener("click", handleTableClick);

  elements.closeNotesDrawerBtn.addEventListener("click", closeNotesDrawer);
  elements.notesTextarea.addEventListener("input", handleNotesInput);
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
      frequencyValue: normalizeFrequencyValue(item.frequency),
      frequencyBand: normalizeFrequencyBand(item.frequency),
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

function normalizeFrequencyValue(value) {
  const numeric = Number(value);
  if (!Number.isNaN(numeric) && numeric > 0) return numeric;
  return 0;
}

function normalizeFrequencyBand(value) {
  const cleaned = String(value ?? "").trim().toLowerCase();
  if (cleaned === "high") return "High";
  if (cleaned === "medium") return "Medium";
  if (cleaned === "low") return "Low";

  const numeric = Number(value);
  if (!Number.isNaN(numeric)) {
    if (numeric >= 200) return "High";
    if (numeric >= 100) return "Medium";
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

function resetToPageOneAndRender() {
  currentPage = 1;
  applyAndRender();
}

function applyAndRender() {
  filteredProblems = applyFilters(allProblems);
  const sorted = applySort(filteredProblems);
  const totalPages = getTotalPages(sorted.length);
  currentPage = Math.min(currentPage, totalPages);
  const paginated = paginate(sorted);

  renderTable(paginated);
  updatePagination(sorted.length);
  updateStats(allProblems);
  syncFilterPills();
}

function getTotalPages(totalItems) {
  return Math.max(1, Math.ceil(totalItems / pageSize));
}

function paginate(items) {
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  return items.slice(start, end);
}

function renderTable(items) {
  if (!items.length) {
    showErrorRow("No problems match current filters.");
    return;
  }

  elements.body.innerHTML = items.map((problem) => buildRowMarkup(problem)).join("");
  applyColumnVisibility();
}

function buildRowMarkup(problem) {
  const conceptClass = getConceptTagClasses(problem.pattern);
  const heatPercent = Math.min(100, Math.max(0, (problem.frequencyValue / HEAT_BAR_MAX) * 100));
  const isMastered = problem.status === STATUS_MASTERED;

  return `
    <tr class="table-row hover:bg-slate-50/50 ${isMastered ? "is-mastered" : ""}" data-problem-id="${escapeHtml(problem.id)}">
      <td data-col="mastered" data-label="Done">
        <input type="checkbox" class="mastered-checkbox" data-problem-id="${escapeHtml(problem.id)}" ${isMastered ? "checked" : ""} aria-label="Mark ${escapeHtml(problem.problem)} mastered" />
      </td>
      <td data-col="problem" class="problem-cell" data-label="Problem">
        <a class="problem-link" href="${escapeHtml(problem.link)}" target="_blank" rel="noopener noreferrer">${escapeHtml(problem.problem)}</a>
      </td>
      <td data-col="concept" class="concept-cell" data-label="Concept">
        <div class="concept">
          <div class="pattern ${conceptClass}">${escapeHtml(problem.pattern)}</div>
          <div class="sub-pattern">${escapeHtml(problem.subPattern)}</div>
          <button type="button" class="idea-icon" title="${escapeHtml(problem.coreIdea)}" aria-label="View core idea">💡</button>
        </div>
      </td>
      <td data-col="difficulty" data-label="Difficulty"><span class="difficulty-badge difficulty-${problem.difficulty.toLowerCase()}">${problem.difficulty}</span></td>
      <td data-col="frequency" data-label="Frequency">
        <div class="frequency-cell-wrap">
          <span class="frequency-value">${problem.frequencyValue}</span>
          <div class="heat-track" aria-hidden="true">
            <div class="heat-fill bg-indigo-500" style="width: ${heatPercent.toFixed(2)}%"></div>
          </div>
        </div>
      </td>
      <td data-col="complexity" class="complexity-cell" data-label="Complexity">${escapeHtml(problem.complexity)}</td>
      <td data-col="notes" data-label="Notes">
        <button type="button" class="notes-btn" data-problem-id="${escapeHtml(problem.id)}">Open Notes</button>
      </td>
    </tr>
  `;
}

function getConceptTagClasses(pattern) {
  const normalized = String(pattern || "").trim().toLowerCase();
  if (normalized.includes("dp") || normalized.includes("dynamic")) return "concept-purple";
  if (normalized.includes("graph")) return "concept-blue";
  if (normalized.includes("hash")) return "concept-green";
  if (normalized.includes("two pointer")) return "concept-orange";
  return "concept-default";
}

function handleTableChange(event) {
  const target = event.target;
  const problemId = target.dataset.problemId;
  if (!problemId) return;

  if (target.classList.contains("mastered-checkbox")) {
    const nextStatus = target.checked ? STATUS_MASTERED : DEFAULT_STATUS;
    patchProblemState(problemId, { status: nextStatus });

    const row = target.closest("tr");
    if (row) row.classList.toggle("is-mastered", target.checked);

    updateStats(allProblems);
  }
}

function handleTableClick(event) {
  const notesButton = event.target.closest(".notes-btn");
  if (!notesButton) return;

  const problemId = notesButton.dataset.problemId;
  if (!problemId) return;
  openNotesDrawer(problemId);
}

function openNotesDrawer(problemId) {
  activeNotesProblemId = problemId;
  const problem = allProblems.find((item) => item.id === problemId);
  if (!problem) return;

  elements.notesDrawerTitle.textContent = `Notes · ${problem.problem}`;
  elements.notesTextarea.value = problem.notes || "";
  elements.notesStatus.textContent = "All changes saved";
  renderMarkdownPreview(problem.notes || "");
  elements.notesDrawer.hidden = false;
}

function closeNotesDrawer() {
  elements.notesDrawer.hidden = true;
  activeNotesProblemId = null;
  clearTimeout(notesSaveTimer);
}

function handleNotesInput() {
  if (!activeNotesProblemId) return;
  clearTimeout(notesSaveTimer);
  elements.notesStatus.textContent = "Auto-saving...";

  notesSaveTimer = window.setTimeout(() => {
    patchProblemState(activeNotesProblemId, { notes: elements.notesTextarea.value.trim() });
    renderMarkdownPreview(elements.notesTextarea.value);
    elements.notesStatus.textContent = "All changes saved";
  }, NOTES_SAVE_DELAY_MS);
}

function renderMarkdownPreview(markdownText) {
  if (window.marked?.parse) {
    elements.notesPreview.innerHTML = window.marked.parse(markdownText || "");
    return;
  }

  elements.notesPreview.textContent = markdownText || "Nothing to preview yet.";
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
    const matchesFrequency = frequency === "all" || item.frequencyBand === frequency;

    return matchesSearch && matchesPattern && matchesSubPattern && matchesDifficulty && matchesFrequency;
  });
}

function applySort(items) {
  const mode = elements.sortSelect.value;

  if (mode === "alpha") return [...items].sort((a, b) => a.problem.localeCompare(b.problem));

  if (mode === "difficulty") {
    return [...items].sort((a, b) => {
      const rankDiff = DIFFICULTY_RANK[a.difficulty] - DIFFICULTY_RANK[b.difficulty];
      return rankDiff || a.problem.localeCompare(b.problem);
    });
  }

  if (mode === "frequency") {
    return [...items].sort((a, b) => {
      const valueDiff = b.frequencyValue - a.frequencyValue;
      if (valueDiff !== 0) return valueDiff;
      const rankDiff = FREQUENCY_RANK[b.frequencyBand] - FREQUENCY_RANK[a.frequencyBand];
      return rankDiff || a.problem.localeCompare(b.problem);
    });
  }

  return [...items].sort((a, b) => a.order - b.order);
}

function updateStats(items) {
  const total = items.length;
  const completed = items.filter((item) => item.status === STATUS_MASTERED).length;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  const easyTotal = items.filter((item) => item.difficulty === "Easy").length;
  const easyDone = items.filter(
    (item) => item.difficulty === "Easy" && item.status === STATUS_MASTERED
  ).length;
  const mediumTotal = items.filter((item) => item.difficulty === "Medium").length;
  const mediumDone = items.filter(
    (item) => item.difficulty === "Medium" && item.status === STATUS_MASTERED
  ).length;
  const hardTotal = items.filter((item) => item.difficulty === "Hard").length;
  const hardDone = items.filter(
    (item) => item.difficulty === "Hard" && item.status === STATUS_MASTERED
  ).length;

  elements.totalCount.textContent = total;
  elements.completedCount.textContent = completed;
  elements.progressPercent.textContent = `${progress}%`;
  elements.progressBar.style.width = `${progress}%`;

  elements.easyBreakdown.textContent = `Easy: ${easyDone}/${easyTotal}`;
  elements.mediumBreakdown.textContent = `Medium: ${mediumDone}/${mediumTotal}`;
  elements.hardBreakdown.textContent = `Hard: ${hardDone}/${hardTotal}`;
}

function showErrorRow(message) {
  elements.body.innerHTML = `<tr><td colspan="7" class="empty-state">${message}</td></tr>`;
}

function updatePagination(totalItems) {
  const totalPages = getTotalPages(totalItems);
  const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = totalItems === 0 ? 0 : Math.min(currentPage * pageSize, totalItems);

  elements.paginationInfo.textContent = `Showing ${start}-${end} of ${totalItems}`;
  elements.pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;
  elements.prevPageBtn.disabled = currentPage <= 1;
  elements.nextPageBtn.disabled = currentPage >= totalPages;
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

function syncFilterPills() {
  elements.filterPills.forEach((pill) => {
    const target = elements[pill.dataset.target];
    pill.classList.toggle("active", Boolean(target) && target.value === pill.dataset.value);
  });
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

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
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
