# Fooody.in — official website

Consumer food-ordering homepage plus restaurant **claim-your-URL** engine for **Fooody.in** — Kerala’s original food-tech pioneer (2016), returning in 2026 with **₹0 platform fee** for guests and **0% commission** direct stores for kitchens.

**Full architecture and inventory (for a revamp):** [`docs/FOOODY-COMPLETE-ARCHITECTURE.md`](./docs/FOOODY-COMPLETE-ARCHITECTURE.md) — what is built, what is mocked, data model, APIs, and how the two apps relate.

This repository has two Next.js apps:

| App | Folder | What it is |
| --- | --- | --- |
| Marketing site | repo root (`src/`) | Public Fooody.in website. Static export for Hostinger `public_html`. |
| Partner portal | [`partner-portal/`](./partner-portal) | Restaurant OS: POS, KDS, QR dine-in, WhatsApp, payments, dispatch. |

This project uses **Next.js** so search engines get real HTML (titles, headings, sitemap, structured data). The production build is a folder of static files you can upload to **Hostinger `public_html`** — no Node server required on the host.

## Pages

- `/` — Kochi ordering UI: location, search, categories, dish grid, cart, and “claim fooody.in/your-brand”
- `/baketree/` — BakeTree Resto Cafe direct store (live kitchen menu from Palarivattom)
- `/our-story/` — 2016 founder chronicle, office / bot / merch gallery
- `/for-restaurants/` — QR dining, CRM, POS, fleets, savings calculator, waitlist
- `/terms/` and `/privacy/`

`/our-story.html` and `/for-restaurants.html` redirect to the slash URLs on Apache hosts.

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

Optional: set `NEXT_PUBLIC_WAITLIST_WEBHOOK` in a `.env.local` file before building if you want waitlist / claim-link submissions posted to Formspree, Make.com, Zapier, or Google Apps Script. Without it, the form still works and stores a confirmation in the browser.

## Partner portal

The restaurant operating system lives in **`partner-portal/`**. It is a separate Next.js app with its own `package.json` and Prisma schema.

```bash
cd partner-portal
npm install
npx prisma db push --force-reset
npx prisma db seed
npm run dev
```

Open [http://localhost:3000/login](http://localhost:3000/login). Demo accounts and webhook notes are in [`partner-portal/README.md`](./partner-portal/README.md).

## Checks

Marketing site:

```bash
npm run typecheck
npm run lint
npm run build
```

Partner portal:

```bash
cd partner-portal
npm run typecheck
npm run lint
```

## Brand notes

- Marketplace canvas `#F8FAFC`, obsidian header `#0B0F17`, crimson `#E11D48` / `#EF4444`, emerald ratings
- Story photographs live in `public/images/` (`office-progress.jpg`, `early-app-bot.jpg`, `fooody-merch.jpg`)
- Menu photography lives in `public/images/menu/`
