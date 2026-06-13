import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import ParticleBackground from "@/components/ParticleBackground";
import AnimatedSection from "@/components/AnimatedSection";
import MagneticCard from "@/components/MagneticCard";
import GlowButton from "@/components/GlowButton";
import TypewriterText from "@/components/TypewriterText";
import { useParallax, useMousePosition } from "@/hooks/useAnimations";
import heroPortals from "@/assets/hero-portals.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Revenio — Live Another Life" },
      { name: "description", content: "Step into AI worlds. Pick a world. Live a story. One headset. Endless worlds." },
      { property: "og:title", content: "Revenio — Be Someone Else" },
      { property: "og:description", content: "AI worlds you can step into. Coming 2031." },
      { property: "og:url", content: "https://revenio.net/" },
    ],
    links: [
      { rel: "canonical", href: "https://revenio.net/" },
    ],
  }),
  component: Home,
});

function Home() {
  const scrollOffset = useParallax();
  const mouse = useMousePosition();

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <ParticleBackground count={35} gold={true} />
      <SiteNav />

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center pt-24 overflow-hidden">
        <img
          src={heroPortals}
          alt="Golden portals opening into parallel galactic realities"
          className="absolute inset-0 w-full h-full object-cover opacity-70"
          width={1920}
          height={1088}
          style={{ transform: `translateY(${scrollOffset * 0.25}px)`, transition: 'transform 0.1s linear' }}
        />

        {/* Mouse-tracking gradient overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 60% 60% at ${mouse.x * 100}% ${mouse.y * 100}%, rgba(212,168,67,0.12) 0%, transparent 70%)`,
            transition: 'background 0.3s ease',
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/30 to-background" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/60" />

        {/* Portal rings */}
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
            <span className="shimmer-text italic font-medium">
              <TypewriterText text="Another You." speed={60} delay={800} />
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 font-light">
            Step into AI worlds. Cast spells. Fly ships. Rule kingdoms.
            One headset. Endless worlds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <GlowButton href="/worlds" gold={true}>
              Explore Worlds →
            </GlowButton>
            <GlowButton href="/pricing" gold={true} ghost={true}>
              How It Works
            </GlowButton>
            <GlowButton href="/play" gold={false} ghost={true} style={{ color: '#D4A843', border: '1px solid rgba(212,168,67,0.5)' }}>
              PLAY REVENIO
            </GlowButton>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <div className="text-[0.6rem] tracking-[0.4em] text-muted-foreground/60 uppercase animate-float">
            Scroll · Step In
          </div>
          <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, rgba(212,168,67,0.4), transparent)', animation: 'float-slow 2s ease-in-out infinite' }} />
        </div>
      </section>

      {/* WHAT IS REVENIO */}
      <section className="relative py-32 px-6 max-w-5xl mx-auto text-center">
        <AnimatedSection delay={0}>
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
        </AnimatedSection>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-center">
          {["Every world is new.", "Every choice matters.", "Every run is a new life."].map((t, i) => (
            <AnimatedSection key={t} delay={i * 150} direction="up">
              <p className="font-display italic text-lg md:text-xl text-[var(--gold)]/90 border-t md:border-t border-[var(--gold)]/30 pt-6">
                {t}
              </p>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: '80px 20px', background: '#0D0D14', textAlign: 'center' as const }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <AnimatedSection delay={0}>
            <div style={{ color: '#D4A843', fontSize: '11px', letterSpacing: '4px', marginBottom: '12px' }}>HOW IT WORKS</div>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 'clamp(24px,4vw,36px)', fontWeight: 700, color: '#F0C060', marginBottom: '48px', letterSpacing: '2px' }}>Three Steps to Your Other Life</div>
          </AnimatedSection>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: '32px' }}>
            {[
              { step: '01', title: 'Tell Your Story', desc: 'Answer questions about your real life. Your relationships, your career, your decisions. The more honest you are the more surprising the result.', icon: '📝' },
              { step: '02', title: 'Choose Your Decision', desc: 'Pick the one moment that changed everything. The university you did not attend. The job you turned down. The person you did not call back.', icon: '🔀' },
              { step: '03', title: 'See the Other Life', desc: 'Watch your alternate timeline unfold. Who you would have met. Where you would have lived. What you would have become.', icon: '🌐' },
            ].map((item, i) => (
              <AnimatedSection key={item.step} delay={i * 150} direction="up">
                <MagneticCard style={{ padding: '32px 24px', textAlign: 'left' as const, height: '100%' }}>
                  <div style={{ color: '#8B6914', fontFamily: "'Orbitron',monospace", fontSize: '28px', fontWeight: 700, marginBottom: '12px', opacity: 0.6 }}>{item.step}</div>
                  <div style={{ fontSize: '32px', marginBottom: '16px' }}>{item.icon}</div>
                  <div style={{ fontFamily: "'Cinzel',serif", fontSize: '17px', fontWeight: 700, color: '#F0C060', marginBottom: '12px' }}>{item.title}</div>
                  <div style={{ color: '#7A7A8A', fontSize: '14px', lineHeight: 1.7 }}>{item.desc}</div>
                </MagneticCard>
              </AnimatedSection>
            ))}
          </div>
          <AnimatedSection delay={300}>
            <div style={{ marginTop: '48px' }}>
              <GlowButton href="/parallel2" gold={false}>BEGIN YOUR SIMULATION</GlowButton>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA bridge */}
      <section className="relative py-32 px-6 bg-[var(--onyx)] border-y border-border text-center">
        <AnimatedSection delay={0}>
          <p className="text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-6">Three Steps</p>
          <h2 className="font-display text-5xl md:text-6xl font-light mb-16">
            Pick a world.<br /><span className="italic text-gold-gradient">Live a story.</span>
          </h2>
        </AnimatedSection>
        <div className="grid md:grid-cols-3 gap-px bg-border max-w-5xl mx-auto">
          {[
            { n: "01", t: "Pick a World", d: "Eight worlds. Magic, space, kingdoms, heroes, and more." },
            { n: "02", t: "Step Inside", d: "The AI builds your role, your friends, your enemies." },
            { n: "03", t: "Live the Story", d: "Every choice sticks. Every run ends in a new way." },
          ].map((s, i) => (
            <AnimatedSection key={s.n} delay={i * 100} direction="up">
              <div className="bg-background p-10 text-left h-full">
                <p className="font-display text-5xl text-[var(--gold)]/40 mb-4">{s.n}</p>
                <h3 className="font-display text-2xl mb-3">{s.t}</h3>
                <p className="text-sm text-muted-foreground">{s.d}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
        <AnimatedSection delay={400}>
          <div className="mt-16">
            <GlowButton href="/worlds">Explore Worlds →</GlowButton>
          </div>
        </AnimatedSection>
      </section>

      <SiteFooter />
    </main>
  );
}
