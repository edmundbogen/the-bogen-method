/* =============================================================
   STANDALONE TOOL PAGES (accessible from /tools route)
   ============================================================= */

function renderHome() {
  const u = state.user;
  const lvl = state.level;
  const xpInLevel = state.xp - xpForLevel(lvl);
  const xpToNext = xpForNextLevel(lvl) - xpForLevel(lvl);
  const pct = Math.min(100, Math.round((xpInLevel / xpToNext) * 100));
  const completed = lessonsCompleted();
  const total = totalLessons();

  // Mission of the day — deterministic per day
  const day = Math.floor(Date.now() / 86400000);
  const mission = DAILY_MISSIONS[day % DAILY_MISSIONS.length];

  // Streak grid: last 7 days
  const today = new Date();
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86400000);
    const iso = d.toISOString().slice(0, 10);
    days.push({ iso, label: ["S", "M", "T", "W", "T", "F", "S"][d.getDay()], lit: state.streakDays.includes(iso) });
  }

  // Fake cohort leaderboard (deterministic on user name length)
  const seed = (state.user.name || "").length || 6;
  const cohort = [
    { name: "Edmund B.", xp: 4250 + (seed % 5) * 50 },
    { name: "Nicole H.", xp: 3120 },
    { name: "Samantha G.", xp: 2840 },
    { name: "Dina U.", xp: 2110 },
    { name: state.user.name?.split(" ")[0] || "You", xp: state.xp, me: true },
    { name: "Eytan B.", xp: 1980 },
    { name: "Avg cohort", xp: 1450 },
  ].sort((a, b) => b.xp - a.xp);

  return `
    <div class="fade-in">
      <section class="welcome">
        <div class="welcome-eyebrow">Welcome back, ${esc((u.name || "Realtor").split(" ")[0])}</div>
        <h1>Your Bogen Method dashboard.</h1>
        <p>You're <strong>${pct}%</strong> of the way to Level ${lvl + 1}. ${completed} of ${total} lessons complete. ${state.streak >= 2 ? `${state.streak}-day streak — keep it lit.` : "Start a streak today."}</p>
        <div class="welcome-stats">
          <div class="welcome-stat"><div class="welcome-stat-label">Level</div><div class="welcome-stat-value"><span class="accent">${lvl}</span></div></div>
          <div class="welcome-stat"><div class="welcome-stat-label">XP</div><div class="welcome-stat-value">${state.xp.toLocaleString()}</div></div>
          <div class="welcome-stat"><div class="welcome-stat-label">Streak</div><div class="welcome-stat-value">${state.streak}🔥</div></div>
          <div class="welcome-stat"><div class="welcome-stat-label">Badges</div><div class="welcome-stat-value">${state.badges.length}/${Object.keys(BADGES).length}</div></div>
          <div class="welcome-stat"><div class="welcome-stat-label">Vault</div><div class="welcome-stat-value">${state.prompts.length}</div></div>
        </div>
        <div class="welcome-cta">
          ${nextLessonCTA()}
          <button class="btn btn--ghost" data-route="tools" style="border-color:rgba(255,255,255,.2);color:#fff">Open the toolbox →</button>
        </div>
      </section>

      <div class="dash-grid">
        <div>
          <div class="section-head"><h2>The three episodes</h2><p>Earn XP. Unlock badges. Beat the boss.</p></div>
          <div class="episode-grid">
            ${EPISODES.map((ep) => {
              const p = episodeProgress(ep.id);
              const lessonsDone = ep.lessons.filter((l) => lessonState(l.id).completed).length;
              return `
                <div class="episode-card" data-route="${ep.id}">
                  <div class="episode-num">EPISODE ${ep.num}</div>
                  <h3 class="episode-title">${esc(ep.title)}</h3>
                  <p class="episode-desc">${esc(ep.summary)}</p>
                  <div class="episode-progress">
                    <div class="episode-progress-bar"><div class="episode-progress-fill" style="width:${p}%"></div></div>
                    <span>${lessonsDone}/${ep.lessons.length}</span>
                  </div>
                  <div class="episode-meta">
                    <span>${ep.lessons.length} lessons</span>
                    <span><strong>${ep.lessons.reduce((s, l) => s + l.xp, 0)}</strong> XP</span>
                  </div>
                </div>`;
            }).join("")}
          </div>
        </div>
        <div>
          <div class="panel">
            <div class="panel-eyebrow">Mission of the day</div>
            <h3>Today's mission</h3>
            <div class="mission">
              <div class="mission-icon">${mission.icon}</div>
              <div class="mission-text">
                <strong>${esc(mission.title)}</strong>
                <span>${esc(mission.desc)}</span>
              </div>
            </div>
          </div>
          <div class="panel panel--dark" style="margin-top:16px">
            <div class="panel-eyebrow">Your streak</div>
            <h3 style="color:#fff">${state.streak}-day streak ${state.streak ? "🔥" : ""}</h3>
            <p class="muted" style="color:rgba(255,255,255,.55);font-size:.85rem;margin:0">Complete one lesson per day to keep it lit. Streaks unlock the Combo King badge at 5×.</p>
            <ul class="streak-list">
              ${days.map((d) => `<li class="${d.lit ? "lit" : ""}">${d.label}</li>`).join("")}
            </ul>
          </div>
          <div class="panel panel--dark" style="margin-top:16px">
            <div class="panel-eyebrow">Cohort leaderboard</div>
            <h3 style="color:#fff">Where you stack up</h3>
            <div class="cohort">
              ${cohort
                .map((c) => {
                  const maxXP = cohort[0].xp || 1;
                  const w = Math.max(6, Math.round((c.xp / maxXP) * 100));
                  return `<div class="cohort-row ${c.me ? "me" : ""}">
                    <span class="name">${esc(c.name)}</span>
                    <span class="cohort-bar"><span class="cohort-bar-fill" style="width:${w}%"></span></span>
                    <span class="xp">${c.xp.toLocaleString()}</span>
                  </div>`;
                })
                .join("")}
            </div>
            <p class="muted" style="color:rgba(255,255,255,.4);font-size:.72rem;margin-top:10px">Fictional cohort for motivation. The leaderboard moves as you do.</p>
          </div>
        </div>
      </div>

      <div class="section-head"><h2>Latest badges</h2><p>${state.badges.length} of ${Object.keys(BADGES).length} unlocked</p></div>
      <div class="badge-grid">
        ${Object.entries(BADGES)
          .slice(0, 8)
          .map(([id, b]) => {
            const owned = state.badges.includes(id);
            return `<div class="badge ${b.color} ${owned ? "" : "locked"}">
              <div class="badge-icon">${b.icon}</div>
              <h4>${esc(b.name)}</h4>
              <p>${esc(b.desc)}</p>
            </div>`;
          })
          .join("")}
      </div>
      <div style="text-align:center;margin-top:18px"><button class="btn btn--ghost btn--sm" data-route="badges">See all badges →</button></div>
    </div>`;
}

function nextLessonCTA() {
  // find next incomplete lesson
  for (const ep of EPISODES) {
    for (const l of ep.lessons) {
      if (!lessonState(l.id).completed) {
        const verb = lessonsCompleted() === 0 ? "Start" : "Continue";
        return `<button class="btn btn--primary btn--lg" data-route="lesson:${l.id}">${verb} · Lesson ${l.id}: ${esc(l.title.split(" — ")[0].slice(0, 36))} →</button>`;
      }
    }
  }
  return `<button class="btn btn--primary btn--lg" data-route="lesson:3.4">View your certificate →</button>`;
}

function renderEpisode(epId) {
  const ep = EPISODES.find((e) => e.id === epId);
  if (!ep) return `<p>Episode not found.</p>`;
  const totalXP = ep.lessons.reduce((s, l) => s + l.xp, 0);
  const earnedXP = ep.lessons.filter((l) => lessonState(l.id).completed).reduce((s, l) => s + l.xp, 0);
  return `
    <div class="fade-in">
      <div class="ep-hero">
        <div class="ep-hero-eyebrow">Episode ${ep.num} · ${esc(ep.date)}</div>
        <h1>${esc(ep.title)}</h1>
        <p>${esc(ep.summary)}</p>
        <div style="display:flex;gap:14px;margin-top:18px;flex-wrap:wrap">
          <span class="pill">${ep.lessons.length} lessons</span>
          <span class="pill pill--accent">${earnedXP}/${totalXP} XP</span>
          <span class="pill">${ep.lessons.filter((l) => lessonState(l.id).completed).length}/${ep.lessons.length} complete</span>
        </div>
      </div>
      <div class="lesson-list">
        ${ep.lessons
          .map((l, i) => {
            const ls = lessonState(l.id);
            const unlocked = isLessonUnlocked(l.id);
            const cls = ls.completed ? "done" : unlocked ? "" : "locked";
            return `<div class="lesson-row ${cls}" ${unlocked ? `data-route="lesson:${l.id}"` : ""}>
              <div class="lesson-num">${ls.completed ? "✓" : !unlocked ? "🔒" : i + 1}</div>
              <div>
                <div class="lesson-title">${esc(l.title)}</div>
                <div class="lesson-meta">${esc(l.duration)} ${l.isBoss ? "· ⚔ Boss" : ""} ${l.badge ? `· Earns ${BADGES[l.badge].icon} ${esc(BADGES[l.badge].name)}` : ""}</div>
              </div>
              <div class="lesson-xp">+${l.xp} XP</div>
            </div>`;
          })
          .join("")}
      </div>
    </div>`;
}

function renderTools() {
  return `
    <div class="fade-in">
      <div class="section-head"><h2>The toolbox</h2><p>Stand-alone tools available anytime.</p></div>
      <div class="episode-grid">
        <div class="episode-card" data-route="tool:terminal">
          <div class="episode-num">SANDBOX</div>
          <h3 class="episode-title">Terminal simulator</h3>
          <p class="episode-desc">Practice <code>claude</code>, <code>/doctor</code>, slash commands without touching your real machine.</p>
          <div class="episode-meta"><span>safe sandbox</span></div>
        </div>
        <div class="episode-card" data-route="tool:ctfc">
          <div class="episode-num">FRAMEWORK</div>
          <h3 class="episode-title">C·T·F·C prompt builder</h3>
          <p class="episode-desc">Drag the four ingredients into place. Decoys included.</p>
          <div class="episode-meta"><span>drag &amp; drop</span></div>
        </div>
        <div class="episode-card" data-route="tool:forge">
          <div class="episode-num">FORGE</div>
          <h3 class="episode-title">Slash command forge</h3>
          <p class="episode-desc">Generate SKILL.md for /listing, /lead, /content.</p>
          <div class="episode-meta"><span>3 templates</span></div>
        </div>
        <div class="episode-card" data-route="tool:roi">
          <div class="episode-num">MATH</div>
          <h3 class="episode-title">ROI calculator</h3>
          <p class="episode-desc">Slide your hours and rate. See recovered GCI in real time.</p>
          <div class="episode-meta"><span>live calc</span></div>
        </div>
        <div class="episode-card" data-route="tool:trouble">
          <div class="episode-num">FIX</div>
          <h3 class="episode-title">Troubleshooter</h3>
          <p class="episode-desc">Pick your symptom, get the exact fix. Six bugs covered.</p>
          <div class="episode-meta"><span>decision tree</span></div>
        </div>
        <div class="episode-card" data-route="tool:claudemd">
          <div class="episode-num">MEMORY</div>
          <h3 class="episode-title">CLAUDE.md builder</h3>
          <p class="episode-desc">Build the file that gives Claude your business context.</p>
          <div class="episode-meta"><span>auto-fills</span></div>
        </div>
      </div>
    </div>`;
}

function renderTool(toolKey) {
  switch (toolKey) {
    case "terminal":
      return `<div class="fade-in"><div class="section-head"><h2>Terminal simulator</h2><p>Try real commands. Earn XP. Break nothing.</p></div>${renderTerminalSim()}</div>`;
    case "ctfc":
      return `<div class="fade-in"><div class="section-head"><h2>C·T·F·C prompt builder</h2><p>Drag the right chips into the right slots.</p></div>${renderCTFC()}</div>`;
    case "forge":
      return `<div class="fade-in"><div class="section-head"><h2>Slash command forge</h2><p>Pick a command. Customize. Export the SKILL.md.</p></div>
        ${["listing", "lead", "content"].map((k) => `<h3 style="margin-top:32px">/${k}</h3>${renderForge(k)}`).join("")}</div>`;
    case "roi":
      return `<div class="fade-in"><div class="section-head"><h2>ROI calculator</h2><p>Slide your numbers — see recovered GCI live.</p></div>${renderROI()}</div>`;
    case "trouble":
      return `<div class="fade-in"><div class="section-head"><h2>Troubleshooter</h2><p>Click your symptom. Get the exact fix.</p></div>${renderTroubleshooter()}</div>`;
    case "claudemd":
      return `<div class="fade-in"><div class="section-head"><h2>CLAUDE.md builder</h2><p>Generate your house rules in 60 seconds.</p></div>${renderClaudeMdBuilder()}</div>`;
  }
  return "";
}

function wireTool(root, toolKey) {
  switch (toolKey) {
    case "terminal":
      wireTerminalSim(root);
      break;
    case "ctfc":
      wireCTFC(root);
      break;
    case "forge":
      ["listing", "lead", "content"].forEach((k) => wireForge(root, k));
      break;
    case "roi":
      wireROI(root);
      break;
    case "trouble":
      wireTroubleshooter(root);
      break;
    case "claudemd":
      wireClaudeMdBuilder(root);
      break;
  }
}

function renderVault() {
  if (!state.prompts.length) {
    return `<div class="fade-in">
      <div class="section-head"><h2>Your Prompt Vault</h2><p>Nothing saved yet.</p></div>
      <div class="panel" style="text-align:center;padding:48px">
        <div style="font-size:3rem;margin-bottom:8px">📭</div>
        <h3>Save your first prompt</h3>
        <p class="muted">Every prompt in the course has a "Save to Vault" button. Use them. You'll thank yourself in 6 months.</p>
        <button class="btn btn--primary btn--sm" data-route="ep1">Browse Episode 1</button>
      </div>
    </div>`;
  }
  return `<div class="fade-in">
    <div class="section-head">
      <h2>Your Prompt Vault</h2>
      <p>${state.prompts.length} prompt${state.prompts.length === 1 ? "" : "s"} saved.</p>
    </div>
    <div style="margin-bottom:14px;display:flex;justify-content:flex-end">
      <button class="btn btn--ghost btn--sm" data-vaultexport>Export vault as Markdown</button>
    </div>
    <div>
      ${state.prompts
        .slice()
        .reverse()
        .map(
          (p) => `
        <div class="vault-row">
          <div>
            <h4>${esc(p.label)}</h4>
            <div class="vault-meta">${p.lessonId ? "From lesson " + esc(p.lessonId) : "Saved manually"} · ${new Date(p.savedAt).toLocaleDateString()}</div>
          </div>
          <div style="display:flex;gap:6px">
            <button class="btn btn--ghost btn--sm" data-vaultview="${p.id}">View</button>
            <button class="btn btn--primary btn--sm" data-vaultcopy="${p.id}">Copy</button>
          </div>
        </div>`,
        )
        .join("")}
    </div>
  </div>`;
}

function wireVault(root) {
  $$("[data-vaultcopy]", root).forEach((b) =>
    b.addEventListener("click", async () => {
      const p = state.prompts.find((x) => x.id === b.dataset.vaultcopy);
      if (!p) return;
      await navigator.clipboard.writeText(p.code);
      toast("Copied", "success");
    }),
  );
  $$("[data-vaultview]", root).forEach((b) =>
    b.addEventListener("click", () => {
      const p = state.prompts.find((x) => x.id === b.dataset.vaultview);
      if (!p) return;
      openModal(`<h2>${esc(p.label)}</h2><pre style="background:var(--navy-900);color:#cfdcec;padding:18px;border-radius:8px;font-family:var(--font-mono);font-size:.82rem;white-space:pre-wrap;max-height:60vh;overflow-y:auto">${esc(p.code)}</pre>`);
    }),
  );
  root.querySelector("[data-vaultexport]")?.addEventListener("click", () => {
    const lines = state.prompts.map((p) => `# ${p.label}\n\n${p.code}\n\n---\n`);
    const blob = new Blob([`# My Bogen Method Prompt Vault\n\n` + lines.join("\n")], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bogen-method-vault.md";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  });
}

function renderBadges() {
  return `<div class="fade-in">
    <div class="section-head">
      <h2>Badges &amp; achievements</h2>
      <p>${state.badges.length} of ${Object.keys(BADGES).length} unlocked · Highest combo: ${state.comboMax || 0}×</p>
    </div>
    <div class="badge-grid">
      ${Object.entries(BADGES)
        .map(([id, b]) => {
          const owned = state.badges.includes(id);
          return `<div class="badge ${b.color} ${owned ? "" : "locked"}">
            <div class="badge-icon">${b.icon}</div>
            <h4>${esc(b.name)}</h4>
            <p>${esc(b.desc)}</p>
            <div style="margin-top:8px;font-size:.72rem;color:var(--muted);font-weight:600">+${b.xp} XP</div>
          </div>`;
        })
        .join("")}
    </div>
  </div>`;
}

function openModal(html) {
  const m = document.getElementById("modal");
  document.getElementById("modalBody").innerHTML = html;
  m.hidden = false;
}
function closeModal() {
  document.getElementById("modal").hidden = true;
}
