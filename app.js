const SPEAKER_AVATARS = {
  "Kristalina Georgieva": "https://upload.wikimedia.org/wikipedia/commons/e/eb/Kristalina_Georgieva_Headshot.jpg",
  "Gita Gopinath": "https://upload.wikimedia.org/wikipedia/commons/d/d2/Gita_Gopinath_2025_%28cropped%29.jpg",
  "António Guterres": "https://upload.wikimedia.org/wikipedia/commons/1/15/U.N._Secretary_General_Antonio_Guterres_%283x4_cropped_b%29.jpg",
  "Arvind Krishna": "https://upload.wikimedia.org/wikipedia/commons/3/30/Arvind_Krishna_in_2025_%28cropped%29.jpg",
  "Bill Gates": "https://upload.wikimedia.org/wikipedia/commons/d/d9/Bill_Gates_at_the_European_Commission_-_P067383-987995_%28cropped%29_5.jpg",
  "Dario Amodei": "https://upload.wikimedia.org/wikipedia/commons/e/e4/Dario_Amodei_at_TechCrunch_Disrupt_2023_01_%28cropped%29.jpg",
  "Elon Musk": "https://upload.wikimedia.org/wikipedia/commons/5/5e/Elon_Musk_-_54820081119_%28cropped%29.jpg",
  "Saadia Zahidi": "https://upload.wikimedia.org/wikipedia/commons/1/1a/Saadia_Zahidi_cropped.jpg",
  "Sam Altman": "https://upload.wikimedia.org/wikipedia/commons/f/f8/Sam_Altman_TechCrunch_SF_2019_Day_2_Oct_3_%28cropped_3%29.jpg",
  "Satya Nadella": "https://upload.wikimedia.org/wikipedia/commons/4/4f/MS-Exec-Nadella-Satya-2017-08-31-22_%28cropped%29.jpg",
  "Ursula von der Leyen": "https://upload.wikimedia.org/wikipedia/commons/f/f2/Ursula_von_der_Leyen_2024.jpg",
  "Anthropic research team": "https://upload.wikimedia.org/wikipedia/commons/7/78/Anthropic_logo.svg",
  "Anthropic": "https://upload.wikimedia.org/wikipedia/commons/7/78/Anthropic_logo.svg",
  "Hadi Partovi": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/C_icon.svg/240px-C_icon.svg.png",
  "Jensen Huang": "https://upload.wikimedia.org/wikipedia/commons/0/05/JensenHuangSC18.jpg",
  "Gilbert Fossoun Houngbo": "https://upload.wikimedia.org/wikipedia/commons/1/15/U.N._Secretary_General_Antonio_Guterres_%283x4_cropped_b%29.jpg",
  "Tyna Eloundou, Sam Manning, Pamela Mishkin, and Daniel Rock": "",
  "Joseph Briggs and Devesh Kodnani": "",
  "International Labour Organization": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/UN_Labour_Organization_logo.png/240px-UN_Labour_Organization_logo.png",
  "World Economic Forum": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/World_Economic_Forum_logo.svg/240px-World_Economic_Forum_logo.svg.png",
};

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
  filtersToggle: document.getElementById("filtersToggle"),
  filtersPanel: document.getElementById("filtersPanel"),
  applyFilters: document.getElementById("applyFilters"),
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

  if (elements.filtersToggle && elements.filtersPanel) {
    elements.filtersToggle.addEventListener("click", () => {
      const isOpen = elements.filtersPanel.classList.toggle("open");
      elements.filtersToggle.setAttribute("aria-expanded", String(isOpen));
    });

    elements.applyFilters && elements.applyFilters.addEventListener("click", () => {
      elements.filtersPanel.classList.remove("open");
      elements.filtersToggle.setAttribute("aria-expanded", "false");
    });
  }
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

    const avatarEl = fragment.querySelector(".speaker-avatar");
    const avatarUrl = SPEAKER_AVATARS[item.speaker_name];
    if (avatarUrl) {
      avatarEl.src = avatarUrl;
      avatarEl.alt = item.speaker_name;
      avatarEl.onerror = function () {
        this.style.display = "none";
      };
    } else {
      // Use the same default avatar for all speakers
      avatarEl.src = "./default-avatar.jpg";
      avatarEl.alt = item.speaker_name;
    }

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

const DISPLAY_NAME = {
  "job-displacement":          "Job Displacement",
  "job-transformation":        "Job Transformation",
  "automation-ai-exposure":    "Automation & AI Exposure",
  "productivity-augmentation": "Productivity & Augmentation",
  "job-creation":             "Job Creation",
  "labor-market-shifts":       "Labor Market Shifts",
  "skills-retraining":         "Skills & Retraining",
  "ai-adoption":               "AI Adoption",
  "future-work-policy":        "Future of Work & Policy",
  "global labor market":       "Global Labor Market",
  "agi-superintelligence":      "AGI & Superintelligence",
};

function humanize(value) {
  if (DISPLAY_NAME[value]) return DISPLAY_NAME[value];
  return String(value)
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .replace(/\bAI\b/g, "AI");
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
