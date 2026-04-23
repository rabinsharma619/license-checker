# Nepal Driver's License Print Status Checker

## Project Overview
A React web app for Nepali driver's license holders to check whether their license has been printed and is ready for collection. Users search by their name or license number against uploaded PDF print lists published by the Department of Transport Management (DoTM), Nepal.

## Target Users
Nepali citizens who have applied for a driver's license and are waiting to know if their license has been printed at their respective district transport office (e.g., Saptari, Janakpur, Kathmandu).

## Core Features
1. **Search by name** — partial match, case-insensitive, supports Romanized Nepali names
2. **Search by license number** — exact or partial match (format: `XX-XX-XXXXXXXX`, e.g., `04-03-89171469`)
3. **PDF upload** — admin can upload one or multiple PDF print list files; app parses and indexes all records
4. **Result display** — shows S.N., full name, license number, category (A/B/K/C1/E etc.), issuing office, and print date
5. **Status badge** — clearly shows "Printed ✓" with the print date for matched records
6. **No result state** — friendly message in Nepali and English if not found: "Your license has not been printed yet. Please check again later."
7. **Multi-file support** — handle paginated PDFs (e.g., "1 of 87 pages") across multiple uploaded files
8. **Persistent data** — parsed records stored in localStorage so users don't re-upload every visit

## PDF Data Format
Each PDF page contains a table with these exact columns:
- S.N. (serial number)
- License Holder Name (Romanized Nepali, ALL CAPS)
- License Number (format: `XX-XX-XXXXXXXX`)
- Category (A, B, A,B, K, C1, E, E,A, B,A, etc.)
- Office (district name, e.g., SAPTARI)
- License Printed Date (format: `YYYY-MON-DD`, e.g., `2026-FEB-06`)

## Tech Stack
- React 18 + Vite for the client
- Tailwind CSS for styling
- Node + Express HTTP API (`server/index.mjs`) — search runs server-side
- Static JSON shards in `data/shards/` act as the "database" (one per office)
- PDFs are pre-parsed into shards at build time by `scripts/parse-pdfs.mjs` (uses pdfjs-dist in Node)

## Architecture
- `data/manifest.json` lists all offices and their shard filenames
- `data/shards/<slug>.json` holds the parsed records for one office (slug from DoTM content URL)
- `data/downloads/*.pdf` — cached PDFs downloaded from DoTM
- Client fetches `/api/offices` once, then `/api/search?office=X&q=Y` on each keystroke (debounced 250ms)
- Server lazy-loads shards into an in-memory cache on first request per office
- No client-side storage — all search state lives on the server

## Sync job (DoTM scraper)
- `server/sync.mjs` scrapes `https://dotm.gov.np/category/details-of-printed-licenses/`, discovers the per-office PDF URL on each `/content/<id>/<slug>/` page, downloads any new/changed PDFs, parses them, and rewrites `data/manifest.json`
- Scheduled inside the Express server via `node-cron` (env `SYNC_CRON`, default `15 */3 * * *` — every 3 hours)
- Set `SYNC_CRON=off` to disable; `SYNC_ON_STARTUP=true` to run once when the server boots
- Manual run: `npm run sync`
- Admin endpoints (optional `ADMIN_TOKEN` Bearer auth): `POST /api/admin/reload` clears the in-memory cache; `POST /api/admin/sync` triggers a fresh sync
- Polite delay between HTTP requests (~1.5s) — DoTM returned 403s when hit back-to-back
- Entries whose PDFs parse to 0 records are skipped (category includes non-list docs like the "smart card sample" PDF)

## UI/UX Requirements
- Language: English interface with Nepali text support (`font-family` that renders Devanagari if needed)
- Mobile-first design — most users will be on Android phones with small screens
- Large, readable search input with a prominent search button
- Results table must be horizontally scrollable on mobile
- Colors: use green for "found/printed" status, red/gray for "not found"
- Show total records loaded and last updated date (from PDF print date) at the top
- Loading spinner while parsing PDFs
- Nepali flag or DoTM branding feel — professional, trustworthy

## Folder Structure
```
src/
  components/
    SearchBar.jsx
    ResultsTable.jsx
    UploadZone.jsx
    StatusBadge.jsx
  utils/
    pdfParser.js      # PDF.js text extraction + table parsing logic
    searchUtils.js    # fuzzy/partial name matching, license number matching
  App.jsx
  main.jsx
public/
  index.html
```

## PDF Parsing Logic (important)
The PDF text extraction produces items in reading order. Parse them like this:
- Detect S.N. as a standalone integer
- Next non-numeric item = License Holder Name
- Item matching `\d{2}-\d{2}-\d{8}` = License Number
- Item matching known category codes = Category
- Next text item = Office
- Item matching `\d{4}-[A-Z]{3}-\d{2}` = Print Date
- Skip header rows ("S.N.", "License Holder Name", etc.) and page markers ("1 of 87")

## Search Logic
- Name search: normalize spaces, ignore case, support partial match (e.g., "AASHISH" matches "AASHISH KUMAR YADAV")
- License number search: strip dashes for comparison so "0403" matches "04-03-89171469"
- Show all matches sorted by S.N.

## Error Handling
- If PDF parsing fails for a page, skip it silently and continue
- If no records found after upload, show: "Could not read records from this PDF. Please make sure it is a DoTM license print list."
- Validate file type — only accept .pdf files

## What NOT to build
- No login or authentication
- No server, API, or database
- No license application form
- No payment or booking features
