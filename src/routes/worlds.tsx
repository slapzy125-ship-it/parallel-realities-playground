import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import wHero from "@/assets/world-hero.jpg";
import wSurvival from "@/assets/world-survival.jpg";
import wKingdom from "@/assets/world-kingdom.jpg";
import wSpace from "@/assets/world-space.jpg";
import wFuture from "@/assets/world-future.jpg";
import wEmpire from "@/assets/world-empire.jpg";
import wSports from "@/assets/world-sports.jpg";
import wMagic from "@/assets/world-magic.jpg";

export const Route = createFileRoute("/worlds")({
  head: () => ({
    meta: [
      { title: "Worlds — Revenio" },
      { name: "description", content: "Eight galactic sagas. Sentinel orders, shadow empires, smuggler ports, rebel fleets. Pick a star. Live a life." },
      { property: "og:title", content: "Choose Your Galaxy — Revenio" },
      { property: "og:description", content: "Eight AI-generated galactic worlds. One headset. Infinite sagas." },
    ],
  }),
  component: Worlds,
});

const worlds = [
  {
    name: "Order of the Sentinels",
    tag: "Guardians of the Light.",
    desc: "Train at a hidden temple on a sun-scorched moon. Master the lightblade. Hold the galaxy together while it tears itself apart.",
    img: wHero,
  },
  {
    name: "The Shadow Empire",
    tag: "Rule with the dark.",
    desc: "Ascend the obsidian throne. Command starfleets. Crush dissent across a thousand systems with a single thought.",
    img: wKingdom,
  },
  {
    name: "Outlaw of the Outer Rim",
    tag: "Run the spice routes.",
    desc: "A cargo hold of contraband, a price on your head, and a crew that almost likes you. Smuggle, gamble, survive.",
    img: wSurvival,
  },
  {
    name: "Bounty Contracts",
    tag: "Armor up. Hunt anything.",
    desc: "Beskar plating. A jetpack. A target. The galaxy calls you when no one else can finish the job.",
    img: wEmpire,
  },
  {
    name: "Rebel Starfighter Wing",
    tag: "Fly for the spark.",
    desc: "Take an X-wing into the void against an impossible imperial fleet. The galaxy doesn't need a hero. It needs a pilot.",
    img: wSpace,
  },
  {
    name: "The Galactic Senate",
    tag: "Politics is the long war.",
    desc: "A thousand worlds. A million agendas. Master the chamber, the back-channels, and the knives that wait in the dark.",
    img: wFuture,
  },
  {
    name: "Speeder Circuit Champion",
    tag: "Race the canyons.",
    desc: "Anti-grav podracers at lethal speeds through asteroid fields and desert canyons. Win the crown — or die spectacularly.",
    img: wSports,
  },
  {
    name: "Academy of the Forgotten Order",
    tag: "Study what was erased.",
    desc: "A monastery on a frozen world holds the last archives of a banned discipline. Train, decode, and decide what to do with what you find.",
    img: wMagic,
  },
];

function Worlds() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <SiteNav />

      <section className="relative pt-40 pb-20 px-6 text-center">
        <div className="gold-hairline w-24 mx-auto mb-8" />
        <p className="text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-4">Choose Your Reality</p>
        <h1 className="font-display text-6xl md:text-8xl font-light leading-[1]">
          Eight galaxies.<br />
          <span className="italic text-gold-gradient">One of them is yours.</span>
        </h1>
        <p className="mt-8 text-muted-foreground max-w-2xl mx-auto">
          Step into a saga inspired by the greatest stories ever told between the stars.
          The AI does the rest.
        </p>
      </section>

      <section className="relative pb-32 px-6">
        <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
      </section>

      {/* Imagine */}
      <section className="relative py-32 px-6 bg-[var(--onyx)] border-y border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-4">Imagine</p>
            <h2 className="font-display text-5xl md:text-7xl font-light">What if<span className="italic text-gold-gradient"> …</span></h2>
          </div>
          <div className="space-y-px">
            {[
              "you trained as a sentinel and held a lightblade for the first time?",
              "you flew the final attack run against an imperial dreadnought?",
              "you out-gambled a kingpin in a smoke-filled cantina on the edge of the galaxy?",
              "you ruled an empire and decided which star system burned tonight?",
              "you took a bounty that turned out to be a child you were supposed to protect?",
              "you broke a galactic senate in a single, perfectly timed sentence?",
            ].map((q, i) => (
              <div key={q} className="group flex items-center gap-6 py-8 border-b border-border hover:bg-[var(--gold)]/5 transition-colors px-4 cursor-pointer">
                <span className="font-display text-3xl text-[var(--gold)]/40 group-hover:text-[var(--gold)] transition-colors w-16">{String(i + 1).padStart(2, "0")}</span>
                <p className="font-display text-2xl md:text-3xl font-light italic flex-1 group-hover:translate-x-2 transition-transform">{q}</p>
                <span className="text-[var(--gold)] opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </div>
            ))}
          </div>
          <div className="text-center mt-16">
            <Link
              to="/auth"
              className="inline-block px-10 py-4 bg-[var(--gold)] text-background text-xs tracking-[0.3em] uppercase font-medium hover:bg-[var(--gold-bright)] transition-all duration-500 shadow-[var(--shadow-gold)]"
            >
              Create Your Account →
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
