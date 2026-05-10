/* =============================================================
   LESSON RENDERER
   ============================================================= */

function renderLesson(lessonId) {
  const found = getLesson(lessonId);
  if (!found) return `<p>Lesson not found.</p>`;
  const { lesson, ep } = found;
  const idx = ep.lessons.findIndex((l) => l.id === lessonId);
  const prev = ep.lessons[idx - 1];
  const next = ep.lessons[idx + 1];
  const ls = lessonState(lessonId);

  const tocBlocks = lesson.blocks
    .filter((b) => b.type === "h" || b.type === "hero")
    .map((b, i) => ({ text: b.text || b.title, idx: i }));

  const blocksHTML = lesson.blocks.map((b, i) => renderBlock(b, lessonId, i)).join("");

  const sideHTML = `
    <aside class="lesson-side">
      <a class="lesson-side-back" href="#" data-route="${ep.id}">← Back to ${esc(ep.title)}</a>
      <div class="lesson-side-eyebrow">${esc(ep.title)}</div>
      <div class="lesson-side-num">Lesson ${lesson.id} · ${esc(lesson.duration)}</div>
      <h2>${esc(lesson.title)}</h2>
      <div style="margin:10px 0 18px"><span class="pill pill--accent">+${lesson.xp} XP</span>${lesson.badge ? `<span class="pill" style="margin-left:6px">${BADGES[lesson.badge].icon} ${esc(BADGES[lesson.badge].name)}</span>` : ""}</div>
      <ul class="lesson-toc" data-toc>
        ${tocBlocks
          .map(
            (t, i) =>
              `<li data-tocidx="${i}" ${i === 0 ? 'class="active"' : ""}>${esc((t.text || "").replace(/<[^>]+>/g, ""))}</li>`,
          )
          .join("")}
      </ul>
      <div style="display:flex;gap:8px;flex-direction:column">
        ${prev ? `<button class="btn btn--ghost btn--sm" data-route="lesson:${prev.id}">← Previous lesson</button>` : ""}
        ${next ? `<button class="btn btn--primary btn--sm" data-route="lesson:${next.id}" data-nextlock>Next lesson →</button>` : ""}
      </div>
    </aside>`;

  return `
    <div class="lesson-wrap fade-in">
      ${sideHTML}
      <div class="lesson-main">
        ${blocksHTML}
        ${renderLessonFooter(lesson, prev, next)}
      </div>
    </div>`;
}

function renderLessonFooter(lesson, prev, next) {
  const done = lessonState(lesson.id).completed;
  return `
    <div class="lesson-section" style="margin-top:48px;padding-top:32px;border-top:1px solid var(--line)">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">
        <div>
          <div class="eyebrow">${done ? "Lesson complete" : "Mark complete to unlock the next lesson"}</div>
          <p style="margin:4px 0 0;font-size:.92rem;color:var(--muted)">${done ? "Strong work. Keep the streak alive." : `+${lesson.xp} XP awaits.`}</p>
        </div>
        <div style="display:flex;gap:8px">
          ${prev ? `<button class="btn btn--ghost btn--sm" data-route="lesson:${prev.id}">← Previous</button>` : ""}
          ${!done ? `<button class="btn btn--primary" data-complete="${lesson.id}">Mark complete (+${lesson.xp} XP)</button>` : ""}
          ${next ? `<button class="btn btn--primary" data-route="lesson:${next.id}">${done ? "Next lesson" : "Next anyway"} →</button>` : `<button class="btn btn--primary" data-route="home">Back to dashboard →</button>`}
        </div>
      </div>
    </div>`;
}

function renderBlock(b, lessonId, idx) {
  switch (b.type) {
    case "hero":
      return `
        <div class="lesson-section" id="b${idx}">
          ${b.eyebrow ? `<div class="eyebrow" style="margin-bottom:6px">${esc(b.eyebrow)}</div>` : ""}
          <h1>${html(b.title)}</h1>
        </div>`;
    case "h":
      return `<h3 id="b${idx}" style="margin-top:36px">${html(b.text)}</h3>`;
    case "p":
      return `<p>${html(b.text)}</p>`;
    case "ul":
      return `<ul>${b.items.map((it) => `<li style="margin-bottom:6px">${html(it)}</li>`).join("")}</ul>`;
    case "ol":
      return `<ol>${b.items.map((it) => `<li style="margin-bottom:6px">${html(it)}</li>`).join("")}</ol>`;
    case "callout":
      return `<div class="callout ${b.tone === "warn" ? "callout--warn" : b.tone === "danger" ? "callout--danger" : b.tone === "success" ? "callout--success" : ""}">${b.title ? `<strong>${html(b.title)}</strong>` : ""}<p>${html(b.text)}</p></div>`;
    case "table":
      return `<div style="overflow-x:auto;margin:18px 0;border:1px solid var(--line);border-radius:var(--radius)">
        <table style="width:100%;border-collapse:collapse;font-size:.92rem">
          <thead><tr>${b.headers.map((h) => `<th style="text-align:left;padding:10px 14px;background:var(--paper-warm);font-weight:600;border-bottom:1px solid var(--line)">${html(h)}</th>`).join("")}</tr></thead>
          <tbody>${b.rows
            .map(
              (r) =>
                `<tr>${r.map((c) => `<td style="padding:10px 14px;border-bottom:1px solid var(--line);vertical-align:top">${html(c)}</td>`).join("")}</tr>`,
            )
            .join("")}</tbody>
        </table>
      </div>`;
    case "prompt":
      return renderPromptBlock(b.label, b.code, lessonId, idx);
    case "split":
      return `<div class="lesson-section" style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
        <div style="background:rgba(227,93,106,.05);border:1px solid rgba(227,93,106,.25);padding:18px;border-radius:var(--radius)"><div class="eyebrow" style="color:var(--red);margin-bottom:6px">${esc(b.left.label)}</div><p style="margin:0;font-family:var(--font-mono);font-size:.88rem">${html(b.left.text)}</p></div>
        <div style="background:rgba(46,194,126,.05);border:1px solid rgba(46,194,126,.25);padding:18px;border-radius:var(--radius)"><div class="eyebrow" style="color:var(--green);margin-bottom:6px">${esc(b.right.label)}</div><p style="margin:0;font-family:var(--font-mono);font-size:.88rem">${html(b.right.text)}</p></div>
      </div>`;
    case "termdemo": {
      const lines = b.lines
        .map((l) => {
          let cls = "term-out";
          if (l.kind === "prompt") cls = "term-prompt";
          if (l.kind === "cmd") cls = "term-cmd";
          if (l.kind === "claude") cls = "term-claude";
          if (l.kind === "good") cls = "term-good";
          if (l.kind === "err") cls = "term-err";
          return `<span class="terminal-line ${cls}">${l.kind === "prompt" ? esc(l.text) : esc(l.text)}</span>`;
        })
        .join("");
      return `<div class="terminal">
        <div class="terminal-head">
          <span class="terminal-dot"></span><span class="terminal-dot"></span><span class="terminal-dot"></span>
          <span class="terminal-title">claude · demo</span>
        </div>
        <div class="terminal-body">${lines}</div>
      </div>`;
    }
    case "terminalSim":
      return renderTerminalSim();
    case "quiz":
      return renderQuiz(b, lessonId);
    case "ctfc":
      return renderCTFC();
    case "claudeMdBuilder":
      return renderClaudeMdBuilder();
    case "forge":
      return renderForge(b.forgeId);
    case "roiCalc":
      return renderROI();
    case "troubleshooter":
      return renderTroubleshooter();
    case "boss":
      return renderBoss();
    case "contract":
      return renderContract();
    case "cert":
      return renderCertificate();
    default:
      return "";
  }
}

function wireLesson(root, lessonId) {
  const { lesson } = getLesson(lessonId);

  wirePromptBlocks(root, lessonId);

  lesson.blocks.forEach((b, idx) => {
    switch (b.type) {
      case "terminalSim":
        wireTerminalSim(root);
        break;
      case "ctfc":
        wireCTFC(root);
        break;
      case "claudeMdBuilder":
        wireClaudeMdBuilder(root);
        break;
      case "forge":
        wireForge(root, b.forgeId);
        break;
      case "roiCalc":
        wireROI(root);
        break;
      case "troubleshooter":
        wireTroubleshooter(root);
        break;
      case "boss":
        wireBoss(root, () => {
          markLessonComplete(lessonId);
          toast("Boss defeated. 👑 Listing Machine + Boss Slayer earned.", "success");
          setTimeout(() => navigate("ep3"), 1500);
        });
        break;
      case "contract":
        wireContract(root);
        break;
      case "cert":
        wireCertificate(root);
        break;
      case "quiz":
        wireQuiz(root, b, lessonId, (result) => {
          // pass — mark progress
          if (result.score / result.total >= 0.5) {
            markLessonComplete(lessonId, result.pct);
            toast(`Lesson complete · +${lesson.xp} XP`, "success");
            const next = findNextLesson(lessonId);
            if (next) setTimeout(() => navigate(`lesson:${next.id}`), 1200);
            else setTimeout(() => navigate("home"), 1200);
          } else {
            toast("You need at least half right to complete the lesson. Try again.", "error");
          }
        });
        break;
    }
  });

  // toc highlighting via intersection observer
  const tocEls = $$("[data-tocidx]", root);
  const headings = $$("h1, h3[id^='b']", root.querySelector(".lesson-main"));
  if (tocEls.length && headings.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = parseInt(entry.target.id.replace("b", ""), 10);
            tocEls.forEach((t) => t.classList.remove("active"));
            const match = tocEls.find((t) => parseInt(t.dataset.tocidx) === tocBlockIndex(idx, lesson));
            if (match) match.classList.add("active");
          }
        });
      },
      { rootMargin: "-100px 0px -60% 0px" },
    );
    headings.forEach((h) => io.observe(h));
  }

  // explicit "mark complete" button (in lesson footer)
  $$("[data-complete]", root).forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.complete;
      markLessonComplete(id);
      toast(`Lesson complete · +${lesson.xp} XP`, "success");
      const next = findNextLesson(id);
      if (next) navigate(`lesson:${next.id}`);
      else navigate("home");
    });
  });
}

function tocBlockIndex(blockIdx, lesson) {
  // map a hero/h block index back to its position in the toc array
  let pos = -1;
  for (let i = 0, t = 0; i <= blockIdx && i < lesson.blocks.length; i++) {
    const b = lesson.blocks[i];
    if (b.type === "h" || b.type === "hero") {
      if (i === blockIdx) return t;
      t++;
    }
  }
  return pos;
}

function findNextLesson(currentId) {
  let take = false;
  for (const ep of EPISODES) {
    for (const l of ep.lessons) {
      if (take) return l;
      if (l.id === currentId) take = true;
    }
  }
  return null;
}
