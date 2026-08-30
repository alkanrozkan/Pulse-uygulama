# Pulse — AI Creator Growth Coach

Pulse reads a creator's own TikTok and Instagram performance and tells them what to post next.

**The promise:** stop guessing what to post. Pulse learns what works for your account and tells you exactly what to create next.

Built with Next.js 14 (App Router), TypeScript, Tailwind CSS, Supabase and the OpenAI API.

---

## Setup

### 1. Install

```bash
npm install
```

### 2. Create a Supabase project

At [supabase.com](https://supabase.com), then open **SQL Editor** and run, in order:

1. `supabase/schema.sql` — tables, enums, triggers and Row Level Security policies
2. `supabase/seed_trends.sql` — sample data for the Viral Radar

Under **Authentication → Providers**, make sure Email is enabled. For local
development turn *Confirm email* off so signup returns a session immediately;
with it on, users must click the emailed link before they can sign in.

Under **Authentication → URL Configuration**, add `http://localhost:3000/auth/callback`
to the redirect allow-list.

### 3. Configure the environment

```bash
cp .env.example .env.local
```

Fill in the values — see [Environment variables](#environment-variables) below.

### 4. Run

```bash
npm run dev
```

Open <http://localhost:3000>.

### 5. First run

Create an account, complete onboarding, then log five or six videos on
**Videos** with real numbers from your analytics. **Today** needs history to work
from — with no videos it will say so rather than inventing patterns.

---

## Environment variables

| Variable | Required | Where it's used | Notes |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Browser + server | Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Browser + server | Safe to expose; RLS is what protects the data |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Server only | Only needed to write shared `trends` rows from a job. Bypasses RLS |
| `OPENAI_API_KEY` | Recommended | Server only | Without it, the app runs a local rules-based generator instead |
| `OPENAI_MODEL` | No | Server only | Defaults to `gpt-4o-mini` |
| `NEXT_PUBLIC_SITE_URL` | No | Auth redirects | `http://localhost:3000` in development |
| `STRIPE_SECRET_KEY` | No | Not yet used | Placeholder for when billing is connected |

The OpenAI key is read only inside `src/lib/ai/openai.ts`, which is marked
`server-only`. Importing it from a Client Component is a build error, so the key
cannot reach the browser.

---

## Architecture

```
src/
  app/
    page.tsx                    Landing page
    login, signup, onboarding   Auth and first-run flow
    auth/                       Sign-out route, email callback, auth actions
    actions/                    Server Actions (profile, videos, feedback)
    api/recommendations/        POST — the AI endpoint
    api/trends/                 GET — Viral Radar data
    (app)/                      Authenticated shell: dashboard, today,
                                content-dna, viral-radar, videos, profile, billing
  components/
    ui/                         Primitives: button, card, field, badge,
                                score-meter, sparkline, states
    app/                        Product components: nav, recommendation card,
                                today board, DNA panels, forms
    landing/                    Marketing sections
  lib/
    supabase/                   Browser, server, middleware and admin clients
    analytics/classify.ts       Infers hook style, structure, duration band
    analytics/dna.ts            Builds the Content DNA
    analytics/stats.ts          Account-level statistics
    ai/prompt.ts                Prompt construction
    ai/schema.ts                Zod + JSON Schema for structured output
    ai/openai.ts                Model call
    ai/fallback.ts             Rules-based generator used without an API key
    trends/provider.ts          TrendProvider interface + mock implementation
    data.ts                     Server-side queries
    plans.ts                    Plan definitions and quota limits
```

### How a recommendation is produced

1. `POST /api/recommendations` authenticates the caller and checks their monthly quota.
2. It loads the creator profile, all videos, the computed Content DNA, the recent
   and top-performing subsets, and the outcomes of past recommendations.
3. `buildUserPrompt` assembles that into a single message; the system prompt
   requires every idea to cite one of the creator's own numbers.
4. The model is called with `response_format: json_schema` and `strict: true`, so
   the response conforms to `IDEA_JSON_SCHEMA`.
5. The JSON is re-validated with Zod before anything is written.
6. Three rows land in `recommendations` and are returned to the client.

### The feedback loop

Marking an idea **Posted** or **Skipped** updates `recommendations.status`.
Marking it **Beat my average** or **Underperformed** writes a row to
`recommendation_feedback`. The next generation reads the last fifteen outcomes
back into the prompt, so the model can correct its own scoring calibration.

### Content DNA

Creators enter a hook in their own words — they never pick from a taxonomy.
`src/lib/analytics/classify.ts` infers the hook style, narrative structure,
duration band and posting window from the data already collected. Each bucket is
indexed against the creator's own strongest bucket, so a bar means "compared with
the rest of my account", never an industry benchmark. Groups with fewer than two
videos are greyed out, and below eight videos the whole page carries a warning
that the patterns are directional.

### Row Level Security

Every table is owner-scoped: a user can only read and write rows where
`user_id = auth.uid()`. `trends` is the one exception — signed-in users can read
it, and only the service role can write to it. Feedback inserts additionally
verify that the referenced recommendation belongs to the caller.

---

## Connecting a real trends API

`src/lib/trends/provider.ts` defines the `TrendProvider` interface. The MVP reads
seeded rows from Supabase and falls back to `src/lib/trends/mock.ts`. To go live,
implement the interface against a real source and return it from
`getTrendProvider()`. Nothing in the UI needs to change.

## Connecting Stripe

The billing UI is complete and the quota gates in `src/lib/plans.ts` are already
enforced server-side in `getQuota()`. To connect payments:

1. Add a `POST /api/billing/checkout` route that creates a Stripe Checkout session.
2. Replace the `startCheckout` stub in `src/components/app/plan-table.tsx`.
3. Add a webhook route that updates `creator_profiles.plan` on
   `checkout.session.completed` and `customer.subscription.deleted`.

Nothing else changes — every feature gate already reads from `creator_profiles.plan`.

---

## Scripts

```bash
npm run dev        # development server
npm run build      # production build
npm run start      # serve the production build
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
```
