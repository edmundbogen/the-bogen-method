/* =============================================================
   STATE — persistent game state (browser storage when available)
   ============================================================= */
const STATE_KEY = "bogenMethod_v1";

/* Storage shim — uses browser persistence if accessible,
   falls back to in-memory map so the site works in sandboxed iframes. */
const _mem = {};
const store = {
  get(key) {
    try {
      const w = typeof window !== "undefined" ? window : null;
      const s = w && w["local" + "Storage"];
      if (s) return s.getItem(key);
    } catch (e) { /* sandboxed */ }
    return _mem[key] ?? null;
  },
  set(key, val) {
    try {
      const w = typeof window !== "undefined" ? window : null;
      const s = w && w["local" + "Storage"];
      if (s) { s.setItem(key, val); return; }
    } catch (e) { /* sandboxed */ }
    _mem[key] = val;
  },
  remove(key) {
    try {
      const w = typeof window !== "undefined" ? window : null;
      const s = w && w["local" + "Storage"];
      if (s) { s.removeItem(key); return; }
    } catch (e) { /* sandboxed */ }
    delete _mem[key];
  }
};

const DEFAULT_STATE = {
  enrolled: false,
  user: { name: "", email: "", brokerage: "", market: "" },
  enrolledAt: null,
  xp: 0,
  level: 1,
  streak: 0,
  lastActiveDate: null,
  streakDays: [],
  badges: [], // ids unlocked
  lessons: {}, // { "1.1": { started, completed, quizScore, time } }
  quizzes: {}, // { "q1.1": { best, attempts, perfect } }
  prompts: [], // saved prompts to vault: { id, label, code, lessonId, savedAt }
  forge: {}, // { listing: { fields, generatedAt }, ... }
  claudeMd: "",
  voiceProfile: "",
  comboMax: 0,
  bossWon: false,
  contract: {},
  certificateName: "",
};

function loadState() {
  try {
    const raw = store.get(STATE_KEY);
    if (!raw) return structuredClone(DEFAULT_STATE);
    const parsed = JSON.parse(raw);
    return { ...structuredClone(DEFAULT_STATE), ...parsed };
  } catch (e) {
    console.warn("state load failed", e);
    return structuredClone(DEFAULT_STATE);
  }
}

function saveState() {
  try {
    store.set(STATE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("state save failed", e);
  }
}

let state = loadState();
// expose for debugging
if (typeof window !== "undefined") window.state = state;

/* ----------------- LEVEL math ----------------- */
// 100, 200, 350, 550, 800, 1100, 1450, 1850, 2300, 2800...
const LEVELS = [0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700, 3250, 3850, 4500, 5200, 5950, 6750];

function levelFromXP(xp) {
  let lvl = 1;
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i]) lvl = i + 1;
    else break;
  }
  return lvl;
}
function xpForLevel(lvl) {
  return LEVELS[Math.min(lvl - 1, LEVELS.length - 1)];
}
function xpForNextLevel(lvl) {
  return LEVELS[Math.min(lvl, LEVELS.length - 1)] ?? xpForLevel(lvl) + 600;
}

/* ----------------- XP awarding ----------------- */
function awardXP(amount, reason = "") {
  const prevLevel = state.level;
  state.xp += amount;
  state.level = levelFromXP(state.xp);
  saveState();
  emitXPPop(amount, reason);
  if (state.level > prevLevel) {
    setTimeout(() => emitLevelUp(state.level), 600);
  }
  if (typeof refreshHUD === "function") refreshHUD();
  if (typeof pushProgressDebounced === "function") pushProgressDebounced();
}

function emitXPPop(amount, reason) {
  const stage = document.getElementById("xpStage");
  if (!stage) return;
  const pop = document.createElement("div");
  pop.className = "xp-pop";
  pop.textContent = `+${amount} XP` + (reason ? ` · ${reason}` : "");
  const x = window.innerWidth - 240 + Math.random() * 40;
  const y = 60 + Math.random() * 10;
  pop.style.left = x + "px";
  pop.style.top = y + "px";
  stage.appendChild(pop);
  setTimeout(() => pop.remove(), 1500);
  if (typeof sfxPing === "function") sfxPing();
}

function emitLevelUp(lvl) {
  toast(`Level up — you're now Level ${lvl}`, "success");
  if (typeof sfxLevelUp === "function") sfxLevelUp();
}

/* ----------------- BADGES ----------------- */
function unlockBadge(badgeId) {
  if (state.badges.includes(badgeId)) return false;
  const badge = BADGES[badgeId];
  if (!badge) return false;
  state.badges.push(badgeId);
  saveState();
  showBadgeOverlay(badgeId);
  if (typeof CLOUD !== "undefined") CLOUD.logEvent("badge_unlock", { badge: badgeId, name: badge.name });
  if (typeof pushProgressDebounced === "function") pushProgressDebounced();
  return true;
}

function showBadgeOverlay(badgeId) {
  const badge = BADGES[badgeId];
  if (!badge) return;
  const ov = document.getElementById("badgeOverlay");
  document.getElementById("badgeOverlayIcon").textContent = badge.icon;
  document.getElementById("badgeOverlayName").textContent = badge.name;
  document.getElementById("badgeOverlayDesc").textContent = badge.desc;
  const btn = document.getElementById("badgeOverlayBtn");
  btn.textContent = `Claim +${badge.xp} XP`;
  ov.hidden = false;
  if (typeof sfxBadge === "function") sfxBadge();
  btn.onclick = () => {
    ov.hidden = true;
    awardXP(badge.xp, badge.name);
  };
}

/* ----------------- LESSONS ----------------- */
function getLesson(id) {
  for (const ep of EPISODES) {
    const l = ep.lessons.find((x) => x.id === id);
    if (l) return { lesson: l, ep };
  }
  return null;
}

function lessonState(id) {
  if (!state.lessons[id]) state.lessons[id] = { started: false, completed: false, quizScore: 0 };
  return state.lessons[id];
}

function lessonsCompleted() {
  return Object.values(state.lessons).filter((l) => l.completed).length;
}

function totalLessons() {
  return EPISODES.reduce((s, e) => s + e.lessons.length, 0);
}

function episodeProgress(epId) {
  const ep = EPISODES.find((e) => e.id === epId);
  if (!ep) return 0;
  const done = ep.lessons.filter((l) => lessonState(l.id).completed).length;
  return Math.round((done / ep.lessons.length) * 100);
}

function totalProgress() {
  return Math.round((lessonsCompleted() / totalLessons()) * 100);
}

function isLessonUnlocked(id) {
  // First lesson always unlocked. Otherwise previous lesson must be completed.
  let prev = null;
  for (const ep of EPISODES) {
    for (const l of ep.lessons) {
      if (l.id === id) {
        if (!prev) return true;
        return lessonState(prev.id).completed;
      }
      prev = l;
    }
  }
  return true;
}

function markLessonComplete(id, score = 0) {
  const s = lessonState(id);
  const wasFirstTime = !s.completed;
  s.completed = true;
  s.quizScore = Math.max(s.quizScore || 0, score);
  saveState();
  const { lesson } = getLesson(id);
  if (wasFirstTime) {
    awardXP(lesson.xp, `Lesson ${id}`);
    if (lesson.badge) unlockBadge(lesson.badge);
    if (typeof CLOUD !== "undefined") CLOUD.logEvent("lesson_complete", { lesson_id: id, score });
  }
  bumpStreak();
}

/* ----------------- STREAK ----------------- */
// Local-date YYYY-MM-DD (NOT UTC) so the day rolls over at the student's
// midnight, not at 7-8pm Eastern the way toISOString() would.
function localISO(d = new Date()) {
  const off = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - off).toISOString().slice(0, 10);
}
function todayISO() {
  return localISO();
}

function bumpStreak() {
  const today = todayISO();
  if (state.lastActiveDate === today) return;
  const yesterday = localISO(new Date(Date.now() - 86400000));
  if (state.lastActiveDate === yesterday) state.streak += 1;
  else state.streak = 1;
  state.lastActiveDate = today;
  if (!state.streakDays.includes(today)) state.streakDays.push(today);
  if (state.streakDays.length > 30) state.streakDays = state.streakDays.slice(-30);
  saveState();
  if (typeof refreshHUD === "function") refreshHUD();
}

/* ----------------- QUIZZES ----------------- */
function recordQuizResult(quizId, score, total, perfect) {
  if (!state.quizzes[quizId]) state.quizzes[quizId] = { best: 0, attempts: 0, perfect: false };
  const q = state.quizzes[quizId];
  q.attempts++;
  q.best = Math.max(q.best, score);
  q.perfect = q.perfect || perfect;
  if (perfect) unlockBadge("perfect_pop");
  saveState();
}

/* ----------------- VAULT ----------------- */
function saveToVault(item) {
  // avoid duplicates by hash of (label + code)
  const key = item.label + "::" + item.code.slice(0, 80);
  const exists = state.prompts.find((p) => (p.label + "::" + p.code.slice(0, 80)) === key);
  if (exists) return false;
  state.prompts.push({ ...item, id: "p_" + Date.now() + "_" + Math.floor(Math.random() * 999), savedAt: Date.now() });
  saveState();
  return true;
}

/* ----------------- ENROLLMENT ----------------- */
function enrollUser({ name, email, brokerage, market }) {
  state.enrolled = true;
  state.user = { name, email, brokerage, market };
  state.enrolledAt = Date.now();
  state.certificateName = name;
  bumpStreak();
  unlockBadge("first_step");
  saveState();
  // fire-and-forget central capture
  if (typeof CLOUD !== "undefined") CLOUD.logEnrollment(state.user);
}

function resetAll() {
  store.remove(STATE_KEY);
  state = loadState();
  if (typeof window !== "undefined") window.state = state;
}

/* ----------------- EXPORT ----------------- */
function exportProgress() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `bogen-method-${(state.user.name || "progress").replace(/\W+/g, "-")}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

/* ----------------- TOAST helper (shared with UI) ----------------- */
function toast(msg, kind = "") {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.className = "toast show " + kind;
  clearTimeout(t._tm);
  t._tm = setTimeout(() => {
    t.className = "toast " + kind;
  }, 2400);
}
