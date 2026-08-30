import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function StatCard({ title, value, subtitle, change, changeType = "neutral", accentColor = "orange", icon: Icon, children }) {
  const accentMap = {
    orange: { light: "bg-[#FEF0E7]", text: "text-[#E8602A]", border: "border-[#FDDFCC]" },
    red: { light: "bg-red-50", text: "text-red-600", border: "border-red-100" },
    green: { light: "bg-green-50", text: "text-green-600", border: "border-green-100" },
    blue: { light: "bg-blue-50", text: "text-blue-600", border: "border-blue-100" },
  };
  const acc = accentMap[accentColor] || accentMap.orange;

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E7E5E4] card-hover shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm text-[#78716C] font-medium">{title}</p>
          {subtitle && <p className="text-xs text-[#A8A29E] mt-0.5">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${acc.light}`}>
            <Icon size={18} className={acc.text} />
          </div>
        )}
      </div>
      <div className="flex items-end gap-3">
        <span className="text-3xl font-bold text-[#1C1917] tracking-tight">{value}</span>
        {change !== undefined && (
          <div className={`flex items-center gap-0.5 text-sm font-medium mb-0.5 ${changeType === "up" ? "text-[#E8602A]" : changeType === "down" ? "text-green-600" : "text-[#78716C]"}`}>
            {changeType === "up" ? <ArrowUpRight size={14} /> : changeType === "down" ? <ArrowDownRight size={14} /> : null}
            {change}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}
