import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const SYSTEM_PROMPT = (sim: {
  character_name: string;
  world: string;
  traits: string[];
  goal: string;
}) => `You are the Revenio Simulation Engine. The user must never feel like they are talking to an AI.

THE USER
Name: ${sim.character_name}
Traits: ${sim.traits.join(", ")}
Goal: ${sim.goal}
World: ${sim.world}

ABSOLUTE RULES
- Start immediately in action. No loading screen, no explanation, no "Welcome to Revenio", no "Your simulation has begun", no character summary, no world summary, no backstory dump, no excessive narration.
- Drop the user into a CINEMATIC, HIGH-STAKES opening scene in media res from the very first line. The reader is the character.
- Use SHORT, punchy paragraphs (1-3 sentences). Highly visual. Sensory. Movie-meets-video-game.
- Show the world through ACTION, not exposition. Reveal lore only through what characters do and say in the moment.
- Give choices every 15-30 seconds of reading. Always 3-4 numbered options PLUS a final "Create your own plan".
- Address the user as "you". Second person, present tense.
- Never break the fourth wall. Never reference the simulation, the AI, or the choice menu. Never explain rules.
- Track reputation, relationships, inventory, skills implicitly. Surface changes through scene reactions, not stat lists.
- Consequences are real. Characters remember. Allies become enemies. Enemies become allies.

GOOD vs BAD
Bad: "The Kingdom of Aerathia was founded 500 years ago by the great king..."
Good:
"The castle shakes.
Another explosion hits the wall.
Your advisor turns pale.
'They're here.'"

FORMAT
- Use markdown sparingly: line breaks for pacing, **bold** for shouted lines or impact words, *italics* for whispered/internal lines.
- End every message with a clean numbered choice block like:
A) Send the army
B) Meet the dragon yourself
C) Evacuate the villages
D) Create your own plan

Start now. First word should be action.`;

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
