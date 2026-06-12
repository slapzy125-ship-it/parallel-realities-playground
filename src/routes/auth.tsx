import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteNav } from "@/components/SiteNav";
import { RevenioLogo, RevenioWordmark } from "@/components/RevenioLogo";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign In — Revenio" },
      { name: "description", content: "Access your Revenio account to manage your AI worlds, save your progress, and continue the parallel lives you've already begun." },
      { property: "og:title", content: "Sign In — Revenio" },
      { property: "og:description", content: "Sign in to Revenio to keep your worlds, characters, and story progress synced across every device." },
      { property: "og:url", content: "https://revenio.net/auth" },
    ],
    links: [
      { rel: "canonical", href: "https://revenio.net/auth" },
    ],
  }),
  component: Auth,
});

function Auth() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);

  // If already signed in, send home
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.navigate({ to: "/" });
    });
  }, [router]);

  // When Remember Me is off, move the supabase auth token to sessionStorage so
  // it disappears when the browser/tab closes. A listener in __root.tsx
  // restores it across in-tab reloads.
  const applyRememberMePreference = () => {
    if (typeof window === "undefined") return;
    if (rememberMe) {
      sessionStorage.removeItem("revenio_session_only");
    } else {
      sessionStorage.setItem("revenio_session_only", "1");
      // Move any current sb-*-auth-token entries out of localStorage.
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith("sb-") && k.endsWith("-auth-token")) keys.push(k);
      }
      keys.forEach((k) => {
        const v = localStorage.getItem(k);
        if (v) sessionStorage.setItem(k, v);
        localStorage.removeItem(k);
      });
    }
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        applyRememberMePreference();
        setMessage("Check your email to confirm your account, then sign in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        applyRememberMePreference();
        router.navigate({ to: "/" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setLoading(true);
    applyRememberMePreference();
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setError(result.error.message ?? "Google sign-in failed.");
      setLoading(false);
      return;
    }
    if (result.redirected) return; // browser will navigate
    router.navigate({ to: "/" });
  };

  return (
    <main className="relative min-h-screen flex flex-col bg-background text-foreground">
      <SiteNav />
      {/* Subtle radial gold backdrop */}
      <div className="absolute inset-0 bg-[var(--gradient-radial-gold)] opacity-30 pointer-events-none" />

      <header className="relative z-10 px-6 pt-28 pb-6 border-b border-border">
        <Link to="/" className="inline-flex items-center gap-3">
          <RevenioLogo size={28} />
          <RevenioWordmark className="text-base" />
        </Link>
      </header>

      <section className="relative z-10 flex-1 flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <p className="text-[0.65rem] tracking-[0.4em] uppercase text-[var(--gold)] mb-4">Access the Portal</p>
            <h1 className="font-display text-5xl font-light leading-tight">
              {mode === "signin" ? <>Welcome <span className="italic text-gold-gradient">back.</span></> : <>Become <span className="italic text-gold-gradient">another you.</span></>}
            </h1>
          </div>

          <form onSubmit={handleEmail} className="space-y-4 border border-border bg-card/60 backdrop-blur p-8">
            <div>
              <label className="block text-[0.6rem] tracking-[0.3em] uppercase text-muted-foreground mb-2">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-background border border-border px-4 py-3 text-sm focus:border-[var(--gold)] focus:outline-none transition-colors"
                placeholder="you@galaxy.com"
              />
            </div>
            <div>
              <label className="block text-[0.6rem] tracking-[0.3em] uppercase text-muted-foreground mb-2">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-background border border-border px-4 py-3 text-sm focus:border-[var(--gold)] focus:outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-xs text-red-400 border border-red-500/30 bg-red-500/10 p-3">{error}</p>}
            {message && <p className="text-xs text-[var(--gold)] border border-[var(--gold)]/30 bg-[var(--gold)]/5 p-3">{message}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--gold)] text-background text-xs tracking-[0.3em] uppercase font-medium py-4 hover:bg-[var(--gold-bright)] disabled:opacity-50 transition-all"
            >
              {loading ? "Working…" : mode === "signin" ? "Sign In" : "Create Account"}
            </button>

            <div className="flex items-center gap-3 py-2">
              <div className="flex-1 gold-hairline" />
              <span className="text-[0.6rem] tracking-[0.3em] uppercase text-muted-foreground">Or</span>
              <div className="flex-1 gold-hairline" />
            </div>

            <button
              type="button"
              onClick={handleGoogle}
              disabled={loading}
              className="w-full border border-border hover:border-[var(--gold)] text-xs tracking-[0.3em] uppercase py-4 transition-all flex items-center justify-center gap-3 hover:bg-[var(--gold)]/5"
            >
              <GoogleIcon /> Continue with Google
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-6">
            {mode === "signin" ? "New to Revenio?" : "Already have an account?"}{" "}
            <button
              onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); setMessage(null); }}
              className="text-[var(--gold)] hover:underline tracking-[0.2em] uppercase text-[0.65rem] ml-1"
            >
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.8 32.5 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C33.9 6 29.2 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C33.9 7 29.2 5 24 5 16.3 5 9.7 9.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.8-2 13.3-5.2l-6.1-5.2C29.2 35 26.7 36 24 36c-5.3 0-9.8-3.4-11.3-8.1l-6.5 5C9.6 39.6 16.3 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.7 2-2 3.7-3.7 4.9l6.1 5.2C40.9 35.4 44 30.1 44 24c0-1.2-.1-2.3-.4-3.5z"/>
    </svg>
  );
}
