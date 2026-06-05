import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useServerFn } from "@tanstack/react-start";
import { simulationChat } from "@/lib/simulation.functions";
import { SiteNav } from "@/components/SiteNav";

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
  "Arcane Academy",
  "Galactic Frontier",
  "Hero Nexus",
  "Dragonfall Kingdoms",
  "Champions Legacy",
  "Shadow Guild",
  "Neon Dominion",
  "Eternal Odyssey",
];

type Msg = { id: string; role: "user" | "assistant"; content: string };
type Profile = {
  character_name: string;
  character_age: number;
  world: string;
  traits: string;
  goals: string;
};
type Saga = {
  id: string;
  title: string;
  profile: Profile;
  messages: Msg[];
  updated_at: number;
};

const STORAGE_KEY = "revenio.sagas.v1";

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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sagas));
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
          profile,
          messages: [{ role: "user", content: "Begin the simulation. Generate my Character Profile, the World, and drop me into the opening scene with choices." }],
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
          profile: active.profile,
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
      // rollback user msg
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
              return (
                <div key={s.id} className={`group flex items-stretch border ${isActive ? "border-[var(--gold)] bg-[var(--gold)]/5" : "border-transparent hover:border-border"} transition-colors`}>
                  <button onClick={() => setActiveId(s.id)} className="flex-1 text-left px-3 py-3 min-w-0">
                    <div className="text-sm truncate">{s.profile.character_name}</div>
                    <div className="text-[0.6rem] tracking-[0.2em] uppercase text-muted-foreground truncate">{s.profile.world}</div>
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
            <div className="flex-1 flex items-center justify-center min-h-[60vh] px-8 text-center">
              <div className="max-w-md">
                <p className="text-[0.6rem] tracking-[0.4em] uppercase text-[var(--gold)] mb-4">The Portal Awaits</p>
                <h1 className="font-display text-5xl font-light leading-tight mb-6">
                  Explore the life you <span className="italic text-gold-gradient">never lived.</span>
                </h1>
                <p className="text-sm text-muted-foreground leading-relaxed mb-8">
                  No login. No setup. Forge a character, choose a world, and the AI will drop you into a cinematic saga that remembers every choice.
                </p>
                <button
                  onClick={() => setShowNew(true)}
                  className="inline-block px-10 py-4 bg-[var(--gold)] text-background text-xs tracking-[0.3em] uppercase font-medium hover:bg-[var(--gold-bright)] transition-all duration-500 shadow-[var(--shadow-gold)]"
                >
                  Forge Your Reality →
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-[calc(100vh-6rem)]">
              <header className="border-b border-border px-8 py-4">
                <p className="text-[0.6rem] tracking-[0.3em] uppercase text-[var(--gold)]">{active.profile.world}</p>
                <h1 className="font-display text-2xl font-light">{active.profile.character_name}</h1>
              </header>

              <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-12 py-8 space-y-6">
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
                    placeholder="What do you do? (or write your own plan…)"
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
        <NewSimDialog
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

  const lines = message.content.split("\n");
  const choices: string[] = [];
  let bodyEnd = lines.length;
  for (let i = lines.length - 1; i >= 0; i--) {
    const m = lines[i].match(/^\s*(\d+)[.)]\s+(.*)/);
    if (m && choices.length < 6) {
      choices.unshift(m[2]);
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
              <span className="text-[var(--gold)] mr-3">{i + 1}.</span>{c}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function NewSimDialog({
  onClose,
  onCreate,
  submitting,
}: {
  onClose: () => void;
  onCreate: (p: Profile) => Promise<void>;
  submitting: boolean;
}) {
  const [name, setName] = useState("");
  const [age, setAge] = useState(18);
  const [world, setWorld] = useState(WORLDS[0]);
  const [traits, setTraits] = useState("");
  const [goals, setGoals] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreate({ character_name: name, character_age: age, world, traits, goals });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background/90 backdrop-blur-md flex items-center justify-center p-6 overflow-y-auto">
      <form onSubmit={submit} className="relative w-full max-w-xl border border-border bg-card p-8 my-8">
        <button type="button" onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground text-xl">×</button>
        <p className="text-[0.6rem] tracking-[0.4em] uppercase text-[var(--gold)] mb-3">Forge Your Reality</p>
        <h2 className="font-display text-3xl font-light mb-6">A life <span className="italic text-gold-gradient">never lived.</span></h2>

        <div className="space-y-4">
          <Field label="Your Character's Name">
            <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-background border border-border px-3 py-2 text-sm focus:border-[var(--gold)] focus:outline-none" placeholder="Kai Solari" />
          </Field>
          <Field label="Age">
            <input required type="number" min={5} max={120} value={age} onChange={(e) => setAge(parseInt(e.target.value || "0", 10))} className="w-full bg-background border border-border px-3 py-2 text-sm focus:border-[var(--gold)] focus:outline-none" />
          </Field>
          <Field label="World">
            <select value={world} onChange={(e) => setWorld(e.target.value)} className="w-full bg-background border border-border px-3 py-2 text-sm focus:border-[var(--gold)] focus:outline-none">
              {WORLDS.map((w) => <option key={w}>{w}</option>)}
            </select>
          </Field>
          <Field label="Personality Traits (optional)">
            <textarea value={traits} onChange={(e) => setTraits(e.target.value)} rows={2} className="w-full bg-background border border-border px-3 py-2 text-sm focus:border-[var(--gold)] focus:outline-none" placeholder="Cunning, loyal, reckless, secretly afraid of failure…" />
          </Field>
          <Field label="Goals (optional)">
            <textarea value={goals} onChange={(e) => setGoals(e.target.value)} rows={2} className="w-full bg-background border border-border px-3 py-2 text-sm focus:border-[var(--gold)] focus:outline-none" placeholder="Become the most feared bounty hunter in the outer rim." />
          </Field>
        </div>

        <button type="submit" disabled={submitting} className="mt-6 w-full bg-[var(--gold)] text-background text-xs tracking-[0.3em] uppercase py-4 hover:bg-[var(--gold-bright)] disabled:opacity-50 transition-all">
          {submitting ? "Forging your reality…" : "Enter The Portal"}
        </button>
        <p className="text-[0.55rem] tracking-[0.25em] uppercase text-muted-foreground/60 text-center mt-4">
          No account required · Saved on this device
        </p>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[0.6rem] tracking-[0.3em] uppercase text-muted-foreground mb-2">{label}</label>
      {children}
    </div>
  );
}
