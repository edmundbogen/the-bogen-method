#!/usr/bin/env python3
"""
sync_enrollments_to_notion.py
=============================
Pulls Bogen Method enrollees out of Supabase and upserts them into the
Bogen.ai + Mastermind "People" CRM in Notion as Prospects (Source = Bogen Method).

This is the DURABLE capture path. The course page also fires an instant
Formspree email alert on every signup (real-time), but this script is the
one that lands every lead in Notion, deduped by email, safe to re-run.

NOT part of the deployed static site — this is an ops script. Run it on a
schedule (cron / GitHub Action) or by hand whenever you want to refresh the CRM.

Stdlib only. No pip install.

Required environment variables
------------------------------
  SUPABASE_SERVICE_KEY   Supabase *service_role* key (Dashboard → Settings →
                         API → service_role). SECRET — never commit it.
                         Needed because the public anon key cannot SELECT.
  NOTION_TOKEN           Notion internal integration token (the same
                         "First_Claude_Code_Integration" used by the MCP).

Optional (sensible defaults baked in)
  SUPABASE_URL                  default: the Bogen Method project URL
  NOTION_PEOPLE_DATABASE_ID     default: People DB
  NOTION_PEOPLE_DATA_SOURCE_ID  default: People data source

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

# Bogen.ai + Mastermind CRM → People
PEOPLE_DATABASE_ID = os.environ.get("NOTION_PEOPLE_DATABASE_ID", "896f07b7-f35f-4b07-879d-18213d8ba3d5")
PEOPLE_DATA_SOURCE_ID = os.environ.get("NOTION_PEOPLE_DATA_SOURCE_ID", "70893d88-c4d9-457b-8e54-7a2a7a0dbe83")

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
# Supabase — read every enrollment (service key can SELECT; anon key cannot)
# ----------------------------------------------------------------------------
def fetch_enrollments():
    if not SUPABASE_SERVICE_KEY:
        sys.exit("ERROR: SUPABASE_SERVICE_KEY is not set. Get the service_role key "
                 "from Supabase → Settings → API.")
    url = (f"{SUPABASE_URL}/rest/v1/enrollments"
           "?select=email,full_name,brokerage,market,created_at"
           "&order=created_at.asc")
    headers = {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
        "Accept": "application/json",
    }
    status, data = _req(url, headers)
    if status != 200:
        sys.exit(f"ERROR: Supabase read failed ({status}): {data}")
    return data


# ----------------------------------------------------------------------------
# Notion — dedupe by email, then create a Prospect
# ----------------------------------------------------------------------------
def _notion_headers():
    if not NOTION_TOKEN:
        sys.exit("ERROR: NOTION_TOKEN is not set.")
    return {
        "Authorization": f"Bearer {NOTION_TOKEN}",
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
    }


def notion_has_email(email):
    url = f"https://api.notion.com/v1/data_sources/{PEOPLE_DATA_SOURCE_ID}/query"
    body = {"filter": {"property": "Email", "email": {"equals": email}}, "page_size": 1}
    status, data = _req(url, _notion_headers(), method="POST", body=body)
    if status != 200:
        print(f"  ! Notion query failed for {email} ({status}): {data}")
        return True  # fail safe: treat as existing so we never double-write
    return len(data.get("results", [])) > 0


def notion_create_prospect(e):
    name = (e.get("full_name") or "").strip() or "Unknown enrollee"
    email = (e.get("email") or "").strip()
    date = (e.get("created_at") or "")[:10] or None

    props = {
        "Name": {"title": [{"text": {"content": name}}]},
        "Email": {"email": email},
        "Role": {"multi_select": [{"name": "Prospect"}]},
        "Source": {"select": {"name": "Bogen Method"}},  # auto-creates the option
        "Notes": {"rich_text": [{"text": {"content": "Enrolled in The Bogen Method course."}}]},
    }
    if e.get("brokerage"):
        props["Company"] = {"rich_text": [{"text": {"content": e["brokerage"]}}]}
    if e.get("market"):
        props["Location"] = {"rich_text": [{"text": {"content": e["market"]}}]}
    if date:
        props["First Contact"] = {"date": {"start": date}}
        props["Last Touch"] = {"date": {"start": date}}

    body = {"parent": {"type": "database_id", "database_id": PEOPLE_DATABASE_ID}, "properties": props}
    status, data = _req("https://api.notion.com/v1/pages", _notion_headers(), method="POST", body=body)
    return status == 200, data


def main():
    rows = fetch_enrollments()
    print(f"Found {len(rows)} enrollment(s) in Supabase.")
    created = skipped = failed = 0

    for e in rows:
        email = (e.get("email") or "").strip()
        if not email:
            skipped += 1
            continue
        if notion_has_email(email):
            skipped += 1
            print(f"  = already in Notion: {email}")
            continue
        if DRY_RUN:
            created += 1
            print(f"  + WOULD create: {e.get('full_name')} <{email}>")
            continue
        ok, data = notion_create_prospect(e)
        if ok:
            created += 1
            print(f"  + created: {e.get('full_name')} <{email}>")
        else:
            failed += 1
            print(f"  ! create failed for {email}: {data}")

    print(f"\nDone. created={created} skipped={skipped} failed={failed}"
          + ("  (dry run — no writes)" if DRY_RUN else ""))


if __name__ == "__main__":
    main()
