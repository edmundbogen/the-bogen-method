/* =============================================================
   COMPONENTS — reusable UI builders.
   Every render is pure HTML strings; events are wired in init().
   ============================================================= */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function esc(s) {
  return (s == null ? "" : String(s))
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/* HTML-safe but allows already-formatted HTML strings */
function html(s) {
  return s || "";
}

/* =============================================================
   PROMPT BLOCK — copy-to-clipboard + save-to-vault
   ============================================================= */
function renderPromptBlock(label, code, lessonId, idx = 0) {
  const id = `pb_${lessonId || "g"}_${idx}_${Math.random().toString(36).slice(2, 7)}`;
  return `
    <div class="prompt-block" id="${id}">
      <div class="prompt-block-head">
        <span class="prompt-block-label">${esc(label)}</span>
        <div class="prompt-block-actions">
          <button class="icon-btn" data-act="copy">Copy</button>
          <button class="icon-btn" data-act="save">Save to Vault</button>
        </div>
      </div>
      <pre>${esc(code)}</pre>
    </div>`;
}

function wirePromptBlocks(root, lessonId) {
  $$(".prompt-block", root).forEach((block) => {
    const code = block.querySelector("pre").textContent;
    const label = block.querySelector(".prompt-block-label").textContent;
    block.querySelector('[data-act="copy"]')?.addEventListener("click", async (e) => {
      try {
        await navigator.clipboard.writeText(code);
        e.target.textContent = "Copied ✓";
        e.target.classList.add("copied");
        setTimeout(() => {
          e.target.textContent = "Copy";
          e.target.classList.remove("copied");
        }, 1400);
        awardXP(5, "Prompt copied");
      } catch (err) {
        toast("Copy failed — your browser blocked it", "error");
      }
    });
    block.querySelector('[data-act="save"]')?.addEventListener("click", (e) => {
      const ok = saveToVault({ label, code, lessonId });
      if (ok) {
        toast("Saved to your Vault", "success");
        awardXP(10, "Saved to Vault");
        e.target.textContent = "Saved ✓";
        e.target.classList.add("copied");
      } else {
        toast("Already in your Vault");
      }
    });
  });
}

/* =============================================================
   TERMINAL SIMULATOR (typed-input, responds to commands)
   ============================================================= */
function renderTerminalSim() {
  return `
    <div class="terminal" data-termsim>
      <div class="terminal-head">
        <span class="terminal-dot"></span><span class="terminal-dot"></span><span class="terminal-dot"></span>
        <span class="terminal-title">claude · sandbox</span>
      </div>
      <div class="terminal-body" data-termout>
        <span class="terminal-line term-dim">Bogen Method sandbox · type a command and press Enter</span>
        <span class="terminal-line term-dim">Try: <span class="term-good">claude --version</span> · <span class="term-good">claude doctor</span> · <span class="term-good">claude</span> · <span class="term-good">/doctor</span> · <span class="term-good">help</span></span>
      </div>
      <div class="term-input-row">
        <span class="term-input-prompt">edmund@MacBook ~ %</span>
        <input class="term-input" type="text" placeholder="type a command…" spellcheck="false" autocapitalize="off" autocomplete="off" />
      </div>
      <div class="term-hint">Hint — start with <code>claude --version</code> to confirm install is working.</div>
    </div>`;
}

const TERM_RESPONSES = {
  "claude --version": [
    { kind: "out", text: "claude-code 2.1.4" },
    { kind: "good", text: "✓ install OK — you've earned the Terminal Tamer badge" },
  ],
  "claude doctor": [
    { kind: "out", text: "Running diagnostics…" },
    { kind: "good", text: "✓ binary at /Users/edmund/.local/bin/claude" },
    { kind: "good", text: "✓ PATH includes ~/.local/bin" },
    { kind: "good", text: "✓ account: Pro · authenticated" },
    { kind: "good", text: "✓ MCP servers: 0 (no warnings)" },
    { kind: "out", text: "No issues found." },
  ],
  claude: [
    { kind: "out", text: "Launching Claude Code…" },
    { kind: "claude", text: "Welcome back, Edmund. Type a question or use a / command. (try /doctor or /help)" },
  ],
  "/doctor": [
    { kind: "claude", text: "Running /doctor inside session…" },
    { kind: "good", text: "✓ context use: 12% of 200K" },
    { kind: "good", text: "✓ skills loaded: listing, lead, content" },
    { kind: "good", text: "✓ CLAUDE.md detected at project root" },
    { kind: "good", text: "✓ no MCP errors" },
  ],
  "/help": [
    { kind: "claude", text: "Available slash commands: /listing /lead /content /doctor /skills /mcp /clear /exit" },
    { kind: "out", text: "Type a command preceded by /, e.g. /listing 2257 Egret Cove, 3BR/3BA, $725,000" },
  ],
  help: [
    { kind: "out", text: "Sandbox commands: claude --version · claude doctor · claude · /doctor · /help · /listing · /clear · exit" },
  ],
  exit: [{ kind: "out", text: "Goodbye." }],
  "/exit": [{ kind: "out", text: "Goodbye." }],
  "/clear": [{ kind: "out", text: "(cleared)" }],
};

function wireTerminalSim(root) {
  const term = root.querySelector("[data-termsim]");
  if (!term) return;
  const out = term.querySelector("[data-termout]");
  const input = term.querySelector(".term-input");
  let cmdCount = 0;

  const writeLine = (kind, text, delay = 0) =>
    new Promise((resolve) => {
      setTimeout(() => {
        const line = document.createElement("span");
        line.className = `terminal-line term-${kind}`;
        line.textContent = text;
        if (kind === "out") line.classList.add("term-out");
        if (kind === "claude") line.classList.add("term-claude");
        if (kind === "good") line.classList.add("term-good");
        if (kind === "err") line.classList.add("term-err");
        out.appendChild(line);
        out.scrollTop = out.scrollHeight;
        resolve();
      }, delay);
    });

  const runCommand = async (raw) => {
    const cmd = raw.trim();
    if (!cmd) return;
    await writeLine("dim", `edmund@MacBook ~ % ${cmd}`);
    sfxType();
    cmdCount++;

    if (cmd === "/listing") {
      await writeLine("claude", "Reading voice-profile.md…", 250);
      await writeLine("claude", "Generating MLS · Public · Instagram · Facebook · SMS · Email · 5 ad headlines…", 600);
      await writeLine("good", "✓ Marketing kit saved as 2257-egret-cove-marketing-kit.md", 700);
      awardXP(15, "Slash command run");
      if (cmdCount >= 3) unlockBadge("terminal_tamer");
      return;
    }

    if (cmd === "/clear") {
      out.innerHTML = "";
      return;
    }

    const resp = TERM_RESPONSES[cmd];
    if (resp) {
      for (let i = 0; i < resp.length; i++) {
        await writeLine(resp[i].kind, resp[i].text, 200 * (i + 1));
      }
      if (cmd === "claude --version" || cmd === "claude doctor" || cmd === "claude") {
        awardXP(8, "Terminal command");
      }
      if (cmdCount >= 3) unlockBadge("terminal_tamer");
      return;
    }

    await writeLine("err", `command not found: ${cmd}`, 200);
    await writeLine("dim", `Try: claude --version · claude doctor · claude · /help`, 400);
  };

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const v = input.value;
      input.value = "";
      runCommand(v);
    }
  });
  input.addEventListener("input", () => sfxType());
}

/* =============================================================
   QUIZ — multiple-choice with timer, combos, instant feedback
   ============================================================= */
function renderQuiz(quiz, lessonId) {
  return `
    <div class="quiz" data-quiz="${quiz.id}" data-lesson="${lessonId}">
      <div class="quiz-head">
        <div>
          <div class="quiz-eyebrow">${esc(quiz.title || "Knowledge check")}</div>
          <div class="quiz-progress" data-progress>Question 1 / ${quiz.questions.length}</div>
        </div>
        <div class="quiz-timer" data-timer>
          <span class="muted" style="font-size:.78rem">15s</span>
          <div class="quiz-timer-bar"><div class="quiz-timer-fill" data-timerfill></div></div>
        </div>
      </div>
      <div data-quizbody></div>
    </div>`;
}

function wireQuiz(root, quiz, lessonId, onComplete) {
  const wrap = root.querySelector(`[data-quiz="${quiz.id}"]`);
  if (!wrap) return;
  const body = wrap.querySelector("[data-quizbody]");
  const progress = wrap.querySelector("[data-progress]");
  const timerFill = wrap.querySelector("[data-timerfill]");
  let idx = 0;
  let score = 0;
  let wrongs = 0;
  let combo = 0;
  let timer = null;
  const TIME_MS = 18000;

  function renderQuestion() {
    const q = quiz.questions[idx];
    progress.innerHTML =
      `Question ${idx + 1} / ${quiz.questions.length}` +
      (combo >= 2 ? `<span class="quiz-combo">🔥 ${combo}× combo</span>` : "");
    body.innerHTML = `
      <div class="quiz-question">${html(q.q)}</div>
      <div class="quiz-options">
        ${q.options
          .map(
            (opt, i) => `
          <button class="quiz-option" data-opt="${i}">
            <span class="quiz-key">${String.fromCharCode(65 + i)}</span>
            <span>${html(opt)}</span>
          </button>`,
          )
          .join("")}
      </div>
      <div data-feedback></div>
      <div class="quiz-next" hidden data-next>
        <button class="btn btn--primary btn--sm" data-nextbtn>${idx === quiz.questions.length - 1 ? "Finish" : "Next question →"}</button>
      </div>
    `;

    timerFill.style.width = "100%";
    timerFill.classList.remove("warn", "danger");
    const t0 = performance.now();
    if (timer) clearInterval(timer);
    timer = setInterval(() => {
      const pct = Math.max(0, 1 - (performance.now() - t0) / TIME_MS);
      timerFill.style.width = pct * 100 + "%";
      if (pct < 0.45 && pct >= 0.2) timerFill.classList.add("warn");
      if (pct < 0.2) {
        timerFill.classList.remove("warn");
        timerFill.classList.add("danger");
      }
      if (pct <= 0) {
        clearInterval(timer);
        if (!wrap.querySelector(".quiz-option.correct, .quiz-option.wrong")) {
          // time out = wrong
          handleAnswer(-1, q);
        }
      }
    }, 100);

    $$(".quiz-option", body).forEach((btn) =>
      btn.addEventListener("click", () => handleAnswer(parseInt(btn.dataset.opt), q)),
    );
    body.querySelector("[data-nextbtn]")?.addEventListener("click", advance);
  }

  function handleAnswer(chosen, q) {
    clearInterval(timer);
    $$(".quiz-option", body).forEach((btn, i) => {
      btn.disabled = true;
      if (i === q.correct) btn.classList.add("correct");
      if (i === chosen && chosen !== q.correct) btn.classList.add("wrong");
    });

    const correct = chosen === q.correct;
    if (correct) {
      score++;
      combo++;
      state.comboMax = Math.max(state.comboMax || 0, combo);
      if (combo >= 5) unlockBadge("combo_king");
      sfxCombo(combo);
      sfxCorrect();
      awardXP(15 + Math.min(combo - 1, 4) * 5, combo > 1 ? `${combo}× combo` : "");
    } else {
      wrongs++;
      combo = 0;
      sfxWrong();
      body.classList.add("shake");
      setTimeout(() => body.classList.remove("shake"), 300);
    }
    const fb = body.querySelector("[data-feedback]");
    fb.innerHTML = `
      <div class="quiz-feedback ${correct ? "correct" : "wrong"}">
        <strong>${correct ? "Right" : chosen === -1 ? "Time's up" : "Not quite"}</strong>
        ${html(q.explain)}
      </div>`;
    body.querySelector("[data-next]").hidden = false;
  }

  function advance() {
    idx++;
    if (idx >= quiz.questions.length) {
      finish();
      return;
    }
    renderQuestion();
  }

  function finish() {
    const total = quiz.questions.length;
    const pct = Math.round((score / total) * 100);
    const stars = score === total ? 3 : score >= total - 1 ? 2 : score >= Math.ceil(total / 2) ? 1 : 0;
    const perfect = score === total;
    recordQuizResult(quiz.id, score, total, perfect);
    body.innerHTML = `
      <div class="quiz-result">
        <div class="quiz-result-score">${score} / ${total}</div>
        <div class="quiz-result-stars">
          ${[0, 1, 2].map((i) => `<span class="quiz-star ${i < stars ? "on" : ""}">★</span>`).join("")}
        </div>
        <p class="muted" style="margin-bottom:18px">${
          perfect ? "Perfect run. The Bogen Method approves." : score >= total - 1 ? "Strong. One off — review and move on." : "Worth a re-run."
        }</p>
        <button class="btn btn--ghost btn--sm" data-retry>Retry</button>
        <button class="btn btn--primary btn--sm" data-finishq>Continue →</button>
      </div>`;
    body.querySelector("[data-retry]").addEventListener("click", () => {
      idx = 0;
      score = 0;
      wrongs = 0;
      combo = 0;
      renderQuestion();
    });
    body.querySelector("[data-finishq]").addEventListener("click", () => {
      onComplete?.({ score, total, pct, perfect });
    });
  }

  renderQuestion();
}

/* =============================================================
   CTFC drag-and-drop builder (Lesson 1.3)
   ============================================================= */
function renderCTFC() {
  // shuffle chips for fun
  const chips = [...CTFC_CHIPS].sort(() => Math.random() - 0.5);
  return `
    <div class="ctfc" data-ctfc>
      <p class="muted" style="margin-bottom:12px">Drag the four right chips into the four slots in the right order. Decoys included — they don't belong anywhere.</p>
      <div class="ctfc-cols">
        <div class="ctfc-pool">
          <h4>Ingredient pool</h4>
          ${chips.map((c, i) => `<div class="ctfc-chip" draggable="true" data-kind="${c.kind}" data-i="${i}">${esc(c.text)}</div>`).join("")}
        </div>
        <div class="ctfc-slots">
          <h4>Your prompt</h4>
          ${CTFC_SLOTS.map(
            (k) => `
            <div class="ctfc-slot" data-slot="${k}">
              <span class="ctfc-slot-label">${esc(CTFC_SLOT_LABELS[k].split(" — ")[0])}</span>
              <span class="ctfc-slot-content muted">Drop ${k} here</span>
            </div>`,
          ).join("")}
        </div>
      </div>
      <div class="ctfc-result" data-ctfc-result><em>Your assembled prompt will appear here.</em></div>
      <div style="display:flex;gap:8px;margin-top:12px;justify-content:flex-end">
        <button class="btn btn--ghost btn--sm" data-ctfc-reset>Reset</button>
        <button class="btn btn--primary btn--sm" data-ctfc-check disabled>Check my prompt</button>
      </div>
    </div>`;
}

function wireCTFC(root) {
  const w = root.querySelector("[data-ctfc]");
  if (!w) return;
  const result = w.querySelector("[data-ctfc-result]");
  const checkBtn = w.querySelector("[data-ctfc-check]");
  let dragged = null;

  function refreshResult() {
    const placed = CTFC_SLOTS.map((k) => {
      const slot = w.querySelector(`.ctfc-slot[data-slot="${k}"]`);
      const chip = slot.querySelector(".ctfc-chip");
      return chip ? chip.textContent : null;
    });
    if (placed.every(Boolean)) {
      result.innerHTML = placed.map((p) => esc(p)).join(" ");
      checkBtn.disabled = false;
    } else {
      result.innerHTML = "<em>Fill all four slots to see your assembled prompt.</em>";
      checkBtn.disabled = true;
    }
  }

  function attachChipDrag(chip) {
    chip.addEventListener("dragstart", (e) => {
      dragged = chip;
      chip.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
    });
    chip.addEventListener("dragend", () => {
      dragged = null;
      chip.classList.remove("dragging");
    });
    chip.addEventListener("click", () => {
      // tap-to-place fallback for touch
      const targetKind = chip.dataset.kind;
      const slot = w.querySelector(`.ctfc-slot[data-slot="${targetKind === "decoy" ? "context" : targetKind}"]`);
      if (slot && !slot.querySelector(".ctfc-chip")) placeChip(chip, slot);
    });
  }

  function placeChip(chip, slot) {
    slot.querySelector(".ctfc-slot-content")?.remove();
    slot.appendChild(chip);
    slot.classList.add("filled");
    chip.style.cursor = "default";
    refreshResult();
  }

  $$(".ctfc-chip", w).forEach(attachChipDrag);

  $$(".ctfc-slot", w).forEach((slot) => {
    slot.addEventListener("dragover", (e) => {
      e.preventDefault();
      slot.classList.add("over");
    });
    slot.addEventListener("dragleave", () => slot.classList.remove("over"));
    slot.addEventListener("drop", (e) => {
      e.preventDefault();
      slot.classList.remove("over");
      if (!dragged) return;
      // remove from old slot if any
      const existingChip = slot.querySelector(".ctfc-chip");
      if (existingChip && existingChip !== dragged) {
        // return existing back to pool
        const pool = w.querySelector(".ctfc-pool");
        pool.appendChild(existingChip);
      }
      placeChip(dragged, slot);
    });
  });

  w.querySelector("[data-ctfc-reset]").addEventListener("click", () => {
    const pool = w.querySelector(".ctfc-pool");
    $$(".ctfc-chip", w).forEach((c) => pool.appendChild(c));
    $$(".ctfc-slot", w).forEach((s) => {
      s.classList.remove("filled");
      if (!s.querySelector(".ctfc-slot-content")) {
        const span = document.createElement("span");
        span.className = "ctfc-slot-content muted";
        span.textContent = `Drop ${s.dataset.slot} here`;
        s.appendChild(span);
      }
    });
    refreshResult();
  });

  w.querySelector("[data-ctfc-check]").addEventListener("click", () => {
    let allCorrect = true;
    let usedDecoy = false;
    $$(".ctfc-slot", w).forEach((slot) => {
      const expected = slot.dataset.slot;
      const chip = slot.querySelector(".ctfc-chip");
      if (!chip) return;
      const kind = chip.dataset.kind;
      if (kind === "decoy") usedDecoy = true;
      if (kind !== expected) allCorrect = false;
      chip.style.borderColor = kind === expected ? "var(--green)" : "var(--red)";
      chip.style.background = kind === expected ? "rgba(46,194,126,.08)" : "rgba(227,93,106,.08)";
    });
    if (allCorrect && !usedDecoy) {
      toast("Prompt assembled correctly", "success");
      awardXP(40, "C·T·F·C mastery");
      unlockBadge("prompt_architect");
      sfxCorrect();
    } else if (usedDecoy) {
      toast("One of those chips is a decoy — pull it out", "error");
      sfxWrong();
    } else {
      toast("Close — check the chip kinds", "error");
      sfxWrong();
    }
  });
}

/* =============================================================
   CLAUDE.md INTERACTIVE BUILDER
   ============================================================= */
function renderClaudeMdBuilder() {
  const u = state.user;
  return `
    <div class="forge" data-claudemd>
      <div class="forge-grid">
        <div>
          <div class="forge-field">
            <label>Your name & role</label>
            <input type="text" data-f="who" value="${esc(u.name || "Edmund Bogen")}, Realtor at ${esc(u.brokerage || "Douglas Elliman")}" />
          </div>
          <div class="forge-field">
            <label>Brand</label>
            <input type="text" data-f="brand" value="The Edmund Bogen Team" />
          </div>
          <div class="forge-field">
            <label>Market</label>
            <input type="text" data-f="market" value="${esc(u.market || "Boca Raton, FL — luxury waterfront + country club")}" />
          </div>
          <div class="forge-field">
            <label>Team members</label>
            <textarea data-f="team">Nicole Hudson · nicole@bogenhomes.com
Samantha Gornstein · samantha@bogenhomes.com
Dina Ulrich · dina@bogenhomes.com</textarea>
          </div>
          <div class="forge-field">
            <label>Voice rules</label>
            <textarea data-f="voice">Confident, calm, never salesy. Short sentences. No 'must-see' or 'spacious.' Always Fair Housing compliant. Always reference voice-profile.md if present.</textarea>
          </div>
          <div class="forge-field">
            <label>Guardrails</label>
            <textarea data-f="guardrails">- Use only facts I provide. Never invent square footage, views, or finishes.
- Florida MLS-compliant. FAR-BAR is our default contract.
- No legal advice. When in doubt, route to the attorney.</textarea>
          </div>
          <div style="display:flex;gap:8px;margin-top:14px">
            <button class="btn btn--primary btn--sm" data-cmdbuild>Build my CLAUDE.md</button>
            <button class="btn btn--ghost btn--sm" data-cmdcopy>Copy</button>
          </div>
        </div>
        <div>
          <label class="forge-field" style="display:block">
            <span style="display:block;font-size:.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--cyan);margin-bottom:6px">Generated CLAUDE.md</span>
          </label>
          <pre class="forge-preview" data-cmdpreview><em>Click "Build my CLAUDE.md" to generate.</em></pre>
        </div>
      </div>
    </div>`;
}

function wireClaudeMdBuilder(root) {
  const w = root.querySelector("[data-claudemd]");
  if (!w) return;
  const preview = w.querySelector("[data-cmdpreview]");

  function gather() {
    const obj = {};
    $$("[data-f]", w).forEach((el) => (obj[el.dataset.f] = el.value));
    return obj;
  }

  function build() {
    const f = gather();
    const md = `# CLAUDE.md — The Edmund Bogen Team

## Who I am
${f.who}

## Brand
${f.brand}

## Market
${f.market}

## Team
${f.team}

## Voice rules
${f.voice}

## Guardrails
${f.guardrails}

## Always
- Read \`voice-profile.md\` if it exists in this folder before producing public-facing copy.
- For every listing prompt, include a Fair Housing constraint.
- For every contract summary, end with "ask your attorney" if ambiguity exists.
- When uncertain, ask before guessing.

## Active inventory
- (refresh monthly — paste your active listings + active buyers here)
`;
    preview.textContent = md;
    state.claudeMd = md;
    saveState();
    awardXP(50, "CLAUDE.md built");
    unlockBadge("voice_cloner");
  }

  w.querySelector("[data-cmdbuild]").addEventListener("click", build);
  w.querySelector("[data-cmdcopy]").addEventListener("click", async () => {
    if (!state.claudeMd) build();
    await navigator.clipboard.writeText(state.claudeMd);
    toast("CLAUDE.md copied", "success");
  });

  if (state.claudeMd) preview.textContent = state.claudeMd;
}

/* =============================================================
   SLASH-COMMAND FORGE
   ============================================================= */
function renderForge(forgeId) {
  const cfg = FORGES[forgeId];
  if (!cfg) return "";
  const saved = state.forge[forgeId]?.fields || {};
  return `
    <div class="forge" data-forge="${forgeId}">
      <h4 style="margin-top:0">${esc(cfg.title)}</h4>
      <div class="forge-grid">
        <div>
          ${cfg.fields
            .map((f) => {
              const val = saved[f.id] ?? f.default ?? "";
              if (f.type === "textarea")
                return `<div class="forge-field"><label>${esc(f.label)}</label><textarea data-fld="${f.id}" placeholder="${esc(f.placeholder || "")}">${esc(val)}</textarea></div>`;
              return `<div class="forge-field"><label>${esc(f.label)}</label><input type="${f.type}" data-fld="${f.id}" value="${esc(val)}" placeholder="${esc(f.placeholder || "")}" /></div>`;
            })
            .join("")}
          <div class="forge-field">
            <label>Will produce</label>
            <ul style="margin:0;padding-left:18px;font-size:.88rem;color:var(--muted);line-height:1.55">
              ${cfg.outputs.map((o) => `<li>${esc(o)}</li>`).join("")}
            </ul>
          </div>
          <div style="display:flex;gap:8px">
            <button class="btn btn--primary btn--sm" data-buildforge>Forge SKILL.md</button>
            <button class="btn btn--ghost btn--sm" data-copyforge>Copy</button>
            <button class="btn btn--ghost btn--sm" data-saveforge>Save to Vault</button>
          </div>
        </div>
        <div>
          <label class="forge-field" style="display:block">
            <span style="display:block;font-size:.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--cyan);margin-bottom:6px">Generated SKILL.md</span>
          </label>
          <pre class="forge-preview" data-forgepreview><em>Click "Forge SKILL.md" to generate.</em></pre>
        </div>
      </div>
    </div>`;
}

function wireForge(root, forgeId) {
  const w = root.querySelector(`[data-forge="${forgeId}"]`);
  if (!w) return;
  const cfg = FORGES[forgeId];
  const preview = w.querySelector("[data-forgepreview]");

  function gather() {
    const obj = {};
    $$("[data-fld]", w).forEach((el) => {
      const v = el.value;
      obj[el.dataset.fld] = el.type === "number" ? parseInt(v || 0) : v;
    });
    return obj;
  }

  function build() {
    const f = gather();
    const md = cfg.template(f);
    preview.textContent = md;
    state.forge[forgeId] = { fields: f, generatedAt: Date.now() };
    saveState();
    awardXP(60, "SKILL.md forged");
    unlockBadge("slash_smith");
    return md;
  }

  w.querySelector("[data-buildforge]").addEventListener("click", build);
  w.querySelector("[data-copyforge]").addEventListener("click", async () => {
    const md = state.forge[forgeId]?.fields ? cfg.template(state.forge[forgeId].fields) : build();
    await navigator.clipboard.writeText(md);
    toast(`/${forgeId} SKILL.md copied`, "success");
  });
  w.querySelector("[data-saveforge]").addEventListener("click", () => {
    const md = state.forge[forgeId]?.fields ? cfg.template(state.forge[forgeId].fields) : build();
    saveToVault({
      label: `/${forgeId} · SKILL.md`,
      code: md,
      lessonId: `forge_${forgeId}`,
    });
    toast("Saved to Vault", "success");
  });

  if (state.forge[forgeId]?.fields) {
    preview.textContent = cfg.template(state.forge[forgeId].fields);
  }
}

/* =============================================================
   ROI CALCULATOR
   ============================================================= */
function renderROI() {
  return `
    <div class="forge" data-roi>
      <div class="roi">
        <div>
          <div class="roi-slider-row">
            <label>Hours saved per week <span class="val" data-out="hrs">10</span></label>
            <input type="range" min="0" max="40" value="10" data-in="hrs">
          </div>
          <div class="roi-slider-row">
            <label>Your hourly opportunity cost <span class="val">$<span data-out="rate">300</span></span></label>
            <input type="range" min="50" max="1000" step="25" value="300" data-in="rate">
          </div>
          <div class="roi-slider-row">
            <label>Months tracked <span class="val" data-out="months">12</span></label>
            <input type="range" min="1" max="36" value="12" data-in="months">
          </div>
          <div class="roi-slider-row">
            <label>Monthly tool cost <span class="val">$<span data-out="cost">200</span></span></label>
            <input type="range" min="0" max="5000" step="50" value="200" data-in="cost">
          </div>
          <p class="muted" style="font-size:.82rem">For a $25M-volume agent at 2.5% commission, hourly opportunity cost lands around <strong>$313</strong>. Slide it to your reality.</p>
        </div>
        <div class="roi-output">
          <div class="label">Recovered GCI</div>
          <div class="big" data-out="result">$0</div>
          <div class="sub" data-out="breakdown"></div>
          <div style="margin-top:16px">
            <button class="btn btn--primary btn--sm" data-roiclaim>Lock in my ROI</button>
          </div>
        </div>
      </div>
    </div>`;
}

function wireROI(root) {
  const w = root.querySelector("[data-roi]");
  if (!w) return;

  function recalc() {
    const hrs = parseInt(w.querySelector('[data-in="hrs"]').value);
    const rate = parseInt(w.querySelector('[data-in="rate"]').value);
    const months = parseInt(w.querySelector('[data-in="months"]').value);
    const cost = parseInt(w.querySelector('[data-in="cost"]').value);
    w.querySelector('[data-out="hrs"]').textContent = hrs;
    w.querySelector('[data-out="rate"]').textContent = rate;
    w.querySelector('[data-out="months"]').textContent = months;
    w.querySelector('[data-out="cost"]').textContent = cost;
    const weeks = (months / 12) * 52;
    const gross = hrs * rate * weeks;
    const totalCost = cost * months;
    const net = Math.max(0, gross - totalCost);
    w.querySelector('[data-out="result"]').textContent = "$" + net.toLocaleString("en-US", { maximumFractionDigits: 0 });
    w.querySelector('[data-out="breakdown"]').textContent =
      `${hrs}h × $${rate}/h × ${Math.round(weeks)} weeks − $${totalCost.toLocaleString()} tools`;
  }
  $$("[data-in]", w).forEach((el) => el.addEventListener("input", recalc));
  recalc();

  w.querySelector("[data-roiclaim]").addEventListener("click", () => {
    awardXP(50, "ROI locked in");
    unlockBadge("roi_realist");
    toast("ROI locked. Bring those numbers to your 30-day review.", "success");
  });
}

/* =============================================================
   TROUBLESHOOTER GAME
   ============================================================= */
function renderTroubleshooter() {
  return `
    <div class="tree" data-trouble>
      <div data-tnode="root"></div>
    </div>`;
}

function wireTroubleshooter(root) {
  const w = root.querySelector("[data-trouble]");
  if (!w) return;
  let fixed = new Set();

  function renderNode(key) {
    const target = w.querySelector("[data-tnode]");
    if (key === "root") {
      target.innerHTML = `
        <div class="tree-node">
          <div class="tree-question">${TROUBLE_TREE.root.question}</div>
          <div class="tree-options">
            ${TROUBLE_TREE.root.options.map((o) => `<button class="tree-option" data-go="${o.next}">${o.label}</button>`).join("")}
          </div>
        </div>`;
      $$(".tree-option", w).forEach((b) => b.addEventListener("click", () => renderNode(b.dataset.go)));
    } else {
      const node = TROUBLE_TREE.nodes[key];
      target.innerHTML = `
        <div class="tree-fix">
          <h4>${node.title}</h4>
          ${node.fix}
        </div>
        <div class="tree-back">
          <button class="btn btn--ghost btn--sm" data-back>← Try another symptom</button>
        </div>`;
      if (!fixed.has(key)) {
        fixed.add(key);
        awardXP(20, "Bug fixed");
        if (fixed.size >= 3) unlockBadge("troubleshooter");
      }
      w.querySelector("[data-back]").addEventListener("click", () => renderNode("root"));
    }
  }
  renderNode("root");
}

/* =============================================================
   BOSS MISSION (Lesson 2.4)
   ============================================================= */
function renderBoss() {
  return `
    <div class="mission-screen" data-boss>
      <p>${esc(BOSS.scenario)}</p>
      <ul class="mission-objectives" data-bosslist>
        ${BOSS.steps
          .map(
            (s, i) => `
          <li data-step="${s.id}">
            <span class="obj-check">${i + 1}</span>
            <div style="flex:1">
              <strong>${esc(s.label)}</strong>
              <div data-stepui style="margin-top:8px"></div>
            </div>
          </li>`,
          )
          .join("")}
      </ul>
      <div style="text-align:center;margin-top:24px">
        <button class="btn btn--primary btn--lg" data-bosssubmit disabled>Submit Boss Mission</button>
      </div>
    </div>`;
}

function wireBoss(root, onWin) {
  const w = root.querySelector("[data-boss]");
  if (!w) return;
  const steps = {};
  const submitBtn = w.querySelector("[data-bosssubmit]");

  BOSS.steps.forEach((s) => {
    const li = w.querySelector(`[data-step="${s.id}"]`);
    const stepUI = li.querySelector("[data-stepui]");
    if (s.kind === "checkbox") {
      stepUI.innerHTML = `<label style="display:flex;gap:8px;align-items:center;font-size:.88rem;color:rgba(255,255,255,.7)"><input type="checkbox" data-cb /> I've run this step in my own setup</label>`;
      stepUI.querySelector("[data-cb]").addEventListener("change", (e) => {
        steps[s.id] = e.target.checked;
        update();
      });
    } else if (s.kind === "input") {
      stepUI.innerHTML = `<input type="text" placeholder="${esc(s.placeholder)}" style="width:100%;padding:8px 10px;border-radius:6px;border:1px solid rgba(255,255,255,.15);background:rgba(0,0,0,.25);color:#fff;font-size:.88rem">`;
      const inp = stepUI.querySelector("input");
      inp.addEventListener("input", () => {
        steps[s.id] = inp.value.trim().length >= 4;
        update();
      });
    } else if (s.kind === "mcq") {
      stepUI.innerHTML = `
        <div style="font-size:.88rem;color:rgba(255,255,255,.78);margin-bottom:8px">${esc(s.question)}</div>
        <div style="display:grid;gap:6px">
          ${s.options
            .map(
              (o, i) =>
                `<button class="btn btn--ghost btn--sm" data-mcq="${i}" style="text-align:left;background:rgba(255,255,255,.04);color:#fff;border-color:rgba(255,255,255,.12);justify-content:flex-start">${esc(o)}</button>`,
            )
            .join("")}
        </div>
        <div data-mcqfb></div>`;
      $$("[data-mcq]", stepUI).forEach((btn) => {
        btn.addEventListener("click", () => {
          const chosen = parseInt(btn.dataset.mcq);
          const correct = chosen === s.correct;
          $$("[data-mcq]", stepUI).forEach((b, i) => {
            b.disabled = true;
            if (i === s.correct) b.style.borderColor = "var(--green)";
            if (i === chosen && !correct) b.style.borderColor = "var(--red)";
          });
          stepUI.querySelector("[data-mcqfb]").innerHTML =
            `<div style="margin-top:8px;font-size:.85rem;color:${correct ? "var(--green)" : "var(--red)"}">${html(s.explain)}</div>`;
          steps[s.id] = correct;
          update();
          if (correct) sfxCorrect();
          else sfxWrong();
        });
      });
    }
  });

  function update() {
    BOSS.steps.forEach((s) => {
      const li = w.querySelector(`[data-step="${s.id}"]`);
      if (steps[s.id]) li.classList.add("done");
      else li.classList.remove("done");
    });
    const done = Object.values(steps).filter(Boolean).length;
    submitBtn.disabled = done < BOSS.steps.length;
    submitBtn.textContent = done < BOSS.steps.length ? `Submit Boss Mission (${done}/${BOSS.steps.length})` : "Submit Boss Mission ⚔";
  }

  submitBtn.addEventListener("click", () => {
    state.bossWon = true;
    saveState();
    unlockBadge("boss_slayer");
    onWin?.();
  });

  update();
}

/* =============================================================
   GRADUATION — contract + certificate
   ============================================================= */
function renderContract() {
  const c = state.contract || {};
  return `
    <div class="forge" data-contract>
      <p class="muted" style="margin:0 0 12px">Public commitments execute at 10× the rate of mental ones. Fill it. Sign it. Photograph it.</p>
      <div class="forge-grid">
        <div>
          <div class="forge-field"><label>Time savings target per week</label><input data-ct="hours" type="number" value="${esc(c.hours || 10)}"> hours</div>
          <div class="forge-field"><label>Revenue increase target (per month, within 90 days)</label><input data-ct="rev" type="number" value="${esc(c.rev || 5000)}"></div>
          <div class="forge-field"><label>Accountability partner</label><input data-ct="ap" type="text" placeholder="Name + email" value="${esc(c.ap || "")}"></div>
          <div class="forge-field"><label>30-day review date</label><input data-ct="review" type="date" value="${esc(c.review || "")}"></div>
          <div class="forge-field"><label>My signature</label><input data-ct="sig" type="text" placeholder="Type your full name to sign" value="${esc(c.sig || state.user.name)}"></div>
          <button class="btn btn--primary" data-contractsave>Lock in commitment</button>
        </div>
        <div>
          <div class="callout callout--success">
            <strong>Why this works</strong>
            Public commitments — written + shared — execute at 10× the rate of internal ones. Photo the signed page and send it to your accountability partner before you close this tab.
          </div>
        </div>
      </div>
    </div>`;
}

function wireContract(root) {
  const w = root.querySelector("[data-contract]");
  if (!w) return;
  w.querySelector("[data-contractsave]").addEventListener("click", () => {
    const obj = {};
    $$("[data-ct]", w).forEach((el) => (obj[el.dataset.ct] = el.value));
    if (!obj.sig || obj.sig.trim().length < 3) {
      toast("Sign with your full name to lock it in", "error");
      return;
    }
    state.contract = obj;
    state.certificateName = obj.sig;
    saveState();
    toast("Contract locked", "success");
    awardXP(80, "Commitment signed");
  });
}

function renderCertificate() {
  const name = state.certificateName || state.user.name || "Realtor Extraordinaire";
  const date = new Date(state.enrolledAt || Date.now()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  return `
    <div class="cert" id="theCert">
      <div class="cert-eyebrow">Certificate of Completion</div>
      <h2>The Bogen Method™</h2>
      <p class="cert-line">This certifies that</p>
      <div class="cert-name">${esc(name)}</div>
      <p class="cert-line">has completed all three episodes of <strong>The Bogen Method</strong>, mastered the C·T·F·C prompting framework, forged the /listing · /lead · /content trio, defeated the Boca Boss Mission, and earned the title of</p>
      <h3 style="color:var(--cyan);margin:8px 0 4px;font-size:1.4rem">Certified Operator</h3>
      <p class="cert-line muted" style="font-size:.85rem">Issued ${date} · Edmund's Mastermind · The Edmund Bogen Team · Douglas Elliman Real Estate</p>
      <div class="cert-sig">
        <div><strong>Edmund Bogen</strong>Instructor & Founder, Edmund's Mastermind</div>
        <div><strong>${esc(name)}</strong>Certified Operator</div>
      </div>
    </div>
    <div style="text-align:center;margin-top:18px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
      <button class="btn btn--primary" id="downloadCert">Download my certificate</button>
      <button class="btn btn--ghost" id="downloadVault">Download my Prompt Vault</button>
    </div>`;
}

function wireCertificate(root) {
  root.querySelector("#downloadCert")?.addEventListener("click", () => {
    window.print();
  });
  root.querySelector("#downloadVault")?.addEventListener("click", () => {
    const lines = state.prompts.map((p) => `# ${p.label}\n\n${p.code}\n\n---\n`);
    const blob = new Blob([`# My Bogen Method Prompt Vault\nFor ${state.user.name}\n\n` + lines.join("\n")], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bogen-method-prompt-vault.md";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    awardXP(30, "Vault exported");
  });
}
