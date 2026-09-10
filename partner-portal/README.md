# Fooody.in Partner Portal

Multi-tenant restaurant OS for **fooody.in**: partner POS/KDS + branded storefront (`fooody.in/[slug]` or `[slug].fooody.in`) + QR dine-in + WhatsApp commerce + hybrid dispatch.

## Run locally

```bash
cd partner-portal
npm install
npx prisma db push --force-reset
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

1. Point `DATABASE_URL` at Supabase Postgres.
2. Change `prisma/schema.prisma` `datasource.provider` to `postgresql`.
3. Run `npx prisma migrate dev`.
4. Apply `prisma/supabase-rls.sql`.
5. Set `SESSION_SECRET`, WhatsApp Cloud API, Razorpay/Cashfree webhook secrets, optional Upstash Redis, Uber Direct / Porter keys.

Every tenant query is scoped by `restaurantId` from the staff membership — not from client input alone.
