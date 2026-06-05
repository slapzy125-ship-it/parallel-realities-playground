import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import showcaseAsset from "@/assets/revenio-showcase.asset.json";

export const Route = createFileRoute("/hardware")({
  head: () => ({
    meta: [
      { title: "Hardware — Revenio One" },
      { name: "description", content: "Revenio One. Two finishes. Built for galactic immersion. Coming 2031." },
      { property: "og:title", content: "Revenio One — The Hardware" },
      { property: "og:description", content: "Onyx and Luxe editions. One headset. Infinite worlds." },
    ],
  }),
  component: Hardware,
});

const features = [
  { t: "AI-Powered Simulations", d: "Every saga adapts to the choices you make in real time." },
  { t: "Dynamic Storytelling", d: "No two sessions unfold the same way — ever." },
  { t: "Choice-Based Outcomes", d: "Every decision permanently rewrites your timeline." },
  { t: "AI Companions", d: "Allies and rivals who remember every word you say to them." },
  { t: "Infinite Endings", d: "Replay the same world ten times. Watch ten different fates." },
  { t: "Galactic Hand-Tracking", d: "Reach out. Grip the lightblade. Pull the trigger. No controllers." },
];

const future = [
  "Haptic Gauntlets",
  "Environmental Immersion",
  "AI Companion Network",
  "Lightblade Peripherals",
  "Mixed Reality Cockpits",
  "Speeder Rig Add-On",
  "Surround Audio Suite",
  "Personalized Universes",
];

function Hardware() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <SiteNav />

      {/* Hero */}
      <section className="relative pt-40 pb-20 px-6 text-center">
        <div className="gold-hairline w-24 mx-auto mb-8" />
        <p className="text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-4">Coming 2031</p>
        <h1 className="font-display text-6xl md:text-8xl font-light leading-[1]">
          Revenio One.<br />
          <span className="italic text-gold-gradient">Built for immersion.</span>
        </h1>
        <p className="mt-8 text-muted-foreground max-w-2xl mx-auto">
          One headset. Two finishes. Engineered from the ground up for AI-powered galactic simulation.
        </p>
      </section>

      {/* Showcase */}
      <section className="relative pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="relative border border-[var(--gold)]/30 overflow-hidden shadow-[var(--shadow-deep)]">
            <img
              src={showcaseAsset.url}
              alt="Revenio One — Onyx and Luxe editions"
              className="w-full h-auto"
            />
            <div className="absolute inset-0 ring-1 ring-inset ring-[var(--gold)]/20 pointer-events-none" />
          </div>

          <div className="grid md:grid-cols-2 gap-px bg-border mt-px">
            <div className="bg-background p-10">
              <p className="text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-3">Onyx Edition</p>
              <h3 className="font-display text-3xl mb-4">Black & Gold. The flagship.</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>· Transparent gold-rim optics</li>
                <li>· Maximum immersion field</li>
                <li>· Precision motion sensors</li>
              </ul>
            </div>
            <div className="bg-background p-10">
              <p className="text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-3">Luxe Edition</p>
              <h3 className="font-display text-3xl mb-4">White & Gold. The ceremonial.</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>· Premium comfort headband</li>
                <li>· Ultra-clear display lattice</li>
                <li>· Hand-finished gold detailing</li>
              </ul>
            </div>
          </div>
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

      {/* Future tech */}
      <section className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-4">The Road Map</p>
            <h2 className="font-display text-5xl md:text-7xl font-light">The future of <span className="italic text-gold-gradient">reality.</span></h2>
          </div>
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
            {future.map((tech) => (
              <div key={tech} className="aspect-square border border-border hover:border-[var(--gold)] p-6 flex flex-col justify-between group hover:bg-[var(--gold)]/5 transition-all duration-500">
                <span className="text-[0.6rem] tracking-[0.35em] uppercase text-[var(--gold)]/60 group-hover:text-[var(--gold)]">Concept</span>
                <p className="font-display text-2xl leading-tight">{tech}</p>
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
            One headset.<br />
            <span className="italic text-gold-gradient">Infinite worlds.</span>
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
