# Fooody.in — official website

Luxury marketing site for **Fooody.in**, Kerala’s original food-tech pioneer (2016), returning in 2026 as a **0% commission direct ordering platform** for restaurants across India.

This project uses **Next.js** so search engines get real HTML (titles, headings, sitemap, structured data). The production build is a folder of static files you can upload to **Hostinger `public_html`** — no Node server required on the host.

## Local preview

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Open it on your PC (no coding)

Download **`Fooody.in-website-for-PC.zip`**, unzip it, open `public_html`, then:

- Windows: double-click `start-on-windows.bat`
- Mac: double-click `start-on-mac-or-linux.command`

Read `START-HERE-FOR-YOUR-PC.txt` if you want the short version.

To rebuild that zip after edits: `npm run package:pc`.

## Deploy to Hostinger

1. Run `npm run build` (or `npm run package:pc`).
2. Upload the **contents** of **`public_html/`** (or `out/`) into Hostinger **`public_html`**, including `.htaccess`.
3. Point the domain to that folder.

Optional: set `NEXT_PUBLIC_WAITLIST_WEBHOOK` in a `.env.local` file before building if you want waitlist submissions posted to Formspree, Make.com, Zapier, or Google Apps Script. Without it, the form still works and stores a confirmation in the browser.

## Checks

```bash
npm run typecheck
npm run lint
npm run build
```

## Brand notes

- Dark obsidian `#090D16`, charcoal cards `#111827`, flame red → orange `#EF4444` → `#F97316`
- Story photographs live in `public/images/` (`office-progress.jpg`, `early-app-bot.jpg`, `fooody-merch.jpg`)
