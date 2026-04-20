import { useEffect, useRef, useState } from "react";
import { Send, Loader2, Sparkles, Car, Bot, User as UserIcon, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Msg { role: "user" | "assistant"; content: string; }

const STORAGE_KEY = "autoserve.ai-assistant.history.v1";

const SUGGESTIONS = [
  "When is my next service due?",
  "How much will brake pads cost for my car?",
  "Recommend a service based on my history",
  "What does AC gas refill include?",
];

const AIAssistant = () => {
  const { profile, user } = useAuth();
  const userKey = user?.id ? `${STORAGE_KEY}.${user.id}` : STORAGE_KEY;
  const [messages, setMessages] = useState<Msg[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(userKey);
      return raw ? (JSON.parse(raw) as Msg[]) : [];
    } catch { return []; }
  });
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  // Persist chat history per-user
  useEffect(() => {
    try {
      localStorage.setItem(userKey, JSON.stringify(messages.slice(-50)));
    } catch { /* quota — ignore */ }
  }, [messages, userKey]);

  const clearChat = () => {
    setMessages([]);
    try { localStorage.removeItem(userKey); } catch { /* ignore */ }
  };

  const send = async (text: string) => {
    if (!text.trim() || busy) return;
    const newMsgs: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(newMsgs);
    setInput("");
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-assistant", {
        body: { mode: "chat", messages: newMsgs },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setMessages([...newMsgs, { role: "assistant", content: data.content || "(no reply)" }]);
    } catch (e: any) {
      toast.error(e.message ?? "AI request failed");
      setMessages(newMsgs); // keep user message
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between pb-4 border-b border-border/20">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-on-surface">AutoServe AI Assistant</h1>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">Powered by Gemini · Knows your vehicles & history</p>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button onClick={clearChat} title="Clear chat" className="p-2 rounded-lg border border-border/20 hover:bg-surface-container transition-colors text-muted-foreground hover:text-destructive">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-surface-container rounded-lg border border-border/20">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-on-surface">{profile?.full_name?.split(" ")[0] || "Customer"}</span>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto py-6 space-y-5">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-14 h-14 bg-gradient-to-br from-slate-900 to-slate-700 rounded-2xl flex items-center justify-center mb-4">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-xl font-bold text-on-surface mb-1">Ask me anything about your vehicles</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-md">I know your fleet, bookings, and our full service catalogue with current Indian market pricing.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)} className="text-left text-sm p-3 bg-surface-container-low border border-border/20 rounded-xl hover:border-primary/30 hover:bg-surface-container transition-all">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
            {m.role === "assistant" && (
              <div className="w-8 h-8 bg-gradient-to-br from-slate-900 to-slate-700 rounded-lg flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            <div className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${m.role === "user" ? "bg-primary text-primary-foreground rounded-br-md" : "bg-card border border-border/20 rounded-tl-md text-on-surface"}`}>
              {m.content}
            </div>
            {m.role === "user" && (
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0 mt-1">
                <UserIcon className="w-4 h-4 text-primary" />
              </div>
            )}
          </div>
        ))}

        {busy && (
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-slate-900 to-slate-700 rounded-lg flex items-center justify-center shrink-0 mt-1">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-card border border-border/20 p-4 rounded-2xl rounded-tl-md text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Thinking…
            </div>
          </div>
        )}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="border-t border-border/20 pt-4">
        <div className="bg-card border border-border/20 rounded-2xl shadow-sm overflow-hidden flex items-center gap-2 p-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your vehicles, services, or pricing…"
            disabled={busy}
            className="flex-1 bg-transparent text-sm text-on-surface placeholder:text-muted-foreground outline-none px-3 py-2"
          />
          <button type="submit" disabled={busy || !input.trim()} className="p-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-40">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 px-1 flex items-center gap-1">
          <Car className="w-3 h-3" /> Verify critical service decisions with a certified technician.
        </p>
      </form>
    </div>
  );
};

export default AIAssistant;
