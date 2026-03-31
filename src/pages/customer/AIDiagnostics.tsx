import { useState } from "react";
import { Upload, FileText, ImageIcon, Clock, Zap, Lightbulb, Video } from "lucide-react";
import { Link } from "react-router-dom";

const AIDiagnostics = () => {
  const [symptoms, setSymptoms] = useState("");
  const [activeTab, setActiveTab] = useState<"text" | "visual">("text");

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
        <span>Diagnostics</span>
        <span className="text-border">/</span>
        <span className="text-primary font-semibold">AI Fault Diagnosis</span>
      </div>
      <div>
        <h1 className="text-2xl font-bold text-on-surface tracking-tight">AI Fault Diagnosis</h1>
        <p className="text-sm text-muted-foreground mt-1">Utilize our neural diagnostic engine to pinpoint mechanical issues with 98.4% accuracy.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Analysis Card */}
          <div className="bg-card p-6 rounded-xl border border-border/20 shadow-sm">
            <div className="flex gap-6 mb-6 border-b border-border/20 pb-4">
              <button
                onClick={() => setActiveTab("text")}
                className={`flex items-center gap-2 text-sm font-semibold pb-2 transition-colors ${
                  activeTab === "text"
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-on-surface"
                }`}
              >
                <FileText className="w-4 h-4" /> Text Analysis
              </button>
              <button
                onClick={() => setActiveTab("visual")}
                className={`flex items-center gap-2 text-sm font-medium pb-2 transition-colors ${
                  activeTab === "visual"
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-on-surface"
                }`}
              >
                <ImageIcon className="w-4 h-4" /> Visual Analysis
              </button>
            </div>

            <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-2">Describe Symptoms</h4>
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Example: Hear a high-pitched squealing noise when braking at low speeds, particularly in cold weather. Slight vibration felt through the brake pedal..."
              className="w-full h-32 bg-surface-container-low border border-border/30 rounded-xl p-4 text-sm resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none placeholder:text-muted-foreground transition-all"
            />
            <div className="flex items-center justify-between mt-4">
              <span className="text-xs bg-surface-container px-3 py-1.5 rounded-full text-muted-foreground font-medium flex items-center gap-1.5">
                <Clock className="w-3 h-3" /> Recent: Braking Issue
              </span>
              <button className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] transition-all">
                Analyze Symptoms <Zap className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Upload Section */}
          <div className="bg-card p-6 rounded-xl border-2 border-dashed border-border/30 flex flex-col items-center justify-center min-h-[160px] text-center hover:border-primary/30 transition-colors cursor-pointer group">
            <Upload className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
            <h4 className="font-bold text-on-surface mb-1">Upload Visual Data</h4>
            <p className="text-xs text-muted-foreground mb-3">Drag and drop photos of engine components or undercarriage</p>
            <div className="flex gap-2">
              {[".JPG", ".PNG", ".HEIC"].map(f => (
                <span key={f} className="text-[10px] font-mono bg-surface-container px-2 py-1 rounded text-muted-foreground">{f}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="space-y-4">
          {/* Fault Suggestions */}
          <div className="bg-card p-5 rounded-xl border border-border/20 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Ranked Fault Suggestions</h4>
              <span className="text-[10px] font-bold text-destructive border border-destructive/30 px-2 py-0.5 rounded">Live Analysis</span>
            </div>
            <div className="space-y-3">
              {[
                { fault: "Worn Brake Pads", detail: "Front-Left Axle emphasis", confidence: 92 },
                { fault: "Glazed Brake Rotors", detail: "Heat-stress secondary symptom", confidence: 64 },
                { fault: "Loose Caliper Pin", detail: "Mechanical vibration source", confidence: 18 },
              ].map(f => (
                <div key={f.fault} className="p-3 bg-surface-container-low rounded-lg border border-border/10 hover:border-primary/20 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm font-bold text-on-surface">{f.fault}</p>
                      <p className="text-xs text-muted-foreground">{f.detail}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-primary">{f.confidence}%</p>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Confidence</p>
                    </div>
                  </div>
                  <div className="h-1.5 bg-surface-container-high rounded-full mb-3">
                    <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${f.confidence}%` }} />
                  </div>
                  <Link
                    to="/customer/book"
                    className="w-full py-2 border border-border/30 rounded-lg text-xs font-bold text-on-surface hover:bg-surface-container hover:border-primary/30 transition-all flex items-center justify-center"
                  >
                    Book This Service
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Pro Tip */}
          <div className="bg-surface-container-low p-4 rounded-xl border border-border/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-tertiary/10 rounded-lg">
                <Lightbulb className="w-3.5 h-3.5 text-tertiary" />
              </div>
              <p className="text-xs font-bold text-on-surface">AI Assistant Pro-Tip</p>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Based on VIN records, your brake fluid was last flushed 22 months ago. Consider a system check.
            </p>
          </div>

          {/* Need a Pro? */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-xl">
            <h4 className="font-bold mb-2">Need a Pro?</h4>
            <p className="text-sm text-slate-400 mb-4">Our master technicians can verify these AI findings via a remote video call diagnostic session.</p>
            <button className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all shadow-lg shadow-primary/20">
              <Video className="w-4 h-4" /> Start Video Consult
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIDiagnostics;
