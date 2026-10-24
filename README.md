# Gold Souk Directory

A listing platform for independent UAE gold jewellers. Customers browse
designs and compare shops online, then contact the shop and buy in person.

There is no checkout, no online payment, no deposit, no booking fee and no
instalment plan anywhere in this codebase. The sale always happens in the
shop. Jewellers pay a monthly subscription, billed by hand outside the app.

> The full step-by-step deployment guide for non-developers arrives in
> Phase 6. This README covers local development.

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind CSS v4
- Supabase: Postgres, auth and row-level security (free tier)
- Cloudinary for product images (free tier, from Phase 3)
- Cloudflare Workers via `@opennextjs/cloudflare`

## Run it locally

```bash
npm install
cp .env.example .env.local      # fill in your Supabase URL and keys
npm run dev                     # http://localhost:3000
```

Without Supabase keys the site still runs and shows a "not connected" note.

## Database

Migrations live in `supabase/migrations`, demo data in `supabase/seed.sql`.

- **Supabase CLI:** `npx supabase link --project-ref <ref>`, then
  `npx supabase db push`. Load demo data with
  `psql "$DATABASE_URL" -f supabase/seed.sql`.
- **No CLI:** paste each migration file, in order, into the Supabase SQL
  editor, then the seed file.

The seed contains three **demo** shops, 30 products and a week of **sample**
gold rates. None of it is a real business or a live price. Delete it before
launch:

```sql
delete from public.shops where slug like 'demo-%';
delete from public.gold_rates;
```

### Making someone an admin

Sign-ups always become jewellers. Promote an admin by hand in the SQL editor:

```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'you@example.com');
```

### Who can see what

| Role | Can see | Can change |
|---|---|---|
| Public | Approved, active shops; their available or reserved products confirmed in the last 30 days; gold rates | Nothing directly. Contact clicks, visit requests and shop applications go through server routes |
| Jeweller | Everything for shops they belong to, including sold, hidden and stale stock, and their own results | Their own shop profile and products. Not approval, plan, featuring, owner or slug |
| Admin | Everything | Everything |

Stock nobody has confirmed for 30 days drops out of public view on its own,
with no scheduled job. One tap on "Confirm stock" brings it back.

## Checks

```bash
npm test            # pricing formula
npm run typecheck
npm run lint
npm run test:db     # migrations + seed + 20 RLS checks against a local Postgres
npm run preview     # build for Cloudflare and run on the Workers runtime
```

`test:db` needs `psql` and a local Postgres server. It creates and drops a
throwaway database, and never touches your Supabase project.

## Pricing

```
estimated price = gold rate (karat) × weight
                + making charge (per gram × weight | % of gold value | fixed)
                + 5% VAT on both
```

Always labelled "Estimated price — confirm in store. Gold rate as of [time]."
When a shop turns prices off, only weight and karat are shown. See
`lib/pricing.ts`.
