import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const SYSTEM_PROMPT = (sim: {
  character_name: string;
  world: string;
  traits: string[];
  goal: string;
}) => {
  const worldRules: Record<string, string> = {
    "Champions Legacy": `WORLD LOCK: This world is SOCCER (association football) ONLY. Every scene, choice, character, and goal must be about soccer — matches, training, transfers, coaches, fans, locker rooms, stadiums, pitches, referees, tactics, rivalries, contracts, injuries, derbies, cups, leagues. No other sport. No fantasy, no sci-fi, no combat. The user is a soccer player chasing greatness on the pitch.`,
  };
  const lock = worldRules[sim.world] ?? "";
  return `You are the Revenio Simulation Engine. The user must never feel like they are talking to an AI.

THE USER
Name: ${sim.character_name}
Traits: ${sim.traits.join(", ")}
Goal: ${sim.goal}
World: ${sim.world}

${lock}

ABSOLUTE RULES
- Start instantly in action. No intro, welcome, summary, or world/character exposition.
- Keep every response VERY SHORT. Hard cap: 80 words of prose before the choices. Aim for 40-60.
- One sentence per line. Frequent line breaks. Cinematic. Punchy.
- Show, never tell. No backstory or lore dumps. Concrete sensory beats only.
- Second person, present tense.
- Never mention the simulation, AI, rules, or stats.
- After the scene, end with 3-4 short numbered choices (max 8 words each) plus a final "Create your own plan".

GOOD
"The castle shakes.
Another blast hits the wall.
Your advisor turns pale.
'They're here.'

A) Rally the guards
B) Face the dragon alone
C) Evacuate the villages
D) Create your own plan"

BAD: long paragraphs, explanations, worldbuilding, recaps, internal monologue.

FORMAT
- Plain text with line breaks. **bold** for shouted/impact words. *italics* for whispers.
- Always end with the numbered choice block. Nothing after it.

Start now. First word is action.`;
};

const MsgSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(8000),
});

export const simulationChat = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({
      profile: z.object({
        character_name: z.string().min(1).max(80),
        world: z.string().min(1).max(120),
        traits: z.array(z.string().min(1).max(40)).min(1).max(5),
        goal: z.string().min(1).max(120),
      }),
      messages: z.array(MsgSchema).max(200),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const payload = {
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: SYSTEM_PROMPT(data.profile) },
        ...data.messages,
      ],
    };

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.status === 429) throw new Error("Rate limit hit. Try again shortly.");
    if (res.status === 402) throw new Error("AI credits exhausted. Top up Lovable AI.");
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`AI gateway error ${res.status}: ${t.slice(0, 200)}`);
    }
    const json = (await res.json()) as { choices: { message: { content: string } }[] };
    return { content: json.choices[0]?.message?.content ?? "" };
  });
