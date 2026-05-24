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
  "Jensen Huang": "",
  "Gilbert Fossoun Houngbo": "https://upload.wikimedia.org/wikipedia/commons/1/15/U.N._Secretary_General_Antonio_Guterres_%283x4_cropped_b%29.jpg",
  "Tyna Eloundou, Sam Manning, Pamela Mishkin, and Daniel Rock": "",
  "Joseph Briggs and Devesh Kodnani": "",
  "International Labour Organization": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/UN_Labour_Organization_logo.png/240px-UN_Labour_Organization_logo.png",
  "World Economic Forum": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/World_Economic_Forum_logo.svg/240px-World_Economic_Forum_logo.svg.png",
};

const titleElement = document.getElementById("detailTitle");
const subtitleElement = document.getElementById("detailSubtitle");
const detailCard = document.getElementById("detailCard");

init();

async function init() {
  const params = new URLSearchParams(window.location.search);
  const predictionId = params.get("id");

  if (!predictionId) {
    renderError("Missing prediction id.");
    return;
  }

  const response = await fetch("./predictions.json");
  const predictions = await response.json();
  const item = predictions.find((entry) => entry.id === predictionId);

  if (!item) {
    renderError("Prediction not found.");
    return;
  }

  renderDetail(item);
}

function renderDetail(item) {
  document.title = `${item.speaker_name} · AI Job Market Predictions`;
  titleElement.textContent = item.prediction_text;
  subtitleElement.textContent = `${item.speaker_name}${item.organization ? ` — ${item.organization}` : ""}`;

  const tags = (item.topic_tags || [])
    .map((tag) => `<span class="tag">${escapeHtml(humanize(tag))}</span>`)
    .join("");

  const avatarUrl = SPEAKER_AVATARS[item.speaker_name];
  const avatarHtml = avatarUrl
    ? `<img class="speaker-avatar" src="${escapeAttribute(avatarUrl)}" alt="${escapeAttribute(item.speaker_name)}" style="width:72px;height:72px;" />`
    : `<div class="speaker-avatar" style="display:inline-flex;align-items:center;justify-content:center;width:72px;height:72px;border-radius:50%;background:var(--accent-soft);border:2px solid var(--border);font-size:1.4rem;font-weight:700;color:var(--accent);">${item.speaker_name.split(" ").map(w=>w[0]).join("").slice(0,2)}</div>`;

  detailCard.innerHTML = `
    ${avatarHtml}
    <div class="card-topline" style="margin-top:16px;">
      <span class="badge">${escapeHtml(humanize(item.prediction_type || "other"))}</span>
      <span class="badge badge-speaker">${escapeHtml(humanize(item.speaker_type || "other"))}</span>
    </div>

    <p class="meta"><strong>Speaker:</strong> ${escapeHtml(item.speaker_name || "Unknown")}</p>
    <p class="meta"><strong>Organization:</strong> ${escapeHtml(item.organization || "Not specified")}</p>
    <p class="meta"><strong>Date made:</strong> ${escapeHtml(formatDate(item.date_made))}</p>
    <p class="meta"><strong>Geography:</strong> ${escapeHtml(humanize(item.geography_scope || "Not specified"))}</p>
    <p class="meta"><strong>Affected group:</strong> ${escapeHtml(item.affected_group || "Not specified")}</p>
    <p class="meta"><strong>Time horizon:</strong> ${escapeHtml(item.time_horizon_text || "Not specified")}</p>
    <p class="meta"><strong>Target year:</strong> ${item.target_year ?? "Not specified"}</p>

    <h2>Prediction</h2>
    <p class="detail-text">${escapeHtml(item.prediction_text || "")}</p>

    <h2>Source quote</h2>
    <blockquote class="source-blockquote">${escapeHtml(item.source_quote || item.prediction_text || "")}</blockquote>

    <h2>Topics</h2>
    <div class="tag-list">${tags || '<span class="meta">No topic tags</span>'}</div>

    <h2>Source</h2>
    <p class="meta"><strong>Title:</strong> ${escapeHtml(item.source_title || "Untitled")}</p>
    <p class="meta"><strong>Type:</strong> ${escapeHtml(humanize(item.source_type || "other"))}</p>
    <p><a class="source-link" href="${escapeAttribute(item.source_url || '#')}" target="_blank" rel="noopener noreferrer">Open original source</a></p>
  `;
}

function renderError(message) {
  titleElement.textContent = "Prediction detail";
  subtitleElement.textContent = message;
  detailCard.innerHTML = `<div class="empty-state">${escapeHtml(message)}</div>`;
}

function humanize(value) {
  return String(value)
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(value) {
  if (!value) return "Not specified";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}
