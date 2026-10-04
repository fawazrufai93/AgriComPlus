# AgriCom+ — Farm-to-door produce marketplace (Kumasi)

React + Vite front end · Supabase (auth, database, realtime) · Paystack payments (MoMo + card, GHS) · Vercel (hosting + serverless API)

## What's in v2
- **Real orders**: created server-side (`/api/create-order`); prices and stock are re-read from the database, so totals can't be tampered with.
- **Paystack payments**: Mobile Money (MTN / Telecel / AirtelTigo) and cards, plus Cash on Delivery. Confirmed by webhook **and** browser callback; amount is verified against the order.
- **Privacy**: customers can only read their own orders (RLS). The old "anyone can read all orders" policy is removed.
- **Admin dashboard** (`Account → Open Admin Dashboard`): all customers' orders (live), search/filter, status updates that drive the QR trace timeline, mark COD cash received, CSV export, edit product price/stock.
- **Live catalog** from Supabase (products/farms), automatic stock deduction.
- Customers see order status change in real time.

## One-time setup
1. **Supabase → SQL Editor**, run in order:
   1. `supabase-schema.sql` (already run before — skip)
   2. `supabase-migration-v2.sql`
   3. `supabase-seed.sql` (loads products & farms)
   4. Make yourself admin: `update public.profiles set role='admin' where email='YOUR_EMAIL';`
2. **Paystack**: create an account at paystack.com → Settings → API Keys. Use the *test* secret key first.
   Settings → API Keys & Webhooks → set **Webhook URL** to `https://YOUR-DOMAIN/api/paystack-webhook`.
3. **Vercel → Project → Settings → Environment Variables** (Production + Preview):
   `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `PAYSTACK_SECRET_KEY`
   (Supabase → Project Settings → API for the keys.) Redeploy after adding them.
4. **Supabase → Authentication → URL Configuration**: set Site URL to your Vercel domain.
5. Vercel's **Root Directory** must be the folder that contains `package.json` and `api/`.

## Local development
The `/api` functions need the Vercel runtime:
```
npm install --legacy-peer-deps
npm i -g vercel && vercel dev      # serves the app + /api on http://localhost:3000
```
(`npm run dev` alone runs only the front end — ordering will not work.)

## Going live with real money
Switch `PAYSTACK_SECRET_KEY` to the live key (`sk_live_…`) once Paystack has activated your business, and update the webhook URL in the live dashboard. Test with Paystack's test MoMo/card numbers first.
