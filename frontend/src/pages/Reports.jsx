import { useState } from "react";
import { FileText, Download, Calendar, Loader2, CheckCircle, FileSpreadsheet, File, ShieldCheck, CheckSquare, BarChart3 } from "lucide-react";
import Layout from "../components/Layout";

export default function Reports({ user }) {
  const getRoleReports = () => {
    if (user?.role === "Reviewer / Monitoring Officer") {
      return [
        {
          id: 1,
          title: "Nodal Verification & Audit Summary",
          format: "PDF (Official)",
          icon: CheckSquare,
          color: "orange",
          desc: "Complete audit record of approved and rejected CUF monthly submissions for April 2026 cycle.",
        },
        {
          id: 2,
          title: "CUF Discrepancy & Rejection Log",
          format: "Excel / CSV",
          icon: FileSpreadsheet,
          color: "red",
          desc: "Tabular log of algorithmic progress-vs-expenditure discrepancy flags and reviewer correction remarks.",
        },
        {
          id: 3,
          title: "New Project Registration Audit",
          format: "PDF",
          icon: FileText,
          color: "green",
          desc: "Registry of all new project proposals approved and onboarded into the national 2,092 portfolio.",
        },
      ];
    }

    if (user?.role === "Project Administrator") {
      return [
        {
          id: 1,
          title: "17-Ministry Ingestion Sync Report",
          format: "PDF / CSV",
          icon: BarChart3,
          color: "orange",
          desc: "Monthly CUF data lake ingestion pipeline health, submission latency, and validation error breakdown.",
        },
        {
          id: 2,
          title: "System & Security Audit Trail",
          format: "Encrypted PDF",
          icon: ShieldCheck,
          color: "green",
          desc: "Immutable system activity log, authentication events, role changes, and ISO 27001 compliance logs.",
        },
        {
          id: 3,
          title: "Master User Directory & Permissions",
          format: "CSV",
          icon: FileSpreadsheet,
          color: "red",
          desc: "Export active government officers, reviewers, and agency credentials across all 17 Central Ministries.",
        },
      ];
    }

    // Default: Government Officer
    return [
      {
        id: 1,
        title: "MoSPI Monthly Flash Report (MPR)",
        format: "PDF (Govt Standard)",
        icon: FileText,
        color: "orange",
        desc: "Official monthly infrastructure monitoring report for ₹150 Cr+ Central Sector Projects covering 2,092 projects.",
      },
      {
        id: 2,
        title: "High-Risk Projects Escalation Matrix",
        format: "PDF",
        icon: File,
        color: "red",
        desc: "Ranked list of 245 high-risk projects with projected cost overruns and recommended inter-ministerial interventions.",
      },
      {
        id: 3,
        title: "National Infrastructure Dataset Export",
        format: "CSV / Excel",
        icon: FileSpreadsheet,
        color: "green",
        desc: "Raw export of all 1,981 project parameters including original/revised costs, cumulative expenditures, and timelines.",
      },
    ];
  };

  const reports = getRoleReports();

  return (
    <Layout
      user={user}
      title={
        user?.role === "Reviewer / Monitoring Officer"
          ? "Reviewer Audit Logs & Report Centre"
          : user?.role === "Project Administrator"
          ? "System Compliance & Ingestion Reports"
          : "Reports & Publications Centre"
      }
      subtitle={
        user?.role === "Reviewer / Monitoring Officer"
          ? "Export verification logs, discrepancy records, and monthly clearance certificates."
          : user?.role === "Project Administrator"
          ? "Export ministry batch ingestion logs, server cluster metrics, and security audit reports."
          : "Generate official MoSPI Monthly Flash Reports, portfolio cost overrun audits, and raw dataset exports."
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>

        {/* Recent Generated Archive */}
        <div className="bg-white rounded-2xl border border-[#E7E5E4] p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-[#1C1917] text-sm">Recently Generated Publications</h3>
              <p className="text-xs text-[#78716C] mt-0.5">Archived official reports available for instant download.</p>
            </div>
            <span className="text-xs bg-[#FEF0E7] text-[#E8602A] font-bold px-2.5 py-1 rounded-lg">
              April 2026 Cycle
            </span>
          </div>

          <div className="divide-y divide-[#F5F5F4] text-xs">
            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#FEF0E7] text-[#E8602A] flex items-center justify-center font-bold">
                  PDF
                </div>
                <div>
                  <p className="font-bold text-[#1C1917]">MoSPI_Flash_Report_April_2026_Final.pdf</p>
                  <p className="text-[#A8A29E] text-[11px]">1,981 Projects Covered · 4.8 MB · Published Today</p>
                </div>
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF7F4] hover:bg-[#F5F5F4] border border-[#E7E5E4] font-semibold text-[#1C1917] cursor-pointer">
                <Download size={13} /> Download
              </button>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-green-50 text-green-700 flex items-center justify-center font-bold">
                  XLS
                </div>
                <div>
                  <p className="font-bold text-[#1C1917]">PAIMANA_Central_Projects_Master_Dataset_Q1.xlsx</p>
                  <p className="text-[#A8A29E] text-[11px]">17 Ministries Complete Records · 12.4 MB · Updated 2 days ago</p>
                </div>
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF7F4] hover:bg-[#F5F5F4] border border-[#E7E5E4] font-semibold text-[#1C1917] cursor-pointer">
                <Download size={13} /> Download
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function ReportCard({ report }) {
  const [state, setState] = useState("idle");
  const [progress, setProgress] = useState(0);

  const colors = {
    red: { bg: "bg-red-50", icon: "text-red-600", iconBg: "bg-red-100", btn: "bg-red-600 hover:bg-red-700", badge: "text-red-700 bg-red-50 border-red-200" },
    orange: { bg: "bg-[#FEF0E7]", icon: "text-[#E8602A]", iconBg: "bg-[#FDDFCC]", btn: "bg-[#E8602A] hover:bg-[#C45320]", badge: "text-[#E8602A] bg-[#FEF0E7] border-[#FDDFCC]" },
    green: { bg: "bg-green-50", icon: "text-green-700", iconBg: "bg-green-100", btn: "bg-green-700 hover:bg-green-800", badge: "text-green-800 bg-green-50 border-green-200" },
  };
  const c = colors[report.color];
  const Icon = report.icon;

  const handleGenerate = () => {
    setState("loading");
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setState("done");
          return 100;
        }
        return prev + Math.random() * 25;
      });
    }, 200);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E7E5E4] p-5 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className={`w-10 h-10 rounded-xl ${c.iconBg} ${c.icon} flex items-center justify-center shrink-0 shadow-2xs`}>
            <Icon size={20} />
          </div>
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${c.badge}`}>
            {report.format}
          </span>
        </div>

        <h3 className="font-bold text-[#1C1917] text-sm mb-1.5">{report.title}</h3>
        <p className="text-xs text-[#78716C] leading-relaxed mb-4">{report.desc}</p>
      </div>

      <div>
        {state === "loading" && (
          <div className="space-y-2 mb-3">
            <div className="flex items-center justify-between text-xs text-[#78716C]">
              <span className="flex items-center gap-1.5 font-medium">
                <Loader2 size={13} className="animate-spin text-[#E8602A]" /> Compiling database...
              </span>
              <span className="font-mono font-bold text-[#1C1917]">{Math.min(100, Math.round(progress))}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#FAF7F4] rounded-full overflow-hidden border border-[#E7E5E4]">
              <div
                className="h-full bg-[#E8602A] rounded-full transition-all duration-200"
                style={{ width: `${Math.min(100, progress)}%` }}
              />
            </div>
          </div>
        )}

        {state === "done" && (
          <div className="mb-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between font-semibold">
            <span className="flex items-center gap-1.5">
              <CheckCircle size={14} className="text-emerald-600" /> Compiled Ready!
            </span>
            <span className="text-[11px] font-mono text-emerald-700">3.4 MB</span>
          </div>
        )}

        <button
          onClick={state === "done" ? () => setState("idle") : handleGenerate}
          disabled={state === "loading"}
          className={`w-full py-2.5 rounded-xl font-bold text-xs text-white transition-all duration-150 flex items-center justify-center gap-2 shadow-2xs cursor-pointer ${
            state === "done" ? "bg-[#1C1917] hover:bg-[#44403C]" : c.btn
          } disabled:opacity-60`}
        >
          {state === "loading" ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Generating...
            </>
          ) : state === "done" ? (
            <>
              <Download size={14} /> Download Compiled File
            </>
          ) : (
            <>
              <Download size={14} /> Generate & Export
            </>
          )}
        </button>
      </div>
    </div>
  );
}
