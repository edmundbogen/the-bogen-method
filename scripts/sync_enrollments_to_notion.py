#!/usr/bin/env python3
"""
sync_enrollments_to_notion.py
=============================
Syncs Bogen Method players from Supabase into the Bogen.ai + Mastermind
"People" CRM in Notion.

Two layers:
  1. ENROLLMENTS -> creates each player as a Prospect (Source = Bogen Method),
     deduped by email.
  2. PROGRESS    -> enriches each contact with their live course score:
     Course XP, Course Level, Lessons Done, Course Status, Course Last Active.

So opening a contact in Notion tells you not just that they signed up, but how
far they got — Level 6, 8/12 lessons, Completed, last active 3 days ago.

Idempotent and safe to re-run (the daily GitHub Action does exactly that).
Stdlib only. No pip install.

Required environment variables
------------------------------
  SUPABASE_SERVICE_KEY   Supabase *service_role* key (Dashboard -> Settings ->
                         API -> service_role). SECRET — never commit it.
  NOTION_TOKEN           Notion internal integration token.

Optional (sensible defaults baked in)
  SUPABASE_URL, NOTION_PEOPLE_DATABASE_ID, NOTION_PEOPLE_DATA_SOURCE_ID

Usage
-----
  export SUPABASE_SERVICE_KEY="..."
  export NOTION_TOKEN="..."
  python3 scripts/sync_enrollments_to_notion.py            # live
  python3 scripts/sync_enrollments_to_notion.py --dry-run  # preview, no writes
"""

import json
import os
import sys
import urllib.error
import urllib.request

SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://ymudfrwpovekpupinjmt.supabase.co")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")
NOTION_TOKEN = os.environ.get("NOTION_TOKEN", "")
NOTION_VERSION = "2025-09-03"

PEOPLE_DATABASE_ID = os.environ.get("NOTION_PEOPLE_DATABASE_ID", "896f07b7-f35f-4b07-879d-18213d8ba3d5")
PEOPLE_DATA_SOURCE_ID = os.environ.get("NOTION_PEOPLE_DATA_SOURCE_ID", "70893d88-c4d9-457b-8e54-7a2a7a0dbe83")

TOTAL_LESSONS = 12
DRY_RUN = "--dry-run" in sys.argv


def _req(url, headers, method="GET", body=None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            raw = r.read().decode()
            return r.status, (json.loads(raw) if raw else {})
    except urllib.error.HTTPError as e:
        return e.code, {"error": e.read().decode()}


# ----------------------------------------------------------------------------
# Supabase reads (service key required — anon key cannot SELECT)
# ----------------------------------------------------------------------------
def _supabase_get(path):
    if not SUPABASE_SERVICE_KEY:
        sys.exit("ERROR: SUPABASE_SERVICE_KEY is not set. Get the service_role key "
                 "from Supabase -> Settings -> API.")
    headers = {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
        "Accept": "application/json",
    }
    status, data = _req(f"{SUPABASE_URL}/rest/v1/{path}", headers)
    if status != 200:
        sys.exit(f"ERROR: Supabase read failed for {path} ({status}): {data}")
    return data


def fetch_enrollments():
    return _supabase_get("enrollments"
                         "?select=email,full_name,brokerage,market,created_at"
                         "&order=created_at.asc")


def fetch_progress():
    # progress table may not exist / be empty yet — tolerate that.
    if not SUPABASE_SERVICE_KEY:
        return []
    headers = {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
        "Accept": "application/json",
    }
    status, data = _req(
        f"{SUPABASE_URL}/rest/v1/progress"
        "?select=email,xp,level,streak,last_active_date,badges,lessons_completed,boss_won,certificate_earned,updated_at",
        headers,
    )
    return data if status == 200 else []


# ----------------------------------------------------------------------------
# Notion helpers
# ----------------------------------------------------------------------------
def _notion_headers():
    if not NOTION_TOKEN:
        sys.exit("ERROR: NOTION_TOKEN is not set.")
    return {
        "Authorization": f"Bearer {NOTION_TOKEN}",
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
    }


def notion_find_page(email):
    url = f"https://api.notion.com/v1/data_sources/{PEOPLE_DATA_SOURCE_ID}/query"
    body = {"filter": {"property": "Email", "email": {"equals": email}}, "page_size": 1}
    status, data = _req(url, _notion_headers(), method="POST", body=body)
    if status != 200:
        print(f"  ! Notion query failed for {email} ({status})")
        return "ERROR"
    results = data.get("results", [])
    return results[0]["id"] if results else None


def course_status(prog, lessons_done):
    if not prog:
        return "Enrolled"
    if prog.get("certificate_earned") or prog.get("boss_won") or lessons_done >= TOTAL_LESSONS:
        return "Completed"
    if (prog.get("xp") or 0) > 0 or lessons_done > 0:
        return "In Progress"
    return "Enrolled"


def progress_props(prog):
    """Course score properties. Empty dict if there's no progress row yet."""
    lessons = prog.get("lessons_completed") or []
    lessons_done = len(lessons) if isinstance(lessons, list) else 0
    props = {
        "Course Status": {"select": {"name": course_status(prog, lessons_done)}},
    }
    if prog:
        props["Course XP"] = {"number": prog.get("xp") or 0}
        props["Course Level"] = {"number": prog.get("level") or 1}
        props["Lessons Done"] = {"number": lessons_done}
        last = (prog.get("last_active_date") or (prog.get("updated_at") or "")[:10]) or None
        if last:
            props["Course Last Active"] = {"date": {"start": last}}
    return props


def create_contact(enr, prog):
    name = (enr.get("full_name") or "").strip() or "Unknown enrollee"
    email = (enr.get("email") or "").strip()
    date = (enr.get("created_at") or "")[:10] or None
    props = {
        "Name": {"title": [{"text": {"content": name}}]},
        "Email": {"email": email},
        "Role": {"multi_select": [{"name": "Prospect"}]},
        "Source": {"select": {"name": "Bogen Method"}},
        "Notes": {"rich_text": [{"text": {"content": "Enrolled in The Bogen Method course."}}]},
    }
    if enr.get("brokerage"):
        props["Company"] = {"rich_text": [{"text": {"content": enr["brokerage"]}}]}
    if enr.get("market"):
        props["Location"] = {"rich_text": [{"text": {"content": enr["market"]}}]}
    if date:
        props["First Contact"] = {"date": {"start": date}}
        props["Last Touch"] = {"date": {"start": date}}
    props.update(progress_props(prog))
    body = {"parent": {"type": "database_id", "database_id": PEOPLE_DATABASE_ID}, "properties": props}
    status, data = _req("https://api.notion.com/v1/pages", _notion_headers(), method="POST", body=body)
    return status == 200, data


def patch_contact(page_id, prog):
    props = progress_props(prog)
    body = {"properties": props}
    status, data = _req(f"https://api.notion.com/v1/pages/{page_id}", _notion_headers(),
                        method="PATCH", body=body)
    return status == 200, data


def main():
    enrollments = fetch_enrollments()
    progress = fetch_progress()
    prog_by_email = {(p.get("email") or "").strip().lower(): p for p in progress if p.get("email")}
    print(f"Supabase: {len(enrollments)} enrollment(s), {len(progress)} progress row(s).")

    created = enriched = skipped = failed = 0
    for enr in enrollments:
        email = (enr.get("email") or "").strip()
        if not email:
            skipped += 1
            continue
        prog = prog_by_email.get(email.lower())

        page_id = notion_find_page(email)
        if page_id == "ERROR":
            failed += 1
            continue

        if page_id is None:
            if DRY_RUN:
                created += 1
                print(f"  + WOULD create: {enr.get('full_name')} <{email}>  [{course_status(prog, len(prog.get('lessons_completed') or []) if prog else 0)}]")
                continue
            ok, data = create_contact(enr, prog)
            if ok:
                created += 1
                print(f"  + created: {enr.get('full_name')} <{email}>")
            else:
                failed += 1
                print(f"  ! create failed for {email}: {data}")
        else:
            # existing contact — refresh their course score
            if not prog:
                skipped += 1
                continue
            if DRY_RUN:
                enriched += 1
                print(f"  ~ WOULD enrich: <{email}>  XP={prog.get('xp')} Lvl={prog.get('level')}")
                continue
            ok, data = patch_contact(page_id, prog)
            if ok:
                enriched += 1
                print(f"  ~ enriched: <{email}>  XP={prog.get('xp')} Lvl={prog.get('level')} "
                      f"Lessons={len(prog.get('lessons_completed') or [])}")
            else:
                failed += 1
                print(f"  ! enrich failed for {email}: {data}")

    print(f"\nDone. created={created} enriched={enriched} skipped={skipped} failed={failed}"
          + ("  (dry run — no writes)" if DRY_RUN else ""))


if __name__ == "__main__":
    main()
