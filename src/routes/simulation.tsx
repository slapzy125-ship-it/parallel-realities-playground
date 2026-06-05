import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useServerFn } from "@tanstack/react-start";
import { simulationChat } from "@/lib/simulation.functions";
import { SiteNav } from "@/components/SiteNav";
import arcaneAcademyWorld from "@/assets/arcane-academy-world.asset.json";
import dragonfallKingdomsWorld from "@/assets/dragonfall-kingdoms-world.asset.json";
import galacticFrontierWorld from "@/assets/galactic-frontier-world.asset.json";
import championsLegacyWorld from "@/assets/champions-legacy-world.asset.json";
import heroNexusWorld from "@/assets/hero-nexus-world.asset.json";
import neonDominionWorld from "@/assets/neon-dominion-world.asset.json";
import shadowGuildWorld from "@/assets/shadow-guild-world.asset.json";
import eternalOdysseyWorld from "@/assets/eternal-odyssey-world.asset.json";

export const Route = createFileRoute("/simulation")({
  head: () => ({
    meta: [
      { title: "Simulation — Revenio" },
      { name: "description", content: "Step into your simulation and live the life you never lived. No account required." },
    ],
  }),
  component: SimulationPage,
});

const WORLDS = [
  { name: "Arcane Academy", emoji: "🧙", img: arcaneAcademyWorld.url },
  { name: "Dragonfall Kingdoms", emoji: "⚔️", img: dragonfallKingdomsWorld.url },
  { name: "Galactic Frontier", emoji: "🌌", img: galacticFrontierWorld.url },
  { name: "Champions Legacy", emoji: "⚽", img: championsLegacyWorld.url },
  { name: "Hero Nexus", emoji: "🦸", img: heroNexusWorld.url },
  { name: "Neon Dominion", emoji: "🏙️", img: neonDominionWorld.url },
  { name: "Shadow Guild", emoji: "🗡️", img: shadowGuildWorld.url },
  { name: "Eternal Odyssey", emoji: "🧭", img: eternalOdysseyWorld.url },
];

const HERO_COLLAGE = [
  arcaneAcademyWorld.url,
  dragonfallKingdomsWorld.url,
  neonDominionWorld.url,
  eternalOdysseyWorld.url,
];

const TRAITS = [
  "Ambitious", "Loyal", "Intelligent", "Brave", "Competitive",
  "Funny", "Ruthless", "Creative", "Confident", "Curious",
];

const GOALS = [
  "Become the greatest",
  "Get rich",
  "Save the world",
  "Build a kingdom",
  "Become a legend",
  "Discover the unknown",
];

type Profile = {
  character_name: string;
  world: string;
  traits: string[];
  goal: string;
  photo?: string; // base64 data URL
};

type Msg = { id: string; role: "user" | "assistant"; content: string };
type Saga = {
  id: string;
  title: string;
  profile: Profile;
  messages: Msg[];
  updated_at: number;
};

const STORAGE_KEY = "revenio.sagas.v2";

function loadSagas(): Saga[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Saga[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveSagas(sagas: Saga[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sagas));
  } catch {
    // Storage full (likely from large photos). Try without photos.
    try {
      const stripped = sagas.map((s) => ({ ...s, profile: { ...s.profile, photo: undefined } }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stripped));
    } catch {
      /* give up silently */
    }
  }
}

function uid() {
  return `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function SimulationPage() {
  const chat = useServerFn(simulationChat);

  const [sagas, setSagas] = useState<Saga[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loaded = loadSagas();
    setSagas(loaded);
    if (loaded.length === 0) setShowNew(true);
    else setActiveId(loaded[0].id);
  }, []);

  const active = sagas.find((s) => s.id === activeId) ?? null;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [active?.messages.length, sending]);

  const persist = (updater: (prev: Saga[]) => Saga[]) => {
    setSagas((prev) => {
      const next = updater(prev);
      saveSagas(next);
      return next;
    });
  };

  const handleCreate = async (profile: Profile) => {
    setError(null);
    setSending(true);
    try {
      const { content } = await chat({
        data: {
          profile: {
            character_name: profile.character_name,
            world: profile.world,
            traits: profile.traits,
            goal: profile.goal,
          },
          messages: [{ role: "user", content: "Begin." }],
        },
      });
      const saga: Saga = {
        id: uid(),
        title: `${profile.character_name} — ${profile.world}`,
        profile,
        messages: [{ id: uid(), role: "assistant", content }],
        updated_at: Date.now(),
      };
      persist((prev) => [saga, ...prev]);
      setActiveId(saga.id);
      setShowNew(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to begin simulation");
    } finally {
      setSending(false);
    }
  };

  const handleSend = async (text?: string) => {
    if (!active) return;
    const content = (text ?? input).trim();
    if (!content || sending) return;
    setSending(true);
    setError(null);
    const userMsg: Msg = { id: uid(), role: "user", content };
    const updatedMessages = [...active.messages, userMsg];
    persist((prev) =>
      prev.map((s) => (s.id === active.id ? { ...s, messages: updatedMessages, updated_at: Date.now() } : s)),
    );
    setInput("");
    try {
      const { content: reply } = await chat({
        data: {
          profile: {
            character_name: active.profile.character_name,
            world: active.profile.world,
            traits: active.profile.traits,
            goal: active.profile.goal,
          },
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
        },
      });
      persist((prev) =>
        prev.map((s) =>
          s.id === active.id
            ? { ...s, messages: [...updatedMessages, { id: uid(), role: "assistant", content: reply }], updated_at: Date.now() }
            : s,
        ),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
      persist((prev) =>
        prev.map((s) => (s.id === active.id ? { ...s, messages: active.messages } : s)),
      );
      setInput(content);
    } finally {
      setSending(false);
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this saga forever?")) return;
    persist((prev) => prev.filter((s) => s.id !== id));
    if (activeId === id) setActiveId(null);
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteNav />
      <div className="pt-24 flex-1 flex max-w-[1600px] mx-auto w-full">
        {/* Sidebar */}
        <aside className="w-72 shrink-0 border-r border-border px-4 py-6 hidden md:flex md:flex-col gap-4">
          <button
            onClick={() => setShowNew(true)}
            className="w-full bg-[var(--gold)] text-background text-[0.65rem] tracking-[0.3em] uppercase py-3 hover:bg-[var(--gold-bright)] transition-all"
          >
            + New Simulation
          </button>
          <div className="text-[0.6rem] tracking-[0.3em] uppercase text-muted-foreground pt-2">Your Sagas</div>
          <div className="flex-1 overflow-y-auto space-y-1">
            {sagas.length === 0 && (
              <p className="text-xs text-muted-foreground italic">No sagas yet. Start one.</p>
            )}
            {sagas.map((s) => {
              const isActive = activeId === s.id;
              const world = WORLDS.find((w) => w.name === s.profile.world);
              return (
                <div key={s.id} className={`group flex items-stretch border ${isActive ? "border-[var(--gold)] bg-[var(--gold)]/5" : "border-transparent hover:border-border"} transition-colors`}>
                  <button onClick={() => setActiveId(s.id)} className="flex-1 text-left px-3 py-3 min-w-0 flex items-center gap-3">
                    {s.profile.photo ? (
                      <img src={s.profile.photo} alt="" className="w-8 h-8 object-cover rounded-full border border-[var(--gold)]/40" />
                    ) : (
                      <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-sm">{world?.emoji ?? "✦"}</div>
                    )}
                    <div className="min-w-0">
                      <div className="text-sm truncate">{s.profile.character_name}</div>
                      <div className="text-[0.6rem] tracking-[0.2em] uppercase text-muted-foreground truncate">{s.profile.world}</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="px-2 text-muted-foreground hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                    aria-label="Delete"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
          <p className="text-[0.55rem] tracking-[0.25em] uppercase text-muted-foreground/60 leading-relaxed pt-3 border-t border-border">
            Sagas saved on this device. No account needed.
          </p>
        </aside>

        {/* Main */}
        <section className="flex-1 min-w-0">
          {!active ? (
            <div className="relative flex-1 flex items-center justify-center min-h-[calc(100vh-6rem)] px-8 text-center overflow-hidden">
              {/* Hero collage background */}
              <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 opacity-30">
                {HERO_COLLAGE.map((src, i) => (
                  <div key={i} className="relative overflow-hidden">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/85 to-background" />
              <div className="relative max-w-md">
                <p className="text-[0.6rem] tracking-[0.4em] uppercase text-[var(--gold)] mb-4">The Portal Awaits</p>
                <h1 className="font-display text-5xl font-light leading-tight mb-6">
                  Explore the life you <span className="italic text-gold-gradient">never lived.</span>
                </h1>
                <p className="text-sm text-muted-foreground leading-relaxed mb-8">
                  Four quick taps. Then you're in.
                </p>
                <button
                  onClick={() => setShowNew(true)}
                  className="inline-block px-10 py-4 bg-[var(--gold)] text-background text-xs tracking-[0.3em] uppercase font-medium hover:bg-[var(--gold-bright)] transition-all duration-500 shadow-[var(--shadow-gold)]"
                >
                  Begin →
                </button>
              </div>
            </div>
          ) : (
            <div className="relative flex flex-col h-[calc(100vh-6rem)]">
              {(() => {
                const activeWorld = WORLDS.find((w) => w.name === active.profile.world);
                return activeWorld?.img ? (
                  <>
                    <img
                      src={activeWorld.img}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/70 to-background pointer-events-none" />
                  </>
                ) : null;
              })()}
              <header className="relative border-b border-border px-6 md:px-8 py-4 flex items-center gap-4 bg-background/60 backdrop-blur">
                {active.profile.photo ? (
                  <img src={active.profile.photo} alt="" className="w-12 h-12 rounded-full object-cover border border-[var(--gold)]/50" />
                ) : (
                  <div className="w-12 h-12 rounded-full border border-[var(--gold)]/50 flex items-center justify-center text-xl overflow-hidden">
                    {(() => {
                      const w = WORLDS.find((w) => w.name === active.profile.world);
                      return w?.img ? (
                        <img src={w.img} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span>{w?.emoji ?? "✦"}</span>
                      );
                    })()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-[0.6rem] tracking-[0.3em] uppercase text-[var(--gold)] truncate">{active.profile.world}</p>
                  <h1 className="font-display text-2xl font-light truncate">{active.profile.character_name}</h1>
                </div>
              </header>

              <div ref={scrollRef} className="relative flex-1 overflow-y-auto px-4 md:px-12 py-8 space-y-6">
                {active.messages.map((m) => (
                  <MessageBubble key={m.id} message={m} onChoice={handleSend} />
                ))}
                {sending && (
                  <div className="flex gap-2 text-[var(--gold)] text-xs tracking-[0.3em] uppercase animate-pulse">
                    <span>The world reacts</span>
                    <span>···</span>
                  </div>
                )}
                {error && <p className="text-xs text-red-400 border border-red-500/30 bg-red-500/10 p-3">{error}</p>}
              </div>

              <form
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="border-t border-border p-4 md:px-12 md:py-6 bg-card/40 backdrop-blur"
              >
                <div className="flex gap-3 items-end max-w-4xl mx-auto">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    rows={2}
                    placeholder="What do you do?"
                    className="flex-1 bg-background border border-border px-4 py-3 text-sm resize-none focus:border-[var(--gold)] focus:outline-none"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    disabled={sending || !input.trim()}
                    className="bg-[var(--gold)] text-background text-[0.65rem] tracking-[0.3em] uppercase px-6 py-4 hover:bg-[var(--gold-bright)] disabled:opacity-40 transition-all"
                  >
                    Act
                  </button>
                </div>
              </form>
            </div>
          )}
        </section>
      </div>

      {showNew && (
        <NewSimWizard
          submitting={sending}
          onClose={() => setShowNew(false)}
          onCreate={handleCreate}
        />
      )}
    </main>
  );
}

function MessageBubble({ message, onChoice }: { message: Msg; onChoice: (text: string) => void }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-2xl border border-[var(--gold)]/40 bg-[var(--gold)]/5 px-5 py-3 text-sm">
          {message.content}
        </div>
      </div>
    );
  }

  // Parse trailing choices. Accept "A)", "A.", "1.", "1)".
  const lines = message.content.split("\n");
  const choices: string[] = [];
  let bodyEnd = lines.length;
  for (let i = lines.length - 1; i >= 0; i--) {
    const m = lines[i].match(/^\s*(?:[A-Z]|\d+)[.)]\s+(.*)/);
    if (m && choices.length < 6) {
      choices.unshift(m[1]);
      bodyEnd = i;
    } else if (choices.length > 0 && lines[i].trim() === "") {
      bodyEnd = i;
    } else if (choices.length > 0) {
      break;
    }
  }
  const body = choices.length >= 2 ? lines.slice(0, bodyEnd).join("\n") : message.content;
  const showChoices = choices.length >= 2;

  return (
    <div className="max-w-3xl">
      <div className="prose prose-invert prose-sm max-w-none prose-headings:font-display prose-headings:font-light prose-strong:text-[var(--gold)] prose-em:text-[var(--gold-bright)] prose-hr:border-[var(--gold)]/30 text-foreground/90">
        <ReactMarkdown>{body}</ReactMarkdown>
      </div>
      {showChoices && (
        <div className="mt-5 space-y-2">
          {choices.map((c, i) => (
            <button
              key={i}
              onClick={() => onChoice(c)}
              className="block w-full text-left border border-border hover:border-[var(--gold)] hover:bg-[var(--gold)]/5 px-4 py-3 text-sm transition-all"
            >
              <span className="text-[var(--gold)] mr-3">{String.fromCharCode(65 + i)})</span>{c}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- 4-Step Wizard ---------------- */

function NewSimWizard({
  onClose,
  onCreate,
  submitting,
}: {
  onClose: () => void;
  onCreate: (p: Profile) => Promise<void>;
  submitting: boolean;
}) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState<string | undefined>(undefined);
  const [world, setWorld] = useState<string | null>(null);
  const [traits, setTraits] = useState<string[]>([]);
  const [goal, setGoal] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhoto = (file: File) => {
    if (file.size > 2_000_000) {
      alert("Please use an image under 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  const toggleTrait = (t: string) => {
    setTraits((prev) => {
      if (prev.includes(t)) return prev.filter((x) => x !== t);
      if (prev.length >= 3) return prev;
      return [...prev, t];
    });
  };

  const next = () => setStep((s) => Math.min(4, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  const canNext =
    (step === 1 && name.trim().length > 0) ||
    (step === 2 && !!world) ||
    (step === 3 && traits.length === 3) ||
    (step === 4 && !!goal);

  const finish = async () => {
    if (!world || !goal || traits.length !== 3 || !name.trim()) return;
    await onCreate({ character_name: name.trim(), world, traits, goal, photo });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex items-center justify-center p-4 md:p-6 overflow-y-auto">
      <div className="relative w-full max-w-2xl border border-border bg-card my-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground text-xl z-10"
          aria-label="Close"
        >
          ×
        </button>

        {/* Step indicator */}
        <div className="flex items-center gap-2 px-8 pt-8">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className={`h-[2px] flex-1 transition-colors ${n <= step ? "bg-[var(--gold)]" : "bg-border"}`}
            />
          ))}
        </div>
        <p className="px-8 mt-3 text-[0.55rem] tracking-[0.4em] uppercase text-muted-foreground">
          Step {step} of 4
        </p>

        <div className="px-8 pb-8 pt-4 min-h-[420px]">
          {step === 1 && (
            <>
              <h2 className="font-display text-3xl md:text-4xl font-light mb-8">Who are you?</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-[0.6rem] tracking-[0.3em] uppercase text-muted-foreground mb-2">Name</label>
                  <input
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && canNext) next(); }}
                    placeholder="Noah"
                    className="w-full bg-background border border-border px-4 py-3 text-lg focus:border-[var(--gold)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[0.6rem] tracking-[0.3em] uppercase text-muted-foreground mb-2">Photo (optional)</label>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="w-20 h-20 rounded-full border border-dashed border-border hover:border-[var(--gold)] flex items-center justify-center overflow-hidden transition-colors"
                    >
                      {photo ? (
                        <img src={photo} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl text-muted-foreground">+</span>
                      )}
                    </button>
                    <div className="text-xs text-muted-foreground">
                      {photo ? (
                        <button type="button" onClick={() => setPhoto(undefined)} className="hover:text-[var(--gold)] underline">
                          Remove
                        </button>
                      ) : (
                        <span>Upload a face for your character.</span>
                      )}
                    </div>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handlePhoto(f);
                      }}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="font-display text-3xl md:text-4xl font-light mb-8">Choose your reality.</h2>
              <div className="grid grid-cols-2 gap-3">
                {WORLDS.map((w) => {
                  const selected = world === w.name;
                  return (
                    <button
                      key={w.name}
                      type="button"
                      onClick={() => { setWorld(w.name); }}
                      className={`text-left p-4 border transition-all ${selected ? "border-[var(--gold)] bg-[var(--gold)]/10" : "border-border hover:border-[var(--gold)]/50"}`}
                    >
                      <div className="text-2xl mb-2">{w.emoji}</div>
                      <div className="text-sm">{w.name}</div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="font-display text-3xl md:text-4xl font-light mb-3">What kind of person are you?</h2>
              <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-6">
                Pick 3 · {traits.length}/3 selected
              </p>
              <div className="flex flex-wrap gap-2">
                {TRAITS.map((t) => {
                  const selected = traits.includes(t);
                  const disabled = !selected && traits.length >= 3;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleTrait(t)}
                      disabled={disabled}
                      className={`px-4 py-2 border text-sm transition-all ${selected
                        ? "border-[var(--gold)] bg-[var(--gold)]/15 text-[var(--gold)]"
                        : disabled
                          ? "border-border opacity-30 cursor-not-allowed"
                          : "border-border hover:border-[var(--gold)]/60"
                        }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h2 className="font-display text-3xl md:text-4xl font-light mb-8">What's your goal?</h2>
              <div className="space-y-2">
                {GOALS.map((g) => {
                  const selected = goal === g;
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGoal(g)}
                      className={`block w-full text-left px-4 py-3 border text-sm transition-all ${selected ? "border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--gold)]" : "border-border hover:border-[var(--gold)]/60"}`}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer nav */}
        <div className="flex items-center justify-between px-8 py-5 border-t border-border bg-background/40">
          <button
            type="button"
            onClick={back}
            disabled={step === 1 || submitting}
            className="text-[0.65rem] tracking-[0.3em] uppercase text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            ← Back
          </button>
          {step < 4 ? (
            <button
              type="button"
              onClick={next}
              disabled={!canNext}
              className="bg-[var(--gold)] text-background text-[0.65rem] tracking-[0.3em] uppercase px-6 py-3 hover:bg-[var(--gold-bright)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Continue →
            </button>
          ) : (
            <button
              type="button"
              onClick={finish}
              disabled={!canNext || submitting}
              className="bg-[var(--gold)] text-background text-[0.65rem] tracking-[0.3em] uppercase px-6 py-3 hover:bg-[var(--gold-bright)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              {submitting ? "Entering…" : "Enter →"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
