/* =============================================================
   CONFIG — public Supabase credentials (anon key, safe to ship)
   ============================================================= */
const SUPABASE_URL = "https://ymudfrwpovekpupinjmt.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_74XKVNiTglA0SDR_MJZ2ww_Ku0JcGeL";

/* Row-level security restricts this key to insert/upsert only on
   public.enrollments, public.progress, public.events. No SELECT on
   the lead list — Edmund reads those via dashboard / service role. */

/* =============================================================
   LEAD CAPTURE — instant email alert on every enrollment.
   Formspree form ID is PUBLIC and safe to ship (it can only
   receive POSTs, never read submissions). Every signup emails
   edmund@bogenhomes.com the moment it happens.
   TODO: swap mlgavjvz for a DEDICATED Bogen Method endpoint so
   these leads don't mix with Egret Cove / AEO guide submissions.
   ============================================================= */
const FORMSPREE_ENDPOINT = "https://formspree.io/f/mlgavjvz";
