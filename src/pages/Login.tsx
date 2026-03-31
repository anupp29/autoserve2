import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight, User, Shield, UserCog } from "lucide-react";
import AutoServeLogo from "@/components/AutoServeLogo";

const Login = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<"customer" | "employee" | "manager">("customer");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/${role}/dashboard`);
  };

  const roles = [
    { id: "customer" as const, label: "Customer", icon: User },
    { id: "employee" as const, label: "Employee", icon: Shield },
    { id: "manager" as const, label: "Manager", icon: UserCog },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center industrial-mesh p-4">
      <main className="w-full max-w-[1200px] grid grid-cols-1 lg:grid-cols-12 bg-card shadow-lg rounded-xl overflow-hidden min-h-[600px] lg:min-h-[700px]">
        {/* Left Branding */}
        <section className="hidden lg:flex lg:col-span-5 relative flex-col justify-between p-12 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-5 pointer-events-none industrial-mesh" />
          <div className="relative z-10">
            <div className="mb-12">
              <AutoServeLogo subtitle="" size={40} className="[&_h2]:text-white [&_div:first-child]:bg-primary [&_div:first-child]:shadow-primary/25" />
              <span className="text-2xl font-extrabold tracking-tighter uppercase italic ml-[52px] -mt-4 block">AutoServe</span>
            </div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight mb-6">
              Engineering-Grade <br />
              <span className="text-primary">Service Management</span>
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Precision tools for automotive professionals. Monitor fleet status, manage work orders, and optimize shop floor efficiency in real-time.
            </p>
          </div>
          <div className="relative z-10">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-md">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] uppercase tracking-[0.15em] font-mono text-slate-400">System Status: Optimal</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.15em] text-slate-500 mb-1">Active Nodes</div>
                  <div className="font-mono text-xl font-bold tracking-tight">1,204</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.15em] text-slate-500 mb-1">Latency</div>
                  <div className="font-mono text-xl font-bold tracking-tight">14ms</div>
                </div>
              </div>
            </div>
            <div className="mt-8 text-[10px] uppercase tracking-[0.15em] text-slate-500 font-mono">
              © 2024 AutoServe Precision Systems.
            </div>
          </div>
        </section>

        {/* Right Form */}
        <section className="col-span-1 lg:col-span-7 flex flex-col p-6 sm:p-8 md:p-16 lg:p-20 justify-center bg-card">
          <div className="mb-8 lg:mb-10">
            <h2 className="text-2xl font-bold text-on-surface mb-2 tracking-tight">Welcome back</h2>
            <p className="text-muted-foreground text-sm mb-6 lg:mb-8">Select your access level to continue</p>
            <div className="grid grid-cols-3 gap-2 sm:gap-3 p-1.5 bg-surface-container rounded-xl border border-border/20">
              {roles.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  className={`flex flex-col items-center gap-2 py-3 sm:py-4 px-2 rounded-lg transition-all duration-200 ${
                    role === r.id
                      ? "bg-card shadow-sm border border-border text-primary"
                      : "text-muted-foreground hover:bg-surface-container-high"
                  }`}
                >
                  <r.icon className="w-5 h-5" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.12em]">{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          <form className="space-y-5 lg:space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground px-1">
                Professional Identifier
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="name@autoserve.systems"
                  className="w-full bg-surface-container-low border border-border/30 rounded-xl py-3.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-end px-1">
                <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">
                  Secure Passphrase
                </label>
                <button type="button" className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary hover:underline">
                  Reset Code
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  className="w-full bg-surface-container-low border border-border/30 rounded-xl py-3.5 pl-11 pr-11 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none placeholder:text-muted-foreground"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 py-2">
              <input type="checkbox" id="remember" className="w-4 h-4 rounded border-border/50 text-primary focus:ring-primary/20" />
              <label htmlFor="remember" className="text-xs text-muted-foreground font-medium select-none cursor-pointer">
                Stay authenticated for 30 days
              </label>
            </div>

            <div className="pt-2 lg:pt-4 space-y-3 lg:space-y-4">
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group transition-all duration-200 active:scale-[0.98]"
              >
                <span className="text-sm">AUTHENTICATE SESSION</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                type="button"
                className="w-full bg-surface-container-low border border-border/20 hover:bg-surface-container-high text-on-surface font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-200"
              >
                <span className="text-sm">CONTINUE WITH ENTERPRISE SSO</span>
              </button>
            </div>
          </form>

          <div className="mt-8 lg:mt-12 pt-6 lg:pt-8 border-t border-border/10 text-center">
            <p className="text-muted-foreground text-xs">
              Don't have an operator account?{" "}
              <button className="text-primary font-bold hover:underline ml-1">Request Access</button>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Login;
