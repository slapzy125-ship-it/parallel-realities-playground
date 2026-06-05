import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

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

const MsgSchema = z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(8000) });

export const simulationChat = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({
      profile: z.object({
        character_name: z.string().min(1).max(80),
        character_age: z.number().int().min(5).max(120),
        world: z.string().min(1).max(120),
        traits: z.string().max(500).default(""),
        goals: z.string().max(500).default(""),
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
