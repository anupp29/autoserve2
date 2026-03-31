import { Outlet } from "react-router-dom";
import RoleSidebar from "./RoleSidebar";
import TopBar from "./TopBar";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export type UserRole = "manager" | "employee" | "customer";

interface RoleLayoutProps {
  role: UserRole;
}

const roleInfo: Record<UserRole, { name: string; title: string }> = {
  manager: { name: "Marcus V.", title: "Manager" },
  employee: { name: "Marcus Wright", title: "Senior Technician" },
  customer: { name: "Alex", title: "Customer" },
};

const RoleLayout = ({ role }: RoleLayoutProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const info = roleInfo[role];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <RoleSidebar role={role} onClose={() => setMobileOpen(false)} />
      </div>

      {/* Main content */}
      <div className="lg:ml-64 min-h-screen flex flex-col">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 lg:px-8 bg-card border-b border-border/50 shadow-sm">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 text-muted-foreground hover:bg-surface-container rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>
          <TopBar userName={info.name} userRole={info.title} />
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default RoleLayout;
