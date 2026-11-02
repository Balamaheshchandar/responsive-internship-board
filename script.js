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
// Application form elements
const applicationModal = document.querySelector("#applicationModal");
const applicationForm = document.querySelector("#applicationForm");
const closeApplicationModal = document.querySelector("#closeApplicationModal");
const applicationInternshipTitle = document.querySelector("#applicationInternshipTitle");
const applicationStatus = document.querySelector("#applicationStatus");
const submitApplicationButton = document.querySelector("#submitApplication");

const APPLICATION_API_URL = "http://localhost:3000/api/applications";

let selectedInternshipId = null;


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

const API_URL = "http://localhost:3000/api/internships";


async function loadInternships() {
  resultCount.textContent = "Loading internships...";
  statusMessage.textContent = "";
  showEmptyState("Loading internships...", "Please wait.");

  try {
    const response = await fetch(API_URL, {
      method: "GET",
      headers: {
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success || !Array.isArray(result.data)) {
      throw new Error("Invalid API response.");
    }

    internships = result.data.map(item => ({
      ...item,
      id: String(item.id),
      domain: getDomain(item.title),
      openings: 0
    })).filter(isValidInternship);

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
      "Unable to connect to the internship API. Check whether the backend server is running.";

    showEmptyState(
      "Internships couldn't be loaded",
      "Please check your backend connection and try again."
    );

    domainLinks.replaceChildren(
      textElement("p", "muted small", "Domain filters unavailable.")
    );

    savedGrid.replaceChildren();
    savedEmpty.hidden = false;
  }
} // This closes loadInternships()

function getDomain(title) {
  const value = title.toLowerCase();

  if (value.includes("frontend")) return "Frontend Development";
  if (value.includes("flutter")) return "Mobile Development";
  if (value.includes("python")) return "Backend Development";
  if (value.includes("design")) return "UI/UX Design";
  if (value.includes("qa")) return "Quality Assurance";

  return "Other";
}


function isValidInternship(item) {
  return item &&
    typeof item.id === "string" &&
    typeof item.title === "string" &&
    typeof item.domain === "string" &&
    typeof item.mode === "string" &&
    typeof item.location === "string" &&
    Array.isArray(item.skills);
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
  const openings = textElement("span", "openings", item.stipend || "Stipend not specified");

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

// Apply Now button
const applyButton = textElement("button", "details-button", "Apply Now");
applyButton.type = "button";
applyButton.addEventListener("click", () => openApplicationForm(item));

actions.append(saveButton, detailsButton, applyButton);
  bottom.append(openings, actions);
  card.append(top, meta);

  if (!compact) {
    card.append(textElement("p", "card-description", item.description || "Explore this internship opportunity."));
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
  `Company: ${item.company}`,
  `Stipend: ${item.stipend}`,
  `Duration: ${item.duration}`,
  `Employment type: ${item.employment_type}`,
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

function openApplicationForm(item) {
  selectedInternshipId = item.id;
  applicationInternshipTitle.textContent = item.title;
  applicationStatus.textContent = "";
  applicationStatus.style.color = "";
  applicationForm.reset();

  applicationModal.classList.add("is-open");
  applicationModal.setAttribute("aria-hidden", "false");

  document.querySelector("#applicantName").focus();
}

function closeApplicationForm() {
  applicationModal.classList.remove("is-open");
  applicationModal.setAttribute("aria-hidden", "true");
  selectedInternshipId = null;
}

closeApplicationModal.addEventListener("click", closeApplicationForm);

applicationModal.addEventListener("click", event => {
  if (event.target === applicationModal) {
    closeApplicationForm();
  }
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && applicationModal.classList.contains("is-open")) {
    closeApplicationForm();
  }
});
applicationForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!selectedInternshipId) return;

  const formData = new FormData(applicationForm);

  const payload = {
    internship_id: Number(selectedInternshipId),
    applicant_name: formData.get("applicant_name").trim(),
    email: formData.get("email").trim(),
    phone: formData.get("phone").trim(),
    resume_url: formData.get("resume_url").trim(),
    cover_letter: formData.get("cover_letter").trim()
  };

  submitApplicationButton.disabled = true;
  submitApplicationButton.textContent = "Submitting...";
  applicationStatus.textContent = "Submitting your application...";

  try {
    const response = await fetch(APPLICATION_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.error?.message || result.message || "Application failed."
      );
    }

    applicationStatus.textContent =
      `Application submitted successfully! Reference ID: ${result.application_id}`;

    applicationStatus.style.color = "green";
    applicationForm.reset();
    selectedInternshipId = null;

  } catch (error) {
    applicationStatus.textContent =
      error.message || "Could not submit application. Please try again.";

    applicationStatus.style.color = "red";

  } finally {
    submitApplicationButton.disabled = false;
    submitApplicationButton.textContent = "Submit Application";
  }
});
loadInternships();
