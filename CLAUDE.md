# CLAUDE.md — The Bogen Method™

Project guide for AI assistants working in this repo.
Last updated: 2026-05-10.

---

## 1. What this site is

**The Bogen Method** is a static, gamified, browser-based Claude Code course for luxury real estate agents, taught by Edmund Bogen of The Edmund Bogen Team at Douglas Elliman and delivered as a member benefit of Edmund's Mastermind. The site is a single-page app: a lead-capture gate, then a routed dashboard covering 3 episodes / 12 lessons, 6 interactive tools (terminal simulator, C·T·F·C drag builder, slash-command forge, ROI calculator, troubleshooter decision tree, CLAUDE.md builder), an XP/level/streak/badge progression system, a Boca Raton listing "boss mission," a printable Certified Operator certificate, and an exportable Prompt Vault. All progress persists in `localStorage`; enrollments, progress snapshots, and key events are fire-and-forget upserted to Supabase. There is no build step and no backend code in this repo.

---

## 2. The 8 JS files

Loaded in this exact order in `index.html` (lines 216–224) — later files depend on earlier globals.

| # | File | Purpose |
|---|------|---------|
| 1 | `js/config.js` | Two `const`s only — `SUPABASE_URL` and `SUPABASE_ANON_KEY`. Public anon key is safe to ship; RLS restricts it to INSERT/UPSERT on three tables. |
| 2 | `js/data.js` | All course content. Exports `BADGES` (17), `EP1_LESSONS`, `EP2_LESSONS`, `EP3_LESSONS`, `EPISODES`, `CTFC_CHIPS` / `CTFC_SLOTS` / `CTFC_SLOT_LABELS`, `FORGES` (listing/lead/content templates), `BOSS` (Boca mission scenario + steps), `TROUBLE_TREE`, `DAILY_MISSIONS`. Pure data — no DOM. |
| 3 | `js/state.js` | Game state engine. Defines `state`, `DEFAULT_STATE`, the `store` localStorage shim (with in-memory fallback for sandboxed iframes), `LEVELS` curve, `awardXP`, `unlockBadge`, lesson/quiz/streak/vault helpers, `enrollUser`, `resetAll`, `exportProgress`. Calls `pushProgressDebounced()` after every mutation. |
| 4 | `js/cloud.js` | Supabase telemetry. Exposes `CLOUD.logEnrollment`, `CLOUD.pushProgress` (PATCH-then-INSERT), `CLOUD.logEvent`, plus `pushProgressDebounced()` (1.5s coalescer). Every call is fire-and-forget — failures are silenced so a Supabase outage never breaks the course. |
| 5 | `js/sfx.js` | Web Audio cues generated on the fly: `sfxPing`, `sfxCorrect`, `sfxWrong`, `sfxBadge`, `sfxLevelUp`, `sfxType`, `sfxCombo(n)`. Lazily creates one `AudioContext`. Respects `state.muted`. |
| 6 | `js/components.js` | Reusable in-lesson UI builders + `$` / `$$` / `esc` / `html` helpers. Each component has a `renderX()` (returns HTML string) and a `wireX(root)` (attaches events). Components: prompt block, terminal sim, quiz (timer + combos), C·T·F·C drag builder, CLAUDE.md builder, slash-command forge, ROI calculator, troubleshooter tree, boss mission, contract, certificate. |
| 7 | `js/lessons.js` | Lesson page renderer. `renderLesson(id)` walks `lesson.blocks[]` and calls `renderBlock()` for each (hero, h, p, ul/ol, callout, table, prompt, split, termdemo, terminalSim, quiz, ctfc, claudeMdBuilder, forge, roiCalc, troubleshooter, boss, contract, cert). `wireLesson()` attaches the right wiring per block type, drives the IntersectionObserver TOC highlight, and handles "Mark complete" / auto-advance. |
| 8 | `js/tools.js` | Top-level routed pages: dashboard (`renderHome`), episode list (`renderEpisode`), tools index (`renderTools`), individual tool pages (`renderTool` / `wireTool`), vault (`renderVault` / `wireVault`), badges gallery (`renderBadges`), modal helpers. |

Plus `js/app.js` — boot, hash router, HUD refresh, gate form handler, user menu, modal. Not in the 8 (since the prompt asked for 8) but it ships in the same `js/` folder and is loaded last.

---

## 3. Brand colors and typography

CSS variables live at the top of `css/style.css` (lines 6–51).

**Primary palette**

| Token | Hex | Use |
|-------|-----|-----|
| `--navy-900` | `#0d2540` | Primary brand navy — topbar, dark panels, gate background |
| `--navy-950` | `#08172a` | Deepest navy for panel gradients |
| `--navy-800` / `-700` / `-600` / `-500` | `#133356` / `#1a3e5c` / `#234e74` / `#2f6593` | Navy ramp |
| `--cyan` | `#00a8e1` | Accent / CTA / progress / "lit" states |
| `--cyan-bright` | `#1bb6e8` | Hover |
| `--cyan-dark` | `#0080ab` | Pressed |
| `--cyan-glow` | `rgba(0,168,225,.35)` | Focus glow |

**Semantic palette**

| Token | Hex |
|-------|-----|
| `--gold` (badges, XP) | `#e6b450` |
| `--green` (correct, success) | `#2ec27e` |
| `--red` (wrong, danger) | `#e35d6a` |
| `--purple` (Episode 3 / power-play badges) | `#8b6cef` |
| `--orange` | `#f08a3e` |

**Neutrals**: `--text` `#0a1a2e`, `--muted` `#6b7a90`, `--paper` `#ffffff`, `--paper-soft` `#f6f8fb`, `--paper-warm` `#f1f4f8`, `--line` `#dde3ec`.

**Typography**

- `--font-sans`: **Inter** (300/400/500/600/700/800/900) — UI, body, headings
- `--font-mono`: **JetBrains Mono** (400/500/600/700) — terminal, code blocks, prompts

Both loaded via Google Fonts in `index.html`. Theme color meta = `#0d2540`.

**Radii / shadows / motion** also live as tokens (`--radius`, `--shadow`, `--t-fast`, etc.) — always reuse, don't hard-code.

---

## 4. State model — XP, levels, badges, streaks

All state lives on the single global `state` (also `window.state` for debugging) and is JSON-serialized into `localStorage` under key **`bogenMethod_v1`** on every change. Source of truth: `js/state.js`.

**Shape** (see `DEFAULT_STATE`):
```
{
  enrolled, user: { name, email, brokerage, market }, enrolledAt,
  xp, level, streak, lastActiveDate, streakDays[],
  badges: [],                      // array of badge ids
  lessons: { "1.1": { started, completed, quizScore } },
  quizzes: { "q1.1": { best, attempts, perfect } },
  prompts: [{ id, label, code, lessonId, savedAt }],
  forge: { listing: { fields, generatedAt }, lead: {...}, content: {...} },
  claudeMd, voiceProfile, comboMax, bossWon, contract: {}, certificateName
}
```

**XP**
- Awarded via `awardXP(amount, reason)`. Emits a floating XP pop near the HUD and a `sfxPing`.
- Sources: completing a lesson (each lesson defines its own `xp`), copying a prompt (+5), saving to Vault (+10), running terminal commands (+8 / +15), perfect quiz answer (+15 with combo bonus up to +35), CTFC solved (+40), CLAUDE.md built (+50), SKILL.md forged (+60), ROI claim (+50), troubleshooter fix (+20), contract signed (+80), vault export (+30), badge claim (per badge), boss win (+300 via badge).

**Levels**
- 16 thresholds defined in `LEVELS = [0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700, 3250, 3850, 4500, 5200, 5950, 6750]`.
- `levelFromXP(xp)` walks the array; `xpForLevel` / `xpForNextLevel` drive the HUD progress bar.
- Level-up triggers `emitLevelUp()` toast + `sfxLevelUp` 600ms after the XP pop.

**Streaks**
- `bumpStreak()` runs on every lesson completion and on enrollment.
- Same-day re-entry: no-op. Yesterday: `streak += 1`. Otherwise: streak resets to `1`.
- `state.streakDays` keeps the last 30 ISO date strings — used to render the 7-day grid on the home dashboard.

**Badges**
- 17 ids stored in `BADGES` (data.js). Each has `name`, `icon` (emoji), `color` (CSS class hint), `desc`, `xp`.
- `unlockBadge(id)` is idempotent (dedupes on `state.badges`), shows the full-screen `#badgeOverlay`, plays `sfxBadge`, and only awards XP when the user clicks "Claim".
- Cloud side-effect: every unlock fires a `badge_unlock` event to Supabase.

**Lesson gating**
- `isLessonUnlocked(id)` requires the previous lesson (in episode order) to be marked complete. First lesson is always open.
- `markLessonComplete(id, score)` awards XP only on first completion, unlocks the lesson's `badge` if defined, then bumps streak.

**Quizzes**
- 18-second per-question timer, time-out counts as wrong.
- Combo counter: consecutive right answers compound XP up to `+35`. 5× combo unlocks `combo_king`. `state.comboMax` is preserved.
- Perfect run (no wrong answers) unlocks `perfect_pop`.

---

## 5. Supabase wiring

**Config** (`js/config.js`)
```js
const SUPABASE_URL = "https://ymudfrwpovekpupinjmt.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_74XKVNiTglA0SDR_MJZ2ww_Ku0JcGeL";
```
The anon key is the **publishable** key — safe to commit. Row-level security restricts it to INSERT/UPSERT on the three tables below. SELECT is not granted, so the lead list cannot be exfiltrated from the browser.

**Client** (`js/cloud.js`)
- Single `CLOUD` IIFE. All requests use `fetch` with `keepalive: true` so they survive page-nav.
- Every call is wrapped in `try/catch` and silently swallows failures — telemetry must never block the lesson UX.
- `pushProgressDebounced()` coalesces XP/badge/lesson churn into one upsert every ~1.5s.

**Three tables**

| Table | Written by | Columns | Notes |
|-------|-----------|---------|-------|
| `enrollments` | `CLOUD.logEnrollment(user)` on gate submit. | `email`, `full_name`, `brokerage`, `market`, `consent`, `user_agent` (truncated 240), `referrer` (truncated 240) | Plain INSERT. Duplicate email returns 409 — silently ignored (returning student). |
| `progress` | `CLOUD.pushProgress()` debounced on every state change. | `email`, `xp`, `level`, `streak`, `last_active_date`, `badges[]`, `lessons_completed[]`, `combo_max`, `boss_won`, `certificate_earned`, `updated_at` | PATCH on `email=eq.{email}` first to avoid 409 console noise on returning students; if 0 rows updated, falls through to INSERT. |
| `events` | `CLOUD.logEvent(kind, payload)` for `enroll`, `lesson_complete`, `badge_unlock`, and anything else worth tracking. | `email`, `kind`, `payload` (jsonb) | Pure append-only log. |

**Rules when editing**
- Never call Supabase synchronously in a critical path. Use the existing `CLOUD.*` helpers and let them fail silently.
- Never add a SELECT call from the browser — the anon key has no read permission by design.
- If you need a new event kind, just call `CLOUD.logEvent("kind_name", {...})`. No schema change required.
- If you need new columns on `progress` or `enrollments`, add them in Supabase first, then update the body in `cloud.js`. The PATCH-then-INSERT pattern accepts unknown columns without breaking older clients.

---

## 6. The 17 badges and what triggers each

Defined in `js/data.js` lines 5–22. Unlock triggers traced through `state.js`, `components.js`, and lesson `badge:` keys in `data.js`.

| # | id | Icon · Name | XP | Triggered by |
|---|----|-------------|----|--------------|
| 1 | `first_step` | 👣 First Step | 25 | Enrolling via the gate form (`enrollUser()` in `state.js`). |
| 2 | `terminal_tamer` | 💻 Terminal Tamer | 100 | Running 3+ commands in the terminal sandbox (`components.js`) **OR** completing Lesson 1.1. |
| 3 | `install_ace` | 🛠️ Install Ace | 100 | Defined but **not currently wired** to any trigger. Lesson 1.2 has no `badge:` key. *Either wire it to Lesson 1.2 completion or remove from `BADGES`.* |
| 4 | `prompt_architect` | 🧠 Prompt Architect | 150 | Correctly solving the C·T·F·C drag builder (`components.js:494`) **OR** completing Lesson 1.3. |
| 5 | `voice_cloner` | 🎙️ Voice Cloner | 100 | Clicking "Build my CLAUDE.md" in the CLAUDE.md builder (`components.js:604`) **OR** completing Lesson 1.4. |
| 6 | `slash_smith` | ⚡ Slash Smith | 150 | Forging a SKILL.md in any slash-command forge (`components.js:681`) **OR** completing Lesson 2.1. |
| 7 | `follow_up_finisher` | 📲 Follow-Up Finisher | 150 | Completing Lesson 2.2 (`badge:` key in data.js). |
| 8 | `content_baron` | 📢 Content Baron | 200 | Completing Lesson 2.3. |
| 9 | `listing_machine` | 🏠 Listing Machine | 200 | Completing Lesson 2.4 (the Boss Mission — `badge:` key + boss submit). |
| 10 | `skill_builder` | 📦 Skill Builder | 200 | Completing Lesson 3.1. |
| 11 | `mcp_pioneer` | 🔌 MCP Pioneer | 200 | Completing Lesson 3.2. |
| 12 | `roi_realist` | 💰 ROI Realist | 100 | Clicking "Lock in my ROI" in the ROI calculator (`components.js:770`) **OR** completing Lesson 3.3. |
| 13 | `troubleshooter` | 🩺 Troubleshooter | 100 | Drilling into 3+ distinct symptom branches in the troubleshooter tree (`components.js:814`). |
| 14 | `perfect_pop` | 💎 Perfect 10 | 75 | Finishing any quiz with 100% correct (`state.js:254`). |
| 15 | `combo_king` | 🔥 Combo King | 75 | Hitting a 5× consecutive-correct streak in any quiz (`components.js:297`). |
| 16 | `boss_slayer` | 👑 Boss Slayer | 300 | Submitting the Boca Boss Mission with all 6 steps cleared (`components.js:917`). |
| 17 | `certified` | 🏆 Certified Operator | 500 | Completing Lesson 3.4 (graduation). |

---

## 7. Conventions when editing

**Architecture**
- This is a vanilla-JS static site. **No build step, no bundler, no framework, no npm.** Don't introduce one without explicit approval.
- File load order in `index.html` matters — `config` → `data` → `state` → `cloud` → `sfx` → `components` → `lessons` → `tools` → `app`. Keep dependencies flowing one direction.
- Every UI element follows the **`render*()` returns a string · `wire*(root)` attaches events** pattern. Don't mix DOM creation into the render functions.

**HTML safety**
- Use `esc(str)` for any user-supplied or state-supplied string before inlining into a template literal.
- Use `html(str)` only when the content is already trusted hand-authored HTML (lesson copy in `data.js`).

**State changes**
- Mutate via the helpers (`awardXP`, `unlockBadge`, `markLessonComplete`, `saveToVault`, etc.) — never write to `localStorage` directly. The helpers always call `saveState()` and `pushProgressDebounced()`.
- New persisted fields go in `DEFAULT_STATE`. `loadState()` merges defaults on top so existing browsers don't break on schema additions.
- Bump `STATE_KEY` (currently `bogenMethod_v1`) only if you need a hard reset for every student. Avoid this.

**Course content**
- All lesson copy, quizzes, prompts, badges, and the Boca scenario live in `js/data.js`. Edit content there; do **not** sprinkle copy into renderers.
- New lesson? Add it to the appropriate `EP*_LESSONS` array with a unique `id` (e.g. `"3.5"`), a `badge:` key if it should grant one, and an `xp` value that fits the curve.
- Every listing/prompt template **must** bake in Fair Housing constraints. The licensed agent is responsible for every published word — keep that framing in callouts.

**Brand**
- Use CSS variables (`var(--navy-900)`, `var(--cyan)`, `var(--font-sans)`, `var(--radius)`, `var(--shadow)`) — never hard-code hex or px values that already have a token.
- The two co-brands shown anywhere: **Edmund's Mastermind** (course) + **The Edmund Bogen Team at Douglas Elliman** (presenter). Don't drop one.

**Telemetry**
- Cloud calls are fire-and-forget by design. Don't `await` them in user-facing flows.
- Don't log anything to Supabase that isn't useful for Edmund — keep payloads small.

**Audio**
- All SFX go through `sfxX()` helpers. Don't load audio files — everything is generated via Web Audio.
- Respect `state.muted` — `tone()` already does.

**Git**
- Branch is `master` (not `main`). Don't rename without coordinating with Edmund.
- Repo is **not** yet in the Active Repos list in `~/CLAUDE.md`. Add it there before treating this as a permanent product repo.

---

## 8. Run locally and deploy

**Run locally**
```bash
cd ~/the-bogen-method
python3 -m http.server 8765
# then open http://localhost:8765
```

That's it — no install, no build, no env vars. The Supabase keys in `js/config.js` are safe to ship and work the same locally as in production.

**Reset your local progress while developing**
```js
// in DevTools console
localStorage.removeItem("bogenMethod_v1"); location.reload();
```
…or click "Sign out / reset" in the user menu.

**Deploy**
Static site — any static host works. Options:

1. **GitHub Pages** — Settings → Pages → Deploy from branch `master`, root. Site goes live at `https://edmundbogen.github.io/the-bogen-method/`. Custom domain (e.g. `bogenmethod.com`) configured via CNAME if desired.
2. **Vercel / Netlify** — Import the repo, no build command, output directory `/`. Auto-deploys on push.
3. **Cloudflare Pages** — Same: no build, root output.

**Before going public, verify:**
- Supabase RLS policies actually restrict the anon key to INSERT/UPSERT only on `enrollments`, `progress`, `events`. Test in an incognito tab with DevTools open — every `fetch` should succeed quietly, no SELECT calls should appear.
- The three tables exist with the columns listed in §5.
- A test enrollment lands in `enrollments` and a test lesson completion lands in `progress` and `events`.

**Production checklist**
- [ ] Custom domain pointed (if applicable)
- [ ] OpenGraph/Twitter meta tags in `<head>` for share preview (currently only `description` + `theme-color`)
- [ ] Favicon variants beyond the single SVG (Apple touch icon, etc.) if you care about home-screen install
- [ ] Confirm Supabase project is on a paid tier if you expect >50K monthly active users (free tier limits)
- [ ] Decide where the Vault export and Certificate live long-term (currently browser-only)
