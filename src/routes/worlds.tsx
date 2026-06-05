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
      { name: "description", content: "Eight realities. Magic academies, galactic frontiers, hero nexuses, dragon kingdoms, and more. Pick a world. Live a life." },
      { property: "og:title", content: "Choose Your World — Revenio" },
      { property: "og:description", content: "Eight AI-generated worlds. One platform. Infinite lives." },
    ],
  }),
  component: Worlds,
});

const worlds = [
  {
    name: "Arcane Academy",
    tag: "Learn the forbidden arts.",
    desc: "A legendary school hidden from the ordinary world where students learn spellcasting, magical combat, potion-making, and ancient secrets.",
    img: wMagic,
  },
  {
    name: "Galactic Frontier",
    tag: "Choose your side.",
    desc: "Join a galaxy-wide conflict, master energy blades, pilot starships, and choose between order, rebellion, or power.",
    img: wSpace,
  },
  {
    name: "Hero Nexus",
    tag: "Power rises. So do you.",
    desc: "Develop extraordinary abilities, form alliances with heroes, battle powerful villains, and determine the fate of the world.",
    img: wHero,
  },
  {
    name: "Dragonfall Kingdoms",
    tag: "Rule from the sky.",
    desc: "Ride dragons, command armies, forge alliances, and compete for control of the realm.",
    img: wKingdom,
  },
  {
    name: "Champions Legacy",
    tag: "Earn your legacy.",
    desc: "Start as an unknown prospect and work your way to becoming the greatest athlete in the world, winning championships, trophies, and global fame.",
    img: wSports,
  },
  {
    name: "Shadow Guild",
    tag: "Strike from the dark.",
    desc: "Join a secret order, uncover conspiracies, complete dangerous missions, and decide whether to save or control the world.",
    img: wSurvival,
  },
  {
    name: "Neon Dominion",
    tag: "The future is war.",
    desc: "A futuristic mega-city filled with AI, advanced technology, virtual worlds, corporate wars, and endless opportunities.",
    img: wFuture,
  },
  {
    name: "Eternal Odyssey",
    tag: "Fate awaits.",
    desc: "Embark on an epic adventure across ancient lands, battle mythical creatures, discover legendary artifacts, and fulfill a prophecy.",
    img: wEmpire,
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
          Eight worlds.<br />
          <span className="italic text-gold-gradient">One of them is yours.</span>
        </h1>
        <p className="mt-8 text-muted-foreground max-w-2xl mx-auto">
          Magic academies, galactic frontiers, hero nexuses, dragon kingdoms, and more.
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
              "you cast your first spell at a hidden academy and felt the arcane surge through your hands?",
              "you piloted a starfighter through a dying nebula with the fleet at your back?",
              "you discovered you had powers no one on Earth had ever seen before?",
              "you rode a dragon into battle and the realm held its breath?",
              "you scored the winning goal in front of eighty thousand screaming fans?",
              "you infiltrated a corporate megastructure and stole the keys to the city?",
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
