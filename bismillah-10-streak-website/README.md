# Bismillah 10 — Dhikr Streak Website

A static, mobile-friendly website for counting Bismillah 10 times daily and tracking a daily completion streak.

## Features
- Daily target: 10 repetitions
- Tap counter, undo and reset
- Daily completion streak and completed-day total
- Last 7 days view
- Saves locally in the current browser using localStorage
- No database, account, API key or paid service required

## Run locally (Mac)
From this folder:

```bash
python3 -m http.server 8080
```

Open http://localhost:8080

Stop the server with `Control + C`.

## Deploy to Vercel
Install Node.js first if needed. Then run:

```bash
npx vercel
```

Follow the prompts and choose this folder as the project directory. For production:

```bash
npx vercel --prod
```

No build command is required; this is a static website.

## Data note
Counts are stored in this browser only. Clearing browser site data or switching devices will not carry the count over. A shared multi-device database can be added later.
