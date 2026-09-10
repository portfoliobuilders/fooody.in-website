# Fooody.in Partner Portal

Multi-tenant restaurant OS for **fooody.in**: partner POS/KDS + branded storefront (`fooody.in/[slug]` or `[slug].fooody.in`) + QR dine-in + WhatsApp commerce + hybrid dispatch.

## Run locally

```bash
cd partner-portal
npm install
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

Open [http://localhost:3000/login](http://localhost:3000/login)

| Role | Email | Password |
| --- | --- | --- |
| Owner | owner@fooody.in | Fooody@2026 |
| Manager | manager@fooody.in | Fooody@2026 |
| Kitchen | kitchen@fooody.in | Fooody@2026 |
| Cashier | cashier@fooody.in | Fooody@2026 |
| Driver | driver@fooody.in | Fooody@2026 |
| Super admin | admin@fooody.in | Fooody@2026 |

Phone OTP demo: `9876543210` / `123456`

- Storefront: [http://localhost:3000/malabar-kitchen](http://localhost:3000/malabar-kitchen)
- Table QR: [http://localhost:3000/qr/malabar-kitchen/table/4](http://localhost:3000/qr/malabar-kitchen/table/4)
- Marketplace: [http://localhost:3000/marketplace](http://localhost:3000/marketplace)
- WhatsApp webhook: `POST /api/webhooks/whatsapp`
- Payments: `POST /api/webhooks/razorpay`, `POST /api/webhooks/cashfree`

Subdomain routing (same store): `http://malabar-kitchen.localhost:3000`

## Production (Supabase / Postgres)

1. Set `DATABASE_URL` (pooler) and `DIRECT_URL` (direct 5432) to Supabase Postgres.
2. Run `npx prisma migrate deploy` (or `npm run start:prod`).
3. Seed once on an empty database (`npx prisma db seed`), then rotate demo passwords. Do not seed again.
4. Optional: apply `prisma/supabase-rls.sql` only if Prisma uses a non-superuser role. App isolation is `requireMembership` + `restaurantId`.
5. Set `SESSION_SECRET`. Razorpay/Cashfree/WhatsApp webhook secrets must be set or those routes return 500 (fail closed). OTP login is disabled in production.

Every tenant query is scoped by `restaurantId` from the staff membership — not from client input alone.
