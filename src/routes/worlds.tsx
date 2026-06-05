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
      { name: "description", content: "Eight worlds. Magic schools, space wars, dragon kingdoms, and more. Pick one. Live it." },
      { property: "og:title", content: "Pick Your World — Revenio" },
      { property: "og:description", content: "Eight AI worlds. One headset. Endless lives." },
    ],
  }),
  component: Worlds,
});

const worlds = [
  {
    name: "Arcane Academy",
    tag: "Learn real magic.",
    desc: "A hidden school of magic. Cast spells, mix potions, duel students, and uncover old secrets.",
    img: wMagic,
  },
  {
    name: "Galactic Frontier",
    tag: "Pick a side.",
    desc: "A war across the stars. Swing an energy blade. Fly a ship. Stand with order, rebels, or power.",
    img: wSpace,
  },
  {
    name: "Hero Nexus",
    tag: "Power rises. So do you.",
    desc: "Get powers. Team up with heroes. Fight villains. Decide what kind of hero you are.",
    img: wHero,
  },
  {
    name: "Dragonfall Kingdoms",
    tag: "Rule from the sky.",
    desc: "Ride dragons. Lead armies. Make friends. Take the throne.",
    img: wKingdom,
  },
  {
    name: "Champions Legacy",
    tag: "Earn your name.",
    desc: "Start as a nobody. Train hard. Win games. Become the best in the world.",
    img: wSports,
  },
  {
    name: "Shadow Guild",
    tag: "Strike from the dark.",
    desc: "Join a secret group. Crack open plots. Pull off risky jobs. Save the world — or run it.",
    img: wSurvival,
  },
  {
    name: "Neon Dominion",
    tag: "The future is a fight.",
    desc: "A neon mega-city. AI, hacking, gangs, and big tech. Find your edge.",
    img: wFuture,
  },
  {
    name: "Eternal Odyssey",
    tag: "Your fate is waiting.",
    desc: "A long journey across old lands. Beat monsters. Find lost gear. Live a legend.",
    img: wEmpire,
  },
];

function Worlds() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <SiteNav />

      <section className="relative pt-40 pb-20 px-6 text-center">
        <div className="gold-hairline w-24 mx-auto mb-8" />
        <p className="text-xs tracking-[0.4em] uppercase text-[var(--gold)] mb-4">Pick Your World</p>
        <h1 className="font-display text-6xl md:text-8xl font-light leading-[1]">
          Eight worlds.<br />
          <span className="italic text-gold-gradient">One is yours.</span>
        </h1>
        <p className="mt-8 text-muted-foreground max-w-2xl mx-auto">
          Magic schools, space wars, hero teams, dragon kingdoms, and more.
          You pick. The AI does the rest.
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
              "you cast your first spell and felt the magic in your hands?",
              "you flew a starfighter into battle with the fleet behind you?",
              "you woke up with powers no one else on Earth had?",
              "you rode a dragon into a fight and the whole kingdom watched?",
              "you scored the winning goal in front of 80,000 fans?",
              "you broke into a giant tower and walked out with its secrets?",
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
              to="/simulation"
              className="inline-block px-10 py-4 bg-[var(--gold)] text-background text-xs tracking-[0.3em] uppercase font-medium hover:bg-[var(--gold-bright)] transition-all duration-500 shadow-[var(--shadow-gold)]"
            >
              Start Your Story →
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
