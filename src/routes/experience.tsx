import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { usePaddleCheckout } from "@/hooks/usePaddleCheckout";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/experience")({
  head: () => ({
    meta: [
      { title: "Experience — Revenio" },
      { name: "description", content: "How Revenio works. Pick a world. Step in. Live the story." },
      { property: "og:title", content: "How Revenio Works" },
      { property: "og:description", content: "AI worlds you live in. One choice. Endless stories." },
    ],
  }),
  component: Experience,
});

const steps = [
  { n: "01", t: "Pick Your World", d: "Eight worlds. Magic, space, kingdoms, heroes, and more. Pick the one you want." },
  { n: "02", t: "Step Inside", d: "The AI sets up your role, your friends, your enemies — live, on the fly. No two runs are the same." },
  { n: "03", t: "Live the Story", d: "Every choice sticks. Every chat moves the story. Every run ends a different way." },
];

const features = [
  { t: "AI Worlds", d: "The story changes with every choice you make." },
  { t: "Live Storytelling", d: "No two runs play out the same way." },
  { t: "Choices That Stick", d: "Every choice changes what happens next." },
  { t: "AI Friends", d: "People in the world remember what you say." },
  { t: "Endless Endings", d: "Play the same world ten times. Ten new endings." },
  { t: "Full Immersion", d: "Reach out. Grab the sword. Pull the trigger. Feel the world." },
];

function Experience() {
  const router = useRouter();
  const { openCheckout, loading } = usePaddleCheckout();
  const { tier, isActive, userId } = useSubscription();
  const [email, setEmail] = useState<string | undefined>();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? undefined));
  }, [userId]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "success") {
      toast.success("Welcome aboard! Your subscription is being activated.");
      window.history.replaceState({}, "", "/experience");
      // Redirect back to the game after a brief delay so they see the toast
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
      customerEmail: email,
      customData: { userId },
      successUrl: `${window.location.origin}/play?checkout=success`,
    });
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <PaymentTestModeBanner />
      <SiteNav />

      {/* Hero */}
      <section className="relative pt-40 pb-20 px-6 text-center">
        <div className="gold-hairline w-24 mx-auto mb-8" />
        <p className="text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-4">How It Works</p>
        <h1 className="font-display text-6xl md:text-8xl font-light leading-[1]">
          One choice.<br />
          <span className="italic text-gold-gradient">Endless stories.</span>
        </h1>
        <p className="mt-8 text-muted-foreground max-w-2xl mx-auto">
          Revenio is a world you can step into. You pick the world. The AI builds it around you. You live the story.
        </p>
      </section>

      {/* Steps */}
      <section className="relative pb-32 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-px bg-border">
          {steps.map((s) => (
            <div key={s.n} className="bg-background p-10 text-left">
              <p className="font-display text-5xl text-[var(--gold)]/40 mb-4">{s.n}</p>
              <h3 className="font-display text-2xl mb-3">{s.t}</h3>
              <p className="text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative py-32 px-6 bg-[var(--onyx)] border-y border-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-4">Why Revenio</p>
            <h2 className="font-display text-5xl md:text-7xl font-light">
              Every choice<br /><span className="italic text-gold-gradient">opens a world.</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
            {features.map((f) => (
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

      {/* Pricing */}
      <section className="relative py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-4">Pricing</p>
            <h2 className="font-display text-5xl md:text-7xl font-light">
              Pick your<br /><span className="italic text-gold-gradient">path.</span>
            </h2>
            {!userId && (
              <p className="mt-8 text-sm text-muted-foreground">
                <Link to="/auth" className="text-[var(--gold)] underline">Sign in</Link> to subscribe and keep your story across devices.
              </p>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Explorer — Free */}
            <div className="bg-[var(--onyx)] border border-border p-8 flex flex-col">
              <h3 className="font-display text-3xl mb-2">Revenio Explorer</h3>
              <p className="text-2xl font-display text-[var(--gold)] mb-8">FREE</p>
              <ul className="space-y-3 text-sm text-muted-foreground flex-1">
                <li className="flex items-start gap-3"><span className="text-[var(--gold)] mt-0.5">+</span>2 worlds: Champions Legacy & Arcane Academy</li>
                <li className="flex items-start gap-3"><span className="text-[var(--gold)] mt-0.5">+</span>5 scenes per world</li>
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
            <div className="bg-[var(--onyx)] border-2 border-[var(--gold)]/60 p-8 flex flex-col relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--gold)] text-background text-[10px] tracking-[0.2em] uppercase px-4 py-1 font-medium">
                Most Popular
              </div>
              <h3 className="font-display text-3xl mb-2">Revenio Legend</h3>
              <p className="text-2xl font-display text-[var(--gold)] mb-8">$10<span className="text-sm text-muted-foreground font-sans">/month</span></p>
              <ul className="space-y-3 text-sm text-muted-foreground flex-1">
                <li className="flex items-start gap-3"><span className="text-[var(--gold)] mt-0.5">+</span>All 8 worlds unlocked</li>
                <li className="flex items-start gap-3"><span className="text-[var(--gold)] mt-0.5">+</span>Unlimited scenes</li>
                <li className="flex items-start gap-3"><span className="text-[var(--gold)] mt-0.5">+</span>3 save slots</li>
                <li className="flex items-start gap-3"><span className="text-[var(--gold)] mt-0.5">+</span>All minigames & match reports</li>
                <li className="flex items-start gap-3"><span className="text-[var(--gold)] mt-0.5">+</span>Season summaries, transfer windows</li>
                <li className="flex items-start gap-3"><span className="text-[var(--gold)] mt-0.5">+</span>Chapter cards & trophy popups</li>
                <li className="flex items-start gap-3"><span className="text-[var(--gold)] mt-0.5">+</span>AI scene images</li>
                <li className="flex items-start gap-3"><span className="text-[var(--gold)] mt-0.5">+</span>Villain panel & full career stats</li>
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
              <p className="text-2xl font-display text-[var(--gold)] mb-8">$20<span className="text-sm text-muted-foreground font-sans">/month</span></p>
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
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
