import { useState } from "react";
import { Radio, CheckCircle2, CheckCheck } from "lucide-react";
import Layout from "../components/Layout";
import AlertCard from "../components/AlertCard";
import { alerts as initialAlerts } from "../data/alerts";

const TABS = ["All", "Critical", "High", "Medium", "Low"];

export default function Alerts({ user }) {
  const [activeTab, setActiveTab] = useState("All");
  const [alerts, setAlerts] = useState(initialAlerts);
  const [toastMsg, setToastMsg] = useState("");

  const filtered = activeTab === "All" ? alerts : alerts.filter(a => a.priority === activeTab);

  const handleMarkReviewed = (id) => {
    const alertItem = alerts.find(a => a.id === id);
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, reviewed: true } : a));
    if (alertItem) {
      setToastMsg(`Alert #${id} for "${alertItem.projectName.slice(0, 40)}..." marked as Reviewed & Verified.`);
      setTimeout(() => setToastMsg(""), 4000);
    }
  };

  const handleMarkAllReviewed = () => {
    const visibleIds = new Set(filtered.map(a => a.id));
    setAlerts(prev => prev.map(a => visibleIds.has(a.id) ? { ...a, reviewed: true } : a));
    setToastMsg(`All ${filtered.length} ${activeTab === "All" ? "" : activeTab} alerts marked as Reviewed!`);
    setTimeout(() => setToastMsg(""), 4000);
  };

  const counts = {
    All: alerts.length,
    Critical: alerts.filter(a => a.priority === "Critical").length,
    High: alerts.filter(a => a.priority === "High").length,
    Medium: alerts.filter(a => a.priority === "Medium").length,
    Low: alerts.filter(a => a.priority === "Low").length,
  };

  return (
    <Layout
      user={user}
      title={user?.role === "Reviewer / Monitoring Officer" ? "Verification Alerts & Early Warnings" : "Early Warning System"}
      subtitle="Automated algorithmic risk escalation, discrepancy alerts, and statutory early warnings for Central Infrastructure Projects."
    >
      {/* Toast Notification */}
      {toastMsg && (
        <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-xs animate-fade-in">
          <span className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            {toastMsg}
          </span>
          <button onClick={() => setToastMsg("")} className="text-stone-600 hover:text-stone-900 cursor-pointer font-bold px-1">✕</button>
        </div>
      )}

      {/* Live indicator & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Risk Telemetry Active
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#78716C]">
            <Radio size={13} className="text-[#E8602A] animate-pulse" />
            Synchronized with DRISHTI Data Lake
          </div>
        </div>

        {filtered.some(a => !a.reviewed) && (
          <button
            onClick={handleMarkAllReviewed}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#1C1917] bg-white hover:bg-[#FAF7F4] border border-[#E7E5E4] px-3.5 py-1.5 rounded-xl shadow-2xs transition-colors cursor-pointer w-fit"
          >
            <CheckCheck size={13} className="text-emerald-600" />
            Mark All {activeTab !== "All" ? activeTab : ""} as Reviewed
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1">
        {TABS.map(tab => {
          const count = counts[tab];
          const isActive = activeTab === tab;
          const tabColors = {
            Critical: "bg-red-100 text-red-700",
            High: "bg-orange-100 text-orange-700",
            Medium: "bg-amber-100 text-amber-700",
            Low: "bg-emerald-100 text-emerald-700",
            All: "bg-[#F5F5F4] text-[#78716C]",
          };
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer
                ${isActive ? "bg-[#1C1917] text-white shadow-xs" : "bg-white border border-[#E7E5E4] text-[#78716C] hover:bg-[#F5F5F4]"}`}
            >
              {tab}
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isActive ? "bg-white/20 text-white" : tabColors[tab]}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Alert cards */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-[#A8A29E] text-xs bg-white rounded-2xl border border-[#E7E5E4]">
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
