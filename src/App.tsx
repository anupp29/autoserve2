import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import RoleLayout from "@/components/layout/RoleLayout";
import Login from "./pages/Login";
import LandingPage from "./pages/LandingPage";

// Manager pages
import ManagerDashboard from "./pages/manager/Dashboard";
import ManagerBookings from "./pages/manager/Bookings";
import ManagerServices from "./pages/manager/Services";
import ManagerInventory from "./pages/manager/Inventory";
import ManagerEmployees from "./pages/manager/Employees";
import ManagerCustomers from "./pages/manager/Customers";
import ManagerReports from "./pages/manager/Reports";

// Employee pages
import EmployeeDashboard from "./pages/employee/Dashboard";
import EmployeeJobDetail from "./pages/employee/JobDetail";
import EmployeeServiceQueue from "./pages/employee/ServiceQueue";
import EmployeeInventoryCheck from "./pages/employee/InventoryCheck";
import EmployeePerformance from "./pages/employee/Performance";

// Customer pages
import CustomerDashboard from "./pages/customer/Dashboard";
import CustomerVehicles from "./pages/customer/MyVehicles";
import CustomerBookService from "./pages/customer/BookService";
import CustomerBookings from "./pages/customer/MyBookings";
import CustomerServiceHistory from "./pages/customer/ServiceHistory";
import CustomerDiagnostics from "./pages/customer/AIDiagnostics";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />

          {/* Manager Routes */}
          <Route element={<RoleLayout role="manager" />}>
            <Route path="/manager/dashboard" element={<ManagerDashboard />} />
            <Route path="/manager/bookings" element={<ManagerBookings />} />
            <Route path="/manager/services" element={<ManagerServices />} />
            <Route path="/manager/inventory" element={<ManagerInventory />} />
            <Route path="/manager/employees" element={<ManagerEmployees />} />
            <Route path="/manager/customers" element={<ManagerCustomers />} />
            <Route path="/manager/reports" element={<ManagerReports />} />
          </Route>

          {/* Employee Routes */}
          <Route element={<RoleLayout role="employee" />}>
            <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
            <Route path="/employee/job/:id" element={<EmployeeJobDetail />} />
          </Route>

          {/* Customer Routes */}
          <Route element={<RoleLayout role="customer" />}>
            <Route path="/customer/dashboard" element={<CustomerDashboard />} />
            <Route path="/customer/vehicles" element={<CustomerVehicles />} />
            <Route path="/customer/book" element={<CustomerBookService />} />
            <Route path="/customer/bookings" element={<CustomerBookings />} />
            <Route path="/customer/history" element={<CustomerServiceHistory />} />
            <Route path="/customer/diagnostics" element={<CustomerDiagnostics />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
