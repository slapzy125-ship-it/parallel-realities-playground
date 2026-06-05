import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import showcaseAsset from "@/assets/revenio-showcase.asset.json";
import gearWand from "@/assets/gear-wand.png.asset.json";
import gearGloves from "@/assets/gear-gloves.png.asset.json";
import gearSaber from "@/assets/gear-saber.png.asset.json";
import gearSword from "@/assets/gear-sword.png.asset.json";
import gearShoes from "@/assets/gear-shoes.png.asset.json";

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

const gear = [
  {
    name: "Arcane Academy Wand",
    world: "Arcane Academy",
    img: gearWand.url,
    desc: "Forged with ancient magic. Guided by intention. Powered by you. Cast spells with a flick of the wrist — every gesture tracked, every incantation answered.",
  },
  {
    name: "Revenio One Gloves",
    world: "Universal",
    img: gearGloves.url,
    desc: "Precision haptic gauntlets with gold-channel feedback. Feel the weight of every object, the recoil of every weapon, the texture of every world.",
  },
  {
    name: "Galactic Frontier Energy Saber",
    world: "Galactic Frontier",
    img: gearSaber.url,
    desc: "A weapon for a more civilized age. Ignite the blade, feel the hum, duel across star systems with full motion tracking and live impact response.",
  },
  {
    name: "Dragonsteel Blade",
    world: "Dragonfall Kingdoms",
    img: gearSword.url,
    desc: "VR sword controller forged for the realm. Motion tracking, haptic feedback, LED edge lighting, and ergonomic grip — built for siege and saddle alike.",
  },
  {
    name: "Champions Legacy Footwear",
    world: "Champions Legacy",
    img: gearShoes.url,
    desc: "Performance. Immersion. Victory. Enhanced movement, motion tracking, and stability — sprint, cut, and leap inside the stadium without leaving your room.",
  },
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

      {/* Signature Gear */}
      <section className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-4">Signature Gear</p>
            <h2 className="font-display text-5xl md:text-7xl font-light">Crafted for <span className="italic text-gold-gradient">every world.</span></h2>
            <p className="mt-6 text-muted-foreground max-w-2xl mx-auto">Bespoke peripherals built to match the saga you step into. Each piece is forged, finished, and tuned to its world.</p>
          </div>
          <div className="space-y-px bg-border">
            {gear.map((g, i) => (
              <div key={g.name} className={`grid md:grid-cols-2 bg-background ${i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""}`}>
                <div className="relative aspect-[4/3] overflow-hidden border-b md:border-b-0 md:border-r border-border">
                  <img src={g.img} alt={g.name} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="p-10 md:p-16 flex flex-col justify-center">
                  <p className="text-[0.6rem] tracking-[0.4em] uppercase text-[var(--gold)] mb-3">{g.world}</p>
                  <h3 className="font-display text-3xl md:text-4xl mb-5 leading-tight">{g.name}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{g.desc}</p>
                </div>
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
