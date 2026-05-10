/* =============================================================
   CONFIG — public Supabase credentials (anon key, safe to ship)
   ============================================================= */
const SUPABASE_URL = "https://ymudfrwpovekpupinjmt.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_74XKVNiTglA0SDR_MJZ2ww_Ku0JcGeL";

/* Row-level security restricts this key to insert/upsert only on
   public.enrollments, public.progress, public.events. No SELECT on
   the lead list — Edmund reads those via dashboard / service role. */
