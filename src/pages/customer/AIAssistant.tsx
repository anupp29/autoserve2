// Production AI assistant with chat persistence (localStorage), DB grounding, and real AI calls.
// Note: Booking creation is intentionally NOT done here — to avoid the "no customer_id linked" bug. The
// assistant guides the user to the Book Service page instead.
import { useEffect, useRef, useState } from "react";
import { Send, Loader2, Sparkles, Trash2, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLiveTable } from "@/hooks/useRealtimeQuery";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
  ts: number;
}

interface Vehicle { id: string; make: string; model: string; year: number; registration: string; mileage: number; }
interface Booking { id: string; status: string; scheduled_at: string; service_id: string; vehicle_id: string; }
interface Service { id: string; name: string; price: number; category: string; }

const STORAGE_KEY = "autoserve_assistant_history_v1";

const AIAssistant = () => {
  const { user, profile } = useAuth();
  const { data: vehicles } = useLiveTable<Vehicle>("vehicles", (q) => q.eq("owner_id", user?.id ?? ""), [user?.id], { enabled: !!user });
  const { data: bookings } = useLiveTable<Booking>("bookings", (q) => q.eq("customer_id", user?.id ?? "").order("scheduled_at", { ascending: false }).limit(8), [user?.id], { enabled: !!user });
  const { data: services } = useLiveTable<Service>("services", (q) => q.eq("active", true));

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scroller = useRef<HTMLDivElement | null>(null);

  // Restore conversation from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setMessages(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-40))); } catch {}
    }
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const buildContext = () => ({
    customer: { name: profile?.full_name ?? "Customer" },
    vehicles: vehicles.map((v) => ({ id: v.id, label: `${v.year} ${v.make} ${v.model}`, registration: v.registration, mileage: v.mileage })),
    services: services.map((s) => ({ id: s.id, name: s.name, category: s.category, price: s.price })),
    recent_bookings: bookings.map((b) => {
      const v = vehicles.find((x) => x.id === b.vehicle_id);
      const s = services.find((x) => x.id === b.service_id);
      return { id: b.id, status: b.status, when: b.scheduled_at, vehicle: v ? `${v.make} ${v.model}` : "?", service: s?.name ?? "?" };
    }),
  });

  const send = async () => {
    if (!input.trim() || busy) return;
    const userMsg: Message = { role: "user", content: input.trim(), ts: Date.now() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-diagnostics", {
        body: {
          mode: "chat",
          context: buildContext(),
          history: next.slice(-10).map((m) => ({ role: m.role, content: m.content })),
        },
      });
      if (error) throw error;
      const reply: Message = { role: "assistant", content: data?.reply ?? "Sorry, I couldn't generate a response.", ts: Date.now() };
      setMessages((p) => [...p, reply]);
    } catch (e: any) {
      toast.error(e.message ?? "AI request failed");
      setMessages((p) => [...p, { role: "assistant", content: "I had trouble connecting. Please try again.", ts: Date.now() }]);
    } finally {
      setBusy(false);
    }
  };

  const clear = () => {
    setMessages([]);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  };

  const suggestions = [
    "When is my next service due?",
    "What does a basic service cost?",
    "Is my brake fluid due for a flush?",
    "Recommend services for my vehicle",
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between pb-4 border-b border-border/20">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-on-surface">AutoServe AI Assistant</h1>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono">Powered by AutoServe AI · {vehicles.length} vehicle{vehicles.length === 1 ? "" : "s"} on file</p>
        </div>
        {messages.length > 0 && (
          <button onClick={clear} className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1.5 p-2 rounded-lg hover:bg-surface-container">
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </div>

      <div ref={scroller} className="flex-1 overflow-y-auto py-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70 items-center justify-center mb-4 shadow-lg shadow-primary/20">
              <Sparkles className="w-7 h-7 text-primary-foreground" />
            </div>
            <h2 className="text-xl font-bold text-on-surface mb-1">How can I help, {profile?.full_name?.split(" ")[0] ?? "there"}?</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">Ask about your vehicles, upcoming services, pricing, or maintenance recommendations.</p>
            <div className="grid sm:grid-cols-2 gap-2 max-w-lg mx-auto">
              {suggestions.map((s) => (
                <button key={s} onClick={() => setInput(s)} className="p-3 text-left text-sm bg-card border border-border/30 rounded-lg hover:border-primary/30 transition-colors text-on-surface">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] sm:max-w-[75%] ${m.role === "user" ? "" : "flex gap-2"}`}>
              {m.role === "assistant" && (
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shrink-0 mt-1">
                  <Sparkles className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
              <div>
                <div className={`p-3.5 rounded-2xl whitespace-pre-wrap text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-card border border-border/20 text-on-surface rounded-tl-md shadow-sm"
                }`}>
                  {m.content}
                </div>
                {m.role === "assistant" && /book|schedule|service/i.test(m.content) && (
                  <Link to="/customer/book" className="inline-flex items-center gap-1.5 mt-2 text-xs font-bold text-primary hover:underline">
                    <Calendar className="w-3 h-3" /> Open booking page
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}

        {busy && (
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground animate-pulse" />
            </div>
            <div className="bg-card border border-border/20 p-3.5 rounded-2xl rounded-tl-md text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Thinking…
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-border/20 pt-3">
        <form onSubmit={(e) => { e.preventDefault(); send(); }} className="bg-card border border-border/30 rounded-2xl shadow-sm p-2 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your vehicles, bookings, or services…"
            className="flex-1 bg-transparent px-3 py-2.5 text-sm outline-none text-on-surface placeholder:text-muted-foreground"
            disabled={busy}
          />
          <button type="submit" disabled={busy || !input.trim()} className="p-2.5 bg-primary text-primary-foreground rounded-xl active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-primary/20">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
        <p className="text-[10px] text-muted-foreground mt-2 px-1 text-center">AI-generated responses. Verify critical maintenance with a certified technician.</p>
      </div>
    </div>
  );
};

export default AIAssistant;
