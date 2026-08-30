import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import Layout from "../components/Layout";
import RiskBadge from "../components/RiskBadge";
import ProgressBar from "../components/ProgressBar";
import { projects } from "../data/projects";

const PAGE_SIZE = 8;

const ministries = ["All", ...new Set(projects.map(p => p.ministry))];
const sectors = ["All", ...new Set(projects.map(p => p.sector))];
const states = ["All", ...new Set(projects.map(p => p.state))];
const riskLevels = ["All", "Critical", "High", "Medium", "Low"];
const statusOptions = ["All", "On Track", "Delayed", "Near Completion", "Cost Overrun", "Moderate Delay"];

const getRiskColor = (score) => {
  if (score >= 75) return "text-red-600 bg-red-50";
  if (score >= 50) return "text-amber-600 bg-amber-50";
  return "text-green-700 bg-green-50";
};

export default function Projects({ user }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [ministry, setMinistry] = useState("All");
  const [sector, setSector] = useState("All");
  const [state, setState] = useState("All");
  const [risk, setRisk] = useState("All");
  const [page, setPage] = useState(1);

  const filtered = projects.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (ministry !== "All" && p.ministry !== ministry) return false;
    if (sector !== "All" && p.sector !== sector) return false;
    if (state !== "All" && p.state !== state) return false;
    if (risk !== "All" && p.riskLevel !== risk) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  return (
    <Layout
      user={user}
      title="All Projects"
      subtitle="Monitor and analyze infrastructure projects across ministries and sectors."
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-[#78716C] bg-[#F5F5F4] border border-[#E7E5E4] px-3 py-1.5 rounded-full">
            {filtered.length} Projects
          </span>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#E7E5E4] shadow-sm mb-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-44">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8A29E]" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by project name..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-[#E7E5E4] rounded-xl outline-none focus:border-[#E8602A] transition-colors"
            />
          </div>
          {[
            { label: "Ministry", options: ministries, value: ministry, setter: setMinistry },
            { label: "Sector", options: sectors, value: sector, setter: setSector },
            { label: "State", options: states, value: state, setter: setState },
            { label: "Risk Level", options: riskLevels, value: risk, setter: setRisk },
          ].map(f => (
            <select
              key={f.label}
              value={f.value}
              onChange={handleFilterChange(f.setter)}
              className="text-sm border border-[#E7E5E4] rounded-xl px-3 py-2 outline-none focus:border-[#E8602A] text-[#44403C] bg-white transition-colors"
            >
              {f.options.map(o => <option key={o}>{o === "All" ? f.label : o}</option>)}
            </select>
          ))}
          <div className="flex items-center gap-1.5 text-xs text-[#78716C]">
            <Filter size={13} />
            <span>Filters</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E7E5E4] shadow-sm overflow-hidden mb-4">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-[#F5F5F4] bg-[#FAFAFA]">
                {["Project Name", "Ministry", "Sector", "State", "Progress", "Risk Score", "Risk Level", "Status", "Action"].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-[#78716C] px-4 py-3.5 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((p, i) => (
                <tr
                  key={p.id}
                  className={`border-b border-[#F5F5F4] hover:bg-[#FAFAFA] transition-colors ${i % 2 === 0 ? "" : "bg-[#FEFEFE]"}`}
                >
                  <td className="px-4 py-3.5">
                    <span className="text-sm font-medium text-[#1C1917]">{p.name}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs text-[#78716C]">{p.ministry}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs text-[#78716C]">{p.sector}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs text-[#78716C]">{p.state}</span>
                  </td>
                  <td className="px-4 py-3.5 w-32">
                    <div className="flex items-center gap-2">
                      <ProgressBar
                        value={p.progress}
                        color={p.progress >= 75 ? "success" : p.progress >= 45 ? "accent" : "danger"}
                        height="h-1.5"
                      />
                      <span className="text-xs font-medium text-[#44403C] whitespace-nowrap">{p.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${getRiskColor(p.riskScore)}`}>
                      {p.riskScore}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <RiskBadge level={p.riskLevel} size="sm" />
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full
                      ${p.status === "On Track" || p.status === "Near Completion"
                        ? "bg-green-50 text-green-700"
                        : p.status === "Delayed" ? "bg-red-50 text-red-600"
                        : "bg-amber-50 text-amber-600"}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <button
                      onClick={() => navigate(`/projects/${p.id}`)}
                      className="text-xs font-medium text-[#E8602A] hover:text-[#C45320] flex items-center gap-1 whitespace-nowrap"
                    >
                      View Details →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {paginated.length === 0 && (
          <div className="py-16 text-center text-[#A8A29E] text-sm">
            No projects match the current filters.
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#78716C] text-xs">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg hover:bg-[#F5F5F4] disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={16} className="text-[#78716C]" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`w-8 h-8 text-xs rounded-lg font-medium transition-colors
                  ${n === page ? "bg-[#1C1917] text-white" : "hover:bg-[#F5F5F4] text-[#78716C]"}`}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg hover:bg-[#F5F5F4] disabled:opacity-30 transition-colors"
            >
              <ChevronRight size={16} className="text-[#78716C]" />
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
