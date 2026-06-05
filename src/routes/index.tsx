import { createFileRoute } from "@tanstack/react-router";
import { RevenioLogo } from "@/components/RevenioLogo";
import heroPortals from "@/assets/hero-portals.jpg";
import showcaseAsset from "@/assets/revenio-showcase.asset.json";
import wMagic from "@/assets/world-magic.jpg";
import wFuture from "@/assets/world-future.jpg";
import wSports from "@/assets/world-sports.jpg";
import wKingdom from "@/assets/world-kingdom.jpg";
import wSpace from "@/assets/world-space.jpg";
import wEmpire from "@/assets/world-empire.jpg";
import wSurvival from "@/assets/world-survival.jpg";
import wHero from "@/assets/world-hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Revenio — Explore the Life You Never Lived" },
      { name: "description", content: "Step into AI-powered simulations where every choice opens a parallel reality. Become a sorcerer, a champion, a galactic explorer — another you." },
      { property: "og:title", content: "Revenio — Become Another You" },
      { property: "og:description", content: "AI-powered parallel-universe simulations. One headset. Infinite worlds." },
    ],
  }),
  component: Index,
});

const worlds = [
  { name: "School of Magic", tag: "Master the arcane.", desc: "A hidden academy where ancient students learn forbidden magic.", img: wMagic },
  { name: "Sports Legend", tag: "Forge your dynasty.", desc: "Rise from unknown prospect to global superstar in the world's biggest stadiums.", img: wSports },
  { name: "Future Civilization", tag: "Live the year 2200.", desc: "Inhabit humanity's most advanced society — neon, marble and quantum light.", img: wFuture },
  { name: "Kingdom of Dragons", tag: "Wear the crown.", desc: "Rule a fragile kingdom under the wings of an ancient golden dragon.", img: wKingdom },
  { name: "Space Explorer", tag: "Chart the void.", desc: "Lead humanity's first deep-space missions across uncharted galaxies.", img: wSpace },
  { name: "Business Empire", tag: "Build the throne.", desc: "Architect a billion-dollar empire from a single penthouse window.", img: wEmpire },
  { name: "Survival Challenge", tag: "Outlast the end.", desc: "A dying world. A golden blade. Every choice is the difference between dust and legend.", img: wSurvival },
  { name: "Hero Realms", tag: "Meet the other you.", desc: "Step through the mirror. The hero you were always meant to be is waiting.", img: wHero },
];

const traits = [
  { label: "Supernaturally Strong", note: "Rip steel. Move mountains." },
  { label: "Recklessly Brilliant", note: "Genius with no fear of consequence." },
  { label: "Quietly Lethal", note: "Stealth, blades, and patience." },
  { label: "Charismatic Tyrant", note: "Command a room. Conquer a kingdom." },
  { label: "Cursed & Gifted", note: "Power at a price." },
  { label: "Reckless Optimist", note: "Charges into the impossible — and wins." },
];

const features = [
  { t: "Parallel-Universe Engine", d: "Not a 'what if I went to a different college'. A different you, in a different reality, entirely." },
  { t: "Dynamic Storytelling", d: "Every session is rewritten in real time. No two stories are ever the same." },
  { t: "Choice-Based Outcomes", d: "Every decision permanently rewrites your timeline." },
  { t: "Mythic Character Forge", d: "Design alternate selves — superhuman, broken, brilliant, dangerous." },
  { t: "Infinite Endings", d: "Replay the same world ten times. Watch ten different fates unfold." },
  { t: "AI Companions", d: "Allies and rivals that remember every word you've said to them." },
];

function Index() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/60 border-b border-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <a href="#top" className="flex items-center gap-3">
            <RevenioLogo size={32} />
            <span className="font-display text-2xl tracking-[0.25em] text-foreground">REVENIO</span>
          </a>
          <div className="hidden md:flex items-center gap-10 text-xs tracking-[0.2em] uppercase text-muted-foreground">
            <a href="#worlds" className="hover:text-foreground transition">Worlds</a>
            <a href="#forge" className="hover:text-foreground transition">Forge</a>
            <a href="#hardware" className="hover:text-foreground transition">Hardware</a>
            <a href="#future" className="hover:text-foreground transition">Future</a>
          </div>
          <a href="#start" className="text-xs tracking-[0.2em] uppercase border border-[var(--gold)]/60 text-[var(--gold)] px-5 py-2.5 hover:bg-[var(--gold)] hover:text-background transition-all duration-300">
            Start Simulation
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section id="top" className="relative min-h-screen flex items-center justify-center pt-24 overflow-hidden">
        <img
          src={heroPortals}
          alt="A cinematic constellation of golden portals leading into parallel realities"
          className="absolute inset-0 w-full h-full object-cover opacity-70"
          width={1920}
          height={1088}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/30 to-background" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/60" />

        {/* Spinning portal ring */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] pointer-events-none animate-portal opacity-30">
          <div className="absolute inset-0 rounded-full border border-[var(--gold)]/40" />
          <div className="absolute inset-10 rounded-full border border-[var(--gold)]/20" />
          <div className="absolute inset-24 rounded-full border border-[var(--gold)]/10" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center animate-fade-up">
          <div className="inline-flex items-center gap-3 text-[0.65rem] tracking-[0.4em] uppercase text-[var(--gold)] mb-8">
            <span className="w-8 gold-hairline" />
            Founded 2026 · Wellesley, MA
            <span className="w-8 gold-hairline" />
          </div>
          <h1 className="font-display text-6xl md:text-8xl lg:text-9xl font-light leading-[0.95] mb-8">
            Become<br />
            <span className="shimmer-text italic font-medium">Another You.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 font-light">
            Step into AI-powered simulations where every choice creates a new reality.
            Parallel-universe storytelling. Mythic alter-egos. One headset. Infinite worlds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="#forge"
              className="group relative px-10 py-4 bg-[var(--gold)] text-background text-xs tracking-[0.3em] uppercase font-medium hover:bg-[var(--gold-bright)] transition-all duration-500 shadow-[var(--shadow-gold)]"
            >
              Start Simulation
              <span className="ml-3 inline-block transition-transform group-hover:translate-x-1">→</span>
            </a>
            <a
              href="#worlds"
              className="px-10 py-4 border border-[var(--gold)]/60 text-[var(--gold)] text-xs tracking-[0.3em] uppercase hover:bg-[var(--gold)]/10 transition-all duration-500"
            >
              Explore Worlds
            </a>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[0.6rem] tracking-[0.4em] text-muted-foreground/60 uppercase animate-float">
          Scroll · Enter the Multiverse
        </div>
      </section>

      {/* WHAT IS REVENIO */}
      <section className="relative py-32 px-6 max-w-5xl mx-auto text-center">
        <div className="gold-hairline w-24 mx-auto mb-8" />
        <p className="text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-6">What Is Revenio</p>
        <h2 className="font-display text-4xl md:text-6xl font-light mb-10 leading-tight">
          Not a life predictor.<br />
          <span className="italic text-gold-gradient">A parallel-universe playground.</span>
        </h2>
        <p className="text-lg text-muted-foreground leading-relaxed font-light max-w-3xl mx-auto">
          Revenio is an AI-powered simulation platform built for mythic alter-egos — not "what if I went to a different college,"
          but <em className="text-foreground/80">"what if I were supernaturally strong, recklessly brilliant, the chosen one of a dying kingdom?"</em>
          Forge a new self. Choose a world. Watch the AI write a story only you could live.
        </p>
        <div className="grid grid-cols-3 gap-6 mt-16 text-center">
          {["Every simulation is unique.", "Every decision changes the outcome.", "Every journey is a different life."].map((t) => (
            <p key={t} className="font-display italic text-lg md:text-xl text-[var(--gold)]/90 border-l border-[var(--gold)]/30 pl-4 md:border-l-0 md:border-t md:pl-0 md:pt-6">{t}</p>
          ))}
        </div>
      </section>

      {/* FORGE — Character creation */}
      <section id="forge" className="relative py-32 px-6 bg-[var(--onyx)] border-y border-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-4">The Forge</p>
            <h2 className="font-display text-5xl md:text-7xl font-light">Build the <span className="italic text-gold-gradient">alter-ego</span>.</h2>
            <p className="mt-6 text-muted-foreground max-w-2xl mx-auto">
              You are not yourself in here. Pick traits, pick a world, pick a fate. The AI does the rest.
            </p>
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-5 gap-px bg-border mb-24">
            {[
              { n: "01", t: "Forge a Self", d: "Upload a face. Choose mythic traits — strength, cunning, charisma, curse." },
              { n: "02", t: "Choose a World", d: "Eight realities. From dragon kingdoms to neon megacities." },
              { n: "03", t: "Enter the Story", d: "AI generates allies, rivals, challenges, and your role in the world." },
              { n: "04", t: "Make Decisions", d: "Every choice rewrites the timeline. There is no undo." },
              { n: "05", t: "Discover Your Fate", d: "Watch your legend — or your ruin — unfold." },
            ].map((s) => (
              <div key={s.n} className="bg-background p-8 hover:bg-card transition-colors group">
                <p className="font-display text-5xl text-[var(--gold)]/40 group-hover:text-[var(--gold)] transition-colors mb-4">{s.n}</p>
                <h3 className="font-display text-2xl mb-3">{s.t}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>

          {/* Trait selection mock */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-4">Pick Your Nature</p>
              <h3 className="font-display text-4xl md:text-5xl font-light mb-6 leading-tight">
                In this session,<br/>you are <span className="italic text-gold-gradient">someone else entirely.</span>
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Forget "high ambition, medium risk tolerance." This is Ready Player One territory — you choose
                a mythic archetype and step into it. The world bends around who you decide to be.
              </p>
              <a href="#worlds" className="text-xs tracking-[0.3em] uppercase text-[var(--gold)] border-b border-[var(--gold)]/60 pb-1 hover:border-[var(--gold)]">
                Choose your world →
              </a>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {traits.map((t, i) => (
                <button
                  key={t.label}
                  className="text-left p-5 border border-border bg-card hover:border-[var(--gold)] hover:bg-[var(--gold)]/5 transition-all duration-300 group"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <p className="font-display text-xl mb-1 group-hover:text-[var(--gold)] transition-colors">{t.label}</p>
                  <p className="text-xs text-muted-foreground">{t.note}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WORLDS */}
      <section id="worlds" className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-4">Choose Your Reality</p>
            <h2 className="font-display text-5xl md:text-7xl font-light">Countless universes.<br /><span className="italic text-gold-gradient">Infinite possibilities.</span></h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {worlds.map((w) => (
              <article
                key={w.name}
                className="group relative aspect-[3/4] overflow-hidden border border-border hover:border-[var(--gold)] transition-all duration-500 cursor-pointer"
              >
                <img
                  src={w.img}
                  alt={w.name}
                  loading="lazy"
                  width={800}
                  height={1024}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                <div className="absolute inset-0 bg-[var(--gold)]/0 group-hover:bg-[var(--gold)]/10 transition-colors duration-500" />

                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <p className="text-[0.6rem] tracking-[0.35em] uppercase text-[var(--gold)] mb-2">{w.tag}</p>
                  <h3 className="font-display text-2xl mb-2 leading-tight">{w.name}</h3>
                  <p className="text-xs text-muted-foreground/90 leading-relaxed opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">{w.desc}</p>
                </div>

                <div className="absolute top-4 right-4 w-8 h-8 border border-[var(--gold)]/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[var(--gold)] text-xs">↗</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* IMAGINE THE POSSIBILITIES */}
      <section className="relative py-32 px-6 bg-[var(--onyx)] border-y border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-4">Imagine</p>
            <h2 className="font-display text-5xl md:text-7xl font-light">What if<span className="italic text-gold-gradient"> …</span></h2>
          </div>
          <div className="space-y-px">
            {[
              "you became the world's greatest athlete in a stadium of a hundred thousand?",
              "you walked the halls of the most prestigious school of magic ever imagined?",
              "you built a billion-dollar empire before your thirtieth birthday?",
              "you ruled a kingdom threatened by an ancient golden dragon?",
              "you commanded humanity's first interstellar fleet into the dark?",
              "you survived a world where AI had already won?",
            ].map((q, i) => (
              <div key={q} className="group flex items-center gap-6 py-8 border-b border-border hover:bg-[var(--gold)]/5 transition-colors px-4 cursor-pointer">
                <span className="font-display text-3xl text-[var(--gold)]/40 group-hover:text-[var(--gold)] transition-colors w-16">{String(i+1).padStart(2,"0")}</span>
                <p className="font-display text-2xl md:text-3xl font-light italic flex-1 group-hover:translate-x-2 transition-transform">{q}</p>
                <span className="text-[var(--gold)] opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-4">Why Revenio</p>
            <h2 className="font-display text-5xl md:text-7xl font-light">Every choice creates<br/><span className="italic text-gold-gradient">a new reality.</span></h2>
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

      {/* HARDWARE / SHOWCASE */}
      <section id="hardware" className="relative py-32 px-6 bg-[var(--onyx)] border-y border-border overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-4">The Hardware</p>
            <h2 className="font-display text-5xl md:text-7xl font-light">Revenio One.<br/><span className="italic text-gold-gradient">Built for immersion.</span></h2>
            <p className="mt-6 text-muted-foreground max-w-2xl mx-auto">
              One headset. Two finishes. Infinite worlds. Coming 2031.
            </p>
          </div>

          {/* Showcase reference image */}
          <div className="relative border border-[var(--gold)]/30 overflow-hidden shadow-[var(--shadow-deep)] group">
            <img
              src={showcaseAsset.url}
              alt="Revenio One — Onyx and Luxe editions"
              loading="lazy"
              className="w-full h-auto"
            />
            <div className="absolute inset-0 ring-1 ring-inset ring-[var(--gold)]/20 pointer-events-none" />
          </div>

          {/* Spec cards */}
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

      {/* FUTURE */}
      <section id="future" className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-4">Coming 2031</p>
            <h2 className="font-display text-5xl md:text-7xl font-light">The future of <span className="italic text-gold-gradient">reality.</span></h2>
          </div>
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              "Haptic Gloves",
              "Environmental Immersion",
              "AI Companions",
              "Interactive NPC Ecosystems",
              "Mixed Reality Worlds",
              "Energy Sword Peripherals",
              "Magic Staff Controllers",
              "Personalized Universes",
            ].map((tech) => (
              <div key={tech} className="aspect-square border border-border hover:border-[var(--gold)] p-6 flex flex-col justify-between group hover:bg-[var(--gold)]/5 transition-all duration-500">
                <span className="text-[0.6rem] tracking-[0.35em] uppercase text-[var(--gold)]/60 group-hover:text-[var(--gold)]">Concept</span>
                <p className="font-display text-2xl leading-tight">{tech}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="start" className="relative py-40 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[var(--gradient-radial-gold)] opacity-50" />
        <div className="relative max-w-3xl mx-auto">
          <div className="gold-hairline w-24 mx-auto mb-8" />
          <p className="text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-6">Become Part of Revenio</p>
          <h2 className="font-display text-5xl md:text-7xl font-light mb-8 leading-tight">
            One headset.<br />
            <span className="italic text-gold-gradient">Infinite worlds.</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-12 font-light">
            Join a growing community of explorers writing stories that don't exist yet.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#forge" className="px-10 py-4 bg-[var(--gold)] text-background text-xs tracking-[0.3em] uppercase font-medium hover:bg-[var(--gold-bright)] transition-all duration-500 shadow-[var(--shadow-gold)]">
              Start Simulation
            </a>
            <a href="#top" className="px-10 py-4 border border-[var(--gold)]/60 text-[var(--gold)] text-xs tracking-[0.3em] uppercase hover:bg-[var(--gold)]/10 transition-all duration-500">
              Follow Our Journey
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative border-t border-border py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <RevenioLogo size={28} />
            <span className="font-display text-xl tracking-[0.25em]">REVENIO</span>
            <span className="hidden md:inline text-border">|</span>
            <span className="hidden md:inline text-xs tracking-[0.3em] uppercase text-muted-foreground">
              One Headset. Infinite Worlds.
            </span>
          </div>
          <p className="text-[0.65rem] tracking-[0.3em] uppercase text-muted-foreground/60">
            © 2026 Revenio LLC · Wellesley, MA · Coming 2031
          </p>
        </div>
      </footer>
    </main>
  );
}
