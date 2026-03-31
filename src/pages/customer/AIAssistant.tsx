import { useState } from "react";
import { Send, Plus, ImageIcon, ThumbsUp, ThumbsDown, Mic, Car, Zap, BookOpen, Shield } from "lucide-react";

const recentChats = [
  { title: "Brake Fluid Leak Specs", vehicle: "2021 Audi RS6" },
  { title: "Turbocharger PSI Drop", vehicle: "2019 Porsche 911" },
];

const AIAssistant = () => {
  const [message, setMessage] = useState("");

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-border/20">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-on-surface">RAG Diagnostic Assistant</h1>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">System: Online | GPU: Cluster-D9</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-surface-container rounded-lg border border-border/20">
          <Car className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-on-surface">2023 BMW M5</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden mt-4 gap-4">
        {/* Sidebar - Recent Chats (hidden on mobile) */}
        <div className="hidden lg:block w-52 shrink-0 space-y-4">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Recent Chats</p>
          <div className="space-y-2">
            {recentChats.map((chat, i) => (
              <button key={i} className="w-full text-left p-3 rounded-lg hover:bg-surface-container transition-colors group">
                <p className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">{chat.title}</p>
                <p className="text-xs text-muted-foreground">{chat.vehicle}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto space-y-6 pb-4">
            {/* Welcome */}
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-900 to-slate-700 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-on-surface mb-1">AI Diagnostic Terminal</h2>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                Directly connected to the 2023 BMW M5 Technical Service Manual and Live Telemetry.
              </p>
            </div>

            {/* User Message */}
            <div className="flex justify-end">
              <div className="max-w-lg">
                <div className="bg-primary text-primary-foreground p-4 rounded-2xl rounded-br-md">
                  <p className="text-sm leading-relaxed">
                    What are the specific torque settings for the front brake caliper bolts on this M5 Competition? I'm seeing a minor variance in the shop notes.
                  </p>
                </div>
                <p className="text-[10px] text-muted-foreground text-right mt-1.5 font-mono uppercase tracking-wider">Sent 14:22</p>
              </div>
            </div>

            {/* AI Response */}
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-slate-900 to-slate-700 rounded-lg flex items-center justify-center shrink-0 mt-1">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div className="max-w-2xl">
                <div className="bg-card border border-border/20 p-5 rounded-2xl rounded-tl-md shadow-sm">
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    For the <span className="font-bold text-primary font-mono">2023 BMW M5 (F90)</span> front axle M-Compound braking system, the torque specification for the caliper housing to the swivel bearing is:
                  </p>

                  <div className="grid grid-cols-2 gap-0 border border-border/20 rounded-lg overflow-hidden mb-4">
                    <div className="p-4 border-r border-border/20">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Newton Meters</p>
                      <p className="text-2xl font-black text-on-surface">110 Nm</p>
                    </div>
                    <div className="p-4">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Foot-Pounds</p>
                      <p className="text-2xl font-black text-on-surface">81 lb-ft</p>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    Note: Replace the bolts as they are micro-encapsulated (single-use). Applying additional torque may lead to shear failure during thermal expansion.
                  </p>

                  <div className="flex items-center justify-between p-3 bg-surface-container rounded-lg">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-primary" />
                      <span className="text-xs text-muted-foreground">Source: 2023 BMW M5 Service Manual - Section 34.11 (Front Brakes)</span>
                    </div>
                    <button className="text-xs text-primary font-bold uppercase tracking-wider hover:underline">View Manual</button>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Received 14:23</span>
                  <button className="p-1 hover:bg-surface-container rounded transition-colors"><ThumbsUp className="w-3.5 h-3.5 text-muted-foreground hover:text-primary" /></button>
                  <button className="p-1 hover:bg-surface-container rounded transition-colors"><ThumbsDown className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" /></button>
                </div>
              </div>
            </div>

            {/* Brake image */}
            <div className="flex justify-end">
              <div className="max-w-sm">
                <div className="rounded-2xl overflow-hidden border border-border/20 shadow-sm">
                  <img
                    src="https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop"
                    alt="Brake system close-up"
                    className="w-full h-48 object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Input */}
          <div className="border-t border-border/20 pt-4">
            <div className="bg-card border border-border/20 rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 p-3">
                <button className="p-2 text-muted-foreground hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors">
                  <Plus className="w-5 h-5" />
                </button>
                <button className="p-2 text-muted-foreground hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors">
                  <ImageIcon className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message or ask for specs..."
                  className="flex-1 bg-transparent text-sm text-on-surface placeholder:text-muted-foreground outline-none"
                />
                <button className="p-2 text-muted-foreground hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors">
                  <Mic className="w-5 h-5" />
                </button>
                <button className="p-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 active:scale-95 transition-all shadow-lg shadow-primary/20">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2 px-1">
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Shield className="w-3 h-3" /> AI can make mistakes. Verify critical specs with manual.
              </p>
              <div className="flex gap-2">
                <span className="text-[10px] font-mono font-bold bg-surface-container px-2 py-1 rounded text-muted-foreground">F90 Platform</span>
                <span className="text-[10px] font-mono font-bold bg-surface-container px-2 py-1 rounded text-muted-foreground">S63 Engine</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
