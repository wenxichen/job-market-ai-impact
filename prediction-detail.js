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

  detailCard.innerHTML = `
    <div class="card-topline">
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
