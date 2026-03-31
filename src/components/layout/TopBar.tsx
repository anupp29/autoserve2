import { Search, Bell, Settings, HelpCircle } from "lucide-react";

interface TopBarProps {
  title?: string;
}

const TopBar = ({ title }: TopBarProps) => {
  return (
    <header className="sticky top-0 flex items-center justify-between px-8 h-16 w-full z-30 bg-card border-b border-border/50 shadow-sm">
      <div className="flex items-center gap-6">
        {title && (
          <>
            <h1 className="text-lg font-bold tracking-tight text-on-surface">{title}</h1>
            <div className="h-6 w-px bg-border" />
          </>
        )}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder="Search VIN, Customer, or Order..."
            className="pl-10 pr-4 py-2 bg-surface-container rounded-xl border-none text-sm w-64 focus:ring-2 focus:ring-primary/20 transition-all outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-surface-container transition-colors rounded-lg">
          <HelpCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Support</span>
        </button>
        <button className="p-2 text-muted-foreground hover:bg-surface-container rounded-full transition-colors">
          <Bell className="w-5 h-5" />
        </button>
        <button className="p-2 text-muted-foreground hover:bg-surface-container rounded-full transition-colors">
          <Settings className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 ml-2">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-on-surface">Marcus V.</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.1em]">Manager</p>
          </div>
          <div className="h-9 w-9 rounded-full bg-primary-container border border-border overflow-hidden flex items-center justify-center">
            <span className="text-sm font-bold text-primary">MV</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
