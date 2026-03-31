import { useState, useRef, useEffect } from "react";
import { Search, Bell, Settings, X, Check, Wrench, Calendar, AlertTriangle } from "lucide-react";

interface TopBarProps {
  userName?: string;
  userRole?: string;
}

const notifications = [
  { id: 1, title: "Service Completed", desc: "Maruti Suzuki Swift — Oil change completed", time: "5 min ago", icon: Wrench, read: false },
  { id: 2, title: "Booking Confirmed", desc: "Your appointment for Oct 28 is confirmed", time: "1 hour ago", icon: Calendar, read: false },
  { id: 3, title: "Low Stock Alert", desc: "Brake pads (Ceramic) below threshold", time: "3 hours ago", icon: AlertTriangle, read: true },
];

const TopBar = ({ userName = "Marcus V.", userRole = "Manager" }: TopBarProps) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [readIds, setReadIds] = useState<number[]>([3]);
  const notifRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !readIds.includes(n.id)).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) setShowSettings(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="flex items-center justify-between w-full">
      <div className="relative hidden md:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <input
          type="text"
          placeholder="Search VIN, Customer, or Order..."
          className="pl-10 pr-4 py-2 bg-surface-container rounded-xl border-none text-sm w-64 focus:ring-2 focus:ring-primary/20 transition-all outline-none placeholder:text-muted-foreground"
        />
      </div>
      <div className="flex items-center gap-2 ml-auto">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowSettings(false); }}
            className="p-2 text-muted-foreground hover:bg-surface-container rounded-full transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-destructive text-white text-[9px] font-bold rounded-full flex items-center justify-center">{unreadCount}</span>
            )}
          </button>
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-card rounded-xl shadow-xl border border-border/30 z-50 overflow-hidden animate-fade-in">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/20">
                <h4 className="text-sm font-bold text-on-surface">Notifications</h4>
                <button onClick={() => setReadIds(notifications.map(n => n.id))} className="text-[10px] font-bold text-primary uppercase tracking-wider hover:underline">Mark all read</button>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.map(n => (
                  <button
                    key={n.id}
                    onClick={() => setReadIds(prev => [...prev, n.id])}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-surface-container-low transition-colors ${!readIds.includes(n.id) ? "bg-primary/5" : ""}`}
                  >
                    <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${!readIds.includes(n.id) ? "bg-primary/10" : "bg-surface-container"}`}>
                      <n.icon className={`w-3.5 h-3.5 ${!readIds.includes(n.id) ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-on-surface truncate">{n.title}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{n.desc}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{n.time}</p>
                    </div>
                    {!readIds.includes(n.id) && <div className="w-2 h-2 bg-primary rounded-full mt-1.5 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="relative" ref={settingsRef}>
          <button
            onClick={() => { setShowSettings(!showSettings); setShowNotifications(false); }}
            className="p-2 text-muted-foreground hover:bg-surface-container rounded-full transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
          {showSettings && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-card rounded-xl shadow-xl border border-border/30 z-50 overflow-hidden animate-fade-in">
              <div className="px-4 py-3 border-b border-border/20">
                <h4 className="text-sm font-bold text-on-surface">Quick Settings</h4>
              </div>
              <div className="p-2">
                {[
                  { label: "Dark Mode", desc: "Switch to dark theme", defaultOn: false },
                  { label: "Email Notifications", desc: "Receive booking updates", defaultOn: true },
                  { label: "SMS Alerts", desc: "Get urgent alerts via SMS", defaultOn: false },
                ].map((s, i) => (
                  <SettingToggle key={i} {...s} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 ml-2">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-on-surface">{userName}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.1em]">{userRole}</p>
          </div>
          <div className="h-9 w-9 rounded-full bg-primary/10 border border-border overflow-hidden flex items-center justify-center">
            <span className="text-sm font-bold text-primary">
              {userName.split(" ").map(n => n[0]).join("")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const SettingToggle = ({ label, desc, defaultOn }: { label: string; desc: string; defaultOn: boolean }) => {
  const [on, setOn] = useState(defaultOn);
  return (
    <button onClick={() => setOn(!on)} className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-surface-container-low transition-colors text-left">
      <div>
        <p className="text-xs font-semibold text-on-surface">{label}</p>
        <p className="text-[10px] text-muted-foreground">{desc}</p>
      </div>
      <div className={`w-9 h-5 rounded-full flex items-center transition-colors ${on ? "bg-primary" : "bg-surface-container-high"}`}>
        <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${on ? "translate-x-4.5 ml-[18px]" : "ml-0.5"}`} />
      </div>
    </button>
  );
};

export default TopBar;
