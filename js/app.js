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

  // Cloudflare Turnstile — only loads/renders when a site key is configured.
  const turnstileOn = typeof TURNSTILE_SITE_KEY === "string" && TURNSTILE_SITE_KEY.length > 0;
  if (turnstileOn) {
    window.onloadTurnstile = () => {
      try {
        window.turnstile.render("#cf-turnstile-slot", { sitekey: TURNSTILE_SITE_KEY, theme: "dark" });
      } catch (e) { /* widget already rendered */ }
    };
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/api.js?onload=onloadTurnstile&render=explicit";
    s.async = true;
    s.defer = true;
    document.head.appendChild(s);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const brokerage = document.getElementById("brokerage").value.trim();
    const market = document.getElementById("market").value.trim();
    const consent = document.getElementById("consent").checked;

    // Honeypot — bots fill this hidden field; real users never see it.
    const hp = document.getElementById("company_url");
    if (hp && hp.value) { setTimeout(() => showApp(), 200); return; } // silently no-op

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

    if (turnstileOn) {
      const token = window.turnstile && window.turnstile.getResponse ? window.turnstile.getResponse() : "";
      if (!token) {
        toast("Please complete the verification box to start.", "error");
        return;
      }
      const btn = document.getElementById("enrollBtn");
      if (btn) btn.disabled = true;
      const ok = await CLOUD.captureViaEndpoint({ name, email, brokerage, market }, token);
      if (btn) btn.disabled = false;
      if (!ok) {
        toast("Verification failed — please try again.", "error");
        if (window.turnstile) window.turnstile.reset();
        return;
      }
      enrollUser({ name, email, brokerage, market }, { skipCloud: true }); // backend already stored it
    } else {
      enrollUser({ name, email, brokerage, market }); // direct capture (honeypot-protected)
    }

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
