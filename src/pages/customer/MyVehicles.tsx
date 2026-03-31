import { Link } from "react-router-dom";
import { AlertTriangle, Clock, CheckCircle, Wrench, Car, Shield, Activity } from "lucide-react";

const CustomerVehicles = () => (
  <div className="space-y-8">
    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
      <span>Customer</span><span>›</span><span className="text-primary font-semibold">Garage</span>
    </div>
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-on-surface tracking-tight">My Vehicles</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your fleet and real-time health monitoring.</p>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
        {/* Maruti Swift */}
        <div className="bg-card rounded-xl border border-border/20 shadow-sm overflow-hidden">
          <div className="relative h-48 bg-surface-container overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=600&h=400&fit=crop"
              alt="Maruti Suzuki Swift"
              className="w-full h-full object-cover"
            />
            <span className="absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded bg-emerald-50 text-emerald-600 uppercase tracking-wider">Active</span>
          </div>
          <div className="p-5">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-on-surface">Maruti Suzuki Swift</h3>
              <span className="text-lg font-light text-muted-foreground">2023</span>
            </div>
            <p className="text-xs text-muted-foreground mb-4 font-mono">VIN: MA3FJEB1...</p>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5" /> DL-4C-AB-1234
              </span>
              <Link to="/customer/history" className="text-xs font-bold text-primary uppercase tracking-wider hover:underline">View Details</Link>
            </div>
          </div>
        </div>

        {/* Hyundai Creta */}
        <div className="bg-card rounded-xl border border-border/20 shadow-sm overflow-hidden">
          <div className="relative h-48 bg-surface-container overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=600&h=400&fit=crop"
              alt="Hyundai Creta"
              className="w-full h-full object-cover"
            />
            <span className="absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded bg-amber-50 text-amber-600 uppercase tracking-wider">Service Due</span>
          </div>
          <div className="p-5">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-on-surface">Hyundai Creta SX(O)</h3>
              <span className="text-lg font-light text-muted-foreground">2021</span>
            </div>
            <p className="text-xs text-muted-foreground mb-4 font-mono">VIN: MALC381C...</p>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5" /> HR-26-DK-5678
              </span>
              <Link to="/customer/history" className="text-xs font-bold text-primary uppercase tracking-wider hover:underline">View Details</Link>
            </div>
          </div>
        </div>
      </div>

      {/* AI Maintenance Tips */}
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-primary/20 rounded-lg"><Activity className="w-4 h-4 text-primary" /></div>
            <h4 className="font-bold text-sm">AI Maintenance Tips</h4>
          </div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-3">Updated 5m ago</p>
          <div className="space-y-3">
            <div className="border border-destructive/30 bg-destructive/5 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-destructive">Critical Action</span>
                <AlertTriangle className="w-4 h-4 text-destructive" />
              </div>
              <h5 className="text-sm font-bold text-white">Brake Wear Detected (Creta)</h5>
              <p className="text-xs text-slate-400 mt-1">Front-left pad sensor reports 2mm remaining. Schedule replacement immediately.</p>
              <Link to="/customer/book" className="mt-2 w-full py-1.5 bg-destructive text-white rounded text-xs font-bold block text-center">Schedule Now</Link>
            </div>
            <div className="border border-amber-500/30 bg-amber-500/5 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Attention</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <h5 className="text-sm font-bold text-white">Tyre Pressure Low (Swift)</h5>
              <p className="text-xs text-slate-400 mt-1">Rear tyres at 26 PSI. Recommended: 32 PSI for optimal grip.</p>
            </div>
            <div className="border border-emerald-500/30 bg-emerald-500/5 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">All Clear</span>
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              </div>
              <h5 className="text-sm font-bold text-white">Engine Health (Swift)</h5>
              <p className="text-xs text-slate-400 mt-1">Operating at 99% efficiency. No action needed for next 5,000 km.</p>
            </div>
          </div>
          <div className="mt-4 bg-primary/20 border border-primary/30 rounded-lg p-3 flex items-center gap-3">
            <Shield className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-bold">Smart Diagnostics</p>
              <p className="text-xs text-slate-400">Full telemetry syncing active.</p>
            </div>
          </div>
        </div>

        <div className="bg-card p-5 rounded-xl border border-border/20 shadow-sm">
          <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-3">Garage Overview</h4>
          <div className="space-y-3">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Total Fleet Value</span><span className="font-bold text-on-surface font-mono">₹28,50,000</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Annual Maintenance</span><span className="font-bold text-on-surface font-mono">₹45,000</span></div>
            <div className="flex justify-between text-sm items-center">
              <span className="text-muted-foreground">Health Index</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-surface-container-high rounded-full"><div className="h-full w-[92%] bg-primary rounded-full" /></div>
                <span className="text-xs font-bold text-primary">92%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default CustomerVehicles;
