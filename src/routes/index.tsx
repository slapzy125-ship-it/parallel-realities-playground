import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import heroPortals from "@/assets/hero-portals.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Revenio — Live Another Life" },
      { name: "description", content: "Step into AI worlds. Pick a world. Live a story. One headset. Endless worlds." },
      { property: "og:title", content: "Revenio — Be Someone Else" },
      { property: "og:description", content: "AI worlds you can step into. Coming 2031." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <SiteNav />

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center pt-24 overflow-hidden">
        <img
          src={heroPortals}
          alt="Golden portals opening into parallel galactic realities"
          className="absolute inset-0 w-full h-full object-cover opacity-70"
          width={1920}
          height={1088}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/30 to-background" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/60" />

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
            Step into AI worlds. Cast spells. Fly ships. Rule kingdoms.
            One headset. Endless worlds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/worlds"
              className="group relative px-10 py-4 bg-[var(--gold)] text-background text-xs tracking-[0.3em] uppercase font-medium hover:bg-[var(--gold-bright)] transition-all duration-500 shadow-[var(--shadow-gold)]"
            >
              Explore Worlds
              <span className="ml-3 inline-block transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <Link
              to="/pricing"
              className="px-10 py-4 border border-[var(--gold)]/60 text-[var(--gold)] text-xs tracking-[0.3em] uppercase hover:bg-[var(--gold)]/10 transition-all duration-500"
            >
              How It Works
            </Link>
            <Link
              to="/play"
              className="px-10 py-4 border border-[var(--gold)] text-[var(--gold)] text-xs tracking-[0.3em] uppercase hover:bg-[var(--gold)] hover:text-background transition-all duration-500"
            >
              PLAY REVENIO
            </Link>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[0.6rem] tracking-[0.4em] text-muted-foreground/60 uppercase animate-float">
          Scroll · Step In
        </div>
      </section>

      {/* WHAT IS REVENIO */}
      <section className="relative py-32 px-6 max-w-5xl mx-auto text-center">
        <div className="gold-hairline w-24 mx-auto mb-8" />
        <p className="text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-6">What Is Revenio</p>
        <h2 className="font-display text-4xl md:text-6xl font-light mb-10 leading-tight">
          A big story.<br />
          <span className="italic text-gold-gradient">Built around you.</span>
        </h2>
        <p className="text-lg text-muted-foreground leading-relaxed font-light max-w-3xl mx-auto">
          Revenio is an AI world you can step into. Pick a world. The AI builds it around you —
          the people, the places, the fight. You make the choices. You live the story.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-center">
          {["Every world is new.", "Every choice matters.", "Every run is a new life."].map((t) => (
            <p key={t} className="font-display italic text-lg md:text-xl text-[var(--gold)]/90 border-t md:border-t border-[var(--gold)]/30 pt-6">
              {t}
            </p>
          ))}
        </div>
      </section>

      {/* CTA bridge */}
      <section className="relative py-32 px-6 bg-[var(--onyx)] border-y border-border text-center">
        <p className="text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-6">Three Steps</p>
        <h2 className="font-display text-5xl md:text-6xl font-light mb-16">
          Pick a world.<br /><span className="italic text-gold-gradient">Live a story.</span>
        </h2>
        <div className="grid md:grid-cols-3 gap-px bg-border max-w-5xl mx-auto">
          {[
            { n: "01", t: "Pick a World", d: "Eight worlds. Magic, space, kingdoms, heroes, and more." },
            { n: "02", t: "Step Inside", d: "The AI builds your role, your friends, your enemies." },
            { n: "03", t: "Live the Story", d: "Every choice sticks. Every run ends in a new way." },
          ].map((s) => (
            <div key={s.n} className="bg-background p-10 text-left">
              <p className="font-display text-5xl text-[var(--gold)]/40 mb-4">{s.n}</p>
              <h3 className="font-display text-2xl mb-3">{s.t}</h3>
              <p className="text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
        <div className="mt-16">
          <Link
            to="/worlds"
            className="inline-block px-10 py-4 bg-[var(--gold)] text-background text-xs tracking-[0.3em] uppercase font-medium hover:bg-[var(--gold-bright)] transition-all duration-500 shadow-[var(--shadow-gold)]"
          >
            Explore Worlds →
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
