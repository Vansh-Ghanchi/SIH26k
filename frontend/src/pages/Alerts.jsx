import { useState } from "react";
import { Radio } from "lucide-react";
import Layout from "../components/Layout";
import AlertCard from "../components/AlertCard";
import { alerts as initialAlerts } from "../data/alerts";

const TABS = ["All", "Critical", "High", "Medium", "Low"];

export default function Alerts({ user }) {
  const [activeTab, setActiveTab] = useState("All");
  const [alerts, setAlerts] = useState(initialAlerts);

  const filtered = activeTab === "All" ? alerts : alerts.filter(a => a.priority === activeTab);

  const handleMarkReviewed = (id) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, reviewed: true } : a));
  };

  const counts = {
    All: alerts.length,
    Critical: alerts.filter(a => a.priority === "Critical").length,
    High: alerts.filter(a => a.priority === "High").length,
    Medium: alerts.filter(a => a.priority === "Medium").length,
    Low: alerts.filter(a => a.priority === "Low").length,
  };

  return (
    <Layout user={user} title="Early Warning System" subtitle="Automated risk escalation and alert monitoring for infrastructure projects.">
      {/* Live indicator */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 px-3.5 py-2 rounded-full">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Live Monitoring
        </div>
        <div className="flex items-center gap-2 text-xs text-[#78716C]">
          <Radio size={13} />
          Refreshed 2 minutes ago
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1">
        {TABS.map(tab => {
          const count = counts[tab];
          const isActive = activeTab === tab;
          const tabColors = {
            Critical: "bg-red-100 text-red-600",
            High: "bg-red-50 text-red-500",
            Medium: "bg-amber-50 text-amber-600",
            Low: "bg-green-50 text-green-600",
            All: "bg-[#F5F5F4] text-[#78716C]",
          };
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all
                ${isActive ? "bg-[#1C1917] text-white shadow-sm" : "bg-white border border-[#E7E5E4] text-[#78716C] hover:bg-[#F5F5F4]"}`}
            >
              {tab}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${isActive ? "bg-white/20 text-white" : tabColors[tab]}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Alert cards */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-[#A8A29E] text-sm bg-white rounded-2xl border border-[#E7E5E4]">
            No alerts in this category.
          </div>
        )}
        {filtered.map(alert => (
          <AlertCard key={alert.id} alert={alert} onMarkReviewed={handleMarkReviewed} />
        ))}
      </div>
    </Layout>
  );
}
