/* =============================================================
   APP — boot, routing, HUD updates
   ============================================================= */

let currentRoute = "home";

function refreshHUD() {
  const lvl = state.level;
  const xpInLevel = state.xp - xpForLevel(lvl);
  const xpToNext = xpForNextLevel(lvl) - xpForLevel(lvl);
  const pct = Math.min(100, Math.round((xpInLevel / xpToNext) * 100));

  setText("hudLevel", lvl);
  setText("hudXP", state.xp);
  setText("hudStreak", state.streak);
  const fill = document.getElementById("hudXPFill");
  if (fill) fill.style.width = pct + "%";
  const tot = document.getElementById("totalProgress");
  if (tot) tot.style.width = totalProgress() + "%";

  // user badge
  const initial = (state.user.name || "?").trim().charAt(0).toUpperCase();
  setText("userInitial", initial);
  setText("userMenuName", state.user.name || "");
  setText("userMenuEmail", state.user.email || "");

  // active nav highlight
  $$("#topbarNav a").forEach((a) => {
    a.classList.toggle("active", a.dataset.route === currentRoute || currentRoute.startsWith(a.dataset.route + ":") || (currentRoute.startsWith("lesson:") && a.dataset.route?.startsWith("ep")));
  });
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

/* ----------------- Router ----------------- */
window.navigate = navigate;
function navigate(route) {
  currentRoute = route;
  const view = document.getElementById("view");
  view.innerHTML = renderRoute(route);
  wireRoute(route, view);
  window.scrollTo({ top: 0, behavior: "instant" });
  refreshHUD();
  history.replaceState(null, "", "#" + encodeURIComponent(route));
}

function renderRoute(route) {
  if (route === "home") return renderHome();
  if (route === "tools") return renderTools();
  if (route === "vault") return renderVault();
  if (route === "badges") return renderBadges();
  if (route.startsWith("ep")) return renderEpisode(route);
  if (route.startsWith("lesson:")) return renderLesson(route.slice(7));
  if (route.startsWith("tool:")) return renderTool(route.slice(5));
  return renderHome();
}

function wireRoute(route, view) {
  // generic data-route delegation
  $$("[data-route]", view).forEach((el) => {
    el.addEventListener("click", (e) => {
      const r = el.dataset.route;
      if (el.classList.contains("locked")) return;
      e.preventDefault();
      navigate(r);
    });
  });

  if (route === "vault") wireVault(view);
  if (route.startsWith("lesson:")) wireLesson(view, route.slice(7));
  if (route.startsWith("tool:")) wireTool(view, route.slice(5));
}

/* ----------------- Boot ----------------- */
function boot() {
  // Gate
  const gate = document.getElementById("gate");
  const app = document.getElementById("app");
  const form = document.getElementById("enrollForm");

  if (state.enrolled) {
    showApp();
  } else {
    gate.classList.remove("hidden");
    app.hidden = true;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const brokerage = document.getElementById("brokerage").value.trim();
    const market = document.getElementById("market").value.trim();
    const consent = document.getElementById("consent").checked;
    let bad = false;
    if (name.length < 2) {
      document.getElementById("fullName").setAttribute("aria-invalid", "true");
      bad = true;
    } else document.getElementById("fullName").removeAttribute("aria-invalid");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      document.getElementById("email").setAttribute("aria-invalid", "true");
      bad = true;
    } else document.getElementById("email").removeAttribute("aria-invalid");
    if (!consent) {
      toast("Please tick the consent box to start.", "error");
      bad = true;
    }
    if (bad) return;
    enrollUser({ name, email, brokerage, market });
    sfxLevelUp();
    setTimeout(() => showApp(), 200);
  });

  document.getElementById("resumeBtn").addEventListener("click", () => {
    if (state.enrolled) showApp();
    else toast("No saved progress on this device yet", "error");
  });

  // ----- App-level wiring -----
  $$("[data-route]", document.querySelector(".topbar")).forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      navigate(el.dataset.route);
    });
  });

  // user menu
  const userBtn = document.getElementById("userMenuBtn");
  const userMenu = document.getElementById("userMenu");
  userBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    userMenu.hidden = !userMenu.hidden;
  });
  document.addEventListener("click", (e) => {
    if (!userMenu.contains(e.target) && e.target !== userBtn) userMenu.hidden = true;
  });
  $$("#userMenu [data-route]").forEach((b) =>
    b.addEventListener("click", () => {
      userMenu.hidden = true;
      navigate(b.dataset.route);
    }),
  );

  document.getElementById("exportBtn").addEventListener("click", () => {
    exportProgress();
    toast("Progress downloaded", "success");
  });

  document.getElementById("resetBtn").addEventListener("click", () => {
    if (!confirm("This clears your XP, badges, and saved prompts on this device. Sure?")) return;
    resetAll();
    location.reload();
  });

  // modal
  document.getElementById("modalClose").addEventListener("click", closeModal);
  document.querySelectorAll("[data-close]").forEach((el) => el.addEventListener("click", closeModal));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal();
      const ov = document.getElementById("badgeOverlay");
      if (ov && !ov.hidden) ov.hidden = true;
    }
  });
}

function showApp() {
  const gate = document.getElementById("gate");
  const app = document.getElementById("app");
  gate.classList.add("hidden");
  app.hidden = false;
  // initial route from URL hash if any
  const hash = decodeURIComponent(location.hash.slice(1));
  navigate(hash || "home");
  refreshHUD();
}

document.addEventListener("DOMContentLoaded", boot);
