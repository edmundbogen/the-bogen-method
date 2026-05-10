# The Bogen Method™

> An interactive Claude Code course built for the luxury real estate agent who's done with the SaaS sprawl and ready to run their entire business from one terminal window.

Live course site for **Edmund's Mastermind**, taught by Edmund Bogen of [The Edmund Bogen Team](https://bogenhomes.com) at Douglas Elliman Real Estate.

![The Bogen Method](https://img.shields.io/badge/Edmund's_Mastermind-Interactive_Course-00a8e1?style=for-the-badge)
![Lessons](https://img.shields.io/badge/Lessons-12-0d2540?style=for-the-badge)
![Badges](https://img.shields.io/badge/Badges-17-e6b450?style=for-the-badge)

---

## What it is

A gamified, browser-based interactive course teaching luxury real estate agents how to install, master, and scale Claude Code as the operating system of their business.

- **Lead capture gate** — name + email required before the course unlocks
- **3 Episodes · 12 Lessons** built directly from the Edmund's Mastermind Episode 1, 2, and 3 workbooks
- **XP · Levels · Streaks · 17 Badges** — full progression system
- **6 interactive tools** — terminal simulator, drag-and-drop C·T·F·C prompt builder, slash-command forge, ROI calculator, troubleshooter decision tree, CLAUDE.md builder
- **Boss mission** — six-step capstone on a fictional Boca Raton listing
- **Certified Operator certificate** — generated with the student's name
- **Prompt Vault** — every copied prompt saved and exportable as Markdown

## Curriculum

### Episode 1 — Foundations
1. What Claude Code actually is (and why it changes everything for realtors)
2. The 60-minute install engine (Mac, Windows, WSL)
3. The C·T·F·C framework — how to actually talk to Claude
4. CLAUDE.md — building your AI a memory

### Episode 2 — Daily Real Estate Work
1. The Listing Production Engine — `/listing`
2. The Client Communication System — `/lead`
3. The Content Multiplication Machine — `/content`
4. **BOSS MISSION** — Ship a complete Boca Raton listing kit

### Episode 3 — Power Plays
1. Custom Skills — beyond slash commands
2. MCP integrations — Gmail, Calendar, property data (with the honest MLS reality check)
3. ROI tracking — measure to the dollar
4. Graduation — your 30-day profit plan

## Run it locally

It's a static site. No build step, no backend.

```bash
git clone https://github.com/<you>/the-bogen-method.git
cd the-bogen-method
python3 -m http.server 8765
# open http://localhost:8765
```

## Project layout

```
bogen-course/
├── index.html             # shell — gate + app frame
├── css/style.css          # Edmund Bogen Team brand styling
├── js/
│   ├── data.js            # all course content — lessons, quizzes, badges, prompts
│   ├── state.js           # XP / level / badge / streak system
│   ├── sfx.js             # Web Audio cues (mute-able)
│   ├── components.js      # quizzes, terminal sim, CTFC drag builder, forge, ROI, etc.
│   ├── lessons.js         # lesson page renderer
│   ├── tools.js           # standalone tool pages, dashboard, vault, badges gallery
│   └── app.js             # router + boot
└── assets/favicon.svg
```

## Brand

- **Primary navy** `#0d2540`
- **Accent cyan** `#00a8e1`
- **Typography** Inter (UI) + JetBrains Mono (code/terminal)
- **Co-branded** with Douglas Elliman Real Estate per [The Edmund Bogen Team brand guidelines](https://bogenhomes.com)

## Compliance

Every listing-generation prompt template in the course bakes in Fair Housing constraints (FHA Articles 2 & 12, NAR Code of Ethics, Florida MLS rules). The course frames Claude consistently as a drafting assistant — the licensed agent is responsible for every published word.

## License

© 2026 Edmund's Mastermind / The Edmund Bogen Team. All rights reserved.

---

**Edmund Bogen** · Douglas Elliman Real Estate
📍 Boca Raton, FL · 📧 edmund@bogenhomes.com · 📞 561-235-7575
