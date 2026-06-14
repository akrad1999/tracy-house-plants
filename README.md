# Tracy House Plants

A production-ready Next.js 15 app for a local pickup houseplant shop.

## Included

- Homepage
- Supabase-backed plant catalog
- Plant detail pages
- Google authentication
- Cart and Stripe Checkout
- Protected account/profile page
- Protected order history page
- Supabase SQL migrations

## Environment

Copy `.env.example` to `.env.local` and set:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

## Run Locally

```bash
npm install
npm run dev
```

## Stripe Checkout

Checkout is local pickup only. The app creates a Stripe Checkout Session from validated cart items, then waits for the Stripe webhook to create the Supabase order, create order items, and decrement plant inventory.

Webhook endpoint:

```text
https://tracyhouseplants.com/api/stripe/webhook
```

Subscribe it to:

```text
checkout.session.completed
```
