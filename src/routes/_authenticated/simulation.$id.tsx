import { createFileRoute, useParams } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useServerFn } from "@tanstack/react-start";
import { getSimulation, sendSimulationMessage } from "@/lib/simulation.functions";

export const Route = createFileRoute("/_authenticated/simulation/$id")({
  component: SimulationChat,
});

type Msg = { id: string; role: string; content: string; created_at: string };
type Sim = { id: string; title: string; character_name: string; world: string };

function SimulationChat() {
  const { id } = useParams({ from: "/_authenticated/simulation/$id" });
  const get = useServerFn(getSimulation);
  const send = useServerFn(sendSimulationMessage);

  const [sim, setSim] = useState<Sim | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setLoading(true);
    setMessages([]);
    setSim(null);
    get({ data: { id } })
      .then((res) => {
        setSim(res.simulation as Sim);
        setMessages(res.messages as Msg[]);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [id, sending]);

  const handleSend = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || sending) return;
    setSending(true);
    setError(null);
    const optimistic: Msg = { id: `tmp-${Date.now()}`, role: "user", content, created_at: new Date().toISOString() };
    setMessages((prev) => [...prev, optimistic]);
    setInput("");
    try {
      const reply = await send({ data: { simulation_id: id, content } });
      setMessages((prev) => [...prev, reply as Msg]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setInput(content);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-sm text-muted-foreground">Loading your saga…</div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      {sim && (
        <header className="border-b border-border px-8 py-4">
          <p className="text-[0.6rem] tracking-[0.3em] uppercase text-[var(--gold)]">{sim.world}</p>
          <h1 className="font-display text-2xl font-light">{sim.character_name}</h1>
        </header>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-12 py-8 space-y-6">
        {messages.map((m) => (
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
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
            }}
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

  // Parse choices from end of message (lines starting with "1." through "9.")
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
