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
      { property: "og:url", content: "https://revenio.net/" },
    ],
    links: [
      { rel: "canonical", href: "https://revenio.net/" },
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

      {/* HOW IT WORKS */}
      <section style={{padding:'80px 20px',background:'#0D0D14',textAlign:'center' as const}}>
        <div style={{maxWidth:'900px',margin:'0 auto'}}>
          <div style={{color:'#D4A843',fontSize:'11px',letterSpacing:'4px',marginBottom:'12px'}}>HOW IT WORKS</div>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:'clamp(24px,4vw,36px)',fontWeight:700,color:'#F0C060',marginBottom:'48px',letterSpacing:'2px'}}>Three Steps to Your Other Life</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:'32px'}}>
            {[
              {step:'01',title:'Tell Your Story',desc:'Answer questions about your real life. Your relationships, your career, your decisions. The more honest you are the more surprising the result.',icon:'📝'},
              {step:'02',title:'Choose Your Decision',desc:'Pick the one moment that changed everything. The university you did not attend. The job you turned down. The person you did not call back.',icon:'🔀'},
              {step:'03',title:'See the Other Life',desc:'Watch your alternate timeline unfold. Who you would have met. Where you would have lived. What you would have become.',icon:'🌐'},
            ].map(item => (
              <div key={item.step} style={{background:'#1A1A24',border:'1px solid #2A2A3A',borderRadius:'4px',padding:'32px 24px',textAlign:'left' as const}}>
                <div style={{color:'#8B6914',fontFamily:"'Orbitron',monospace",fontSize:'28px',fontWeight:700,marginBottom:'12px',opacity:0.6}}>{item.step}</div>
                <div style={{fontSize:'32px',marginBottom:'16px'}}>{item.icon}</div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:'17px',fontWeight:700,color:'#F0C060',marginBottom:'12px'}}>{item.title}</div>
                <div style={{color:'#7A7A8A',fontSize:'14px',lineHeight:1.7}}>{item.desc}</div>
              </div>
            ))}
          </div>
          <div style={{marginTop:'48px'}}>
            <a href="/parallel2" style={{background:'linear-gradient(135deg,#1a3a6b,#4A9EFF)',color:'white',fontFamily:"'Cinzel',serif",fontWeight:700,padding:'16px 48px',textDecoration:'none',letterSpacing:'2px',fontSize:'15px',borderRadius:'4px',display:'inline-block'}}>BEGIN YOUR SIMULATION</a>
          </div>
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
