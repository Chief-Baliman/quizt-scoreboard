import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getDatabase, ref, get, set, remove, onValue } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyA5kq-HiCkVroQLCwwVc24C8XYPJTZvegM",
  authDomain: "queue-tracker-3fa3c.firebaseapp.com",
  databaseURL: "https://queue-tracker-3fa3c-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "queue-tracker-3fa3c",
  storageBucket: "queue-tracker-3fa3c.firebasestorage.app",
  messagingSenderId: "132132188124",
  appId: "1:132132188124:web:ecc130f7ee7ac9d61be919",
  measurementId: "G-3QBWJHGDXG"
};

const ADMIN_UID = "FMZW16NbeQXPKmVE50BcnbRYI2o1";
const ROOT_PATH = "quiztScoreboard";
const LEAGUE_POINTS = [20, 16, 12, 9, 6, 4, 2];

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const $ = (selector) => document.querySelector(selector);
const uid = () => crypto.randomUUID ? crypto.randomUUID() : `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
const createModeratorCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
};

const dom = {
  adminToggleBtn: $("#adminToggleBtn"),
  adminCloseBtn: $("#adminCloseBtn"),
  adminPanel: $("#adminPanel"),
  publicView: $("#publicView"),
  rankingView: $("#rankingView"),
  moderatorView: $("#moderatorView"),
  moderatorTitle: $("#moderatorTitle"),
  moderatorMeta: $("#moderatorMeta"),
  moderatorStatus: $("#moderatorStatus"),
  moderatorContent: $("#moderatorContent"),
  moderatorBackLink: $("#moderatorBackLink"),
  codeForm: $("#codeForm"),
  passwordForm: $("#passwordForm"),
  eventCodeInput: $("#eventCodeInput"),
  eventPasswordInput: $("#eventPasswordInput"),
  publicMessage: $("#publicMessage"),
  backToCodeBtn: $("#backToCodeBtn"),
  eventTitle: $("#eventTitle"),
  eventCodeBadge: $("#eventCodeBadge"),
  eventUpdated: $("#eventUpdated"),
  winnerCard: $("#winnerCard"),
  podiumView: $("#podiumView"),
  rankingList: $("#rankingList"),
  roundSortSelect: $("#roundSortSelect"),
  roundBreakdown: $("#roundBreakdown"),
  openStoryTemplateBtn: $("#openStoryTemplateBtn"),
  storyTemplateView: $("#storyTemplateView"),
  backFromStoryBtn: $("#backFromStoryBtn"),
  loginBox: $("#loginBox"),
  adminWorkspace: $("#adminWorkspace"),
  adminEmail: $("#adminEmail"),
  adminPassword: $("#adminPassword"),
  loginBtn: $("#loginBtn"),
  loginMessage: $("#loginMessage"),
  logoutBtn: $("#logoutBtn"),
  newEventBtn: $("#newEventBtn"),
  adminEventList: $("#adminEventList"),
  editorCard: $("#editorCard"),
  editorHeadline: $("#editorHeadline"),
  editorCode: $("#editorCode"),
  draftStatusBox: $("#draftStatusBox"),
  draftStatusLabel: $("#draftStatusLabel"),
  draftStatusMeta: $("#draftStatusMeta"),
  moderatorLinkInput: $("#moderatorLinkInput"),
  copyModeratorLinkBtn: $("#copyModeratorLinkBtn"),
  quizTitleInput: $("#quizTitleInput"),
  quizNoteInput: $("#quizNoteInput"),
  eventFinishedInput: $("#eventFinishedInput"),
  showPodiumInput: $("#showPodiumInput"),
  privateEventInput: $("#privateEventInput"),
  privatePasswordBox: $("#privatePasswordBox"),
  guestPasswordInput: $("#guestPasswordInput"),
  teamsEditor: $("#teamsEditor"),
  roundsEditor: $("#roundsEditor"),
  adminPreview: $("#adminPreview"),
  addTeamBtn: $("#addTeamBtn"),
  addRoundBtn: $("#addRoundBtn"),
  saveDraftBtn: $("#saveDraftBtn"),
  publishBtn: $("#publishBtn"),
  editorMessage: $("#editorMessage"),
  publicLeagueBox: $("#publicLeagueBox"),
  publicLeagueList: $("#publicLeagueList"),
  publicLeagueQuarterBtn: $("#publicLeagueQuarterBtn"),
  publicLeagueAllTimeBtn: $("#publicLeagueAllTimeBtn"),
  leagueEnabledInput: $("#leagueEnabledInput"),
  leagueShowHomeInput: $("#leagueShowHomeInput"),
  saveLeagueSettingsBtn: $("#saveLeagueSettingsBtn"),
  prepareLeagueImportBtn: $("#prepareLeagueImportBtn"),
  prepareLeagueImportEditorBtn: $("#prepareLeagueImportEditorBtn"),
  leagueActiveEventHint: $("#leagueActiveEventHint"),
  leagueMessage: $("#leagueMessage"),
  leagueImportBox: $("#leagueImportBox"),
  leagueImportRows: $("#leagueImportRows"),
  cancelLeagueImportBtn: $("#cancelLeagueImportBtn"),
  saveLeagueImportBtn: $("#saveLeagueImportBtn"),
  manualLeagueTeamInput: $("#manualLeagueTeamInput"),
  manualLeaguePointsInput: $("#manualLeaguePointsInput"),
  manualLeagueNoteInput: $("#manualLeagueNoteInput"),
  addManualLeagueEntryBtn: $("#addManualLeagueEntryBtn"),
  adminLeagueQuarter: $("#adminLeagueQuarter"),
  adminLeagueAllTime: $("#adminLeagueAllTime"),
  leagueLastSaveBox: $("#leagueLastSaveBox"),
  leagueDebugBox: $("#leagueDebugBox"),
  leagueResultsList: $("#leagueResultsList")
};

let currentUser = null;
let adminEvents = {};
let activeEventId = null;
let activeDraft = null;
let unsubscribeAdminEvents = null;
let pendingPrivateCode = "";
let currentPublicEvent = null;
let unsubscribeLeague = null;
let leagueSettings = { enabled: false, showOnHome: false };
let leagueResults = {};
let pendingLeagueImport = null;
let publicLeagueMode = "quarter";
let lastSavedLeagueEntry = null;


function setupBrandLogo() {
  const logo = document.querySelector("#brandLogo");
  const fallback = document.querySelector("#brandFallback");
  if (!logo || !fallback) return;

  const candidates = ["./logo.png", "./Logo.png", "./assets/logo.png", "./images/logo.png"];
  const version = Date.now();

  function tryCandidate(index) {
    if (index >= candidates.length) {
      logo.classList.add("hidden");
      fallback.classList.remove("hidden");
      return;
    }

    const testImage = new Image();
    const candidate = candidates[index];
    testImage.onload = () => {
      logo.src = `${candidate}?v=${version}`;
      logo.classList.remove("hidden");
      fallback.classList.add("hidden");
    };
    testImage.onerror = () => tryCandidate(index + 1);
    testImage.src = `${candidate}?v=${version}`;
  }

  tryCandidate(0);
}


function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showMessage(node, text, type = "") {
  node.textContent = text || "";
  node.className = `message ${type}`.trim();
}

function normalizeCode(raw) {
  return String(raw || "").replace(/\D/g, "").slice(0, 4);
}

function encodePassword(password) {
  const normalized = String(password || "").trim();
  if (!normalized) return "";
  const encoded = btoa(unescape(encodeURIComponent(normalized)));
  return encoded.replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function formatDate(value) {
  if (!value) return "Noch nicht veröffentlicht";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Zuletzt aktualisiert";
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function scoreNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeEvent(event) {
  const clean = { ...(event || {}) };
  clean.teams = Array.isArray(clean.teams) ? clean.teams : [];
  clean.rounds = Array.isArray(clean.rounds) ? clean.rounds : [];

  if (Array.isArray(clean.extras) && clean.extras.length) {
    const existingIds = new Set(clean.rounds.map((round) => round.id));
    clean.extras.forEach((extra, index) => {
      const extraId = extra.id || uid();
      if (!existingIds.has(extraId)) {
        clean.rounds.push({ ...extra, id: extraId, name: extra.name || `Zwischenrunde ${index + 1}` });
      }
    });
  }

  delete clean.extras;
  clean.isPrivate = Boolean(clean.isPrivate);
  clean.privatePassword = clean.privatePassword || "";
  clean.finished = Boolean(clean.finished);
  clean.showPodium = Boolean(clean.showPodium);
  clean.moderatorCode = clean.moderatorCode || createModeratorCode();
  ensureScoresForTeams(clean);
  return clean;
}

function calculateRoundWinnerIds(round, teams) {
  const values = teams.map((team) => ({ id: team.id, score: scoreNumber(round?.scores?.[team.id]) }));
  const max = Math.max(...values.map((entry) => entry.score));
  if (!Number.isFinite(max) || max <= 0) return new Set();
  return new Set(values.filter((entry) => entry.score === max).map((entry) => entry.id));
}

function calculateRanking(event) {
  const normalized = normalizeEvent(event);
  const teams = normalized.teams;
  const rounds = normalized.rounds;

  return teams.map((team) => {
    const total = rounds.reduce((sum, round) => sum + scoreNumber(round?.scores?.[team.id]), 0);
    return { ...team, total };
  }).sort((a, b) => b.total - a.total || a.name.localeCompare(b.name, "de"));
}

function renderPublicEvent(rawEvent) {
  const event = normalizeEvent(rawEvent);
  currentPublicEvent = event;
  const ranking = calculateRanking(event);
  dom.publicView.classList.add("hidden");
  dom.moderatorView.classList.add("hidden");
  dom.storyTemplateView.classList.add("hidden");
  dom.rankingView.classList.remove("hidden");

  dom.eventTitle.textContent = event.title || "Quizt Event";
  dom.eventCodeBadge.textContent = `Code ${event.code || "----"}${event.isPrivate ? " · Privat" : ""}`;
  dom.eventUpdated.textContent = `${event.note ? `${event.note} · ` : ""}Veröffentlicht: ${formatDate(event.publishedAt || event.updatedAt)}`;

  if (!ranking.length) {
    dom.winnerCard.innerHTML = "<strong>Noch keine Teams</strong><span>Das Ranking wird angezeigt, sobald Teams eingetragen wurden.</span>";
    dom.rankingList.innerHTML = "";
    dom.roundBreakdown.innerHTML = "";
    dom.podiumView.classList.add("hidden");
    return;
  }

  const winner = ranking[0];
  const winnerTitle = event.finished ? "Gewonnen hat" : "Aktuell Platz 1";
  const winnerSub = event.finished ? "Finaler Punktestand" : "Live nach veröffentlichtem Stand";
  dom.winnerCard.innerHTML = `
    <span>${winnerTitle}</span>
    <strong>${escapeHtml(winner.name)}</strong>
    <span>${winner.total} Punkte · ${winnerSub}</span>
  `;

  renderPodium(event, ranking);

  dom.rankingList.innerHTML = ranking.map((team, index) => `
    <article class="rank-row ${index === 0 ? "first" : ""}">
      <div class="rank-number">${index + 1}</div>
      <div>
        <div class="rank-name">${escapeHtml(team.name)}</div>
        ${team.label ? `<div class="team-label">${escapeHtml(team.label)}</div>` : `<div class="muted">Team Ranking</div>`}
      </div>
      <div class="rank-points">${team.total}</div>
    </article>
  `).join("");

  renderBreakdown(event);
}

function renderPodium(event, ranking) {
  if (!event.showPodium || ranking.length < 2) {
    dom.podiumView.classList.add("hidden");
    dom.podiumView.innerHTML = "";
    return;
  }

  const first = ranking[0];
  const second = ranking[1];
  const third = ranking[2];
  const block = (team, place) => team ? `
    <div class="podium-place podium-${place}">
      <span>${place}</span>
      <strong>${escapeHtml(team.name)}</strong>
      <small>${team.total} Punkte</small>
      ${team.label ? `<em>${escapeHtml(team.label)}</em>` : ""}
    </div>
  ` : "";

  dom.podiumView.classList.remove("hidden");
  dom.podiumView.innerHTML = `${block(second, 2)}${block(first, 1)}${block(third, 3)}`;
}

function getTeamTotalMap(event) {
  return new Map(calculateRanking(event).map((team) => [team.id, team.total]));
}

function updateRoundSortOptions(event) {
  if (!dom.roundSortSelect) return "total";

  const previousValue = dom.roundSortSelect.value || "total";
  const rounds = Array.isArray(event.rounds) ? event.rounds : [];
  const options = [
    { value: "total", label: "Gesamtwertung" },
    ...rounds.map((round, index) => ({ value: `round:${round.id}`, label: round.name || `Runde ${index + 1}` }))
  ];

  dom.roundSortSelect.innerHTML = options.map((option) => `
    <option value="${escapeHtml(option.value)}">${escapeHtml(option.label)}</option>
  `).join("");

  const allowed = new Set(options.map((option) => option.value));
  dom.roundSortSelect.value = allowed.has(previousValue) ? previousValue : "total";
  return dom.roundSortSelect.value;
}

function sortTeamsForBreakdown(event, teams, sortValue) {
  const rankingTotals = getTeamTotalMap(event);
  const copiedTeams = [...teams];

  if (sortValue === "original") return copiedTeams;

  if (sortValue?.startsWith("round:")) {
    const roundId = sortValue.replace("round:", "");
    const round = (event.rounds || []).find((entry) => entry.id === roundId);
    copiedTeams.sort((a, b) => {
      const scoreDiff = scoreNumber(round?.scores?.[b.id]) - scoreNumber(round?.scores?.[a.id]);
      if (scoreDiff !== 0) return scoreDiff;
      const totalDiff = (rankingTotals.get(b.id) || 0) - (rankingTotals.get(a.id) || 0);
      if (totalDiff !== 0) return totalDiff;
      return a.name.localeCompare(b.name, "de");
    });
    return copiedTeams;
  }

  copiedTeams.sort((a, b) => {
    const totalDiff = (rankingTotals.get(b.id) || 0) - (rankingTotals.get(a.id) || 0);
    if (totalDiff !== 0) return totalDiff;
    return a.name.localeCompare(b.name, "de");
  });
  return copiedTeams;
}

function getSelectedRoundLeaderboard(event, selectedRoundId) {
  const round = (event.rounds || []).find((entry) => entry.id === selectedRoundId);
  if (!round) return [];
  const totals = getTeamTotalMap(event);
  return (event.teams || []).map((team) => ({
    ...team,
    roundScore: scoreNumber(round?.scores?.[team.id]),
    total: totals.get(team.id) || 0
  })).sort((a, b) => {
    const roundDiff = b.roundScore - a.roundScore;
    if (roundDiff !== 0) return roundDiff;
    const totalDiff = b.total - a.total;
    if (totalDiff !== 0) return totalDiff;
    return a.name.localeCompare(b.name, "de");
  });
}

function renderRoundSpotlight(event, sortValue) {
  const rounds = Array.isArray(event.rounds) ? event.rounds : [];
  const totals = getTeamTotalMap(event);

  if (sortValue?.startsWith("round:")) {
    const selectedRoundId = sortValue.replace("round:", "");
    const round = rounds.find((entry) => entry.id === selectedRoundId);
    const leaderboard = getSelectedRoundLeaderboard(event, selectedRoundId);
    if (!round || !leaderboard.length) return "";

    return `
      <div class="round-spotlight">
        <div>
          <span class="spotlight-kicker">Rundenranking</span>
          <strong>${escapeHtml(round.name || "Runde")}</strong>
          <small>Sortiert nach den Punkten dieser Runde.</small>
        </div>
        <div class="round-podium-list">
          ${leaderboard.slice(0, 3).map((team, index) => `
            <div class="round-podium-item place-${index + 1}">
              <span>${index + 1}</span>
              <strong>${escapeHtml(team.name || "Team")}</strong>
              <em>${team.roundScore} Punkte</em>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  return "";
}

function renderBreakdown(event) {
  const selectedSort = updateRoundSortOptions(event);
  const rounds = Array.isArray(event.rounds) ? event.rounds : [];
  const totals = getTeamTotalMap(event);

  if (!rounds.length) {
    dom.roundBreakdown.innerHTML = "<p class='muted'>Noch keine Runden veröffentlicht.</p>";
    return;
  }

  const sortedTeams = sortTeamsForBreakdown(event, event.teams || [], selectedSort);
  const activeRoundId = selectedSort?.startsWith("round:") ? selectedSort.replace("round:", "") : "";
  const roundWinnerMap = new Map(rounds.map((round) => [round.id, calculateRoundWinnerIds(round, event.teams || [])]));
  const tableMinWidth = Math.max(360, 148 + ((rounds.length + 1) * 58));

  const table = `
    <div class="mobile-table-note">↔ Bei vielen Runden kannst du die Tabelle seitlich schieben.</div>
    <div class="table-scroll desktop-breakdown-table responsive-score-table-wrap" style="--table-min:${tableMinWidth}px" aria-label="Rundenübersicht">
      <table class="score-table matrix-table responsive-score-table">
        <thead>
          <tr>
            <th class="team-head">Team</th>
            ${rounds.map((round) => `<th class="${round.id === activeRoundId ? "active-sort-col" : ""}">${escapeHtml(round.name)}</th>`).join("")}
            <th class="total-head ${selectedSort === "total" ? "active-sort-col" : ""}">Gesamt</th>
          </tr>
        </thead>
        <tbody>
          ${sortedTeams.map((team, index) => `
            <tr>
              <th class="team-cell">
                <span class="table-rank">${index + 1}</span>
                <div>
                  <strong>${escapeHtml(team.name)}</strong>
                  ${team.label ? `<span>${escapeHtml(team.label)}</span>` : ""}
                </div>
              </th>
              ${rounds.map((round) => {
                const winnerIds = roundWinnerMap.get(round.id) || new Set();
                const isWinner = winnerIds.has(team.id);
                const score = scoreNumber(round?.scores?.[team.id]);
                return `<td class="score-cell ${isWinner ? "round-winner" : ""} ${round.id === activeRoundId ? "active-sort-col" : ""}">
                  <span>${score}</span>${isWinner ? "<i class='mini-crown'>★</i>" : ""}
                </td>`;
              }).join("")}
              <td class="total-cell ${selectedSort === "total" ? "active-sort-col" : ""}"><span>${totals.get(team.id) || 0}</span></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
    <p class="round-help">★ markiert den Rundensieger. Das Dropdown sortiert nach Gesamtwertung oder einzelner Runde.</p>
  `;

  dom.roundBreakdown.innerHTML = table;
}


function roundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 2) {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  words.forEach((word) => {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  });
  if (line) lines.push(line);
  const visible = lines.slice(0, maxLines);
  if (lines.length > maxLines) visible[visible.length - 1] = `${visible[visible.length - 1].replace(/\s+\S*$/, "")}…`;
  visible.forEach((entry, index) => ctx.fillText(entry, x, y + index * lineHeight));
  return visible.length * lineHeight;
}

async function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = `${src}?v=${Date.now()}`;
  });
}

function openStoryTemplateView() {
  dom.publicView.classList.add("hidden");
  dom.rankingView.classList.add("hidden");
  dom.storyTemplateView.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function closeStoryTemplateView() {
  dom.storyTemplateView.classList.add("hidden");
  if (currentPublicEvent) {
    dom.rankingView.classList.remove("hidden");
  } else {
    dom.publicView.classList.remove("hidden");
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderModeratorDraft(event) {
  const normalized = normalizeEvent(event);
  const ranking = calculateRanking(normalized);
  const rounds = Array.isArray(normalized.rounds) ? normalized.rounds : [];
  const roundWinnerMap = new Map(rounds.map((round) => [round.id, calculateRoundWinnerIds(round, normalized.teams || [])]));
  const winner = ranking[0];

  dom.moderatorView.classList.remove("hidden");
  dom.publicView.classList.add("hidden");
  dom.rankingView.classList.add("hidden");
  dom.storyTemplateView.classList.add("hidden");
  dom.adminPanel.classList.add("hidden");

  dom.moderatorTitle.textContent = normalized.title || "Quizt Event";
  dom.moderatorMeta.textContent = `Unveröffentlichter Entwurf · Gäste-Code ${normalized.code || "----"} · aktualisiert ${formatDate(normalized.lastDraftSavedAt || normalized.updatedAt)}`;
  showMessage(dom.moderatorStatus, "Nur für Moderation. Diese Punkte sind für Gäste noch nicht sichtbar.", "success");

  if (!ranking.length) {
    dom.moderatorContent.innerHTML = "<p class='muted'>Noch keine Teams vorhanden.</p>";
    return;
  }

  dom.moderatorContent.innerHTML = `
    <section class="moderator-winner-card">
      <span>Aktuell Platz 1</span>
      <strong>${escapeHtml(winner.name)}</strong>
      <p>${winner.total} Punkte · Entwurf</p>
    </section>

    <section class="moderator-ranking-card">
      <h3>Ranking zum Vorlesen</h3>
      <div class="moderator-ranking-list">
        ${ranking.map((team, index) => `
          <div class="moderator-rank-row">
            <span>${index + 1}</span>
            <strong>${escapeHtml(team.name)}</strong>
            <b>${team.total}</b>
          </div>
        `).join("")}
      </div>
    </section>

    <details class="moderator-rounds-card" open>
      <summary>Rundenpunkte</summary>
      <div class="moderator-table-wrap">
        <table class="moderator-table">
          <thead>
            <tr>
              <th>Team</th>
              ${rounds.map((round) => `<th>${escapeHtml(round.name)}</th>`).join("")}
              <th>Gesamt</th>
            </tr>
          </thead>
          <tbody>
            ${ranking.map((team, index) => `
              <tr>
                <th>${index + 1}. ${escapeHtml(team.name)}</th>
                ${rounds.map((round) => {
                  const score = scoreNumber(round?.scores?.[team.id]);
                  const isWinner = (roundWinnerMap.get(round.id) || new Set()).has(team.id);
                  return `<td class="${isWinner ? "winner" : ""}">${score}${isWinner ? " ★" : ""}</td>`;
                }).join("")}
                <td>${team.total}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </details>
  `;
}

function openModeratorView(moderatorCode) {
  const code = String(moderatorCode || "").trim().toUpperCase();
  if (!code) return;

  if (unsubscribeModeratorView) unsubscribeModeratorView();

  dom.publicView.classList.add("hidden");
  dom.rankingView.classList.add("hidden");
  dom.storyTemplateView.classList.add("hidden");
  dom.adminPanel.classList.add("hidden");
  dom.moderatorView.classList.remove("hidden");
  dom.moderatorTitle.textContent = "Moderator-Ansicht";
  dom.moderatorMeta.textContent = "Entwurf wird geladen ...";
  dom.moderatorContent.innerHTML = "";
  showMessage(dom.moderatorStatus, "Moderator-View wird geladen ...");

  unsubscribeModeratorView = onValue(ref(db, `${ROOT_PATH}/moderatorViews/${code}`), (snapshot) => {
    const event = snapshot.val();
    if (!event) {
      dom.moderatorMeta.textContent = "";
      dom.moderatorContent.innerHTML = "";
      showMessage(dom.moderatorStatus, "Für diesen Moderator-Link wurde kein Entwurf gefunden. Bitte im Admin-Bereich einmal „Entwurf speichern“ klicken.", "error");
      return;
    }

    renderModeratorDraft(event);
  }, (error) => {
    showMessage(dom.moderatorStatus, `Moderator-View konnte nicht geladen werden: ${error.message}`, "error");
  });
}


async function openByCode(code) {
  const normalized = normalizeCode(code);
  if (normalized.length !== 4) {
    showMessage(dom.publicMessage, "Bitte gib einen 4-stelligen Code ein.", "error");
    return;
  }

  showMessage(dom.publicMessage, "Ranking wird geladen ...");
  dom.passwordForm.classList.add("hidden");
  pendingPrivateCode = "";

  try {
    const codeSnap = await get(ref(db, `${ROOT_PATH}/codeIndex/${normalized}`));
    const indexValue = codeSnap.val();

    if (!indexValue) {
      showMessage(dom.publicMessage, "Für diesen Code wurde kein Event gefunden.", "error");
      return;
    }

    const isOldIndex = typeof indexValue === "string";
    const eventId = isOldIndex ? indexValue : indexValue.eventId;
    const isPrivate = !isOldIndex && indexValue.isPrivate;

    if (isPrivate) {
      pendingPrivateCode = normalized;
      dom.passwordForm.classList.remove("hidden");
      dom.eventPasswordInput.focus();
      showMessage(dom.publicMessage, "Dieses Event ist privat. Bitte gib das Event-Passwort ein.");
      return;
    }

    const eventSnap = await get(ref(db, `${ROOT_PATH}/publicEvents/${eventId}`));
    const event = eventSnap.val();

    if (!event) {
      showMessage(dom.publicMessage, "Dieses Event wurde noch nicht veröffentlicht.", "error");
      return;
    }

    history.replaceState(null, "", `?code=${normalized}`);
    renderPublicEvent(event);
    showMessage(dom.publicMessage, "");
  } catch (error) {
    showMessage(dom.publicMessage, `Fehler beim Laden: ${error.message}`, "error");
  }
}

async function openPrivateByPassword() {
  const code = pendingPrivateCode || normalizeCode(dom.eventCodeInput.value);
  const passwordKey = encodePassword(dom.eventPasswordInput.value);

  if (!code || !passwordKey) {
    showMessage(dom.publicMessage, "Bitte gib das Passwort ein.", "error");
    return;
  }

  showMessage(dom.publicMessage, "Privates Ranking wird geladen ...");

  try {
    const eventSnap = await get(ref(db, `${ROOT_PATH}/privateEvents/${code}/${passwordKey}`));
    const event = eventSnap.val();

    if (!event) {
      showMessage(dom.publicMessage, "Passwort falsch oder Event nicht veröffentlicht.", "error");
      return;
    }

    history.replaceState(null, "", `?code=${code}`);
    renderPublicEvent(event);
    showMessage(dom.publicMessage, "");
  } catch (error) {
    showMessage(dom.publicMessage, `Fehler beim Laden: ${error.message}`, "error");
  }
}

function resetPublicView() {
  dom.rankingView.classList.add("hidden");
  dom.publicView.classList.remove("hidden");
  dom.passwordForm.classList.add("hidden");
  pendingPrivateCode = "";
  history.replaceState(null, "", location.pathname);
  dom.eventCodeInput.focus();
}

function requireAdmin() {
  return currentUser && currentUser.uid === ADMIN_UID;
}

function makeNewEvent() {
  const id = uid();
  const teamA = uid();
  const teamB = uid();
  return {
    id,
    code: "",
    title: "Neues Quizt Event",
    note: "",
    isPrivate: false,
    privatePassword: "",
    finished: false,
    showPodium: false,
    moderatorCode: createModeratorCode(),
    teams: [
      { id: teamA, name: "Team 1", label: "" },
      { id: teamB, name: "Team 2", label: "" }
    ],
    rounds: [
      { id: uid(), name: "Runde 1", scores: { [teamA]: 0, [teamB]: 0 } },
      { id: uid(), name: "Runde 2", scores: { [teamA]: 0, [teamB]: 0 } },
      { id: uid(), name: "Runde 3", scores: { [teamA]: 0, [teamB]: 0 } }
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    publishedAt: null
  };
}

async function generateUniqueCode() {
  for (let i = 0; i < 80; i += 1) {
    const code = String(Math.floor(1000 + Math.random() * 9000));
    const snap = await get(ref(db, `${ROOT_PATH}/codeIndex/${code}`));
    if (!snap.exists()) return code;
  }
  throw new Error("Kein freier 4-stelliger Code gefunden. Bitte später erneut versuchen.");
}

function renderAdminEventList() {
  const events = Object.values(adminEvents || {}).map(normalizeEvent).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

  if (!events.length) {
    dom.adminEventList.innerHTML = "<p class='muted'>Noch keine Events vorhanden.</p>";
    return;
  }

  dom.adminEventList.innerHTML = events.map((event) => `
    <button class="event-item ${event.id === activeEventId ? "active" : ""}" type="button" data-event-id="${escapeHtml(event.id)}">
      <strong>${escapeHtml(event.title || "Quizt Event")}</strong>
      <small>Code ${escapeHtml(event.code || "----")} · ${event.isPrivate ? "Privat · " : ""}${event.finished ? "Beendet · " : ""}${formatDate(event.updatedAt)}</small>
    </button>
  `).join("");

  dom.adminEventList.querySelectorAll("[data-event-id]").forEach((button) => {
    button.addEventListener("click", () => selectAdminEvent(button.dataset.eventId));
  });
}

function selectAdminEvent(eventId) {
  const event = adminEvents[eventId];
  if (!event) return;
  activeEventId = eventId;
  activeDraft = normalizeEvent(structuredClone(event));
  renderAdminEventList();
  renderEditor();
  updateLeagueActiveEventHint();
}

function ensureScoresForTeams(event) {
  const teams = Array.isArray(event.teams) ? event.teams : [];
  if (!Array.isArray(event.rounds)) event.rounds = [];

  event.rounds.forEach((round) => {
    if (!round.scores) round.scores = {};
    teams.forEach((team) => {
      if (round.scores[team.id] === undefined) round.scores[team.id] = 0;
    });
    Object.keys(round.scores).forEach((teamId) => {
      if (!teams.some((team) => team.id === teamId)) delete round.scores[teamId];
    });
  });
}

function renderAdminPreview() {
  if (!activeDraft || !dom.adminPreview) return;

  const event = normalizeEvent(structuredClone(activeDraft));
  const ranking = calculateRanking(event);
  const rounds = Array.isArray(event.rounds) ? event.rounds : [];
  const roundWinnerMap = new Map(rounds.map((round) => [round.id, calculateRoundWinnerIds(round, event.teams || [])]));

  if (!ranking.length) {
    dom.adminPreview.innerHTML = "<p class='muted'>Noch keine Teams für die Vorschau vorhanden.</p>";
    return;
  }

  const winner = ranking[0];

  dom.adminPreview.innerHTML = `
    <div class="admin-preview-winner">
      <span>Aktuell Platz 1</span>
      <strong>${escapeHtml(winner.name)}</strong>
      <b>${winner.total} Punkte</b>
    </div>

    <div class="admin-preview-ranking">
      ${ranking.map((team, index) => `
        <div class="admin-preview-row">
          <span>${index + 1}.</span>
          <strong>${escapeHtml(team.name)}</strong>
          <b>${team.total}</b>
        </div>
      `).join("")}
    </div>

    <details class="admin-preview-rounds" open>
      <summary>Rundenpunkte prüfen</summary>
      <div class="admin-preview-table-wrap">
        <table class="admin-preview-table">
          <thead>
            <tr>
              <th>Team</th>
              ${rounds.map((round) => `<th>${escapeHtml(round.name)}</th>`).join("")}
              <th>Gesamt</th>
            </tr>
          </thead>
          <tbody>
            ${ranking.map((team, index) => `
              <tr>
                <th>${index + 1}. ${escapeHtml(team.name)}</th>
                ${rounds.map((round) => {
                  const score = scoreNumber(round?.scores?.[team.id]);
                  const isWinner = (roundWinnerMap.get(round.id) || new Set()).has(team.id);
                  return `<td class="${isWinner ? "winner" : ""}">${score}${isWinner ? " ★" : ""}</td>`;
                }).join("")}
                <td>${team.total}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </details>
  `;
}


function renderDraftStatus() {
  if (!activeDraft || !dom.draftStatusBox || !dom.draftStatusLabel || !dom.draftStatusMeta) return;

  const updatedAt = Number(activeDraft.updatedAt || 0);
  const publishedAt = Number(activeDraft.publishedAt || 0);

  dom.draftStatusBox.classList.remove("status-clean", "status-draft");

  if (updatedAt > publishedAt) {
    dom.draftStatusBox.classList.add("status-draft");
    dom.draftStatusLabel.textContent = "Unveröffentlichter Entwurf gespeichert";
    dom.draftStatusMeta.textContent = `Moderator sieht diesen Stand. Gäste sehen noch den alten Stand. Gespeichert: ${formatDate(updatedAt)}`;
    return;
  }

  dom.draftStatusBox.classList.add("status-clean");
  dom.draftStatusLabel.textContent = "Öffentlicher Stand aktuell";
  dom.draftStatusMeta.textContent = publishedAt ? `Zuletzt veröffentlicht: ${formatDate(publishedAt)}` : "Noch nicht veröffentlicht.";
}


function renderEditor() {
  if (!activeDraft) return;
  activeDraft = normalizeEvent(activeDraft);
  ensureScoresForTeams(activeDraft);
  dom.editorCard.classList.remove("hidden");
  dom.editorHeadline.textContent = activeDraft.title || "Event bearbeiten";
  if (!activeDraft.moderatorCode) activeDraft.moderatorCode = createModeratorCode();
  const moderatorUrl = new URL(`moderator.html?mod=${encodeURIComponent(activeDraft.moderatorCode)}`, location.href).toString();
  dom.editorCode.textContent = `Event-Code: ${activeDraft.code || "wird erzeugt"} · Moderator-Code: ${activeDraft.moderatorCode}`;
  if (dom.moderatorLinkInput) dom.moderatorLinkInput.value = moderatorUrl;
  renderDraftStatus();
  dom.quizTitleInput.value = activeDraft.title || "";
  dom.quizNoteInput.value = activeDraft.note || "";
  dom.eventFinishedInput.checked = Boolean(activeDraft.finished);
  dom.showPodiumInput.checked = Boolean(activeDraft.showPodium);
  dom.privateEventInput.checked = Boolean(activeDraft.isPrivate);
  dom.guestPasswordInput.value = activeDraft.privatePassword || "";
  dom.privatePasswordBox.classList.toggle("hidden", !activeDraft.isPrivate);

  renderTeamEditor();
  renderScoreBlocks();
  renderAdminPreview();
  updateLeagueActiveEventHint();
  showMessage(dom.editorMessage, "");
}

function renderTeamEditor() {
  const teams = activeDraft.teams || [];
  dom.teamsEditor.innerHTML = teams.map((team, index) => `
    <div class="team-row team-edit-row" data-team-id="${escapeHtml(team.id)}">
      <label>Team ${index + 1}
        <input type="text" data-team-name="${escapeHtml(team.id)}" value="${escapeHtml(team.name || "")}" />
      </label>
      <label>Sonderlabel
        <input type="text" data-team-label="${escapeHtml(team.id)}" value="${escapeHtml(team.label || "")}" placeholder="z. B. Lucky Loser" />
      </label>
      <button class="remove-btn" type="button" data-remove-team="${escapeHtml(team.id)}">Entfernen</button>
    </div>
  `).join("");

  dom.teamsEditor.querySelectorAll("[data-team-name]").forEach((input) => {
    input.addEventListener("input", () => {
      const team = activeDraft.teams.find((entry) => entry.id === input.dataset.teamName);
      if (team) team.name = input.value;
      renderAdminPreview();
    });
  });

  dom.teamsEditor.querySelectorAll("[data-team-label]").forEach((input) => {
    input.addEventListener("input", () => {
      const team = activeDraft.teams.find((entry) => entry.id === input.dataset.teamLabel);
      if (team) team.label = input.value;
      renderAdminPreview();
    });
  });

  dom.teamsEditor.querySelectorAll("[data-remove-team]").forEach((button) => {
    button.addEventListener("click", () => {
      if ((activeDraft.teams || []).length <= 1) {
        showMessage(dom.editorMessage, "Mindestens ein Team muss vorhanden bleiben.", "error");
        return;
      }
      const teamId = button.dataset.removeTeam;
      activeDraft.teams = activeDraft.teams.filter((team) => team.id !== teamId);
      ensureScoresForTeams(activeDraft);
      renderEditor();
    });
  });
}

function renderScoreBlocks() {
  const rounds = Array.isArray(activeDraft.rounds) ? activeDraft.rounds : [];
  const teams = Array.isArray(activeDraft.teams) ? activeDraft.teams : [];

  if (!rounds.length) {
    dom.roundsEditor.innerHTML = "<p class='muted'>Noch keine Runde eingetragen.</p>";
    return;
  }

  dom.roundsEditor.innerHTML = rounds.map((round, index) => `
    <div class="round-block" data-block-id="${escapeHtml(round.id)}">
      <div class="round-title-row">
        <label>Runde ${index + 1}
          <input type="text" data-block-name="${escapeHtml(round.id)}" value="${escapeHtml(round.name || `Runde ${index + 1}`)}" />
        </label>
        <button class="remove-btn" type="button" data-remove-block="${escapeHtml(round.id)}">Entfernen</button>
      </div>
      <div class="score-input-grid">
        ${teams.map((team) => `
          <label>${escapeHtml(team.name || "Team")}
            <input type="number" step="0.5" inputmode="decimal" data-score-block="${escapeHtml(round.id)}" data-score-team="${escapeHtml(team.id)}" value="${scoreNumber(round?.scores?.[team.id])}" />
          </label>
        `).join("")}
      </div>
    </div>
  `).join("");

  dom.roundsEditor.querySelectorAll("[data-block-name]").forEach((input) => {
    input.addEventListener("input", () => {
      const round = activeDraft.rounds.find((entry) => entry.id === input.dataset.blockName);
      if (round) round.name = input.value;
      renderAdminPreview();
    });
  });

  dom.roundsEditor.querySelectorAll("[data-score-block]").forEach((input) => {
    input.addEventListener("input", () => {
      const round = activeDraft.rounds.find((entry) => entry.id === input.dataset.scoreBlock);
      if (!round) return;
      if (!round.scores) round.scores = {};
      round.scores[input.dataset.scoreTeam] = scoreNumber(input.value);
      renderAdminPreview();
    });
  });

  dom.roundsEditor.querySelectorAll("[data-remove-block]").forEach((button) => {
    button.addEventListener("click", () => {
      activeDraft.rounds = activeDraft.rounds.filter((round) => round.id !== button.dataset.removeBlock);
      renderEditor();
    });
  });
}

function collectEditorValues() {
  if (!activeDraft) return null;
  activeDraft.title = dom.quizTitleInput.value.trim() || "Quizt Event";
  activeDraft.note = dom.quizNoteInput.value.trim();
  activeDraft.finished = dom.eventFinishedInput.checked;
  activeDraft.showPodium = dom.showPodiumInput.checked;
  activeDraft.isPrivate = dom.privateEventInput.checked;
  activeDraft.privatePassword = dom.guestPasswordInput.value.trim();
  activeDraft.updatedAt = Date.now();

  if (activeDraft.isPrivate && !activeDraft.privatePassword) {
    throw new Error("Für ein privates Event musst du ein Gast-Passwort eintragen.");
  }

  activeDraft.teams = (activeDraft.teams || []).map((team, index) => ({
    ...team,
    name: String(team.name || `Team ${index + 1}`).trim() || `Team ${index + 1}`,
    label: String(team.label || "").trim()
  }));

  activeDraft.rounds = (activeDraft.rounds || []).map((round, index) => ({
    ...round,
    name: String(round.name || `Runde ${index + 1}`).trim(),
    scores: round.scores || {}
  }));

  delete activeDraft.extras;
  ensureScoresForTeams(activeDraft);
  return activeDraft;
}

function createModeratorPayload(event) {
  const clean = normalizeEvent(structuredClone(event));
  return {
    ...clean,
    moderatorOnly: true,
    lastDraftSavedAt: Date.now()
  };
}

async function syncModeratorView(event) {
  if (!event?.moderatorCode) return;
  await set(ref(db, `${ROOT_PATH}/moderatorViews/${event.moderatorCode}`), createModeratorPayload(event));
}


async function saveDraft() {
  if (!requireAdmin()) {
    showMessage(dom.editorMessage, "Du bist nicht als Admin eingeloggt.", "error");
    return;
  }

  try {
    const event = collectEditorValues();
    if (!event) return;
    await set(ref(db, `${ROOT_PATH}/adminEvents/${event.id}`), event);
    await syncModeratorView(event);
    activeDraft = normalizeEvent(structuredClone(event));
    renderDraftStatus();
    showMessage(dom.editorMessage, "Entwurf gespeichert. Moderator-View ist aktualisiert. Gäste sehen davon noch nichts.", "success");
  } catch (error) {
    showMessage(dom.editorMessage, `Speichern fehlgeschlagen: ${error.message}`, "error");
  }
}

async function publishEvent() {
  if (!requireAdmin()) {
    showMessage(dom.editorMessage, "Du bist nicht als Admin eingeloggt.", "error");
    return;
  }

  try {
    const event = collectEditorValues();
    if (!event) return;
    event.publishedAt = Date.now();

    const indexPayload = {
      eventId: event.id,
      isPrivate: Boolean(event.isPrivate),
      title: event.title || "Quizt Event",
      updatedAt: event.updatedAt
    };

    await set(ref(db, `${ROOT_PATH}/adminEvents/${event.id}`), event);
    await syncModeratorView(event);
    await set(ref(db, `${ROOT_PATH}/codeIndex/${event.code}`), indexPayload);

    if (event.isPrivate) {
      const passwordKey = encodePassword(event.privatePassword);
      await remove(ref(db, `${ROOT_PATH}/publicEvents/${event.id}`));
      await set(ref(db, `${ROOT_PATH}/privateEvents/${event.code}/${passwordKey}`), event);
    } else {
      await remove(ref(db, `${ROOT_PATH}/privateEvents/${event.code}`));
      await set(ref(db, `${ROOT_PATH}/publicEvents/${event.id}`), event);
    }

    activeDraft = normalizeEvent(structuredClone(event));
    renderDraftStatus();
    showMessage(dom.editorMessage, "Änderungen veröffentlicht. Gäste sehen jetzt den neuen Stand.", "success");
  } catch (error) {
    showMessage(dom.editorMessage, `Veröffentlichen fehlgeschlagen: ${error.message}`, "error");
  }
}

async function createNewEvent() {
  if (!requireAdmin()) return;

  try {
    const event = makeNewEvent();
    event.code = await generateUniqueCode();
    event.updatedAt = Date.now();
    await set(ref(db, `${ROOT_PATH}/adminEvents/${event.id}`), event);
    await syncModeratorView(event);
    await set(ref(db, `${ROOT_PATH}/codeIndex/${event.code}`), {
      eventId: event.id,
      isPrivate: false,
      title: event.title,
      updatedAt: event.updatedAt
    });
    activeEventId = event.id;
    activeDraft = structuredClone(event);
    renderEditor();
    showMessage(dom.editorMessage, "Neues Event erstellt. Der Code ist direkt reserviert.", "success");
  } catch (error) {
    showMessage(dom.loginMessage, `Event konnte nicht erstellt werden: ${error.message}`, "error");
  }
}

function startAdminListener() {
  if (unsubscribeAdminEvents) unsubscribeAdminEvents();
  const adminRef = ref(db, `${ROOT_PATH}/adminEvents`);
  unsubscribeAdminEvents = onValue(adminRef, (snapshot) => {
    adminEvents = snapshot.val() || {};
    renderAdminEventList();

    if (activeEventId && adminEvents[activeEventId]) {
      activeDraft = normalizeEvent(structuredClone(adminEvents[activeEventId]));
      renderEditor();
    }
  });
}

function stopAdminListener() {
  if (unsubscribeAdminEvents) unsubscribeAdminEvents();
  unsubscribeAdminEvents = null;
  adminEvents = {};
  activeEventId = null;
  activeDraft = null;
  dom.adminEventList.innerHTML = "";
  dom.editorCard.classList.add("hidden");
}

function getLeaguePoints(place) {
  return LEAGUE_POINTS[place - 1] ?? 1;
}

function getQuarterKey(date = new Date()) {
  const month = date.getMonth();
  const quarter = Math.floor(month / 3) + 1;
  return `${date.getFullYear()}-Q${quarter}`;
}

function normalizeLeagueTeamName(name = "") {
  return String(name || "").trim().replace(/\s+/g, " ") || "Unbenanntes Team";
}

function normalizeLeagueTeamsValue(teams) {
  if (Array.isArray(teams)) return teams;
  if (teams && typeof teams === "object") return Object.values(teams);
  return [];
}

function buildLeagueEntryFromPending() {
  if (!pendingLeagueImport) return null;
  const now = Date.now();
  return {
    id: `event_${pendingLeagueImport.id}`,
    type: "event",
    eventId: pendingLeagueImport.id,
    code: pendingLeagueImport.code,
    title: pendingLeagueImport.title,
    quarter: pendingLeagueImport.quarter,
    createdAt: getExistingLeagueEntryForEvent(pendingLeagueImport.id)?.createdAt || now,
    updatedAt: now,
    teams: pendingLeagueImport.teams.map((team) => ({
      name: normalizeLeagueTeamName(team.name),
      place: team.place,
      quizPoints: team.score,
      points: scoreNumber(team.points)
    }))
  };
}

function getLeagueLocalStorageKey() {
  return `${ROOT_PATH}:leagueResultsFallback`;
}

function loadLocalLeagueResults() {
  try {
    const raw = localStorage.getItem(getLeagueLocalStorageKey());
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    console.warn("Lokale Liga-Daten konnten nicht gelesen werden", error);
    return {};
  }
}

function saveLocalLeagueResult(entry) {
  if (!entry?.id) return;
  try {
    const existing = loadLocalLeagueResults();
    existing[entry.id] = entry;
    localStorage.setItem(getLeagueLocalStorageKey(), JSON.stringify(existing));
  } catch (error) {
    console.warn("Lokale Liga-Daten konnten nicht gespeichert werden", error);
  }
}

function forceRenderLeagueTables(resultsObject, statusText = "") {
  const tables = calculateLeagueTables(resultsObject);
  renderLeagueList(dom.adminLeagueQuarter, tables.quarter, "Noch keine Punkte im aktuellen Quartal.");
  renderLeagueList(dom.adminLeagueAllTime, tables.allTime, "Noch keine All-Time-Punkte.");

  const results = Object.values(resultsObject || {}).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  if (dom.leagueResultsList) {
    dom.leagueResultsList.innerHTML = results.length ? results.slice(0, 20).map((entry) => `
      <article class="league-result-item">
        <div>
          <strong>${escapeHtml(entry.title || "Liga-Eintrag")}</strong>
          <small>${escapeHtml(entry.quarter || "")} · ${formatDate(entry.createdAt)} · ${entry.type === "manual" ? "Manuell" : entry.type === "preview" ? "Vorbereitet, noch nicht gespeichert" : "Event"}</small>
        </div>
        <div class="league-result-teams">
          ${normalizeLeagueTeamsValue(entry.teams).map((team) => `<span>${escapeHtml(team.name)}: ${scoreNumber(team.points)}</span>`).join("")}
        </div>
        ${entry.type === "preview" ? "<span class='tiny-status'>Noch speichern</span>" : `<button class="tiny-btn danger" type="button" data-delete-league-result="${escapeHtml(entry.id)}">Entfernen</button>`}
      </article>
    `).join("") : "<p class='muted'>Noch keine Liga-Einträge gespeichert.</p>";
  }

  if (dom.leagueDebugBox) {
    const count = results.length;
    dom.leagueDebugBox.textContent = statusText || `Liga-Status: v47 aktiv · ${count} Eintrag${count === 1 ? "" : "e"} sichtbar.`;
  }
}

function getRenderableLeagueResults() {
  const merged = { ...loadLocalLeagueResults(), ...(leagueResults || {}) };
  if (lastSavedLeagueEntry?.id) {
    merged[lastSavedLeagueEntry.id] = lastSavedLeagueEntry;
  }

  const pendingEntry = buildLeagueEntryFromPending();
  if (pendingEntry?.id && !merged[pendingEntry.id]) {
    merged[pendingEntry.id] = { ...pendingEntry, type: "preview" };
  }

  return merged;
}

function renderLastSavedLeagueEntry(entry) {
  if (!dom.leagueLastSaveBox) return;

  if (!entry) {
    dom.leagueLastSaveBox.classList.add("hidden");
    dom.leagueLastSaveBox.innerHTML = "";
    return;
  }

  dom.leagueLastSaveBox.classList.remove("hidden");
  dom.leagueLastSaveBox.innerHTML = `
    <strong>Zuletzt gespeicherter Liga-Eintrag</strong>
    <span>${escapeHtml(entry.title || "Quizt Event")} · ${escapeHtml(entry.quarter || "")}</span>
    <div>
      ${(entry.teams || []).map((team) => `<b>${escapeHtml(team.name)}: ${scoreNumber(team.points)}</b>`).join("")}
    </div>
  `;
}

function calculateLeagueTables(results = leagueResults) {
  const quarterKey = getQuarterKey();
  const allTime = new Map();
  const quarter = new Map();

  Object.values(results || {}).forEach((entry) => {
    if (!entry || entry.deleted) return;
    const teams = normalizeLeagueTeamsValue(entry.teams);
    teams.forEach((team) => {
      const name = normalizeLeagueTeamName(team.name);
      const points = scoreNumber(team.points);
      if (!name || !points) return;

      const currentAll = allTime.get(name) || { name, points: 0, events: 0 };
      currentAll.points += points;
      currentAll.events += 1;
      allTime.set(name, currentAll);

      if ((entry.quarter || "") === quarterKey) {
        const currentQuarter = quarter.get(name) || { name, points: 0, events: 0 };
        currentQuarter.points += points;
        currentQuarter.events += 1;
        quarter.set(name, currentQuarter);
      }
    });
  });

  const sortRows = (rows) => [...rows.values()].sort((a, b) => b.points - a.points || a.name.localeCompare(b.name, "de"));
  return { quarter: sortRows(quarter), allTime: sortRows(allTime), quarterKey };
}

function renderLeagueList(target, rows, emptyText = "Noch keine Liga-Punkte vorhanden.") {
  if (!target) return;
  if (!rows.length) {
    target.innerHTML = `<p class="muted">${emptyText}</p>`;
    return;
  }

  target.innerHTML = rows.slice(0, 12).map((row, index) => `
    <article class="league-row">
      <span>${index + 1}</span>
      <strong>${escapeHtml(row.name)}</strong>
      <b>${row.points}</b>
      <small>${row.events} ${row.events === 1 ? "Eintrag" : "Einträge"}</small>
    </article>
  `).join("");
}

function renderPublicLeague() {
  if (!dom.publicLeagueBox || !dom.publicLeagueList) return;
  const tables = calculateLeagueTables(getRenderableLeagueResults());

  const visible = Boolean(leagueSettings.enabled && leagueSettings.showOnHome);
  dom.publicLeagueBox.classList.toggle("hidden", !visible);
  if (!visible) return;

  const rows = publicLeagueMode === "allTime" ? tables.allTime : tables.quarter;
  renderLeagueList(dom.publicLeagueList, rows, "Noch keine Liga-Wertung veröffentlicht.");

  dom.publicLeagueQuarterBtn?.classList.toggle("active", publicLeagueMode === "quarter");
  dom.publicLeagueAllTimeBtn?.classList.toggle("active", publicLeagueMode === "allTime");
}

function renderAdminLeague() {
  if (dom.leagueEnabledInput) dom.leagueEnabledInput.checked = Boolean(leagueSettings.enabled);
  if (dom.leagueShowHomeInput) dom.leagueShowHomeInput.checked = Boolean(leagueSettings.showOnHome);

  const renderable = getRenderableLeagueResults();
  const savedResultsCount = Object.keys(leagueResults || {}).length;
  const localResultsCount = Object.keys(loadLocalLeagueResults()).length;
  const previewCount = pendingLeagueImport ? 1 : 0;

  forceRenderLeagueTables(
    renderable,
    `Liga-Status: v47 aktiv · Firebase: ${savedResultsCount} · lokal: ${localResultsCount}${previewCount ? " · 1 vorbereitete Übernahme sichtbar" : ""}.`
  );

  updateLeagueActiveEventHint();
  renderLastSavedLeagueEntry(lastSavedLeagueEntry);

  dom.leagueResultsList?.querySelectorAll("[data-delete-league-result]").forEach((button) => {
    button.addEventListener("click", async () => {
      if (!requireAdmin()) return;
      const id = button.dataset.deleteLeagueResult;
      await remove(ref(db, `${ROOT_PATH}/league/results/${id}`));
      const local = loadLocalLeagueResults();
      delete local[id];
      localStorage.setItem(getLeagueLocalStorageKey(), JSON.stringify(local));
      delete leagueResults[id];
      renderAdminLeague();
      showMessage(dom.leagueMessage, "Liga-Eintrag entfernt.", "success");
    });
  });
}


function startLeagueListener() {
  if (unsubscribeLeague) unsubscribeLeague();

  unsubscribeLeague = onValue(ref(db, `${ROOT_PATH}/league`), (snapshot) => {
    const value = snapshot.val() || {};
    leagueSettings = {
      enabled: Boolean(value.settings?.enabled),
      showOnHome: Boolean(value.settings?.showOnHome)
    };
    leagueResults = value.results || {};

    renderPublicLeague();
    renderAdminLeague();
  });
}

function stopLeagueListener() {
  if (unsubscribeLeague) unsubscribeLeague();
  unsubscribeLeague = null;
}

function getLeagueEventEntryId(eventId) {
  return `event_${eventId}`;
}

function getExistingLeagueEntryForEvent(eventId) {
  if (!eventId) return null;
  return leagueResults?.[getLeagueEventEntryId(eventId)] || null;
}

function updateLeagueActiveEventHint() {
  if (!dom.leagueActiveEventHint) return;

  if (!activeDraft) {
    dom.leagueActiveEventHint.textContent = "Kein Event geöffnet. Öffne links zuerst ein Event, das du übernehmen möchtest.";
    return;
  }

  const existing = getExistingLeagueEntryForEvent(activeDraft.id);
  const label = existing
    ? `Bereits übernommen am ${formatDate(existing.createdAt)}. Erneute Übernahme überschreibt den vorhandenen Liga-Eintrag.`
    : "Noch nicht ins Liga-Ranking übernommen.";

  dom.leagueActiveEventHint.textContent = `Geöffnetes Event: ${activeDraft.title || "Quizt Event"} · Code ${activeDraft.code || "----"} · ${label}`;

}


function prepareLeagueImport() {
  if (dom.editorMessage) showMessage(dom.editorMessage, "Liga-Übernahme wird vorbereitet ...");
  if (dom.leagueMessage) showMessage(dom.leagueMessage, "Liga-Übernahme wird vorbereitet ...");

  if (!activeDraft) {
    showMessage(dom.editorMessage, "Bitte links zuerst ein Event öffnen.", "error");
    showMessage(dom.leagueMessage, "Bitte links zuerst ein Event öffnen. Das geöffnete Event ist das Event, das übernommen wird.", "error");
    return;
  }

  const event = normalizeEvent(structuredClone(activeDraft));
  const ranking = calculateRanking(event);
  if (!ranking.length) {
    showMessage(dom.leagueMessage, "Dieses Event hat noch keine Teams.", "error");
    return;
  }

  const existing = getExistingLeagueEntryForEvent(event.id);

  pendingLeagueImport = {
    id: event.id,
    title: event.title || "Quizt Event",
    code: event.code || "",
    quarter: getQuarterKey(new Date(event.updatedAt || Date.now())),
    overwritesExisting: Boolean(existing),
    teams: ranking.map((team, index) => {
      const existingTeam = existing?.teams?.find((row) => row.place === index + 1 || normalizeLeagueTeamName(row.name) === normalizeLeagueTeamName(team.name));
      return {
        originalName: team.name,
        name: existingTeam?.name || team.name,
        place: index + 1,
        score: team.total,
        points: existingTeam ? scoreNumber(existingTeam.points) : getLeaguePoints(index + 1)
      };
    })
  };

  dom.leagueImportBox?.classList.remove("hidden");
  renderLeagueImportRows();
  renderAdminLeague();
  dom.leagueImportBox?.scrollIntoView({ behavior: "smooth", block: "center" });
  showMessage(dom.editorMessage, "Liga-Übernahme vorbereitet. Bitte prüfe die Liste direkt hier im Event.", "success");
  showMessage(
    dom.leagueMessage,
    existing
      ? "Dieses Event war bereits übernommen. Wenn du jetzt speicherst, wird der vorhandene Liga-Eintrag überschrieben."
      : "Bitte Teamnamen und Liga-Punkte prüfen.",
    existing ? "error" : "success"
  );
}

function runLeagueImportFromButton(event) {
  event?.preventDefault?.();
  event?.stopPropagation?.();

  try {
    prepareLeagueImport();
  } catch (error) {
    const message = `Liga-Übernahme konnte nicht vorbereitet werden: ${error.message}`;
    if (dom.editorMessage) showMessage(dom.editorMessage, message, "error");
    if (dom.leagueMessage) showMessage(dom.leagueMessage, message, "error");
    console.error(error);
  }
}

window.quiztPrepareLeagueImport = runLeagueImportFromButton;


function renderLeagueImportRows() {
  if (!pendingLeagueImport || !dom.leagueImportRows) return;

  const overwriteNotice = pendingLeagueImport.overwritesExisting
    ? `<div class="league-overwrite-warning">Dieses Event ist bereits im Liga-Ranking. Speichern überschreibt den vorhandenen Eintrag.</div>`
    : "";

  dom.leagueImportRows.innerHTML = overwriteNotice + pendingLeagueImport.teams.map((team, index) => `
    <div class="league-import-row">
      <span class="league-place">${team.place}.</span>
      <div>
        <strong>${escapeHtml(team.originalName)}</strong>
        <small>${team.score} Quizpunkte</small>
      </div>
      <label>Liga-Team
        <input type="text" value="${escapeHtml(team.name)}" data-league-team-name="${index}" />
      </label>
      <label>Punkte
        <input type="number" step="1" value="${team.points}" data-league-team-points="${index}" />
      </label>
    </div>
  `).join("");

  dom.leagueImportRows.querySelectorAll("[data-league-team-name]").forEach((input) => {
    input.addEventListener("input", () => {
      pendingLeagueImport.teams[Number(input.dataset.leagueTeamName)].name = input.value;
    });
  });

  dom.leagueImportRows.querySelectorAll("[data-league-team-points]").forEach((input) => {
    input.addEventListener("input", () => {
      pendingLeagueImport.teams[Number(input.dataset.leagueTeamPoints)].points = scoreNumber(input.value);
    });
  });
}

async function saveLeagueImport(event) {
  event?.preventDefault?.();
  event?.stopPropagation?.();

  if (!requireAdmin()) {
    showMessage(dom.editorMessage, "Du bist nicht als Admin eingeloggt. Liga-Eintrag wurde nicht gespeichert.", "error");
    showMessage(dom.leagueMessage, "Du bist nicht als Admin eingeloggt. Liga-Eintrag wurde nicht gespeichert.", "error");
    return;
  }

  if (!pendingLeagueImport) {
    showMessage(dom.editorMessage, "Keine vorbereitete Liga-Übernahme gefunden. Bitte zuerst „Dieses Event in Liga übernehmen“ klicken.", "error");
    showMessage(dom.leagueMessage, "Keine vorbereitete Liga-Übernahme gefunden.", "error");
    return;
  }

  const entry = buildLeagueEntryFromPending();

  if (!entry) {
    showMessage(dom.editorMessage, "Liga-Eintrag konnte nicht erzeugt werden.", "error");
    showMessage(dom.leagueMessage, "Liga-Eintrag konnte nicht erzeugt werden.", "error");
    return;
  }

  showMessage(dom.editorMessage, "Liga-Eintrag wird gespeichert ...");
  showMessage(dom.leagueMessage, "Liga-Eintrag wird gespeichert ...");

  try {
    await set(ref(db, `${ROOT_PATH}/league/results/${entry.id}`), entry);

    // Direkt lokal aktualisieren, damit die Tabelle sofort sichtbar wird,
    // auch wenn der Firebase-Listener einen Moment braucht.
    leagueResults = {
      ...(leagueResults || {}),
      [entry.id]: entry
    };
    lastSavedLeagueEntry = entry;
    saveLocalLeagueResult(entry);

    pendingLeagueImport = null;
    dom.leagueImportBox?.classList.add("hidden");
    forceRenderLeagueTables(getRenderableLeagueResults(), "Liga-Status: v47 aktiv · Eintrag wurde gerade gespeichert und direkt angezeigt.");
    renderAdminLeague();
    renderPublicLeague();
    updateLeagueActiveEventHint();

    dom.leagueLastSaveBox?.scrollIntoView({ behavior: "smooth", block: "center" });

    const visibleHint = leagueSettings.enabled && leagueSettings.showOnHome
      ? "Die öffentliche Liga-Anzeige ist aktiv."
      : "Hinweis: Für die öffentliche Anzeige müssen „Liga aktiv“ und „Auf Code-Seite anzeigen“ eingeschaltet und gespeichert sein.";

    showMessage(dom.editorMessage, `Liga-Eintrag gespeichert. ${visibleHint}`, "success");
    showMessage(dom.leagueMessage, `Liga-Eintrag gespeichert. ${visibleHint}`, "success");
  } catch (error) {
    const message = `Liga-Eintrag konnte nicht gespeichert werden: ${error.message}`;
    showMessage(dom.editorMessage, message, "error");
    showMessage(dom.leagueMessage, message, "error");
    console.error(error);
  }
}

window.quiztSaveLeagueImport = saveLeagueImport;


async function saveLeagueSettings() {
  if (!requireAdmin()) return;
  const settings = {
    enabled: Boolean(dom.leagueEnabledInput?.checked),
    showOnHome: Boolean(dom.leagueShowHomeInput?.checked),
    updatedAt: Date.now()
  };
  await set(ref(db, `${ROOT_PATH}/league/settings`), settings);
  showMessage(dom.leagueMessage, "Liga-Einstellungen gespeichert.", "success");
}

async function addManualLeagueEntry() {
  if (!requireAdmin()) return;

  const name = normalizeLeagueTeamName(dom.manualLeagueTeamInput?.value);
  const points = scoreNumber(dom.manualLeaguePointsInput?.value);
  const note = String(dom.manualLeagueNoteInput?.value || "").trim();

  if (!name || !points) {
    showMessage(dom.leagueMessage, "Bitte Teamname und Punkte eintragen.", "error");
    return;
  }

  const id = `manual_${uid()}`;
  const entry = {
    id,
    type: "manual",
    title: note || "Manuelle Korrektur",
    quarter: getQuarterKey(),
    createdAt: Date.now(),
    teams: [{ name, points }]
  };

  await set(ref(db, `${ROOT_PATH}/league/results/${id}`), entry);
  if (dom.manualLeagueTeamInput) dom.manualLeagueTeamInput.value = "";
  if (dom.manualLeaguePointsInput) dom.manualLeaguePointsInput.value = "";
  if (dom.manualLeagueNoteInput) dom.manualLeagueNoteInput.value = "";
  showMessage(dom.leagueMessage, "Korrektur wurde gebucht.", "success");
}


function bindEvents() {
  setupBrandLogo();

dom.adminToggleBtn.addEventListener("click", () => dom.adminPanel.classList.toggle("hidden"));
  dom.adminCloseBtn.addEventListener("click", () => dom.adminPanel.classList.add("hidden"));
  dom.backToCodeBtn.addEventListener("click", resetPublicView);

  dom.eventCodeInput.addEventListener("input", () => {
    dom.eventCodeInput.value = normalizeCode(dom.eventCodeInput.value);
  });

  dom.codeForm.addEventListener("submit", (event) => {
    event.preventDefault();
    openByCode(dom.eventCodeInput.value);
  });

  dom.passwordForm.addEventListener("submit", (event) => {
    event.preventDefault();
    openPrivateByPassword();
  });

  if (dom.roundSortSelect) {
    dom.roundSortSelect.addEventListener("change", () => {
      if (currentPublicEvent) renderBreakdown(currentPublicEvent);
    });
  }

  dom.loginBtn.addEventListener("click", async () => {
    showMessage(dom.loginMessage, "Login wird geprüft ...");
    try {
      await signInWithEmailAndPassword(auth, dom.adminEmail.value.trim(), dom.adminPassword.value);
      showMessage(dom.loginMessage, "");
    } catch (error) {
      showMessage(dom.loginMessage, `Login fehlgeschlagen: ${error.message}`, "error");
    }
  });

  dom.logoutBtn.addEventListener("click", () => signOut(auth));
  dom.newEventBtn.addEventListener("click", createNewEvent);

  dom.addTeamBtn.addEventListener("click", () => {
    if (!activeDraft) return;
    const teamId = uid();
    activeDraft.teams.push({ id: teamId, name: `Team ${activeDraft.teams.length + 1}`, label: "" });
    ensureScoresForTeams(activeDraft);
    renderEditor();
  });

  dom.addRoundBtn.addEventListener("click", () => {
    if (!activeDraft) return;
    activeDraft.rounds.push({ id: uid(), name: `Runde ${activeDraft.rounds.length + 1}`, scores: {} });
    ensureScoresForTeams(activeDraft);
    renderEditor();
  });

  dom.eventFinishedInput.addEventListener("change", () => {
    if (activeDraft) activeDraft.finished = dom.eventFinishedInput.checked;
  });

  dom.showPodiumInput.addEventListener("change", () => {
    if (activeDraft) activeDraft.showPodium = dom.showPodiumInput.checked;
  });

  dom.privateEventInput.addEventListener("change", () => {
    if (!activeDraft) return;
    activeDraft.isPrivate = dom.privateEventInput.checked;
    dom.privatePasswordBox.classList.toggle("hidden", !activeDraft.isPrivate);
  });

  dom.saveDraftBtn.addEventListener("click", saveDraft);
  dom.publishBtn.addEventListener("click", publishEvent);
  dom.copyModeratorLinkBtn?.addEventListener("click", async () => {
    if (!dom.moderatorLinkInput?.value) return;
    try {
      await navigator.clipboard.writeText(dom.moderatorLinkInput.value);
      showMessage(dom.editorMessage, "Moderator-Link kopiert.", "success");
    } catch (error) {
      dom.moderatorLinkInput.select();
      showMessage(dom.editorMessage, "Link konnte nicht automatisch kopiert werden. Bitte manuell kopieren.", "error");
    }
  });
  dom.openStoryTemplateBtn?.addEventListener("click", openStoryTemplateView);
  dom.backFromStoryBtn?.addEventListener("click", closeStoryTemplateView);

  dom.publicLeagueQuarterBtn?.addEventListener("click", () => {
    publicLeagueMode = "quarter";
    renderPublicLeague();
  });
  dom.publicLeagueAllTimeBtn?.addEventListener("click", () => {
    publicLeagueMode = "allTime";
    renderPublicLeague();
  });
  dom.saveLeagueSettingsBtn?.addEventListener("click", saveLeagueSettings);
  dom.prepareLeagueImportBtn?.addEventListener("click", runLeagueImportFromButton);
  dom.prepareLeagueImportEditorBtn?.addEventListener("click", runLeagueImportFromButton);
  dom.cancelLeagueImportBtn?.addEventListener("click", () => {
    pendingLeagueImport = null;
    dom.leagueImportBox?.classList.add("hidden");
    showMessage(dom.leagueMessage, "");
    showMessage(dom.editorMessage, "");
  });
  dom.saveLeagueImportBtn?.addEventListener("click", saveLeagueImport);
  dom.addManualLeagueEntryBtn?.addEventListener("click", addManualLeagueEntry);

  document.addEventListener("click", (event) => {
    const target = event.target?.closest?.("#prepareLeagueImportBtn, #prepareLeagueImportEditorBtn");
    if (!target) return;
    runLeagueImportFromButton(event);
  });

  document.addEventListener("click", (event) => {
    const target = event.target?.closest?.("#saveLeagueImportBtn");
    if (!target) return;
    saveLeagueImport(event);
  });
}

function initAuth() {
  onAuthStateChanged(auth, (user) => {
    currentUser = user;

    if (requireAdmin()) {
      dom.loginBox.classList.add("hidden");
      dom.adminWorkspace.classList.remove("hidden");
      startAdminListener();
      return;
    }

    if (user && user.uid !== ADMIN_UID) {
      showMessage(dom.loginMessage, "Dieser Login ist nicht als Admin freigegeben.", "error");
      signOut(auth);
    }

    dom.loginBox.classList.remove("hidden");
    dom.adminWorkspace.classList.add("hidden");
    stopAdminListener();
  });
}

function initFromUrl() {
  const params = new URLSearchParams(location.search);
  const modCode = String(params.get("mod") || "").trim();
  if (modCode) {
    openModeratorView(modCode);
    return;
  }

  const code = normalizeCode(params.get("code"));
  if (code.length === 4) {
    dom.eventCodeInput.value = code;
    openByCode(code);
  }
}

bindEvents();
initAuth();
startLeagueListener();
initFromUrl();
