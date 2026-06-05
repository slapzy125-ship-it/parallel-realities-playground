import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/experience")({
  head: () => ({
    meta: [
      { title: "Experience — Revenio" },
      { name: "description", content: "How Revenio works. Choose a galaxy. Step through the portal. Live the saga." },
      { property: "og:title", content: "The Revenio Experience" },
      { property: "og:description", content: "AI-powered parallel-universe simulation. One choice. Infinite sagas." },
    ],
  }),
  component: Experience,
});

const steps = [
  {
    n: "01",
    t: "Choose Your Galaxy",
    d: "Eight star systems. Sentinel temples, shadow empires, smuggler ports, rebel fleets. Pick the saga that calls to you.",
  },
  {
    n: "02",
    t: "Step Through the Portal",
    d: "The AI builds your role, your allies, your enemies, and your stakes in real time. No two entries are the same.",
  },
  {
    n: "03",
    t: "Live the Saga",
    d: "Every choice locks in. Every conversation shifts the story. Every session writes a different ending.",
  },
];

const features = [
  { t: "AI-Powered Simulations", d: "Every saga adapts to the choices you make in real time." },
  { t: "Dynamic Storytelling", d: "No two sessions unfold the same way — ever." },
  { t: "Choice-Based Outcomes", d: "Every decision permanently rewrites your timeline." },
  { t: "AI Companions", d: "Allies and rivals who remember every word you say to them." },
  { t: "Infinite Endings", d: "Replay the same world ten times. Watch ten different fates." },
  { t: "Full Immersion", d: "Reach out. Grip the lightblade. Pull the trigger. Feel the galaxy around you." },
];

function Experience() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <SiteNav />

      {/* Hero */}
      <section className="relative pt-40 pb-20 px-6 text-center">
        <div className="gold-hairline w-24 mx-auto mb-8" />
        <p className="text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-4">How It Works</p>
        <h1 className="font-display text-6xl md:text-8xl font-light leading-[1]">
          One choice.<br />
          <span className="italic text-gold-gradient">Infinite sagas.</span>
        </h1>
        <p className="mt-8 text-muted-foreground max-w-2xl mx-auto">
          Revenio is an AI-powered simulation platform. You pick the galaxy. The AI builds the world around you. You write the story.
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
              Every choice<br /><span className="italic text-gold-gradient">opens a galaxy.</span>
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

      {/* CTA */}
      <section className="relative py-40 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[var(--gradient-radial-gold)] opacity-50" />
        <div className="relative max-w-3xl mx-auto">
          <div className="gold-hairline w-24 mx-auto mb-8" />
          <h2 className="font-display text-5xl md:text-7xl font-light mb-8 leading-tight">
            Your saga<br />
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

