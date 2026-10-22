const searchInput = document.querySelector("#searchInput");
const searchForm = document.querySelector("#searchForm");
const domainFilter = document.querySelector("#domainFilter");
const modeFilter = document.querySelector("#modeFilter");
const clearFiltersButton = document.querySelector("#clearFilters");
const internshipGrid = document.querySelector("#internshipGrid");
const resultCount = document.querySelector("#resultCount");
const statusMessage = document.querySelector("#statusMessage");
const quickFilters = document.querySelector(".quick-filters");
const domainLinks = document.querySelector("#domainLinks");
const profileTotal = document.querySelector("#profileTotal");
const savedTotal = document.querySelector("#savedTotal");
const shortcutSavedCount = document.querySelector("#shortcutSavedCount");
const savedGrid = document.querySelector("#savedGrid");
const savedEmpty = document.querySelector("#savedEmpty");
const savedResultCount = document.querySelector("#savedResultCount");

const STORAGE_KEY = "internhub-saved-internships-v1";
let internships = [];
let loadFailed = false;
let savedIds = readSavedIds();

function readSavedIds() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter(id => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function persistSavedIds() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedIds));
  } catch (error) {
    console.warn("Saved internships could not be stored in this browser.", error);
    statusMessage.textContent = "Bookmarks work for this session, but your browser could not save them permanently.";
  }
}

function textElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function showEmptyState(title, description, target = internshipGrid) {
  const empty = textElement("div", "empty-state");
  empty.append(textElement("h3", "", title), textElement("p", "", description));
  target.replaceChildren(empty);
}

async function loadInternships() {
  resultCount.textContent = "Loading…";
  statusMessage.textContent = "";

  try {
    const response = await fetch("./internships.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`Dataset request failed (${response.status}).`);

    const data = await response.json();
    if (!data || !Array.isArray(data.internships)) {
      throw new Error("The JSON file must contain an 'internships' array.");
    }

    internships = data.internships.filter(isValidInternship);
    if (internships.length === 0) {
      throw new Error("No valid internship records were found in the dataset.");
    }

    loadFailed = false;
    populateFilterOptions();
    renderQuickFilters();
    renderDomainLinks();
    profileTotal.textContent = String(internships.length);
    renderInternships();
    renderSavedInternships();
  } catch (error) {
    loadFailed = true;
    console.error("Could not load internships:", error);
    resultCount.textContent = "Unavailable";
    profileTotal.textContent = "—";
    statusMessage.textContent =
      "We couldn't load the internship data. Check that internships.json is in the same folder and run the site using a local web server.";
    showEmptyState("Internships couldn't be loaded", "Check the JSON filename and format, then refresh the page.");
    domainLinks.replaceChildren(textElement("p", "muted small", "Domain filters are unavailable until the data loads."));
    savedGrid.replaceChildren();
    savedEmpty.hidden = false;
  }
}

function isValidInternship(item) {
  return item &&
    typeof item.id === "string" &&
    typeof item.title === "string" &&
    typeof item.domain === "string" &&
    typeof item.mode === "string" &&
    typeof item.location === "string" &&
    Array.isArray(item.skills) &&
    Number.isFinite(Number(item.openings));
}

function populateFilterOptions() {
  const domains = [...new Set(internships.map(item => item.domain))].sort();
  const modes = [...new Set(internships.map(item => item.mode))].sort();

  for (const domain of domains) {
    const option = document.createElement("option");
    option.value = domain;
    option.textContent = domain;
    domainFilter.append(option);
  }

  for (const mode of modes) {
    const option = document.createElement("option");
    option.value = mode;
    option.textContent = mode;
    modeFilter.append(option);
  }
}

function renderQuickFilters() {
  quickFilters.replaceChildren();
  const domains = ["all", ...new Set(internships.map(item => item.domain))];

  domains.forEach(domain => {
    const button = textElement("button", "filter-chip", domain === "all" ? "All roles" : domain);
    button.type = "button";
    button.dataset.domain = domain;
    button.setAttribute("aria-pressed", String(domainFilter.value === domain));
    if (domainFilter.value === domain) button.classList.add("selected");
    button.addEventListener("click", () => {
      domainFilter.value = domain;
      renderInternships();
      searchInput.focus({ preventScroll: true });
    });
    quickFilters.append(button);
  });
}

function renderDomainLinks() {
  domainLinks.replaceChildren();
  const counts = new Map();
  internships.forEach(item => counts.set(item.domain, (counts.get(item.domain) || 0) + 1));

  [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0])).forEach(([domain, count]) => {
    const button = textElement("button", "domain-link");
    button.type = "button";
    button.append(textElement("span", "", domain), textElement("span", "", String(count)));
    button.classList.toggle("active", domainFilter.value === domain);
    button.setAttribute("aria-pressed", String(domainFilter.value === domain));
    button.addEventListener("click", () => {
      domainFilter.value = domain;
      renderInternships();
      document.querySelector("#filters").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    domainLinks.append(button);
  });
}

function getFilteredInternships() {
  const keyword = searchInput.value.trim().toLocaleLowerCase();
  const domain = domainFilter.value;
  const mode = modeFilter.value;

  return internships.filter(item => {
    const searchable = [
      item.title, item.domain, item.mode, item.location, item.id,
      ...item.skills
    ].join(" ").toLocaleLowerCase();

    return searchable.includes(keyword) &&
      (domain === "all" || item.domain === domain) &&
      (mode === "all" || item.mode === mode);
  });
}

function renderInternships() {
  if (loadFailed) return;

  const filtered = getFilteredInternships();
  resultCount.textContent = `${filtered.length} ${filtered.length === 1 ? "opportunity" : "opportunities"}`;
  statusMessage.textContent = "";
  internshipGrid.replaceChildren();

  if (filtered.length === 0) {
    showEmptyState("No internships found", "Try a different keyword or adjust your domain and work-mode filters.");
  } else {
    filtered.forEach(item => internshipGrid.append(createInternshipCard(item)));
  }

  updateFilterUI();
  renderDomainLinks();
  renderSavedInternships();
}

function initialsFor(item) {
  const words = item.title.replace(/\b(intern|internship)\b/ig, "").trim().split(/\s+/).filter(Boolean);
  return words.slice(0, 2).map(word => word[0]).join("").toUpperCase() || "IN";
}

function createInternshipCard(item, compact = false) {
  const card = textElement("article", "internship-card");
  const top = textElement("div", "card-top");
  const mark = textElement("div", "company-mark", initialsFor(item));
  mark.setAttribute("aria-hidden", "true");

  const titleBlock = textElement("div", "card-title-block");
  titleBlock.append(
    textElement("h3", "", item.title),
    textElement("p", "card-domain", item.domain)
  );
  top.append(mark, titleBlock);

  const meta = textElement("div", "card-meta");
  meta.append(
    textElement("span", "", `⌖ ${item.location}`),
    textElement("span", "", `◷ ${item.mode}`)
  );

  const skills = textElement("div", "skills");
  item.skills.forEach(skill => skills.append(textElement("span", "skill", skill)));

  const bottom = textElement("div", "card-bottom");
  const openings = textElement("span", "openings", `${Number(item.openings)} ${Number(item.openings) === 1 ? "opening" : "openings"}`);

  const actions = textElement("div", "card-actions");
  const isSaved = savedIds.includes(item.id);
  const saveButton = textElement("button", `save-button${isSaved ? " is-saved" : ""}`, isSaved ? "✓ Saved" : "☆ Save");
  saveButton.type = "button";
  saveButton.setAttribute("aria-pressed", String(isSaved));
  saveButton.setAttribute("aria-label", `${isSaved ? "Remove saved" : "Save"} ${item.title}`);
  saveButton.addEventListener("click", () => toggleSaved(item.id));

  const detailsButton = textElement("button", "details-button", "View details");
  detailsButton.type = "button";
  detailsButton.addEventListener("click", () => showInternshipDetails(item));

  actions.append(saveButton, detailsButton);
  bottom.append(openings, actions);
  card.append(top, meta);

  if (!compact) {
    card.append(textElement("p", "card-description", `Explore this ${item.domain.toLowerCase()} opportunity and build practical experience.`));
    card.append(skills);
  }

  card.append(bottom);
  return card;
}

function showInternshipDetails(item) {
  const detailText = [
    item.title,
    `Domain: ${item.domain}`,
    `Work mode: ${item.mode}`,
    `Location: ${item.location}`,
    `Skills: ${item.skills.join(", ")}`,
    `Openings: ${item.openings}`,
    `Reference: ${item.id}`,
    "",
    "This is fictional sample data for the EdVyro assignment, not a live vacancy."
  ].join("\n");
  window.alert(detailText);
}

function toggleSaved(id) {
  if (savedIds.includes(id)) {
    savedIds = savedIds.filter(savedId => savedId !== id);
    statusMessage.textContent = "Internship removed from your saved list.";
  } else {
    savedIds = [...savedIds, id];
    statusMessage.textContent = "Internship saved. You can find it in Your saved internships.";
  }

  persistSavedIds();
  updateSavedCounts();
  renderInternships();
}

function renderSavedInternships() {
  if (!savedGrid || loadFailed) return;
  const saved = internships.filter(item => savedIds.includes(item.id));
  savedGrid.replaceChildren();

  saved.forEach(item => savedGrid.append(createInternshipCard(item, true)));

  savedEmpty.hidden = saved.length > 0;
  savedResultCount.textContent = `${saved.length} saved`;
  updateSavedCounts();
}

function updateSavedCounts() {
  const count = internships.filter(item => savedIds.includes(item.id)).length;
  savedTotal.textContent = String(count);
  shortcutSavedCount.textContent = String(count);
  savedResultCount.textContent = `${count} saved`;
}

function updateFilterUI() {
  quickFilters.querySelectorAll(".filter-chip").forEach(button => {
    const selected = button.dataset.domain === domainFilter.value;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
}

function resetFilters() {
  searchInput.value = "";
  domainFilter.value = "all";
  modeFilter.value = "all";
  renderInternships();
}

searchForm.addEventListener("submit", event => {
  event.preventDefault();
  renderInternships();
});
searchInput.addEventListener("input", renderInternships);
domainFilter.addEventListener("change", renderInternships);
modeFilter.addEventListener("change", renderInternships);
clearFiltersButton.addEventListener("click", resetFilters);

loadInternships();
