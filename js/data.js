/* =============================================================
   COURSE DATA — The Bogen Method
   ============================================================= */

const BADGES = {
  first_step: { name: "First Step", icon: "👣", color: "", desc: "Enrolled in The Bogen Method.", xp: 25 },
  terminal_tamer: { name: "Terminal Tamer", icon: "💻", color: "", desc: "Survived your first terminal session.", xp: 100 },
  install_ace: { name: "Install Ace", icon: "🛠️", color: "", desc: "Walked through every install path — Mac, Windows, WSL.", xp: 100 },
  prompt_architect: { name: "Prompt Architect", icon: "🧠", color: "b-purple", desc: "Mastered the C·T·F·C framework.", xp: 150 },
  voice_cloner: { name: "Voice Cloner", icon: "🎙️", color: "b-purple", desc: "Built your voice profile.", xp: 100 },
  slash_smith: { name: "Slash Smith", icon: "⚡", color: "b-gold", desc: "Forged your first slash command.", xp: 150 },
  listing_machine: { name: "Listing Machine", icon: "🏠", color: "b-gold", desc: "Shipped a full listing kit.", xp: 200 },
  follow_up_finisher: { name: "Follow-Up Finisher", icon: "📲", color: "b-green", desc: "Built the 7-touch lead system.", xp: 150 },
  content_baron: { name: "Content Baron", icon: "📢", color: "b-purple", desc: "Multiplied one idea across 5 platforms.", xp: 200 },
  skill_builder: { name: "Skill Builder", icon: "📦", color: "b-gold", desc: "Created a custom Claude Skill.", xp: 200 },
  mcp_pioneer: { name: "MCP Pioneer", icon: "🔌", color: "b-purple", desc: "Connected your first MCP server.", xp: 200 },
  roi_realist: { name: "ROI Realist", icon: "💰", color: "b-gold", desc: "Calculated your recovered GCI.", xp: 100 },
  troubleshooter: { name: "Troubleshooter", icon: "🩺", color: "b-red", desc: "Diagnosed and fixed three bugs.", xp: 100 },
  perfect_pop: { name: "Perfect 10", icon: "💎", color: "b-gold", desc: "Aced a quiz with no wrong answers.", xp: 75 },
  combo_king: { name: "Combo King", icon: "🔥", color: "b-red", desc: "Hit a 5x answer combo.", xp: 75 },
  boss_slayer: { name: "Boss Slayer", icon: "👑", color: "b-gold", desc: "Beat the Boca Boss Mission.", xp: 300 },
  certified: { name: "Certified Operator", icon: "🏆", color: "b-gold", desc: "Completed The Bogen Method.", xp: 500 },
};

/* =============================================================
   EPISODE 1 — FOUNDATIONS
   ============================================================= */
const EP1_LESSONS = [
  /* ---------- L1.1 ---------- */
  {
    id: "1.1",
    title: "What Claude Code actually is (and why it changes everything for realtors)",
    duration: "12 min",
    xp: 80,
    objectives: [
      "Understand why Claude Code is fundamentally different from ChatGPT/Claude.ai",
      "See three real revenue applications mapped to your week",
      "Pass the Foundations Quiz",
    ],
    blocks: [
      { type: "hero", eyebrow: "Episode 1 · Lesson 1", title: "Claude Code is not a chatbot. It's an operating system." },
      { type: "p", text: "Most agents who try AI quit inside 60 days. The reason is almost always the same: they use AI like a search box. Ask a question, copy an answer, paste it elsewhere. Repeat. Friction compounds. They quit." },
      { type: "p", text: "Claude Code lives <em>on your computer</em>. It reads the listing PDF on your desktop. It writes the email and saves the draft. It remembers your brand voice across every session. It runs the same task fifty times without complaint." },
      { type: "callout", tone: "", title: "The mindset shift", text: "You stop <em>using</em> AI. You start <em>delegating</em> to it. That's the difference between a $20/month chatbot and a personal AI operating system." },
      { type: "h", text: "Real-revenue applications for a Florida luxury agent" },
      { type: "ul", items: [
        "Generate 30 days of social content from one prompt + your CLAUDE.md",
        "Process 10 buyer leads with personalized follow-ups in the time it takes to write one",
        "Summarize a 50-page HOA disclosure in 90 seconds — every time",
        "Draft 5 listing descriptions that match your voice, simultaneously",
        "Audit your CRM for stale contacts and generate re-engagement emails for each",
      ]},
      { type: "h", text: "The $500/month tool stack killer" },
      { type: "p", text: "Most agents pay for ChatGPT Plus + Jasper + Copy.ai + Descript + something else. With Claude Code, one $20 Pro subscription replaces the writing layer of your entire stack — and adds capabilities the others physically can't provide." },
      { type: "termdemo", lines: [
        { kind: "prompt", text: "edmund@MacBook ~ %" },
        { kind: "cmd", text: " claude --version" },
        { kind: "out", text: "claude-code 2.1.4" },
        { kind: "prompt", text: "edmund@MacBook ~ %" },
        { kind: "cmd", text: " cd ~/listings/7654-ocean-blvd" },
        { kind: "prompt", text: "edmund@MacBook 7654-ocean-blvd %" },
        { kind: "cmd", text: " claude" },
        { kind: "claude", text: "Welcome back, Edmund. I see property.txt, condo-docs/, and FAR-BAR-AsIs.pdf in this folder. What should I work on first?" },
      ] },
      { type: "quiz", id: "q1.1", title: "Foundations Quiz", questions: [
        {
          q: "What's the single biggest reason Claude Code feels different from ChatGPT for a working realtor?",
          options: [
            "It produces better English than ChatGPT",
            "It lives on your machine and can read and write the files you already use",
            "It's free for the first six months",
            "It's exclusively trained on real estate data",
          ],
          correct: 1,
          explain: "Claude Code's defining trait is local file access. The AI lives where your work lives. That's what eliminates copy-paste friction.",
        },
        {
          q: "A buddy says \"AI gives me garbage.\" What's almost always the actual problem?",
          options: [
            "His AI isn't smart enough",
            "He's using the wrong model",
            "His prompts lack Context, Task, Format, or Constraints",
            "He needs to pay for the enterprise version",
          ],
          correct: 2,
          explain: "Garbage out = inputs missing one of the C·T·F·C ingredients. We'll master this framework in Lesson 1.3.",
        },
        {
          q: "Which of these is NOT a realistic claim for Claude Code in your business?",
          options: [
            "Summarize a 50-page HOA disclosure in 90 seconds",
            "Draft 5 listing descriptions in your voice in parallel",
            "Replace your real estate license and act as your broker",
            "Audit your CRM and draft re-engagement emails for each contact",
          ],
          correct: 2,
          explain: "Claude is a drafting and analysis assistant. The licensed agent is responsible for every published word — Fair Housing, NAR Code of Ethics, and your broker rules apply.",
        },
      ]},
    ],
  },

  /* ---------- L1.2 ---------- */
  {
    id: "1.2",
    title: "The 60-minute install engine (Mac, Windows, WSL)",
    duration: "18 min · hands-on",
    xp: 120,
    badge: "terminal_tamer",
    objectives: [
      "Install Claude Code on Mac or Windows without WSL",
      "Use the interactive terminal sim to practice commands risk-free",
      "Know the three diagnostic commands every user needs",
    ],
    blocks: [
      { type: "hero", eyebrow: "Episode 1 · Lesson 2", title: "Zero to running Claude Code in under an hour." },
      { type: "callout", tone: "warn", title: "Before you start", text: "You need a paid Claude account (Pro $20/mo minimum, Max recommended). The free plan does not include Claude Code. This trips up the most people on Day 1." },
      { type: "h", text: "Path A — Mac (native installer, recommended for 2026)" },
      { type: "p", text: "Open Spotlight (<span class='kbd'>⌘ Space</span>), type Terminal, press Return. A black window opens. Paste this line and press Return:" },
      { type: "prompt", label: "Install on Mac", code: `curl -fsSL https://claude.ai/install.sh | bash` },
      { type: "p", text: "Close and reopen Terminal so your shell picks up the new PATH. Then type <code>claude</code>, which spawns a browser tab for the OAuth login. One click — you're in." },
      { type: "callout", tone: "", title: "Homebrew alternative (Mac)", text: "If you already use brew: <code>brew install --cask claude-code</code>. Two casks exist — <code>claude-code</code> (stable) and <code>claude-code@latest</code> (bleeding edge). Use stable." },

      { type: "h", text: "Path B — Windows native (recommended for 2026)" },
      { type: "p", text: "Old guides told you to install WSL first. <strong>Not anymore.</strong> As of late 2025 the native Windows installer is the supported path. Open PowerShell (right-click Start → Windows Terminal) and run:" },
      { type: "prompt", label: "Install on Windows", code: `irm https://claude.ai/install.ps1 | iex` },
      { type: "callout", tone: "warn", title: "Windows prerequisite", text: "Install <strong>Git for Windows</strong> from git-scm.com first. Even on native Windows, Claude Code uses Git Bash internally. Without it, many tools fail silently. During Git install, keep all defaults." },

      { type: "h", text: "Path C — WSL (advanced; only if you need Linux sandboxing)" },
      { type: "prompt", label: "WSL path", code: `# in PowerShell:\nwsl --install -d Ubuntu\n\n# then inside Ubuntu:\ncurl -fsSL https://claude.ai/install.sh | bash` },

      { type: "h", text: "Live terminal sim — try it yourself" },
      { type: "p", text: "This is a safe sandbox. Try these commands one at a time. You can't break anything." },
      { type: "terminalSim", id: "ts_install" },

      { type: "h", text: "Three diagnostic commands every user needs" },
      { type: "table", headers: ["Command", "What it does", "When to use"], rows: [
        ["<code>claude --version</code>", "Confirms install + prints version", "After every install / update"],
        ["<code>claude doctor</code>", "Diagnoses install issues from the shell", "When <code>claude</code> won't start at all"],
        ["<code>/doctor</code>", "Run <em>inside</em> a Claude session — checks settings, MCP, context use", "First-line fix for anything weird"],
      ]},

      { type: "quiz", id: "q1.2", title: "Install Engine Quiz", questions: [
        {
          q: "You're on a Mac and you typed <code>claude</code> but got <code>command not found</code>. First fix?",
          options: [
            "Reinstall macOS",
            "Quit and reopen Terminal — the new PATH isn't loaded yet",
            "Run <code>sudo claude</code>",
            "File an Anthropic support ticket",
          ],
          correct: 1,
          explain: "Closing and reopening Terminal forces the shell to read your updated <code>~/.zshrc</code>. If that doesn't work, you can manually run <code>source ~/.zshrc</code> or add <code>$HOME/.local/bin</code> to PATH.",
        },
        {
          q: "True or false: WSL is required to run Claude Code on Windows in 2026.",
          options: ["True", "False — the native Windows installer is now the recommended path"],
          correct: 1,
          explain: "Native Windows install became the official recommendation in late 2025. WSL is only needed if you specifically want Linux-style sandboxing.",
        },
        {
          q: "Inside a Claude Code session, which diagnostic do you run first when something feels off?",
          options: [
            "<code>/doctor</code>",
            "<code>/help</code>",
            "<code>/restart</code>",
            "<code>/version</code>",
          ],
          correct: 0,
          explain: "<code>/doctor</code> checks install health, settings, MCP config, and context use in one pass. It resolves about 80% of beginner issues without escalation.",
        },
        {
          q: "Your friend signed up for free Claude.ai and now Claude Code says \"no access.\" What's wrong?",
          options: [
            "He needs to clear cookies",
            "Claude Code requires a paid plan (Pro, Max, Team, or Enterprise) — free Claude.ai doesn't include it",
            "His VPN is interfering",
            "He needs to install Node.js",
          ],
          correct: 1,
          explain: "This is the most common surprise. Pro at $20/mo is the entry point. Max ($100-$200) is what most heavy users prefer.",
        },
      ]},
    ],
  },

  /* ---------- L1.3 ---------- */
  {
    id: "1.3",
    title: "The C·T·F·C framework — how to actually talk to Claude",
    duration: "16 min",
    xp: 100,
    badge: "prompt_architect",
    objectives: [
      "Master the four ingredients every effective prompt needs",
      "Drag-and-drop to build a framework-aware prompt",
      "Compare weak prompt vs. strong prompt outputs side-by-side",
    ],
    blocks: [
      { type: "hero", eyebrow: "Episode 1 · Lesson 3", title: "Same AI. Different prompt. 10× result." },
      { type: "p", text: "The problem isn't the AI. It's the way agents talk to it. Every effective prompt has four ingredients:" },
      { type: "ul", items: [
        "<strong>Context</strong> — Who's it for? What's the situation? What files matter?",
        "<strong>Task</strong> — What exactly do you want produced?",
        "<strong>Format</strong> — How should the output look (length, sections, file type)?",
        "<strong>Constraints</strong> — What must it avoid or include? Fair Housing? Voice? Length?",
      ]},
      { type: "h", text: "Weak vs. strong — same AI, different ask" },
      { type: "split", left: {
        label: "❌ Weak prompt",
        text: "Write a listing description for a 3-bedroom condo."
      }, right: {
        label: "✅ Framework-aware prompt",
        text: "You're writing for a luxury Boca Raton agent (read voice.md). Write a 120-word description for 2257 Egret Cove, a 3BR/3BA Baywinds condo with golf views, primary suite with sitting room, chef's kitchen. One paragraph. Avoid 'spacious' or 'must-see.' End with a sensory detail."
      }},

      { type: "h", text: "Build your own — drag the ingredients into the slots" },
      { type: "ctfc" },

      { type: "h", text: "The Fair Housing guardrail belongs in every prompt" },
      { type: "callout", tone: "danger", title: "Compliance is non-negotiable", text: "Fair Housing prohibits language referencing or implying race, color, national origin, religion, sex, disability, familial status, or age. Phrases like \"great for families,\" \"perfect for retirees,\" \"safe neighborhood,\" or \"walking distance to church\" can violate the FHA. Every prompt that produces published copy should include a Fair Housing guardrail. The licensed agent (you) is responsible for every published word — Claude is a drafting assistant, full stop." },

      { type: "quiz", id: "q1.3", title: "Prompt Framework Quiz", questions: [
        {
          q: "Which ingredient is missing from this prompt: \"Write a 250-word luxury listing description. Use my voice. No emojis.\"",
          options: ["Context", "Task", "Format", "Constraints"],
          correct: 0,
          explain: "There's no Context — no specific property, no source files, no buyer profile. Claude will invent details to fill the gap, which is how hallucinated square footage gets shipped.",
        },
        {
          q: "Best place to put Fair Housing constraints in a listing prompt?",
          options: [
            "At the very end as an afterthought",
            "Inside the Constraints section, explicitly and every time",
            "Don't bother — Claude knows the law",
            "Only when generating multifamily descriptions",
          ],
          correct: 1,
          explain: "Bake it into the Constraints section of every listing prompt. Don't rely on Claude to remember without being told. The agent is responsible for every published word.",
        },
        {
          q: "A prompt says \"Write a 75–85 word headline paragraph.\" Which ingredient does that belong to?",
          options: ["Context", "Task", "Format", "Constraints"],
          correct: 2,
          explain: "Length, structure, and style rules live in Format. Task is what's produced (\"a headline paragraph\"); Format is how (\"75–85 words, one paragraph\").",
        },
      ]},
    ],
  },

  /* ---------- L1.4 ---------- */
  {
    id: "1.4",
    title: "CLAUDE.md — building your AI a memory",
    duration: "14 min · hands-on",
    xp: 100,
    badge: "voice_cloner",
    objectives: [
      "Understand what CLAUDE.md does and where it lives",
      "Build your personal CLAUDE.md interactively",
      "Generate a voice profile from your existing emails",
    ],
    blocks: [
      { type: "hero", eyebrow: "Episode 1 · Lesson 4", title: "Out of the box, Claude is generic. With CLAUDE.md, it's <em>yours</em>." },
      { type: "p", text: "A CLAUDE.md file is just a markdown document at the root of a project folder. Claude reads it automatically every time you start a session in that folder. Whatever you write there becomes permanent context — your name, team, market, brand voice, common tasks, and preferences." },
      { type: "h", text: "What goes in a great CLAUDE.md" },
      { type: "ul", items: [
        "Who you are — name, brand, brokerage, license number, contact info",
        "Your business entities — Edmund's Mastermind, REIGNation, Bogen.ai — and what each does",
        "Your team — who handles what, their contact info",
        "Your voice rules — tone, sentence length, words you favor, words to avoid",
        "Your guardrails — Fair Housing, FAR-BAR, voice in VOICE.md, never quote prices not in source files",
        "Your active inventory — current listings, current buyers (refreshed monthly)",
      ]},

      { type: "h", text: "Build YOUR CLAUDE.md right now" },
      { type: "claudeMdBuilder" },

      { type: "h", text: "The voice-profile move" },
      { type: "p", text: "The single best one-time setup is to feed Claude 20 of your past emails and have it write a one-page style guide. Save it as VOICE.md. From then on, every prompt can say \"match the style in VOICE.md\" — and Claude will write in your voice automatically." },
      { type: "prompt", label: "Voice profile prompt", code: `Read the last 20 emails I have saved as .txt files in ~/sent-emails. Analyze my writing voice — tone, sentence length, vocabulary, signature phrases. Save the profile as voice-profile.md so you can match my style going forward.` },

      { type: "quiz", id: "q1.4", title: "Memory Quiz", questions: [
        {
          q: "Where does CLAUDE.md need to live for Claude to read it automatically?",
          options: [
            "In your Downloads folder",
            "At the root of your project folder",
            "Anywhere on your hard drive",
            "Uploaded to Claude.ai",
          ],
          correct: 1,
          explain: "Claude looks for CLAUDE.md at the root of the directory where you launch <code>claude</code>. Project-specific = lives in the project root. Personal/global rules can go in <code>~/.claude/CLAUDE.md</code>.",
        },
        {
          q: "After building voice-profile.md, what's the right way to reference it later?",
          options: [
            "Re-paste your past emails in every prompt",
            "Ask Claude to \"match the style in voice-profile.md\" in any future prompt",
            "Email it to yourself",
            "Print it out",
          ],
          correct: 1,
          explain: "Once the file exists, future prompts just reference it. This is how you compound brand voice across sessions without re-explaining yourself.",
        },
      ]},
    ],
  },
];

/* =============================================================
   EPISODE 2 — DAILY REAL ESTATE WORK
   ============================================================= */
const EP2_LESSONS = [
  /* ---------- L2.1 ---------- */
  {
    id: "2.1",
    title: "The Listing Production Engine — /listing",
    duration: "18 min · hands-on",
    xp: 120,
    badge: "slash_smith",
    objectives: [
      "Understand the difference between a prompt, a CLAUDE.md, and a Skill",
      "Forge your own /listing slash command in the Skill Forge",
      "Run the engine on a sample Boca Raton property",
    ],
    blocks: [
      { type: "hero", eyebrow: "Episode 2 · Lesson 1", title: "Volume agents don't write 50 listings. They run 50 listings through one engine." },
      { type: "p", text: "Most agents max out at 25-30 listings per year — not because of lead flow, but because of the production bottleneck. Each new listing demands 8-12 hours of marketing copy. That work doesn't scale linearly. It scales catastrophically." },
      { type: "p", text: "A listing engine inverts the problem. You build the engine once. Every future listing flows through it. The marginal cost of listing #51 is the same as listing #1: about 60 seconds." },

      { type: "h", text: "Prompt vs. CLAUDE.md vs. Skill — Edmund's tagline" },
      { type: "callout", tone: "", title: "Memorize this one line", text: "<strong>Prompts</strong> are conversations. <strong>CLAUDE.md</strong> is the house rules. <strong>Skills</strong> are the playbook. <strong>MCP servers</strong> are the hands." },

      { type: "h", text: "Forge your /listing slash command" },
      { type: "p", text: "A Skill is a folder at <code>.claude/skills/listing/</code> with a <code>SKILL.md</code> inside. Once it exists, you type <code>/listing</code> and Claude runs the whole playbook. Build yours now:" },
      { type: "forge", forgeId: "listing" },

      { type: "h", text: "Run the engine on a real property" },
      { type: "prompt", label: "Test your /listing command", code: `/listing 2257 Egret Cove, 3BR/3BA, 1,840 sqft, $725,000. Standout features: golf course view, primary suite with sitting room, chef's kitchen with quartz waterfall island, screened patio, two-car garage.` },

      { type: "h", text: "The 8-hour listing marketing killer (the math)" },
      { type: "p", text: "Hours per listing without the engine: 8–12. With the engine: under 0.5. If you list 30 properties a year, the recovered time alone is 240+ hours — six full work-weeks, every year, back in your calendar. That's the bandwidth to take 10 more listings without hiring anyone." },

      { type: "quiz", id: "q2.1", title: "Listing Engine Quiz", questions: [
        {
          q: "A Skill is technically what on disk?",
          options: [
            "A single text file in your Downloads folder",
            "A folder containing a SKILL.md file with YAML frontmatter + markdown body",
            "An entry in your CRM",
            "A node_modules package",
          ],
          correct: 1,
          explain: "Skills are folders. Each holds a SKILL.md whose frontmatter has at minimum <code>name</code> and <code>description</code>. The markdown body is the playbook Claude follows when triggered.",
        },
        {
          q: "Why does Anthropic recommend a slightly \"pushy\" description in the SKILL.md frontmatter?",
          options: [
            "It scores higher on Google",
            "Claude tends to under-trigger skills — explicit phrasings (\"use when the user says X, Y, or Z\") help it fire reliably",
            "It looks more professional",
            "Required for the App Store",
          ],
          correct: 1,
          explain: "Anthropic explicitly notes that Claude tends to under-trigger skills. List the exact phrasings that should trigger it; tighten with \"do not use for X\" if needed.",
        },
        {
          q: "Edmund's tagline: \"Prompts are conversations. CLAUDE.md is ____. Skills are the playbook.\"",
          options: ["The novel", "The house rules", "The agent's license", "The MLS"],
          correct: 1,
          explain: "CLAUDE.md = house rules. It's what's true for this project, always. Skills = the playbook. The reusable named workflows you run repeatedly.",
        },
      ]},
    ],
  },

  /* ---------- L2.2 ---------- */
  {
    id: "2.2",
    title: "The Client Communication System — /lead",
    duration: "16 min · hands-on",
    xp: 120,
    badge: "follow_up_finisher",
    objectives: [
      "Internalize the speed-to-lead and touch-count benchmarks",
      "Build the 7-touch nurture cadence as a /lead slash command",
      "Run /lead against a sample warm lead from your sphere",
    ],
    blocks: [
      { type: "hero", eyebrow: "Episode 2 · Lesson 2", title: "Top 50+/year agents follow up 12× before quitting. Everyone else quits at 1.3." },
      { type: "h", text: "The conversion math most agents ignore" },
      { type: "table", headers: ["Benchmark", "Average agent", "Top 1%"], rows: [
        ["Speed to lead", "917 minutes", "<5 minutes (21× more likely to qualify)"],
        ["Touches before quitting", "1.3", "12+"],
        ["Lead → appointment rate", "0.4–1.2%", "3–5% (solo); 5–7% (team + ISA + AI)"],
        ["Follow-up time per contact", "5 minutes (manual)", "30 seconds (with /lead)"],
      ]},
      { type: "p", text: "Speed alone explains a 391% conversion lift (Luxury Presence) — agents who respond inside one minute beat agents who respond at 30 minutes by an order of magnitude. The hard part isn't speed for one lead. It's speed for fifty leads. That's the bottleneck a slash command breaks." },

      { type: "h", text: "The A-B-C-D triage model" },
      { type: "ul", items: [
        "<strong>A — actively transacting in &lt;30 days.</strong> Daily contact.",
        "<strong>B — 1–3 months out.</strong> Every 3–5 days.",
        "<strong>C — 3–6 months out.</strong> Every 2–4 weeks.",
        "<strong>D — 6–12+ months.</strong> Monthly nurture.",
      ]},

      { type: "h", text: "Forge your /lead slash command" },
      { type: "forge", forgeId: "lead" },

      { type: "h", text: "Run it on a real warm lead" },
      { type: "prompt", label: "Test your /lead command", code: `/lead Sarah Mitchell. Last interaction: showed her 3BR Boca homes Saturday, she liked Royal Palm but worried about HOA. Looking for: 3BR under $850K, good schools. Urgency: warm.` },

      { type: "quiz", id: "q2.2", title: "Communication Quiz", questions: [
        {
          q: "Published Luxury Presence data shows what conversion lift for responding inside one minute?",
          options: ["+25%", "+95%", "+391%", "+1,200%"],
          correct: 2,
          explain: "+391%. RealScout's separate data shows responding inside 5 minutes makes you 21× more likely to qualify than waiting 30 minutes. Speed is the single biggest free conversion lever.",
        },
        {
          q: "Your CRM has 18,000 dormant contacts from years past. Realistic Claude Code workflow?",
          options: [
            "Pretend they don't exist",
            "Hand them all to a VA",
            "Run /lead in batch over a tagged CSV — draft personalized re-engagement texts for each",
            "Mail handwritten cards to 18,000 people",
          ],
          correct: 2,
          explain: "Database reactivation is one of the highest-leverage Claude Code workflows. There's a public case study of a Keller Williams team doing exactly this on 18,000 dormant contacts and booking real appointments.",
        },
      ]},
    ],
  },

  /* ---------- L2.3 ---------- */
  {
    id: "2.3",
    title: "The Content Multiplication Machine — /content",
    duration: "16 min · hands-on",
    xp: 120,
    badge: "content_baron",
    objectives: [
      "Understand why algorithms reward frequency × engagement",
      "Build /content to multiply one idea across 5 platforms",
      "Generate a full content week from one Boca market stat",
    ],
    blocks: [
      { type: "hero", eyebrow: "Episode 2 · Lesson 3", title: "Cancel the $3,000/month marketing agency. The machine doesn't sleep." },
      { type: "p", text: "Instagram, Facebook, LinkedIn, TikTok, YouTube — every algorithm rewards two things: <strong>frequency</strong> and <strong>engagement</strong>. Agents who post 5 high-quality posts per week dominate agents who post 1. There is no third option." },
      { type: "p", text: "Most agents can produce one great post a week. They can't produce five because each one requires fresh research, writing, per-platform formatting, hashtag research, and scheduling. Eight hours for one weekly idea. That's why most quit consistent posting inside 90 days." },
      { type: "p", text: "The multiplier inverts the math. One strong idea in. Five platform-native versions out. Eight hours becomes twenty minutes. Frequency goes up. Quality stays high. The algorithm rewards you." },

      { type: "h", text: "Forge your /content slash command" },
      { type: "forge", forgeId: "content" },

      { type: "h", text: "Run it on this week's actual market data" },
      { type: "prompt", label: "Test your /content command", code: `/content Boca Raton single-family median price hit $1.85M in April, up 6.2% YoY. Inventory still 32% below 2019 levels. Implications for sellers and buyers heading into summer.` },

      { type: "callout", tone: "", title: "Lock-in question", text: "What's the one weekly insight you have that NO other agent in your market is sharing? Build the content machine around <em>that</em>. The volume is the unfair advantage; the angle is the moat." },

      { type: "quiz", id: "q2.3", title: "Content Machine Quiz", questions: [
        {
          q: "What two things do all major social algorithms reward?",
          options: [
            "Hashtags and emojis",
            "Frequency and engagement",
            "Paid ads and reels",
            "Followers and verification",
          ],
          correct: 1,
          explain: "Frequency × engagement. The multiplication machine wins on frequency without sacrificing the quality that drives engagement.",
        },
        {
          q: "If you produce one strong idea per week and your machine multiplies across 5 platforms, your monthly content output is:",
          options: ["5 posts", "12 posts", "20 posts", "60 posts"],
          correct: 2,
          explain: "1 idea × 5 platforms × ~4 weeks = 20 posts/month. Most solo agents produce 4. That gap is what \"owning your local algorithm\" looks like in raw arithmetic.",
        },
      ]},
    ],
  },

  /* ---------- L2.4 ---------- */
  {
    id: "2.4",
    title: "BOSS MISSION — Ship a complete Boca Raton listing kit",
    duration: "25 min · boss fight",
    xp: 300,
    badge: "listing_machine",
    isBoss: true,
    objectives: [
      "Hit every objective inside 25 minutes",
      "Use /listing, /content, and /lead together on one real scenario",
      "Submit your kit to earn the Listing Machine badge",
    ],
    blocks: [
      { type: "hero", eyebrow: "Episode 2 · Boss Mission", title: "The Boca Boss Mission" },
      { type: "callout", tone: "danger", title: "Scenario", text: "It's Monday morning. You just got a luxury listing at <strong>2257 Egret Cove, Boca Raton</strong> — 3BR/3BA Baywinds condo with golf views, $725,000. The seller signs at noon. You need a complete launch package by 5 PM. Six deliverables. One boss mission. Go." },
      { type: "boss" },
    ],
  },
];

/* =============================================================
   EPISODE 3 — POWER PLAYS
   ============================================================= */
const EP3_LESSONS = [
  /* ---------- L3.1 ---------- */
  {
    id: "3.1",
    title: "Custom Skills — beyond slash commands",
    duration: "18 min",
    xp: 150,
    badge: "skill_builder",
    objectives: [
      "Understand the Skill anatomy and progressive disclosure model",
      "Use skill-creator to build a CMA Generator interactively",
      "Know which Skills belong in the Bogen team library",
    ],
    blocks: [
      { type: "hero", eyebrow: "Episode 3 · Lesson 1", title: "The killer feature: progressive disclosure." },
      { type: "p", text: "At session start, only the <em>name</em> and <em>description</em> of every installed Skill is loaded into Claude's context. Cheap. When triggered, the full SKILL.md body loads. Linked reference files load only on demand. That's why a real estate agent can install 30 Skills (CMA Generator, Lead Follow-Up, Condo Doc Reviewer, Open House Sequence, etc.) without slowing Claude down — only the relevant Skill loads for each conversation." },

      { type: "h", text: "Where Skills live on disk" },
      { type: "ul", items: [
        "<strong>Personal/global</strong> — available everywhere on your machine: <code>~/.claude/skills/&lt;name&gt;/SKILL.md</code>",
        "<strong>Project</strong> — only loaded in that folder: <code>&lt;project&gt;/.claude/skills/&lt;name&gt;/SKILL.md</code>",
        "<strong>Plugin</strong> — installed via Claude Code's plugin system, packaged as <code>.skill</code> files.",
      ]},

      { type: "h", text: "The first Skill every student should build: skill-creator" },
      { type: "p", text: "Anthropic ships a meta-Skill called <code>skill-creator</code> in the public repo at <code>github.com/anthropics/skills</code>. The intended workflow:" },
      { type: "ol", items: [
        "Install <code>skill-creator</code> into <code>~/.claude/skills/</code>",
        "In Claude Code, say: \"Use the skill-creator skill to build me a new skill that does X.\"",
        "It interviews you, writes the SKILL.md, packages it, and even generates 20 \"should trigger / shouldn't trigger\" evaluation queries to test the description.",
      ]},

      { type: "h", text: "The Bogen Team Skill library (build these in order)" },
      { type: "ul", items: [
        "<strong>cma-generator</strong> — reads subject + comps, applies adjustments, produces a branded CMA PDF.",
        "<strong>lead-followup</strong> — triages A/B/C/D, drafts the 7-touch sequence, logs activity.",
        "<strong>listing-description</strong> — your /listing engine promoted to a full Skill with VOICE.md auto-load.",
        "<strong>buyer-presentation</strong> — turns buyer criteria into a 10-slide deck outline.",
        "<strong>transaction-tracker</strong> — extracts every dated obligation from executed contract → Gantt + weekly digest.",
        "<strong>weekly-market-report</strong> — last week's MLS CSV → 1-page PDF + 250-word email + IG caption.",
      ]},

      { type: "callout", tone: "danger", title: "Skill security", text: "Anthropic's note: \"Treat like installing software. Only use Skills from trusted sources.\" Before installing any community Skill, audit the SKILL.md and any referenced scripts. A malicious Skill is just a malicious shell script with a friendly name." },

      { type: "quiz", id: "q3.1", title: "Skills Quiz", questions: [
        {
          q: "What loads into Claude's context at session start when you have 30 Skills installed?",
          options: [
            "All 30 SKILL.md bodies (slow, expensive)",
            "Only the name + description of each Skill",
            "Nothing — Skills load on first message",
            "The first Skill alphabetically",
          ],
          correct: 1,
          explain: "Progressive disclosure: only names and descriptions at startup. Body loads when triggered. Reference files load on demand. This is what makes a large Skill library viable.",
        },
        {
          q: "Where do personal/global Skills live on Mac?",
          options: [
            "<code>/Applications/Claude/Skills</code>",
            "<code>~/.claude/skills/&lt;name&gt;/SKILL.md</code>",
            "<code>~/Documents/Claude/Skills</code>",
            "<code>/etc/claude/skills</code>",
          ],
          correct: 1,
          explain: "Personal Skills always live in <code>~/.claude/skills/</code>. Project-specific Skills live at <code>&lt;project&gt;/.claude/skills/</code>.",
        },
        {
          q: "Which is the highest-leverage <em>first</em> Skill to install?",
          options: [
            "<code>cma-generator</code>",
            "<code>skill-creator</code> — because it builds every subsequent Skill <em>for</em> you",
            "<code>weekly-market-report</code>",
            "<code>listing-description</code>",
          ],
          correct: 1,
          explain: "skill-creator is a meta-Skill. Install it once and it interviews you to build every subsequent Skill — including writing tested trigger descriptions. The single highest-leverage 20 minutes in Episode 3.",
        },
      ]},
    ],
  },

  /* ---------- L3.2 ---------- */
  {
    id: "3.2",
    title: "MCP integrations — Gmail, Calendar, Property data",
    duration: "20 min",
    xp: 160,
    badge: "mcp_pioneer",
    objectives: [
      "Understand what MCP is (\"USB-C for AI\") and why it changes everything",
      "Connect Gmail and Google Calendar MCP servers safely",
      "Know the honest MLS/property-data landscape and what's actually possible",
    ],
    blocks: [
      { type: "hero", eyebrow: "Episode 3 · Lesson 2", title: "Prompts are conversations. Skills are the playbook. MCP is the hands." },
      { type: "p", text: "MCP (Model Context Protocol) is the open standard that lets any AI app connect to any tool through one protocol. The community quote is now standard: <strong>\"MCP is USB-C for AI.\"</strong>" },
      { type: "p", text: "For agents, the punchline: MCP is what takes Claude Code from \"writes great emails\" to <em>sends them</em>, and from \"drafts the showing schedule\" to <em>books the appointments</em>." },

      { type: "h", text: "Adding an MCP server (general pattern)" },
      { type: "prompt", label: "Three commands you'll use most", code: `# add a server\nclaude mcp add <name> --transport <stdio|http> "<command-or-url>"\n\n# list servers + status\nclaude mcp list\n\n# manage / authenticate from inside Claude\n/mcp` },

      { type: "h", text: "Gmail + Calendar — the two everyone wants" },
      { type: "p", text: "Two real paths for Gmail: Google's official Workspace MCP servers (requires a Google Cloud project + Gmail/Calendar APIs + OAuth), or community servers like <code>GongRzhe/Gmail-MCP-Server</code> (simpler to spin up for individuals). Composio is a managed third option that wraps both behind one URL." },

      { type: "callout", tone: "danger", title: "MCP security — three rules", text: "1) <strong>Read the tool list before authorizing.</strong> If a \"weather\" server suddenly exposes <code>delete_file</code>, abort.<br>2) <strong>Treat incoming content as adversarial.</strong> A malicious email could contain prompt injection telling Claude to forward all messages elsewhere. Don't auto-execute MCP actions based on content you haven't reviewed.<br>3) <strong>Minimum-necessary scopes.</strong> Start read-only. Promote to write only after the workflow is proven." },

      { type: "h", text: "The MLS / property data honest reality check" },
      { type: "p", text: "<strong>There is no official MLS MCP server, and there won't be one any time soon.</strong> RESO Web API licensing restricts redistribution, persistent storage, and AI training on MLS data. What actually exists today:" },
      { type: "table", headers: ["Tool", "What it gives you", "Honest take"], rows: [
        ["Zillow MCP via Apify", "Listings, property details, Zestimates", "Best for buyer-side research. ToS-aware. ~$2/1,000 results."],
        ["sap156/zillow-mcp-server", "Open-source, Zillow Bridge API", "Tinkering tier. 1,000 req/day."],
        ["Bright Data MCP", "General web fetch for public listings", "Strong infra. Subject to source ToS."],
        ["ATTOM Data API", "Property records, tax, transactions, AVM", "Enterprise feed. Custom MCP wrapper: ~10–40 lines Python with FastMCP."],
        ["County appraiser sites", "Authoritative tax + ownership data", "Florida is one of the best states for open county data."],
        ["Your own RESO Web API feed", "Full MLS, legitimately licensed", "Right long-term answer for a team. $3-10K to wrap as MCP, $50-200/mo hosting."],
      ]},

      { type: "callout", tone: "", title: "Recommendation for the Bogen Team", text: "<strong>Tier 1 (every agent):</strong> Zillow-via-Apify MCP for fast public comps.<br><strong>Tier 2 (you):</strong> A custom MCP wrapper on Palm Beach County appraiser data. ~1 hour build. Free moat.<br><strong>Tier 3 (Install clients):</strong> A custom RESO Web API MCP on the team's existing IDX/VOW feed. Almost no one else has this." },

      { type: "quiz", id: "q3.2", title: "MCP Quiz", questions: [
        {
          q: "Plain-English definition of MCP?",
          options: [
            "A new programming language",
            "USB-C for AI — an open standard that lets any AI connect to any tool through one protocol",
            "A type of API key",
            "Claude's billing system",
          ],
          correct: 1,
          explain: "MCP (Model Context Protocol) is the open standard. The community shorthand \"USB-C for AI\" has stuck because it nails the idea: one connector type, many devices.",
        },
        {
          q: "Worst Gmail MCP onboarding move?",
          options: [
            "Start with <code>gmail.readonly</code> + <code>create_draft</code>",
            "Audit which tools the server exposes before authorizing",
            "Grant full <code>https://mail.google.com/</code> scope on day one with auto-send enabled",
            "Run the official Google MCP server",
          ],
          correct: 2,
          explain: "Minimum-necessary scopes. Start read-only + draft. Promote to send only after the workflow is proven. Auto-send + prompt injection in an incoming email is the most-documented MCP horror story.",
        },
        {
          q: "Why is there no \"drop-in\" MCP server for all 600+ MLSs?",
          options: [
            "Anthropic hasn't built it yet",
            "RESO Web API licensing restricts redistribution, persistent storage, and AI training on MLS data per-MLS",
            "MLS data is too large",
            "Nobody wants one",
          ],
          correct: 1,
          explain: "MLS data is governed by per-MLS RESO licensing — and most of those licenses explicitly restrict the things an MCP server does. The clean path is a custom wrapper on your <em>own</em> licensed feed.",
        },
      ]},
    ],
  },

  /* ---------- L3.3 ---------- */
  {
    id: "3.3",
    title: "ROI tracking — measure to the dollar",
    duration: "12 min",
    xp: 80,
    badge: "roi_realist",
    objectives: [
      "Run the recovered-GCI formula for your own business",
      "Internalize the published industry benchmarks",
      "Track six monthly KPIs from your first week",
    ],
    blocks: [
      { type: "hero", eyebrow: "Episode 3 · Lesson 3", title: "Most agents stop at \"feels productive.\" Top 1% measure to the dollar." },
      { type: "h", text: "The formula" },
      { type: "callout", tone: "", title: "Recovered GCI", text: "<strong>(hours saved per week × hourly opportunity cost × 52) − (tool + implementation cost)</strong><br><br>For a luxury Florida agent doing $25M volume at 2.5% commission = $625K GCI on 2,000 working hours = <strong>$313/hour opportunity cost</strong>. Even 3 hours/week saved = <strong>~$48,000/year</strong> of recovered capacity per agent." },

      { type: "h", text: "Run it on your business" },
      { type: "roiCalc" },

      { type: "h", text: "Six KPIs to track monthly" },
      { type: "table", headers: ["KPI", "Pre-AI benchmark", "Goal post-AI"], rows: [
        ["Lead → appointment rate", "0.4–1.2%", "3–5% solo, 5–7% team"],
        ["CMA turnaround", "24–72 hours", "&lt;60 minutes"],
        ["Listing-to-active days", "3–7 days", "1–2 days"],
        ["Email response time", "917 minutes (avg)", "&lt;5 minutes"],
        ["Touches per lead in first 30 days", "1–2", "7–9 (NAR-recommended)"],
        ["Listings won per buyer/seller conversation", "1 in 11 (Mackin)", "1 in 5–7 (with AI prep)"],
      ]},

      { type: "h", text: "Troubleshooter game — diagnose three real bugs" },
      { type: "p", text: "Pick the symptom you'd run into in your first 30 days. Click through to the fix." },
      { type: "troubleshooter" },
    ],
  },

  /* ---------- L3.4 ---------- */
  {
    id: "3.4",
    title: "Graduation — your 30-day profit plan",
    duration: "10 min",
    xp: 200,
    badge: "certified",
    isFinal: true,
    objectives: [
      "Sign your Profit Commitment Contract",
      "Generate your Certified Operator certificate",
      "Download your prompt vault for offline use",
    ],
    blocks: [
      { type: "hero", eyebrow: "Episode 3 · Graduation", title: "Closing manifesto" },
      { type: "callout", tone: "", title: "Read this out loud", text: "\"While my competitors debate whether AI will replace them, I'm using it to replace their market share. Claude Code doesn't make me lazy — it makes me unstoppable. Every hour I save is an hour I spend building relationships, creating strategy, and growing my income. This is my competitive weapon, and I will master it.\"" },

      { type: "h", text: "Your 30-day stack" },
      { type: "p", text: "Week 1: Install + first wins. Week 2: CLAUDE.md + voice profile. Week 3: /listing, /lead, /content live. Week 4: ROI measurement. These weeks aren't independent — they compound. Skip a week and the stack breaks. Stay on it and the leverage compounds for the rest of your career." },

      { type: "h", text: "Sign your commitment" },
      { type: "contract" },

      { type: "h", text: "Claim your certificate" },
      { type: "cert" },
    ],
  },
];

const EPISODES = [
  {
    id: "ep1",
    num: 1,
    title: "Foundations",
    subtitle: "How realtors run their business from the terminal",
    date: "Thursday, May 14, 2026",
    color: "var(--cyan)",
    summary: "Install Claude Code, master the C·T·F·C prompting framework, and build your AI a memory with CLAUDE.md.",
    lessons: EP1_LESSONS,
  },
  {
    id: "ep2",
    num: 2,
    title: "Daily Real Estate Work",
    subtitle: "Run your listing business from a single terminal window",
    date: "Thursday, June 11, 2026",
    color: "var(--gold)",
    summary: "Forge the three slash commands that compress 60-hour weeks into 20: /listing, /lead, /content. Then beat the Boca Boss Mission.",
    lessons: EP2_LESSONS,
  },
  {
    id: "ep3",
    num: 3,
    title: "Power Plays",
    subtitle: "Skills, MCP, ROI, and scale",
    date: "Thursday, July 9, 2026",
    color: "var(--purple)",
    summary: "Custom Skills, MCP servers (Gmail, Calendar, property data), real-money ROI tracking, and your graduation certificate.",
    lessons: EP3_LESSONS,
  },
];

/* =============================================================
   CTFC drag-build chips (for Lesson 1.3)
   ============================================================= */
const CTFC_CHIPS = [
  { kind: "context", text: "You're writing for a luxury Boca Raton agent (read voice.md)." },
  { kind: "task", text: "Write a 120-word listing description for 2257 Egret Cove." },
  { kind: "context", text: "It's a 3BR/3BA Baywinds condo with golf views, primary suite with sitting room, and chef's kitchen." },
  { kind: "format", text: "One paragraph. Lead with the most distinctive feature. End with a sensory detail." },
  { kind: "constraints", text: "Fair Housing compliant. No 'spacious,' 'must-see,' or 'perfect for families.' Match the style in voice.md." },
  { kind: "decoy", text: "Make it shorter than 50 words." },
  { kind: "decoy", text: "Use lots of emojis 🏠🌴☀️" },
  { kind: "decoy", text: "Mention what religion the neighborhood is known for." },
];
const CTFC_SLOTS = ["context", "task", "format", "constraints"];
const CTFC_SLOT_LABELS = {
  context: "CONTEXT — Who/what/where",
  task: "TASK — What to produce",
  format: "FORMAT — How it should look",
  constraints: "CONSTRAINTS — What to avoid/include",
};

/* =============================================================
   FORGE templates — slash command builder per lesson
   ============================================================= */
const FORGES = {
  listing: {
    title: "/listing — the listing production engine",
    fields: [
      { id: "voice", label: "Voice profile path", type: "text", placeholder: "voice-profile.md", default: "voice-profile.md" },
      { id: "wordsMls", label: "MLS description word target", type: "number", default: 275 },
      { id: "wordsPublic", label: "Public-facing description words", type: "number", default: 120 },
      { id: "hashtags", label: "Instagram hashtag count", type: "number", default: 8 },
      { id: "brand", label: "Brand for footer", type: "text", default: "The Edmund Bogen Team · Douglas Elliman" },
    ],
    outputs: [
      "MLS-ready description",
      "Public-facing description",
      "Instagram caption",
      "Facebook post",
      "Just-listed SMS",
      "Email subject + body",
      "5 ad headline variants",
    ],
    template: (f) => `---
name: listing
description: Use when the user types /listing, asks for a listing kit, marketing kit, MLS description, just-listed post, or property launch package. Reads property details from the input and produces all marketing assets in the user's voice.
---

# /listing — The Edmund Bogen Team Listing Production Engine

## Inputs (the user provides on the same line)
property address, beds, baths, sqft, list price, 3–5 standout features.

## Read first
- ${f.voice} — match this voice on every output.
- VOICE.md if it exists in the project root (override).

## Outputs (produce all, in this order)
1. **MLS-ready description** — ${f.wordsMls} words. Neutral, factual, no superlatives, Florida MLS-compliant.
2. **Public-facing description** — ${f.wordsPublic} words, no jargon, evocative but accurate.
3. **Instagram caption** — 50 words + ${f.hashtags} hashtags + soft CTA ("DM for the full package").
4. **Facebook post** — 100–150 words, story-driven.
5. **Just-listed SMS** — 3 lines for buyer prospects.
6. **Email blast** — subject line + 100-word body.
7. **Five ad headlines** — for A/B testing.

## Guardrails — strict
- Use only facts the user provided. Do NOT invent square footage, views, finishes, schools, or distances.
- **Fair Housing.** No language referencing or implying race, color, national origin, religion, sex, disability, familial status, or age. Avoid "perfect for families," "great for retirees," "safe neighborhood," "walking distance to church."
- No "must-see," "spacious," or empty superlatives unless objectively verifiable from inputs.
- If a critical detail is missing, ask before guessing.

## Output file
Save the full kit as \`[property-address-slug]-marketing-kit.md\` in the working folder.

## Footer
End every kit with: \`${f.brand}\`
`,
  },
  lead: {
    title: "/lead — the 7-touch communication system",
    fields: [
      { id: "voice", label: "Voice profile path", type: "text", default: "voice-profile.md" },
      { id: "touches", label: "Default touch count", type: "number", default: 7 },
      { id: "responseTime", label: "First-touch SLA (minutes)", type: "number", default: 5 },
    ],
    outputs: [
      "A/B/C/D triage",
      "Text follow-up (3-4 sentences)",
      "Longer email follow-up with one market insight",
      "CRM note (Date | Action | Next Step)",
      "Voicemail script if no reply in 48h",
    ],
    template: (f) => `---
name: lead
description: Use when the user mentions a new lead, an old lead, lead nurture, drip campaign, follow-up sequence, reactivation, cold lead revival, or asks "what should I say to [name]?" Triages the lead and drafts every follow-up touch.
---

# /lead — The Edmund Bogen Team Communication System

## Inputs
contact name, last interaction summary (1–2 sentences), what they're looking for, urgency (cold/warm/hot).

## Read first
- ${f.voice}

## Triage (A/B/C/D)
- A: actively transacting <30 days → daily
- B: 1–3 months → every 3–5 days
- C: 3–6 months → every 2–4 weeks
- D: 6–12+ months → monthly nurture

## Outputs (produce ALL, matching voice)
1. **Text follow-up** — 3–4 sentences, casual, references something specific from the interaction.
2. **Email version** — longer, value-add, includes ONE specific market insight relevant to their search.
3. **CRM note** — "Date | Action | Next Step | Suggested Follow-up Date"
4. **Voicemail script** — for if no response in 48 hours.

## ${f.touches}-touch sequence (compress for A, stretch for C/D)
- Touch 1 — within ${f.responseTime} minutes of inquiry. SMS + email confirming receipt + ONE qualifying question.
- Touch 2 — day 1 evening. Voicemail + value email (3 matching listings).
- Touch 3 — day 3. Market insight specific to their target area.
- Touch 4 — day 7. Video update or neighborhood guide.
- Touch 5 — day 14. Direct check-in: "Still actively looking?" with yes/no/later.
- Touch 6 — day 21. New-listing or price-drop alert.
- Touch 7 — day 30. "Moving you to my monthly market list unless you want more frequent updates."

## Guardrails
- No "Hi [FirstName]" template feel. Personalize every touch.
- Fair Housing — no language about families, retirees, kids, schools as selling points.

## Output
Save as \`[contact-name-slug]-followup.md\` and log each touch to \`leads/[contact-name-slug].log\`.
`,
  },
  content: {
    title: "/content — the content multiplication machine",
    fields: [
      { id: "voice", label: "Voice profile path", type: "text", default: "voice-profile.md" },
      { id: "platforms", label: "Platforms (comma-sep)", type: "text", default: "Instagram, Facebook, LinkedIn, YouTube, Email, X/Twitter" },
    ],
    outputs: [
      "Instagram caption + 12 hashtags",
      "Facebook story-driven post",
      "LinkedIn insight-led post (200-250 words)",
      "YouTube Community post + 60-sec video script",
      "Email newsletter subject + body",
      "Twitter/X thread (4-6 tweets)",
    ],
    template: (f) => `---
name: content
description: Use when the user types /content, asks for content multiplication, a content week, a content sprint, social posts, or to turn one idea into many posts. Multiplies a single content idea across all platforms.
---

# /content — The Edmund Bogen Team Content Multiplication Machine

## Input
One strong content idea (1–2 sentences) + optional supporting data or links.

## Read first
- ${f.voice}

## Platforms (rotate as needed; default order)
${f.platforms.split(",").map((p, i) => `${i + 1}. ${p.trim()}`).join("\n")}

## Outputs (produce ALL, voice-matched, platform-native)
1. **Instagram caption** — ~100 words + 12 hashtags + soft CTA.
2. **Facebook post** — story-driven, 150–200 words.
3. **LinkedIn post** — insight-led, 200–250 words, professional tone.
4. **YouTube Community post** + 60-second video script.
5. **Email newsletter** — subject line + 200-word body.
6. **Twitter/X thread** — 4–6 tweets, each standalone-strong.

## Guardrails
- Fair Housing on every post.
- Cite the data source if the idea references stats.
- No emojis on LinkedIn; tasteful emojis OK on IG/FB.

## Output
Save as \`content-[topic-slug]-[YYYY-MM-DD].md\`.
`,
  },
};

/* =============================================================
   Boss mission objectives (Lesson 2.4)
   ============================================================= */
const BOSS = {
  scenario: "Property: 2257 Egret Cove, Boca Raton · 3BR/3BA Baywinds condo · Golf views · Chef's kitchen · $725,000 · Listing signs at noon.",
  steps: [
    {
      id: "b1",
      label: "Run /listing on the property and review all 7 outputs",
      kind: "checkbox",
      hint: "You don't have to produce real copy here — confirm you'd run the engine and review.",
    },
    {
      id: "b2",
      label: "Pick the one Instagram caption you'd ship — which sensory detail leads?",
      kind: "input",
      placeholder: "e.g. 'morning light on the fairway' or 'the kitchen island'",
    },
    {
      id: "b3",
      label: "Identify a Fair Housing violation in this draft caption",
      kind: "mcq",
      question: "Which line in this draft Instagram caption MUST be cut before publication?",
      options: [
        "Wake up to the fairway. Quartz-waterfall kitchen, primary with sitting room.",
        "Perfect home for young families who love good schools nearby.",
        "DM for the full package — 2257 Egret Cove is live.",
        "Three bedrooms, two and a half baths, 1,840 sq ft.",
      ],
      correct: 1,
      explain: "\"Perfect home for young families\" implies familial status — a Fair Housing violation. \"Good schools nearby\" makes it worse. Both must come out.",
    },
    {
      id: "b4",
      label: "Run /content with this week's market insight: Boca SFH median = $1.85M, +6.2% YoY",
      kind: "checkbox",
    },
    {
      id: "b5",
      label: "Pull 5 sphere contacts and run /lead on each — name your top one",
      kind: "input",
      placeholder: "e.g. Sarah Mitchell · saw 3BR Boca Saturday · worried about HOA",
    },
    {
      id: "b6",
      label: "Set the 30-day Profit Plan trigger: when will you measure?",
      kind: "input",
      placeholder: "Date 30 days from today",
    },
  ],
};

/* =============================================================
   Mission-of-the-day (rotated per dashboard load)
   ============================================================= */
const DAILY_MISSIONS = [
  { icon: "💡", title: "Run /listing on your most recent property", desc: "Pick a real address. Take 5 minutes. Ship one IG caption." },
  { icon: "📲", title: "Run /lead on three sphere contacts you haven't touched in 30+ days", desc: "Three personalized texts. Send before lunch." },
  { icon: "📣", title: "Run /content on one Boca market stat you saw this week", desc: "Multiply across IG, FB, LinkedIn. 20 minutes max." },
  { icon: "🩺", title: "Run /doctor inside Claude Code", desc: "Fix the warnings now, not when something breaks at 11pm." },
  { icon: "📝", title: "Add 'Active Listings' and 'Active Buyers' sections to CLAUDE.md", desc: "Re-read your context. Tighten it." },
];

/* =============================================================
   Troubleshooter decision tree
   ============================================================= */
const TROUBLE_TREE = {
  root: {
    question: "What's actually happening?",
    options: [
      { label: "<code>command not found: claude</code> after install", next: "n1" },
      { label: "<code>'claude' is not recognized</code> on Windows", next: "n2" },
      { label: "Skill never triggers when I expect it to", next: "n3" },
      { label: "MCP server shows ❌ in <code>claude mcp list</code>", next: "n4" },
      { label: "Authenticated to Gmail but \"no tools available\"", next: "n5" },
      { label: "Browser doesn't open for OAuth", next: "n6" },
    ],
  },
  nodes: {
    n1: {
      title: "PATH issue on Mac/Linux",
      fix: `<p>Your new PATH entry didn't load into the current shell. Try these in order:</p>
<ol>
<li>Quit Terminal entirely (⌘Q) and reopen it. Type <code>claude --version</code>.</li>
<li>Still broken? Run <code>echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc && source ~/.zshrc</code></li>
<li>Confirm with <code>which claude</code> — should print a path.</li>
</ol>`,
    },
    n2: {
      title: "Windows PATH not set",
      fix: `<p><code>~\\.local\\bin</code> isn't in your user PATH. Fix:</p>
<ol>
<li>Press <span class="kbd">Win+R</span>, type <code>sysdm.cpl</code>, hit Enter.</li>
<li>Advanced tab → Environment Variables.</li>
<li>Under "User variables" select <strong>Path</strong> → Edit → New → paste <code>%USERPROFILE%\\.local\\bin</code></li>
<li>Restart PowerShell.</li>
</ol>`,
    },
    n3: {
      title: "Skill description too vague (or YAML broken)",
      fix: `<p>Two likely causes:</p>
<ol>
<li><strong>Description is too generic.</strong> Edit SKILL.md frontmatter and add the EXACT user phrasings that should trigger it ("Use when the user says /listing, marketing kit, or asks for a listing description"). Reload session.</li>
<li><strong>YAML is invalid.</strong> Frontmatter must open and close with <code>---</code> on their own lines. <code>name:</code> must match the folder name exactly. Validate.</li>
</ol>
<p>Run <code>/skills</code> inside Claude Code to see what's actually loaded.</p>`,
    },
    n4: {
      title: "MCP server failing — restart + reauth",
      fix: `<p>Quickest diagnostic chain:</p>
<ol>
<li><code>claude mcp list</code> — confirm status column.</li>
<li><code>claude mcp remove &lt;name&gt;</code> then <code>claude mcp add</code> with the exact transport + URL from the server's docs.</li>
<li>Inside Claude, type <code>/mcp</code> → pick the server → re-authenticate.</li>
<li>If still broken, run <code>/doctor</code> inside Claude.</li>
</ol>`,
    },
    n5: {
      title: "OAuth completed but tools missing — known bug",
      fix: `<p>This is the silent-fail OAuth bug documented in Anthropic issue #26917 and #52549.</p>
<ol>
<li>Inside Claude Code, type <code>/mcp</code>, select the server, <strong>re-authenticate</strong>.</li>
<li>If still broken, toggle the connector off, wait 2 minutes, toggle back on.</li>
<li>If <em>still</em> broken on Claude.ai web: try <code>claude mcp add --transport http &lt;url&gt;</code> from the CLI instead. The web Connector UI has a documented regression early 2026.</li>
</ol>`,
    },
    n6: {
      title: "Browser didn't open for OAuth",
      fix: `<p>Common on SSH/remote sessions, or when your default browser isn't configured.</p>
<ol>
<li>Look at the terminal — Claude prints a long URL. Hold <span class="kbd">⌘</span> (Mac) or <span class="kbd">Ctrl</span> (Win) and click it.</li>
<li>If that fails: copy the URL and paste into any browser already logged into claude.ai.</li>
</ol>`,
    },
  },
};
