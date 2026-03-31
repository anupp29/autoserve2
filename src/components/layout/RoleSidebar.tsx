import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Wrench, Package, Users, UserCog, BarChart3,
  Plus, LogOut, HelpCircle, ClipboardList, Car, Calendar, History,
  Search as SearchIcon, X,
} from "lucide-react";
import AutoServeLogo from "@/components/AutoServeLogo";
import type { UserRole } from "./RoleLayout";

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
}

const managerNav: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/manager/dashboard" },
  { label: "Bookings", icon: ClipboardList, path: "/manager/bookings" },
  { label: "Services", icon: Wrench, path: "/manager/services" },
  { label: "Inventory", icon: Package, path: "/manager/inventory" },
  { label: "Employees", icon: UserCog, path: "/manager/employees" },
  { label: "Customers", icon: Users, path: "/manager/customers" },
  { label: "Reports", icon: BarChart3, path: "/manager/reports" },
];

const employeeNav: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/employee/dashboard" },
  { label: "Service Queue", icon: Wrench, path: "/employee/queue" },
  { label: "Inventory", icon: Package, path: "/employee/inventory" },
  { label: "Performance", icon: BarChart3, path: "/employee/performance" },
];

const customerNav: NavItem[] = [
  { label: "Overview", icon: LayoutDashboard, path: "/customer/dashboard" },
  { label: "My Vehicles", icon: Car, path: "/customer/vehicles" },
  { label: "Book Service", icon: Calendar, path: "/customer/book" },
  { label: "My Bookings", icon: ClipboardList, path: "/customer/bookings" },
  { label: "Service History", icon: History, path: "/customer/history" },
  { label: "Diagnostics", icon: SearchIcon, path: "/customer/diagnostics" },
];

const navMap: Record<UserRole, NavItem[]> = {
  manager: managerNav,
  employee: employeeNav,
  customer: customerNav,
};

const subtitleMap: Record<UserRole, string> = {
  manager: "Manager Portal",
  employee: "Industrial Management",
  customer: "Precision",
};

interface RoleSidebarProps {
  role: UserRole;
  onClose: () => void;
}

const RoleSidebar = ({ role, onClose }: RoleSidebarProps) => {
  const location = useLocation();
  const navItems = navMap[role];

  return (
    <aside className="h-screen w-64 border-r border-border/50 bg-surface-container-low flex flex-col py-4">
      {/* Brand */}
      <div className="flex items-center justify-between px-6 py-4 mb-2">
        <AutoServeLogo subtitle={subtitleMap[role]} />
        <button onClick={onClose} className="lg:hidden p-1 text-muted-foreground hover:text-on-surface">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path + item.label}
              to={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                isActive
                  ? "bg-card text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-surface-container-high/50 hover:text-on-surface"
              }`}
            >
              <item.icon className="w-[18px] h-[18px] shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="px-4 mt-auto pt-4 border-t border-border/50 space-y-2">
        {role !== "customer" && (
          <Link
            to={role === "manager" ? "/manager/bookings" : "/employee/queue"}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-br from-slate-900 to-slate-700 text-white rounded-xl shadow-lg text-sm font-semibold hover:scale-[1.02] active:scale-95 transition-transform"
          >
            <Plus className="w-4 h-4" />
            <span>New Service Order</span>
          </Link>
        )}
        {role === "customer" && (
          <div className="px-3 py-3 rounded-lg bg-primary/5 border border-primary/10">
            <p className="text-[10px] font-bold text-primary uppercase tracking-[0.15em] mb-1">System Status</p>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-on-surface">Optimal Performance</span>
            </div>
          </div>
        )}
        <button className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:text-on-surface text-[12px] font-medium w-full">
          <HelpCircle className="w-4 h-4" />
          <span>Support</span>
        </button>
        <Link
          to="/login"
          className="flex items-center gap-3 px-3 py-2 text-destructive hover:opacity-80 text-[12px] font-medium"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </Link>
      </div>
    </aside>
  );
};

export default RoleSidebar;
