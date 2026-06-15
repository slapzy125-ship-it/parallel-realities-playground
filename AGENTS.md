# AGENTS.md

## Cursor Cloud specific instructions

### What this is
Revenio — an AI "live another life" interactive-fiction web app. Single product, built on the Lovable.dev TanStack Start template (React 19 + Vite 7 + TypeScript, SSR via Nitro), backed by a **hosted** Supabase project and external AI proxies. There is no local database/backend to run — the app talks to hosted services.

### Package manager
- Use **Bun** (`bun.lock` + `bunfig.toml` are authoritative). Bun is installed at `~/.bun/bin/bun` and is on `PATH` via `~/.bashrc`. A `package-lock.json` also exists, so `npm` works as a fallback, but prefer Bun.
- `bunfig.toml` sets `minimumReleaseAge = 86400` (24h supply-chain guard). This only affects newly published packages; normal installs are unaffected.

### Commands (run from repo root, see `package.json` scripts)
- Dev server: `bun run dev` → Vite serves on **http://localhost:8080/** (port is fixed by the Lovable config).
- Build: `bun run build` (Cloudflare target) or `bun run build:dev` (dev mode). Both work.
- Lint: `bun run lint` (`eslint .`). NOTE: the repo currently has **thousands of pre-existing `prettier/prettier` formatting errors** across `src/`, `api/`, and `supabase/functions/`. This is the committed state — `bun run lint` exits non-zero on a clean checkout. Do not mass-reformat unless asked; scope lint expectations to files you actually touch.
- Format: `bun run format` (prettier). There is no `typecheck` script; TS is checked by the build.

### Environment / config
- `.env`, `.env.development`, `.env.production` are committed and already point at the hosted Supabase project, so the app runs out-of-the-box for browsing + auth.
- Server-side secrets (`SUPABASE_SERVICE_ROLE_KEY`, `LOVABLE_API_KEY`, Paddle/AI keys) are **not** committed and are not needed to run the dev server.

### Non-obvious gotchas
- **`/play` is intentionally a "COMING SOON" placeholder.** `src/pages/Play.tsx` `export default function Play()` returns `<PlayComingSoon />` on its first line; the full game state machine below that `return` is currently unreachable dead code. The only working action on `/play` is the early-access waitlist form (writes to `localStorage`).
- **The core AI features require a verified (email-confirmed) login:**
  - `/parallel2` (Parallel Life 2.0, the homepage "BEGIN YOUR SIMULATION" CTA) hard-gates the whole page behind `supabase.auth.getUser()` — logged-out users only see "SIGN IN REQUIRED".
  - `/parallel` (v1) renders without a gate, but its generation call hits the hosted `ai-scene` Supabase edge function, which rejects requests without a valid user session ("Invalid session").
- **Signup requires email confirmation.** The hosted Supabase project enforces email verification: `supabase.auth.signUp` returns no session and sign-in fails with `email_not_confirmed`. To exercise the AI flows you need either a pre-confirmed test account, a Desktop-pane login with a real (confirmable) email, or email confirmation disabled on the Supabase project. Google OAuth on `/auth` currently returns 404 (callback not configured for localhost).
- **AI backends are external and live:**
  - `/parallel2` calls `https://parallel-realities-playground.vercel.app/api/*` (Anthropic, ElevenLabs narration, RunwayML video). These are reachable and return real responses; they do not require Supabase auth (only the page UI gate does).
  - `/parallel` and `supabase/functions/*` use the hosted `ai-scene` edge function (needs `LOVABLE_API_KEY` configured server-side, which it appears to have).
- The `api/` directory and `supabase/functions/` are deployed externally (Vercel / Supabase). They are not started locally as part of `bun run dev`.
