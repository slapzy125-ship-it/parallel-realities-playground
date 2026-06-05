import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/simulation/")({
  component: SimulationIndex,
});

function SimulationIndex() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[60vh] px-8 text-center">
      <div className="max-w-md">
        <p className="text-[0.6rem] tracking-[0.4em] uppercase text-[var(--gold)] mb-4">The Portal Awaits</p>
        <h1 className="font-display text-5xl font-light leading-tight mb-6">
          Explore the life you <span className="italic text-gold-gradient">never lived.</span>
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Start a new simulation from the sidebar. Every saga is a parallel reality built around the character you imagine — your name, your traits, your world. The story begins the moment you step in.
        </p>
      </div>
    </div>
  );
}
