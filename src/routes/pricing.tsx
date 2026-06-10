import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { usePaddleCheckout } from "@/hooks/usePaddleCheckout";
import { useSubscription } from "@/hooks/useSubscription";

import { toast } from "sonner";
import { useEffect } from "react";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Revenio" },
      { name: "description", content: "Unlock all 8 worlds, unlimited scenes, and exclusive features. Plans from $10/month." },
      { property: "og:title", content: "Revenio Pricing — Live Every Story" },
      { property: "og:description", content: "Start free. Upgrade to unlock all worlds, unlimited scenes, AI scene art, and more." },
    ],
  }),
  component: Pricing,
});

const valueProps = [
  { t: "All 8 Worlds", d: "Magic, space, kingdoms, heroes. Unlocked the moment you subscribe." },
  { t: "Unlimited Scenes", d: "No caps. No cooldowns. Play as long as the story keeps pulling you in." },
  { t: "AI Scene Art", d: "Every moment rendered as cinematic imagery, generated live as you play." },
  { t: "Your Story, Saved", d: "Multiple save slots. Pick up exactly where you left off, on any device." },
  { t: "Replay & Export", d: "Revisit any past scene. Export your full saga as a beautifully formatted PDF." },
  { t: "Priority Generation", d: "Skip the queue. Immortals get the fastest scene generation, always." },
];

const faqs = [
  { q: "Can I cancel anytime?", a: "Yes. Cancel in one click from your account. You keep access until the end of your billing period." },
  { q: "What's the difference between Legend and Immortal?", a: "Legend unlocks all 8 worlds, unlimited scenes, and all core features. Immortal adds The Rift (an exclusive 9th world), early access to new worlds, replay any past scene, PDF export, and priority generation." },
  { q: "Is there a free trial?", a: "The Explorer plan is free forever — 2 worlds, 5 scenes per world. Try the experience before you commit." },
  { q: "Will my saves carry over if I upgrade?", a: "Yes. Every choice, every character, every story stays with you when you upgrade." },
];

function Pricing() {
  const router = useRouter();
  const { openCheckout, loading } = usePaddleCheckout();
  const { tier, isActive, userId } = useSubscription();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "success") {
      toast.success("Welcome aboard! Your subscription is being activated.");
      window.history.replaceState({}, "", "/pricing");
      setTimeout(() => router.navigate({ to: "/play" }), 1500);
    }
  }, [router]);

  const handleSubscribe = (priceId: string, tierName: "legend" | "immortal") => {
    if (!userId) {
      toast.info("Sign in to subscribe — your account keeps your story.");
      router.navigate({ to: "/auth" });
      return;
    }
    if (isActive && tier === tierName) {
      toast.info(`You're already on Revenio ${tierName === "legend" ? "Legend" : "Immortal"}.`);
      return;
    }
    openCheckout({
      priceId,
      successUrl: `${window.location.origin}/play?checkout=success`,
    });
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <PaymentTestModeBanner />
      <SiteNav />

      {/* Hero */}
      <section className="relative pt-40 pb-16 px-6 text-center">
        <div className="gold-hairline w-24 mx-auto mb-8" />
        <p className="text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-4">Pricing</p>
        <h1 className="font-display text-6xl md:text-8xl font-light leading-[1]">
          Live every<br />
          <span className="italic text-gold-gradient">story.</span>
        </h1>
        <p className="mt-8 text-muted-foreground max-w-2xl mx-auto">
          Start free. Upgrade when you're ready to unlock every world, every scene, and every ending.
        </p>
        {!userId && (
          <p className="mt-6 text-sm text-muted-foreground">
            <Link to="/auth" className="text-[var(--gold)] underline">Sign in</Link> to subscribe and keep your story across devices.
          </p>
        )}
      </section>

      {/* Pricing */}
      <section className="relative pb-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Explorer — Free */}
            <div className="bg-[var(--onyx)] border border-border p-8 flex flex-col">
              <h3 className="font-display text-3xl mb-2">Revenio Explorer</h3>
              <p className="text-2xl font-display text-[var(--gold)] mb-1">FREE</p>
              <p className="text-xs text-muted-foreground mb-8">Forever, no card required</p>
              <ul className="space-y-3 text-sm text-muted-foreground flex-1">
                <li className="flex items-start gap-3"><span className="text-[var(--gold)] mt-0.5">+</span>2 worlds: Champions Legacy & Arcane Academy</li>
                <li className="flex items-start gap-3"><span className="text-[var(--gold)] mt-0.5">+</span>5 scenes per world</li>
                <li className="flex items-start gap-3"><span className="text-[#3B82F6] mt-0.5">+</span><span><span className="text-[#3B82F6]">Parallel Life</span> — First Year only</span></li>
                <li className="flex items-start gap-3"><span className="text-[var(--gold)] mt-0.5">+</span>Basic character creation</li>
                <li className="flex items-start gap-3"><span className="text-[var(--gold)] mt-0.5">+</span>Community access</li>
              </ul>
              <Link
                to={userId ? "/play" : "/auth"}
                className="mt-8 w-full py-4 border border-[var(--gold)]/60 text-[var(--gold)] text-xs tracking-[0.3em] uppercase hover:bg-[var(--gold)]/10 transition-all duration-500 text-center"
              >
                {userId ? "Start Free" : "Sign Up Free"}
              </Link>
            </div>

            {/* Legend — $10 */}
            <div className="bg-[var(--onyx)] border-2 border-[var(--gold)]/60 p-8 flex flex-col relative shadow-[var(--shadow-gold)]">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--gold)] text-background text-[10px] tracking-[0.2em] uppercase px-4 py-1 font-medium">
                Most Popular
              </div>
              <h3 className="font-display text-3xl mb-2">Revenio Legend</h3>
              <p className="text-2xl font-display text-[var(--gold)] mb-1">$10<span className="text-sm text-muted-foreground font-sans">/month</span></p>
              <p className="text-xs text-muted-foreground mb-8">Cancel anytime</p>
              <ul className="space-y-3 text-sm text-muted-foreground flex-1">
                <li className="flex items-start gap-3"><span className="text-[var(--gold)] mt-0.5">+</span>All 8 worlds unlocked</li>
                <li className="flex items-start gap-3"><span className="text-[var(--gold)] mt-0.5">+</span>Unlimited scenes</li>
                <li className="flex items-start gap-3"><span className="text-[var(--gold)] mt-0.5">+</span>3 save slots</li>
                <li className="flex items-start gap-3"><span className="text-[var(--gold)] mt-0.5">+</span>All minigames & match reports</li>
                <li className="flex items-start gap-3"><span className="text-[var(--gold)] mt-0.5">+</span>Season summaries, transfer windows</li>
                <li className="flex items-start gap-3"><span className="text-[var(--gold)] mt-0.5">+</span>Chapter cards & trophy popups</li>
                <li className="flex items-start gap-3"><span className="text-[var(--gold)] mt-0.5">+</span>AI scene images</li>
                <li className="flex items-start gap-3"><span className="text-[var(--gold)] mt-0.5">+</span>Villain panel & full career stats</li>
                <li className="flex items-start gap-3"><span className="text-[#3B82F6] mt-0.5">+</span><span><span className="text-[#3B82F6]">Parallel Life</span> — Formative Years (10 years)</span></li>
              </ul>
              <button
                disabled={loading}
                onClick={() => handleSubscribe("legend_monthly", "legend")}
                className="mt-8 w-full py-4 bg-[var(--gold)] text-background text-xs tracking-[0.3em] uppercase font-medium hover:bg-[var(--gold-bright)] transition-all duration-500 shadow-[var(--shadow-gold)] disabled:opacity-50"
              >
                {isActive && tier === "legend" ? "Current Plan" : loading ? "Loading..." : "Become A Legend"}
              </button>
            </div>

            {/* Immortal — $20 */}
            <div className="bg-[var(--onyx)] border border-border p-8 flex flex-col">
              <h3 className="font-display text-3xl mb-2">Revenio Immortal</h3>
              <p className="text-2xl font-display text-[var(--gold)] mb-1">$20<span className="text-sm text-muted-foreground font-sans">/month</span></p>
              <p className="text-xs text-muted-foreground mb-8">For the truly obsessed</p>
              <ul className="space-y-3 text-sm text-muted-foreground flex-1">
                <li className="flex items-start gap-3"><span className="text-[var(--gold)] mt-0.5">+</span>Everything in Legend</li>
                <li className="flex items-start gap-3"><span className="text-[var(--gold)] mt-0.5">+</span>The Rift — exclusive 9th world</li>
                <li className="flex items-start gap-3"><span className="text-[var(--gold)] mt-0.5">+</span>Early access to new worlds</li>
                <li className="flex items-start gap-3"><span className="text-[var(--gold)] mt-0.5">+</span>IMMORTAL badge in the game topbar</li>
                <li className="flex items-start gap-3"><span className="text-[var(--gold)] mt-0.5">+</span>Replay any past scene</li>
                <li className="flex items-start gap-3"><span className="text-[var(--gold)] mt-0.5">+</span>Export your full story as PDF</li>
                <li className="flex items-start gap-3"><span className="text-[var(--gold)] mt-0.5">+</span>Priority scene generation</li>
              </ul>
              <button
                disabled={loading}
                onClick={() => handleSubscribe("immortal_monthly", "immortal")}
                className="mt-8 w-full py-4 border border-[var(--gold)]/60 text-[var(--gold)] text-xs tracking-[0.3em] uppercase hover:bg-[var(--gold)]/10 transition-all duration-500"
              >
                {isActive && tier === "immortal" ? "Current Plan" : loading ? "Loading..." : "Become Immortal"}
              </button>
            </div>
          </div>

          <p className="text-center mt-10 text-xs text-muted-foreground tracking-wider">
            Secure payment by Paddle · Cancel anytime · Instant access
          </p>
        </div>
      </section>

      {/* Value Props */}
      <section className="relative py-32 px-6 bg-[var(--onyx)] border-y border-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-4">What You Unlock</p>
            <h2 className="font-display text-5xl md:text-7xl font-light">
              Every choice<br /><span className="italic text-gold-gradient">opens a world.</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
            {valueProps.map((f) => (
              <div key={f.t} className="bg-background p-10 hover:bg-card transition-colors group">
                <div className="w-10 h-10 border border-[var(--gold)]/60 flex items-center justify-center mb-6 group-hover:bg-[var(--gold)] group-hover:border-[var(--gold)] transition-all">
                  <div className="w-2 h-2 bg-[var(--gold)] group-hover:bg-background transition-colors" />
                </div>
                <h3 className="font-display text-2xl mb-3">{f.t}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative py-32 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-4">Questions</p>
            <h2 className="font-display text-4xl md:text-6xl font-light">
              Before you<br /><span className="italic text-gold-gradient">step in.</span>
            </h2>
          </div>
          <div className="space-y-px bg-border">
            {faqs.map((f) => (
              <div key={f.q} className="bg-background p-8">
                <h3 className="font-display text-xl mb-3 text-[var(--gold)]">{f.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-32 px-6 text-center border-t border-border">
        <div className="gold-hairline w-24 mx-auto mb-8" />
        <h2 className="font-display text-5xl md:text-7xl font-light leading-[1]">
          Your story<br /><span className="italic text-gold-gradient">starts now.</span>
        </h2>
        <p className="mt-8 text-muted-foreground max-w-xl mx-auto">
          Join thousands living stories no one else will ever play.
        </p>
        <button
          disabled={loading}
          onClick={() => handleSubscribe("legend_monthly", "legend")}
          className="mt-10 px-12 py-4 bg-[var(--gold)] text-background text-xs tracking-[0.3em] uppercase font-medium hover:bg-[var(--gold-bright)] transition-all duration-500 shadow-[var(--shadow-gold)] disabled:opacity-50"
        >
          {loading ? "Loading..." : "Become A Legend — $10/mo"}
        </button>
      </section>

      <SiteFooter />
    </main>
  );
}
