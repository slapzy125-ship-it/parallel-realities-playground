import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { usePaddleCheckout } from "@/hooks/usePaddleCheckout";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "sonner";
import { useEffect } from "react";

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
  {
    n: "01",
    t: "Pick Your World",
    d: "Eight worlds. Magic, space, kingdoms, heroes, and more. Pick the one you want.",
  },
  {
    n: "02",
    t: "Step Inside",
    d: "The AI sets up your role, your friends, your enemies — live, on the fly. No two runs are the same.",
  },
  {
    n: "03",
    t: "Live the Story",
    d: "Every choice sticks. Every chat moves the story. Every run ends a different way.",
  },
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
  const { openCheckout, loading } = usePaddleCheckout();
  const { tier, isActive } = useSubscription();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "success") {
      toast.success("Welcome aboard! Your subscription is being activated.");
      window.history.replaceState({}, "", "/experience");
    }
  }, []);

  const handleSubscribe = (priceId: string, tierName: "legend" | "infinite") => {
    if (isActive && tier === tierName) {
      toast.info(`You're already on Revenio ${tierName === "legend" ? "Legend" : "Infinite"}.`);
      return;
    }
    openCheckout({ priceId });
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
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Explorer — Free */}
            <div className="bg-[var(--onyx)] border border-border p-8 flex flex-col">
              <h3 className="font-display text-3xl mb-2">Revenio Explorer</h3>
              <p className="text-2xl font-display text-[var(--gold)] mb-8">FREE</p>
              <ul className="space-y-3 text-sm text-muted-foreground flex-1">
                <li className="flex items-start gap-3"><span className="text-[var(--gold)] mt-0.5">+</span>Access to 2 Worlds</li>
                <li className="flex items-start gap-3"><span className="text-[var(--gold)] mt-0.5">+</span>Arcane Academy</li>
                <li className="flex items-start gap-3"><span className="text-[var(--gold)] mt-0.5">+</span>Champions Legacy</li>
                <li className="flex items-start gap-3"><span className="text-[var(--gold)] mt-0.5">+</span>3 Simulations Per Day</li>
                <li className="flex items-start gap-3"><span className="text-[var(--gold)] mt-0.5">+</span>Basic Character Creation</li>
                <li className="flex items-start gap-3"><span className="text-[var(--gold)] mt-0.5">+</span>Save 1 Character</li>
                <li className="flex items-start gap-3"><span className="text-[var(--gold)] mt-0.5">+</span>Standard AI Speed</li>
                <li className="flex items-start gap-3"><span className="text-[var(--gold)] mt-0.5">+</span>Community Access</li>
              </ul>
              <button className="mt-8 w-full py-4 border border-[var(--gold)]/60 text-[var(--gold)] text-xs tracking-[0.3em] uppercase hover:bg-[var(--gold)]/10 transition-all duration-500">
                Start Free
              </button>
            </div>

            {/* Legend — $9.99 */}
            <div className="bg-[var(--onyx)] border-2 border-[var(--gold)]/60 p-8 flex flex-col relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--gold)] text-background text-[10px] tracking-[0.2em] uppercase px-4 py-1 font-medium">
                Most Popular
              </div>
              <h3 className="font-display text-3xl mb-2">Revenio Legend</h3>
              <p className="text-2xl font-display text-[var(--gold)] mb-8">$9.99<span className="text-sm text-muted-foreground font-sans">/month</span></p>
              <ul className="space-y-3 text-sm text-muted-foreground flex-1">
                <li className="flex items-start gap-3"><span className="text-[var(--gold)] mt-0.5">+</span>Access to All 8 Worlds</li>
                <li className="flex items-start gap-3"><span className="text-[var(--gold)] mt-0.5">+</span>Unlimited Simulations</li>
                <li className="flex items-start gap-3"><span className="text-[var(--gold)] mt-0.5">+</span>Advanced Character Creation</li>
                <li className="flex items-start gap-3"><span className="text-[var(--gold)] mt-0.5">+</span>Unlimited Character Saves</li>
                <li className="flex items-start gap-3"><span className="text-[var(--gold)] mt-0.5">+</span>Story Progress Tracking</li>
                <li className="flex items-start gap-3"><span className="text-[var(--gold)] mt-0.5">+</span>Exclusive Equipment</li>
                <li className="flex items-start gap-3"><span className="text-[var(--gold)] mt-0.5">+</span>Faster AI Responses</li>
                <li className="flex items-start gap-3"><span className="text-[var(--gold)] mt-0.5">+</span>Premium Character Slots</li>
                <li className="flex items-start gap-3"><span className="text-[var(--gold)] mt-0.5">+</span>Future World Access</li>
              </ul>
              <button
                disabled={loading}
                onClick={() => handleSubscribe("revenio_legend_monthly", "legend")}
                className="mt-8 w-full py-4 bg-[var(--gold)] text-background text-xs tracking-[0.3em] uppercase font-medium hover:bg-[var(--gold-bright)] transition-all duration-500 shadow-[var(--shadow-gold)] disabled:opacity-50"
              >
                {isActive && tier === "legend" ? "Current Plan" : loading ? "Loading..." : "Become A Legend"}
              </button>
            </div>

            {/* Infinite — $19.99 */}
            <div className="bg-[var(--onyx)] border border-border p-8 flex flex-col">
              <h3 className="font-display text-3xl mb-2">Revenio Infinite</h3>
              <p className="text-2xl font-display text-[var(--gold)] mb-8">$19.99<span className="text-sm text-muted-foreground font-sans">/month</span></p>
              <ul className="space-y-3 text-sm text-muted-foreground flex-1">
                <li className="flex items-start gap-3"><span className="text-[var(--gold)] mt-0.5">+</span>Everything In Legend</li>
                <li className="flex items-start gap-3"><span className="text-[var(--gold)] mt-0.5">+</span>Early Access To New Worlds</li>
                <li className="flex items-start gap-3"><span className="text-[var(--gold)] mt-0.5">+</span>Exclusive Storylines</li>
                <li className="flex items-start gap-3"><span className="text-[var(--gold)] mt-0.5">+</span>Founder Rewards</li>
                <li className="flex items-start gap-3"><span className="text-[var(--gold)] mt-0.5">+</span>Premium Equipment Sets</li>
                <li className="flex items-start gap-3"><span className="text-[var(--gold)] mt-0.5">+</span>AI Companion Characters</li>
                <li className="flex items-start gap-3"><span className="text-[var(--gold)] mt-0.5">+</span>Exclusive Cosmetics</li>
                <li className="flex items-start gap-3"><span className="text-[var(--gold)] mt-0.5">+</span>Revenio One Discounts</li>
                <li className="flex items-start gap-3"><span className="text-[var(--gold)] mt-0.5">+</span>Future Hardware Benefits</li>
              </ul>
              <button
                disabled={loading}
                onClick={() => handleSubscribe("revenio_infinite_monthly", "infinite")}
                className="mt-8 w-full py-4 border border-[var(--gold)] text-[var(--gold)] text-xs tracking-[0.3em] uppercase hover:bg-[var(--gold)]/10 transition-all duration-500 disabled:opacity-50"
              >
                {isActive && tier === "infinite" ? "Current Plan" : loading ? "Loading..." : "Enter Infinite"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-40 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[var(--gradient-radial-gold)] opacity-50" />
        <div className="relative max-w-3xl mx-auto">
          <div className="gold-hairline w-24 mx-auto mb-8" />
          <h2 className="font-display text-5xl md:text-7xl font-light mb-8 leading-tight">
            Your story<br />
            <span className="italic text-gold-gradient">starts now.</span>
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/worlds" className="px-10 py-4 bg-[var(--gold)] text-background text-xs tracking-[0.3em] uppercase font-medium hover:bg-[var(--gold-bright)] transition-all duration-500 shadow-[var(--shadow-gold)]">
              Explore Worlds
            </Link>
            <Link to="/auth" className="px-10 py-4 border border-[var(--gold)]/60 text-[var(--gold)] text-xs tracking-[0.3em] uppercase hover:bg-[var(--gold)]/10 transition-all duration-500">
              Create Account
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

