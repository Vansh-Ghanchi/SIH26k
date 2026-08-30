import { useState } from "react";
import { FileText, Download, Calendar, Loader2, CheckCircle, FileSpreadsheet, File } from "lucide-react";
import Layout from "../components/Layout";

const reportConfigs = [
  {
    id: 1,
    title: "Project Risk Report",
    format: "PDF",
    icon: FileText,
    color: "red",
    desc: "Generate detailed risk analysis for selected projects including AI risk scores, contributing factors, and recommendations.",
  },
  {
    id: 2,
    title: "Monthly Monitoring Report",
    format: "PDF",
    icon: File,
    color: "orange",
    desc: "Generate monthly infrastructure monitoring summary covering all ministries, sectors, and risk trends.",
  },
  {
    id: 3,
    title: "Full Data Export",
    format: "CSV / Excel",
    icon: FileSpreadsheet,
    color: "green",
    desc: "Export complete project monitoring dataset including all KPIs, financial data, and progress metrics.",
  },
];

function ReportCard({ report }) {
  const [state, setState] = useState("idle"); // idle | loading | done
  const [progress, setProgress] = useState(0);
  const [dateFrom, setDateFrom] = useState("2024-01-01");
  const [dateTo, setDateTo] = useState("2024-06-30");

  const colors = {
    red: { bg: "bg-red-50", icon: "text-red-500", iconBg: "bg-red-100", btn: "bg-red-500 hover:bg-red-600", badge: "text-red-600 bg-red-50 border-red-100" },
    orange: { bg: "bg-[#FEF0E7]", icon: "text-[#E8602A]", iconBg: "bg-[#FDDFCC]", btn: "bg-[#E8602A] hover:bg-[#C45320]", badge: "text-[#E8602A] bg-[#FEF0E7] border-[#FDDFCC]" },
    green: { bg: "bg-green-50", icon: "text-green-600", iconBg: "bg-green-100", btn: "bg-green-600 hover:bg-green-700", badge: "text-green-700 bg-green-50 border-green-100" },
  };
  const c = colors[report.color];
  const Icon = report.icon;

  const handleGenerate = () => {
    setState("loading");
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setState("done");
          return 100;
        }
        return prev + Math.random() * 18;
      });
    }, 200);
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E7E5E4] shadow-sm flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-2xl ${c.iconBg} flex items-center justify-center`}>
          <Icon size={20} className={c.icon} />
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${c.badge}`}>
          {report.format}
        </span>
      </div>

      <h3 className="font-semibold text-[#1C1917] mb-2">{report.title}</h3>
      <p className="text-sm text-[#78716C] leading-relaxed mb-5 flex-1">{report.desc}</p>

      {/* Date range */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1">
          <label className="text-xs text-[#78716C] mb-1 block">From</label>
          <div className="relative">
            <Calendar size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#A8A29E]" />
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="w-full pl-8 pr-2 py-2 text-xs border border-[#E7E5E4] rounded-xl outline-none focus:border-[#E8602A] text-[#44403C]"
            />
          </div>
        </div>
        <div className="flex-1">
          <label className="text-xs text-[#78716C] mb-1 block">To</label>
          <div className="relative">
            <Calendar size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#A8A29E]" />
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="w-full pl-8 pr-2 py-2 text-xs border border-[#E7E5E4] rounded-xl outline-none focus:border-[#E8602A] text-[#44403C]"
            />
          </div>
        </div>
      </div>

      {/* Progress */}
      {state === "loading" && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-[#78716C] mb-1.5">
            <span>Generating report...</span>
            <span>{Math.round(Math.min(progress, 100))}%</span>
          </div>
          <div className="h-2 bg-[#F5F5F4] rounded-full overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${report.color === "green" ? "bg-green-500" : "bg-[#E8602A]"}`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      )}

      {state === "done" && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-100 rounded-xl mb-4">
          <CheckCircle size={14} className="text-green-600 flex-shrink-0" />
          <span className="text-sm font-medium text-green-700">Report Ready!</span>
        </div>
      )}

      {/* Action button */}
      {state !== "done" ? (
        <button
          onClick={handleGenerate}
          disabled={state === "loading"}
          className={`flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold text-white rounded-xl transition-colors ${c.btn} disabled:opacity-60 disabled:cursor-not-allowed`}
        >
          {state === "loading" ? (
            <><Loader2 size={14} className="animate-spin" /> Generating...</>
          ) : (
            report.format.includes("CSV") ? "Export Data" : "Generate Report"
          )}
        </button>
      ) : (
        <button
          onClick={() => { setState("idle"); setProgress(0); }}
          className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-xl transition-colors"
        >
          <Download size={14} /> Download {report.format.split(" ")[0]}
        </button>
      )}
    </div>
  );
}

export default function Reports({ user }) {
  return (
    <Layout user={user} title="Reports & Export Center" subtitle="Generate project monitoring reports and export analytical data.">
      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Reports Generated", value: "142", sub: "This month" },
          { label: "Data Exports", value: "38", sub: "This month" },
          { label: "Scheduled Reports", value: "12", sub: "Auto-delivery" },
          { label: "Avg. Generation Time", value: "4.2s", sub: "All formats" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-[#E7E5E4] shadow-sm">
            <p className="text-xs text-[#A8A29E] mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-[#1C1917]">{s.value}</p>
            <p className="text-xs text-[#78716C] mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      <h3 className="font-semibold text-[#1C1917] mb-4">Available Reports</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {reportConfigs.map(r => <ReportCard key={r.id} report={r} />)}
      </div>

      {/* Recent reports */}
      <div className="mt-6">
        <h3 className="font-semibold text-[#1C1917] mb-4">Recent Reports</h3>
        <div className="bg-white rounded-2xl border border-[#E7E5E4] shadow-sm overflow-hidden">
          {[
            { name: "Project Risk Report — All Projects", date: "30 Aug 2026", format: "PDF", size: "2.4 MB" },
            { name: "Monthly Monitoring Report — Aug 2026", date: "28 Aug 2026", format: "PDF", size: "1.8 MB" },
            { name: "Transport Sector Data Export", date: "25 Aug 2026", format: "Excel", size: "4.1 MB" },
            { name: "High Risk Projects Summary", date: "20 Aug 2026", format: "PDF", size: "980 KB" },
          ].map((r, i) => (
            <div key={i} className={`flex items-center justify-between px-5 py-3.5 ${i < 3 ? "border-b border-[#F5F5F4]" : ""}`}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#F5F5F4] rounded-xl flex items-center justify-center">
                  <FileText size={14} className="text-[#78716C]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1C1917]">{r.name}</p>
                  <p className="text-xs text-[#A8A29E]">{r.date} · {r.size}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#78716C] bg-[#F5F5F4] px-2.5 py-1 rounded-full">{r.format}</span>
                <button className="text-xs text-[#E8602A] hover:text-[#C45320] font-medium flex items-center gap-1">
                  <Download size={12} /> Download
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
