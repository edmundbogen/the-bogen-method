/* =============================================================
   CLOUD — fire-and-forget Supabase REST calls.
   Never blocks the UI. Failures are swallowed silently
   so the course always works even if Supabase is down.
   ============================================================= */

const CLOUD = (() => {
  const ok = typeof SUPABASE_URL === "string" && SUPABASE_URL.startsWith("http");
  const headers = () => ({
    "Content-Type": "application/json",
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    Prefer: "return=minimal",
  });

  async function post(path, body, extra = {}) {
    if (!ok) return;
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
        method: "POST",
        headers: { ...headers(), ...extra },
        body: JSON.stringify(body),
        keepalive: true,
      });
    } catch (e) {
      // silent — never break the lesson UX over telemetry
      console.debug("cloud post failed", e);
    }
  }

  /* Instant email alert to Edmund's inbox via Formspree.
     Browser-safe (public form ID), fire-and-forget. This is the
     lead-capture path — Supabase is the durable store, Formspree
     is the real-time "you've got a lead" ping + Notion-sync source. */
  async function notifyLead(user) {
    const endpoint = typeof FORMSPREE_ENDPOINT === "string" ? FORMSPREE_ENDPOINT : "";
    if (!endpoint.startsWith("http")) return;
    try {
      await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: `🎓 New Bogen Method enrollee: ${user.name || "Unknown"}`,
          source: "the-bogen-method",
          name: user.name || "",
          email: user.email || "",
          brokerage: user.brokerage || "",
          market: user.market || "",
          enrolled_at: new Date().toISOString(),
          referrer: (document.referrer || "direct").slice(0, 240),
        }),
        keepalive: true,
      });
    } catch (e) {
      console.debug("lead notify failed", e);
    }
  }

  async function upsert(path, body, onConflict) {
    if (!ok) return;
    try {
      const url = `${SUPABASE_URL}/rest/v1/${path}` + (onConflict ? `?on_conflict=${onConflict}` : "");
      await fetch(url, {
        method: "POST",
        headers: {
          ...headers(),
          Prefer: "resolution=merge-duplicates,return=minimal",
        },
        body: JSON.stringify(body),
        keepalive: true,
      });
    } catch (e) {
      console.debug("cloud upsert failed", e);
    }
  }

  return {
    /* Verified capture path: POST to the bogen.ai backend, which checks the
       honeypot + Turnstile token server-side before storing/emailing the lead.
       Returns true on success, false if verification failed (so the gate can
       ask the user to retry). Used when TURNSTILE_SITE_KEY is configured. */
    async captureViaEndpoint(user, token) {
      const ep = (typeof ENROLL_ENDPOINT === "string" && ENROLL_ENDPOINT) || "/api/method-enroll";
      try {
        const r = await fetch(ep, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            name: user.name, email: user.email, brokerage: user.brokerage,
            market: user.market, consent: true, turnstileToken: token,
            referrer: document.referrer || "",
          }),
        });
        if (!r.ok) return false;
        const data = await r.json().catch(() => ({}));
        return data.success !== false;
      } catch (e) {
        console.debug("verified capture failed", e);
        return false;
      }
    },

    /* Called once when student submits the gate (direct path / Turnstile off) */
    async logEnrollment(user) {
      // Plain insert — RLS allows INSERT for anon.
      // Duplicate email returns 409, which we ignore (returning student).
      await post(
        "enrollments",
        {
          email: user.email,
          full_name: user.name,
          brokerage: user.brokerage || null,
          market: user.market || null,
          consent: true,
          user_agent: navigator.userAgent.slice(0, 240),
          referrer: (document.referrer || "").slice(0, 240),
        },
      );
      await this.logEvent("enroll", { name: user.name, market: user.market, brokerage: user.brokerage });
      // Real-time lead alert to Edmund's inbox (+ feeds the Notion sync).
      await notifyLead(user);
    },

    /* Called whenever the student earns XP, finishes a lesson, etc */
    async pushProgress() {
      if (!state.user?.email) return;
      // Try a plain insert first. If that 409s (row exists), do an UPDATE.
      const body = {
        email: state.user.email,
        xp: state.xp,
        level: state.level,
        streak: state.streak,
        last_active_date: state.lastActiveDate,
        badges: state.badges,
        lessons_completed: Object.entries(state.lessons || {})
          .filter(([, v]) => v.completed)
          .map(([k]) => k),
        combo_max: state.comboMax || 0,
        boss_won: !!state.bossWon,
        certificate_earned: !!state.contract?.sig,
        updated_at: new Date().toISOString(),
      };
      if (!ok) return;
      // Try PATCH first to avoid the 409 console noise on returning students.
      try {
        const patchRes = await fetch(
          `${SUPABASE_URL}/rest/v1/progress?email=eq.${encodeURIComponent(state.user.email)}`,
          {
            method: "PATCH",
            headers: { ...headers(), Prefer: "return=headers-only" },
            body: JSON.stringify(body),
            keepalive: true,
          },
        );
        // PATCH returns 204 with no body. If 0 rows updated, fall through to INSERT.
        const updated = patchRes.headers.get("content-range") || "";
        const rowsPatched = /\/(\d+)$/.exec(updated)?.[1];
        if (rowsPatched && Number(rowsPatched) > 0) return;
        // No existing row — INSERT.
        await fetch(`${SUPABASE_URL}/rest/v1/progress`, {
          method: "POST",
          headers: headers(),
          body: JSON.stringify(body),
          keepalive: true,
        });
      } catch (e) {
        /* silent — telemetry must never break the lesson UX */
      }
    },

    /* Fire-and-forget event */
    async logEvent(kind, payload = {}) {
      if (!ok) return;
      await post("events", {
        email: state.user?.email || null,
        kind,
        payload,
      });
    },
  };
})();

/* Debounce: pushProgress can fire on every XP gain.
   We coalesce to once every ~1.5s so we don't spam Supabase. */
let _progressTimer = null;
function pushProgressDebounced() {
  clearTimeout(_progressTimer);
  _progressTimer = setTimeout(() => CLOUD.pushProgress(), 1500);
}
