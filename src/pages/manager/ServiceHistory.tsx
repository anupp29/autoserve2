import { useState } from "react";
import { Filter, Download, CheckCircle, Search, Wrench, Clock } from "lucide-react";

const allRecords = [
  { id: "#AS-4920", client: "Rahul Sharma", vehicle: "2023 Maruti Swift", service: "Full System Diagnostic", tech: "Rajesh K.", date: "Oct 24, 2024", status: "Completed", cost: "₹4,500" },
  { id: "#AS-4919", client: "Priya Patel", vehicle: "2022 Hyundai Creta", service: "AC Gas Refill & Service", tech: "Ankit M.", date: "Oct 23, 2024", status: "Completed", cost: "₹2,800" },
  { id: "#AS-4918", client: "Vikram Singh", vehicle: "2021 Tata Nexon", service: "Brake Pad Replacement", tech: "Suresh R.", date: "Oct 22, 2024", status: "Completed", cost: "₹6,200" },
  { id: "#AS-4917", client: "Neha Gupta", vehicle: "2023 Honda City", service: "Tyre Rotation & Balancing", tech: "Rajesh K.", date: "Oct 21, 2024", status: "Completed", cost: "₹1,850" },
  { id: "#AS-4916", client: "Amit Verma", vehicle: "2020 Mahindra XUV700", service: "Major Interval Service", tech: "Ankit M.", date: "Oct 20, 2024", status: "Completed", cost: "₹12,450" },
  { id: "#AS-4915", client: "Sonal Joshi", vehicle: "2022 Kia Seltos", service: "Clutch Plate Replacement", tech: "Suresh R.", date: "Oct 19, 2024", status: "Completed", cost: "₹8,900" },
  { id: "#AS-4914", client: "Deepak Kumar", vehicle: "2021 Toyota Fortuner", service: "Engine Oil Change", tech: "Rajesh K.", date: "Oct 18, 2024", status: "Completed", cost: "₹3,200" },
  { id: "#AS-4913", client: "Kavita Reddy", vehicle: "2023 Maruti Baleno", service: "Suspension Check", tech: "Ankit M.", date: "Oct 17, 2024", status: "Warranty", cost: "₹0" },
];

const ManagerServiceHistory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const filtered = allRecords.filter(r => {
    const matchesSearch = !searchTerm || r.client.toLowerCase().includes(searchTerm.toLowerCase()) || r.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) || r.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "All" || r.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
        <span>Operations</span><span>/</span><span className="text-primary font-semibold">Service History</span>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">Service History</h1>
          <p className="text-sm text-muted-foreground mt-1">Complete service records with 100% accuracy for tracking and reference.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 border border-border/30 rounded-lg text-xs font-medium hover:bg-surface-container active:scale-[0.98] transition-all"><Filter className="w-3.5 h-3.5" /> Filter</button>
          <button className="flex items-center gap-1.5 px-3 py-2 border border-border/30 rounded-lg text-xs font-medium hover:bg-surface-container active:scale-[0.98] transition-all"><Download className="w-3.5 h-3.5" /> Export</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card p-5 rounded-xl border border-border/20 shadow-sm">
          <p className="text-muted-foreground text-[10px] uppercase tracking-[0.15em] font-bold">Total Records</p>
          <p className="text-2xl font-black text-on-surface mt-1">1,248</p>
        </div>
        <div className="bg-card p-5 rounded-xl border border-border/20 shadow-sm">
          <p className="text-muted-foreground text-[10px] uppercase tracking-[0.15em] font-bold">This Month</p>
          <p className="text-2xl font-black text-on-surface mt-1">86</p>
        </div>
        <div className="bg-card p-5 rounded-xl border border-border/20 shadow-sm">
          <p className="text-muted-foreground text-[10px] uppercase tracking-[0.15em] font-bold">Repeat Customers</p>
          <p className="text-2xl font-black text-on-surface mt-1">72%</p>
        </div>
        <div className="bg-card p-5 rounded-xl border border-border/20 shadow-sm">
          <p className="text-muted-foreground text-[10px] uppercase tracking-[0.15em] font-bold">Avg. Revenue/Service</p>
          <p className="text-2xl font-black text-on-surface mt-1 font-mono">₹5,480</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by Job ID, Customer, or Vehicle..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-card border border-border/20 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none placeholder:text-muted-foreground"
        />
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border/20 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border/20">
                <th className="text-left py-3 px-6 font-bold">Job ID</th>
                <th className="text-left py-3 px-4 font-bold">Customer</th>
                <th className="text-left py-3 px-4 font-bold">Vehicle</th>
                <th className="text-left py-3 px-4 font-bold">Service</th>
                <th className="text-left py-3 px-4 font-bold">Technician</th>
                <th className="text-left py-3 px-4 font-bold">Date</th>
                <th className="text-left py-3 px-4 font-bold">Status</th>
                <th className="text-right py-3 px-4 font-bold">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="py-4 px-6 text-sm font-mono font-bold text-on-surface">{r.id}</td>
                  <td className="py-4 px-4 text-sm font-semibold text-on-surface">{r.client}</td>
                  <td className="py-4 px-4 text-sm text-muted-foreground">{r.vehicle}</td>
                  <td className="py-4 px-4"><span className="text-xs font-medium bg-surface-container px-2 py-1 rounded">{r.service}</span></td>
                  <td className="py-4 px-4 text-sm text-on-surface">{r.tech}</td>
                  <td className="py-4 px-4 text-sm text-muted-foreground">{r.date}</td>
                  <td className="py-4 px-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit ${r.status === "Completed" ? "text-emerald-600 bg-emerald-50" : "text-primary bg-primary/10"}`}>
                      {r.status === "Completed" ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {r.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm font-bold text-on-surface text-right font-mono">{r.cost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between p-4 border-t border-border/20">
          <p className="text-xs text-muted-foreground">Showing {filtered.length} of {allRecords.length} records</p>
          <div className="flex gap-1">
            <button className="px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-surface-container rounded">Previous</button>
            <button className="px-3 py-1 text-xs font-bold bg-primary text-primary-foreground rounded">1</button>
            <button className="px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-surface-container rounded">2</button>
            <button className="px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-surface-container rounded">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerServiceHistory;
