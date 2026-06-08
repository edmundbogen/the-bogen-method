# Bogen Method — lead capture

Two paths get an enrollee into Edmund's world:

### 1. Instant email alert (real-time, automatic)
On every gate submit, `js/cloud.js → notifyLead()` POSTs to the Formspree
endpoint in `js/config.js` (`FORMSPREE_ENDPOINT`). You get an email at
**edmund@bogenhomes.com** the moment someone enrolls — subject
`🎓 New Bogen Method enrollee: <name>`, with email / brokerage / market / referrer.

Nothing to run. It just works once the site is deployed.

> TODO: `FORMSPREE_ENDPOINT` currently uses the shared `mlgavjvz` form
> (also used by Egret Cove + the AEO guide). Create a **dedicated** Bogen
> Method form in Formspree and swap the ID so leads don't mix.

### 2. Notion CRM sync + progress enrichment (durable, deduped)
`sync_enrollments_to_notion.py` does two things, deduped by email, safe to re-run:

1. **Enrollments → Prospects.** Every enrollee becomes a contact in the
   Bogen.ai + Mastermind **People** DB (Role = Prospect, Source = *Bogen Method*).
2. **Progress → score on the contact.** Pulls the `progress` table and writes
   each player's live course score onto their record:
   **Course XP · Course Level · Lessons Done · Course Status**
   (Enrolled / In Progress / Completed) **· Course Last Active**.

So a contact shows not just that they signed up, but how far they got — you can
filter Notion for "Completed" (hot) vs. stalled at Lesson 1. Re-running refreshes
scores for everyone.

```bash
export SUPABASE_SERVICE_KEY="..."   # Supabase → Settings → API → service_role (SECRET)
export NOTION_TOKEN="..."           # First_Claude_Code_Integration token
python3 scripts/sync_enrollments_to_notion.py --dry-run   # preview
python3 scripts/sync_enrollments_to_notion.py             # live
```

Why a service key? The public anon key in `config.js` is locked to
INSERT-only by RLS — it can't read the lead list. The service key can, and
must stay OUT of the repo (env var only).

**Schedule it** (so you never run it by hand): a daily GitHub Action with
`SUPABASE_SERVICE_KEY` + `NOTION_TOKEN` as repo secrets, or a local cron.
Ask Claude to "schedule the Notion enrollment sync" to set it up.
