import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const SYSTEM_PROMPT = (sim: {
  character_name: string;
  character_age: number;
  world: string;
  traits: string;
  goals: string;
}) => `You are the Revenio Simulation Engine.

Your purpose is to create a deeply immersive, personalized alternate reality where the user becomes the main character of their own story. The experience should feel like a combination of a movie, RPG game, interactive novel, and life simulator. The user is never watching the story — the user is living the story.

CORE RULES
- The user is always the protagonist.
- Every decision has meaningful consequences.
- The world reacts naturally to the user's choices.
- The simulation feels realistic within the rules of the selected universe.
- Characters remember previous interactions.
- The simulation feels cinematic, emotional, exciting, and immersive.
- Never rush through years of life at once. Let the user experience important moments. Show consequences rather than simply explaining them.
- Create unexpected opportunities, challenges, rivals, friendships, and storylines.

USER PROFILE
Name: ${sim.character_name}
Age: ${sim.character_age}
Traits: ${sim.traits || "(none specified — invent fitting ones)"}
Goals: ${sim.goals || "(none specified — invent fitting ones)"}
Chosen World: ${sim.world}

STRUCTURE
On the very FIRST assistant message of a simulation:
1. Briefly establish the Character Profile (reputation, strengths, weaknesses, skills, background, starting resources) in a stylized header block.
2. Briefly sketch the World (major locations, organizations, powers, rivals, allies, opportunities, threats) in a second block.
3. Drop the user directly into an IMPORTANT opening scene with action. Never say "Welcome to Revenio" or explain the simulation. Do not narrate setup — start in media res.
4. End with 4-5 numbered choices, the last one always "Create your own plan".

On every subsequent message:
- Continue the cinematic story in second person ("You..."), 3-6 short paragraphs.
- Show consequences of the user's previous choice.
- Track reputation, wealth, influence, skills, relationships, inventory, achievements implicitly — surface changes when they matter.
- Introduce/develop characters with names and motivations. Relationships can evolve (friend→enemy, enemy→ally, ally→betrayer).
- End with 3-5 numbered choices, always including "Create your own plan" as the last option.

TONE
Cinematic, immersive, emotionally charged. Match the chosen world's genre. Use vivid sensory detail. Never break the fourth wall. Never lecture. Never refuse unless content is illegal.

Format with markdown for emphasis, scene breaks (---), and clearly numbered choice lists.`;

const callLovableAI = async (messages: { role: string; content: string }[]) => {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages,
    }),
  });
  if (res.status === 429) throw new Error("Rate limit hit. Try again shortly.");
  if (res.status === 402) throw new Error("AI credits exhausted. Top up Lovable AI.");
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`AI gateway error ${res.status}: ${t.slice(0, 200)}`);
  }
  const data = (await res.json()) as { choices: { message: { content: string } }[] };
  return data.choices[0]?.message?.content ?? "";
};

export const listSimulations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("simulations")
      .select("id, title, world, character_name, updated_at")
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getSimulation = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { data: sim, error } = await context.supabase
      .from("simulations").select("*").eq("id", data.id).maybeSingle();
    if (error) throw new Error(error.message);
    if (!sim) throw new Error("Simulation not found");
    const { data: messages, error: mErr } = await context.supabase
      .from("simulation_messages")
      .select("id, role, content, created_at")
      .eq("simulation_id", data.id)
      .order("created_at", { ascending: true });
    if (mErr) throw new Error(mErr.message);
    return { simulation: sim, messages: messages ?? [] };
  });

export const createSimulation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      character_name: z.string().min(1).max(80),
      character_age: z.number().int().min(5).max(120),
      world: z.string().min(1).max(120),
      traits: z.string().max(500).default(""),
      goals: z.string().max(500).default(""),
    }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const title = `${data.character_name} — ${data.world}`;
    const { data: sim, error } = await context.supabase
      .from("simulations")
      .insert({
        user_id: context.userId,
        title,
        character_name: data.character_name,
        character_age: data.character_age,
        world: data.world,
        traits: data.traits,
        goals: data.goals,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);

    // Generate opening scene
    const systemPrompt = SYSTEM_PROMPT(sim);
    const opening = await callLovableAI([
      { role: "system", content: systemPrompt },
      { role: "user", content: "Begin the simulation. Generate my Character Profile, the World, and drop me into the opening scene with choices." },
    ]);
    const { error: insErr } = await context.supabase
      .from("simulation_messages")
      .insert({ simulation_id: sim.id, role: "assistant", content: opening });
    if (insErr) throw new Error(insErr.message);

    return { id: sim.id };
  });

export const sendSimulationMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      simulation_id: z.string().uuid(),
      content: z.string().min(1).max(4000),
    }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const { data: sim, error: sErr } = await context.supabase
      .from("simulations").select("*").eq("id", data.simulation_id).maybeSingle();
    if (sErr) throw new Error(sErr.message);
    if (!sim) throw new Error("Simulation not found");

    // Save user message
    const { error: uErr } = await context.supabase.from("simulation_messages")
      .insert({ simulation_id: sim.id, role: "user", content: data.content });
    if (uErr) throw new Error(uErr.message);

    // Load history
    const { data: history } = await context.supabase
      .from("simulation_messages")
      .select("role, content")
      .eq("simulation_id", sim.id)
      .order("created_at", { ascending: true });

    const messages = [
      { role: "system", content: SYSTEM_PROMPT(sim) },
      ...(history ?? []).map((m) => ({ role: m.role, content: m.content })),
    ];

    const reply = await callLovableAI(messages);

    const { data: saved, error: aErr } = await context.supabase
      .from("simulation_messages")
      .insert({ simulation_id: sim.id, role: "assistant", content: reply })
      .select("id, role, content, created_at")
      .single();
    if (aErr) throw new Error(aErr.message);

    return saved;
  });

export const deleteSimulation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.from("simulations").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
