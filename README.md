# AeroKits MVP (Expo + Supabase + Stripe)

Two-sided MVP:
- **Customer**: Browse kits, add to cart, choose FBO/time window
- **Vendor**: View incoming orders (basic queue)

## Quick start

```bash
# 1) Install Expo CLI (if needed)
npm i -g expo

# 2) Install deps
npm install

# 3) Copy env
cp .env.example .env

# 4) Fill your keys in .env (Supabase URL/Anon key, Stripe publishable key)

# 5) Run on iOS or Android
npm run ios      # or: npm run android
# or start Metro and use Expo Go
npm start
```

## Supabase
Create a project → SQL Editor → paste `supabase/schema.sql` and run.
This creates minimal tables (kits, airports, fbos) and seeds **PBI, SUA, FLL** and mock kits.

## Notes
- Payments are scaffolded; wire to Stripe PaymentSheet when ready.
- Physical goods → use Stripe/Apple Pay (no Apple IAP required).
