const state = {
  predictions: [],
  filters: {
    search: "",
    speakerType: "",
    topic: "",
    geography: "",
    predictionType: "",
    year: "",
    sort: "newest",
  },
};

const elements = {
  stats: document.getElementById("stats"),
  resultsCount: document.getElementById("resultsCount"),
  activeFilters: document.getElementById("activeFilters"),
  predictionsList: document.getElementById("predictionsList"),
  template: document.getElementById("predictionCardTemplate"),
  searchInput: document.getElementById("searchInput"),
  speakerTypeFilter: document.getElementById("speakerTypeFilter"),
  topicFilter: document.getElementById("topicFilter"),
  geographyFilter: document.getElementById("geographyFilter"),
  predictionTypeFilter: document.getElementById("predictionTypeFilter"),
  yearFilter: document.getElementById("yearFilter"),
  sortFilter: document.getElementById("sortFilter"),
  resetFilters: document.getElementById("resetFilters"),
};

init();

async function init() {
  const response = await fetch("./predictions.json");
  state.predictions = await response.json();
  populateFilterOptions();
  bindEvents();
  render();
}

function bindEvents() {
  elements.searchInput.addEventListener("input", (event) => {
    state.filters.search = event.target.value.trim().toLowerCase();
    render();
  });

  [
    [elements.speakerTypeFilter, "speakerType"],
    [elements.topicFilter, "topic"],
    [elements.geographyFilter, "geography"],
    [elements.predictionTypeFilter, "predictionType"],
    [elements.yearFilter, "year"],
    [elements.sortFilter, "sort"],
  ].forEach(([element, key]) => {
    element.addEventListener("change", (event) => {
      state.filters[key] = event.target.value;
      render();
    });
  });

  elements.resetFilters.addEventListener("click", () => {
    state.filters = {
      search: "",
      speakerType: "",
      topic: "",
      geography: "",
      predictionType: "",
      year: "",
      sort: "newest",
    };

    elements.searchInput.value = "";
    elements.speakerTypeFilter.value = "";
    elements.topicFilter.value = "";
    elements.geographyFilter.value = "";
    elements.predictionTypeFilter.value = "";
    elements.yearFilter.value = "";
    elements.sortFilter.value = "newest";
    render();
  });
}

function populateFilterOptions() {
  fillSelect(elements.speakerTypeFilter, uniqueValues(state.predictions.map((item) => item.speaker_type)));
  fillSelect(elements.topicFilter, uniqueValues(state.predictions.flatMap((item) => item.topic_tags || [])));
  fillSelect(elements.geographyFilter, uniqueValues(state.predictions.map((item) => item.geography_scope)));
  fillSelect(elements.predictionTypeFilter, uniqueValues(state.predictions.map((item) => item.prediction_type)));
  fillSelect(
    elements.yearFilter,
    uniqueValues(
      state.predictions
        .map((item) => String(item.date_made || "").slice(0, 4))
        .filter(Boolean)
    ).sort((a, b) => Number(b) - Number(a))
  );
}

function fillSelect(element, values) {
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = humanize(value);
    element.appendChild(option);
  });
}

function uniqueValues(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function render() {
  const filtered = getFilteredPredictions();
  renderStats();
  renderActiveFilters();
  renderResults(filtered);
}

function renderStats() {
  const totalPredictions = state.predictions.length;
  const speakers = new Set(state.predictions.map((item) => item.speaker_name)).size;
  const topics = new Set(state.predictions.flatMap((item) => item.topic_tags || [])).size;

  elements.stats.innerHTML = "";
  [
    `${totalPredictions} predictions`,
    `${speakers} speakers`,
    `${topics} topics`,
  ].forEach((label) => {
    const pill = document.createElement("span");
    pill.className = "stat-pill";
    pill.textContent = label;
    elements.stats.appendChild(pill);
  });
}

function renderActiveFilters() {
  elements.activeFilters.innerHTML = "";
  const activeEntries = Object.entries(state.filters).filter(([key, value]) => value && !(key === "sort" && value === "newest"));

  activeEntries.forEach(([key, value]) => {
    const pill = document.createElement("span");
    pill.className = "filter-pill";
    pill.textContent = `${labelForFilter(key)}: ${humanize(value)}`;
    elements.activeFilters.appendChild(pill);
  });
}

function renderResults(items) {
  elements.predictionsList.innerHTML = "";
  elements.resultsCount.textContent = `${items.length} of ${state.predictions.length} predictions shown`;

  if (!items.length) {
    const emptyState = document.createElement("div");
    emptyState.className = "empty-state";
    emptyState.textContent = "No predictions match the current filters.";
    elements.predictionsList.appendChild(emptyState);
    return;
  }

  items.forEach((item) => {
    const fragment = elements.template.content.cloneNode(true);

    fragment.querySelector(".badge-type").textContent = humanize(item.prediction_type);
    fragment.querySelector(".badge-speaker").textContent = humanize(item.speaker_type);
    fragment.querySelector(".prediction-text").textContent = item.prediction_text;
    fragment.querySelector(".speaker-line").textContent = `${item.speaker_name}${item.organization ? ` — ${item.organization}` : ""}`;
    fragment.querySelector(".date-line").textContent = `${formatDate(item.date_made)}${item.geography_scope ? ` • ${humanize(item.geography_scope)}` : ""}${item.time_horizon_text ? ` • ${item.time_horizon_text}` : ""}`;
    fragment.querySelector(".source-quote").textContent = item.source_quote || item.prediction_text;
    fragment.querySelector(".source-title").textContent = item.source_title;

    const sourceLink = fragment.querySelector(".source-link");
    sourceLink.href = item.source_url;

    const detailLink = fragment.querySelector(".detail-link");
    detailLink.href = `./prediction.html?id=${encodeURIComponent(item.id)}`;

    const tagList = fragment.querySelector(".tag-list");
    (item.topic_tags || []).forEach((tag) => {
      const tagElement = document.createElement("span");
      tagElement.className = "tag";
      tagElement.textContent = humanize(tag);
      tagList.appendChild(tagElement);
    });

    elements.predictionsList.appendChild(fragment);
  });
}

function getFilteredPredictions() {
  const filtered = [...state.predictions]
    .filter((item) => matchesSearch(item, state.filters.search))
    .filter((item) => !state.filters.speakerType || item.speaker_type === state.filters.speakerType)
    .filter((item) => !state.filters.topic || (item.topic_tags || []).includes(state.filters.topic))
    .filter((item) => !state.filters.geography || item.geography_scope === state.filters.geography)
    .filter((item) => !state.filters.predictionType || item.prediction_type === state.filters.predictionType)
    .filter((item) => !state.filters.year || String(item.date_made || "").startsWith(state.filters.year));

  return filtered.sort((a, b) => {
    if (state.filters.sort === "oldest") {
      return String(a.date_made).localeCompare(String(b.date_made));
    }

    if (state.filters.sort === "speaker") {
      return String(a.speaker_name).localeCompare(String(b.speaker_name));
    }

    return String(b.date_made).localeCompare(String(a.date_made));
  });
}

function matchesSearch(item, query) {
  if (!query) return true;

  const haystack = [
    item.speaker_name,
    item.organization,
    item.prediction_text,
    item.source_title,
    item.source_quote,
    ...(item.topic_tags || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

function humanize(value) {
  return String(value)
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(value) {
  if (!value) return "Date not specified";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function labelForFilter(key) {
  return {
    search: "Search",
    speakerType: "Speaker type",
    topic: "Topic",
    geography: "Geography",
    predictionType: "Prediction type",
    year: "Year",
    sort: "Sort",
  }[key] || key;
}
