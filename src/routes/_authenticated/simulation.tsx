import { createFileRoute, Link, Outlet, useNavigate, useParams, useRouter } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useServerFn } from "@tanstack/react-start";
import {
  listSimulations,
  getSimulation,
  createSimulation,
  sendSimulationMessage,
  deleteSimulation,
} from "@/lib/simulation.functions";
import { SiteNav } from "@/components/SiteNav";

export const Route = createFileRoute("/_authenticated/simulation")({
  head: () => ({
    meta: [
      { title: "Simulation — Revenio" },
      { name: "description", content: "Step into your simulation and live the life you never lived." },
    ],
  }),
  component: SimulationLayout,
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

type Sim = { id: string; title: string; world: string; character_name: string; updated_at: string };

function SimulationLayout() {
  const list = useServerFn(listSimulations);
  const create = useServerFn(createSimulation);
  const del = useServerFn(deleteSimulation);
  const navigate = useNavigate();
  const router = useRouter();
  const params = useParams({ strict: false }) as { id?: string };

  const [sims, setSims] = useState<Sim[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);

  const refresh = async () => {
    const data = await list();
    setSims(data as Sim[]);
    setLoading(false);
  };
  useEffect(() => { refresh(); }, []);

  // Open new dialog by default if no sims and on /simulation root
  useEffect(() => {
    if (!loading && sims.length === 0 && !params.id) setShowNew(true);
  }, [loading, sims.length, params.id]);

  const handleCreate = async (input: { character_name: string; character_age: number; world: string; traits: string; goals: string }) => {
    const { id } = await create({ data: input });
    setShowNew(false);
    await refresh();
    navigate({ to: "/simulation/$id", params: { id } });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this saga forever?")) return;
    await del({ data: { id } });
    if (params.id === id) navigate({ to: "/simulation" });
    await refresh();
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
            {sims.length === 0 && !loading && (
              <p className="text-xs text-muted-foreground italic">No sagas yet. Start one.</p>
            )}
            {sims.map((s) => {
              const active = params.id === s.id;
              return (
                <div key={s.id} className={`group flex items-stretch border ${active ? "border-[var(--gold)] bg-[var(--gold)]/5" : "border-transparent hover:border-border"} transition-colors`}>
                  <button
                    onClick={() => navigate({ to: "/simulation/$id", params: { id: s.id } })}
                    className="flex-1 text-left px-3 py-3 min-w-0"
                  >
                    <div className="text-sm truncate">{s.character_name}</div>
                    <div className="text-[0.6rem] tracking-[0.2em] uppercase text-muted-foreground truncate">{s.world}</div>
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
        </aside>

        {/* Main */}
        <section className="flex-1 min-w-0">
          <Outlet />
        </section>
      </div>

      {showNew && <NewSimDialog onClose={() => setShowNew(false)} onCreate={handleCreate} />}
    </main>
  );
}

function NewSimDialog({ onClose, onCreate }: { onClose: () => void; onCreate: (i: { character_name: string; character_age: number; world: string; traits: string; goals: string }) => Promise<void> }) {
  const [name, setName] = useState("");
  const [age, setAge] = useState(18);
  const [world, setWorld] = useState(WORLDS[0]);
  const [traits, setTraits] = useState("");
  const [goals, setGoals] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onCreate({ character_name: name, character_age: age, world, traits, goals });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create simulation");
      setSubmitting(false);
    }
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

        {error && <p className="text-xs text-red-400 mt-4 border border-red-500/30 bg-red-500/10 p-3">{error}</p>}

        <button type="submit" disabled={submitting} className="mt-6 w-full bg-[var(--gold)] text-background text-xs tracking-[0.3em] uppercase py-4 hover:bg-[var(--gold-bright)] disabled:opacity-50 transition-all">
          {submitting ? "Forging your reality…" : "Enter The Portal"}
        </button>
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
