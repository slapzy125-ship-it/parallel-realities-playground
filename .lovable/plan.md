## Current state (audited)

- `subscriptions` table, RLS, `useSubscription` hook, Paddle webhook handler at `src/routes/api/public/payments/webhook.ts`, Paddle checkout hook, and `/auth` route — **all already wired**. Subscription status is queried server-side via the `getMySubscription` server function, not localStorage.
- Tier mapping is currently `revenio_legend` / `revenio_infinite`. No Paddle products exist yet for `legend` / `immortal`.
- `Play.tsx` and `experience.tsx` are **not gated by tier** — the game runs free for everyone.
- No `PaywallGate.tsx` exists.
- Homepage has no login button.

The only real "localStorage" in Play.tsx is `revenio_save_*` for game saves — out of scope; leave it alone.

## Plan

### 1. Paddle catalog
- Create product `revenio_legend` with price `legend_monthly` at $10/mo.
- Create product `revenio_immortal` with price `immortal_monthly` at $20/mo.
- Update `useSubscription` tier type to `"free" | "legend" | "immortal"` and map `revenio_immortal` → `immortal`.

### 2. Pricing page (`/experience`)
- Rename "Infinite" → "Immortal", update price ID + display copy.
- Pass logged-in user's email + `customData.userId` to checkout (so webhook can link sub to user).
- `successUrl` → `/play`.
- If user not logged in when they click subscribe, redirect to `/auth?redirect=/experience`.

### 3. Homepage (`/`) login button
- In `SiteNav`: show "Sign In" link if logged out, "Sign Out" / email if logged in.

### 4. `PaywallGate` component
- Props: `requiredTier: "legend" | "immortal"`, `children`, optional `feature` label.
- Reads `useSubscription`. If tier meets requirement, render children. Else render a styled lock card with "Upgrade to {tier}" → `/experience`.

### 5. Server-side tier check (the security boundary)
- New server function `getMyTier()` in `src/utils/payments.functions.ts` — runs under `requireSupabaseAuth`, returns `"free" | "legend" | "immortal"` by reading the user's subscription row server-side. Defaults to `free` on no row or error.
- Add a new server function `requireTierForAI({ minTier })` that the `ai-scene` flow consults — if the user's server-derived tier is below the required tier OR they're hitting the free scene cap, throw 403. The game cannot bypass this by editing browser state.
- Add a `scene_counts` table (or column on `profiles`/`subscriptions`) keyed by `user_id` + `world_id` to enforce the 5-scenes-per-world free cap server-side. Edge function increments on each successful generation.

### 6. `Play.tsx` gating (client-side UX, paired with server enforcement)
Wrap or short-circuit each premium feature by tier read from `useSubscription`:

- **Free**: only Champions Legacy + Arcane Academy world cards are clickable. Others show a lock badge → `/experience`.
- **Free**: after 5 scenes in a world, replace the choices UI with a `<PaywallGate requiredTier="legend">`.
- **Minigames**: skip `setActiveMinigame` for free users; AI continues story directly.
- **Match report / season summary / transfer window / chapter card / trophy popup / scene image / villain panel**: render only when `tier !== "free"`.
- **Save slots**: hide SAVE button for free.
- **Immortal-only**: "IMMORTAL" gold badge in topbar, replay-scene button in history, "The Rift" 9th world card, "Export PDF" button on legacy screen.

### 7. "The Rift" world (Immortal-only)
- Add a 9th entry to the `WORLDS` array with `customCreation: 'rift'` (reuse position/wand-style picker), guarded so only `tier === 'immortal'` users see/select it.
- Add a small villain pool entry for The Rift.

### 8. Out of scope for v1 (call out so you can confirm)
- **"Priority scene generation"** — would require a separate model/queue. Skipping unless you want me to wire it to a faster model for Immortal users in a follow-up.
- **"Exclusive villain variants"** — I'll add 1 Immortal-only villain per world later; not in v1 unless you want it now.
- **PDF export** — I'll add a button that uses `jspdf` to render the legacy screen; if you want a more polished PDF layout that's a follow-up.

## Files I'll create / modify
- `src/hooks/useSubscription.ts` — change `infinite` → `immortal`, map new product ids.
- `src/components/PaywallGate.tsx` — new.
- `src/components/SiteNav.tsx` — login button.
- `src/routes/experience.tsx` — Immortal copy, price ids, redirect-to-auth, success url.
- `src/utils/payments.functions.ts` — add `getMyTier`, `checkSceneAccess` server fns.
- `src/pages/Play.tsx` — gate features by `tier`, gate world cards, free scene cap.
- `supabase/functions/ai-scene/index.ts` — verify caller JWT, look up tier, enforce server-side scene cap before calling AI.
- Migration: add `free_scene_usage` table (`user_id`, `world_id`, `count`).
- Paddle products: `revenio_legend`/`legend_monthly` ($10/mo), `revenio_immortal`/`immortal_monthly` ($20/mo).

Confirm and I'll execute, or tell me which pieces to drop / re-scope.