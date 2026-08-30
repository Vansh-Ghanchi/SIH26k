import { Menu, Calendar, Download } from "lucide-react";

export default function Header({ user, title, subtitle, onMenuClick, showDateRange = false, onExport }) {
  return (
    <header className="bg-white border-b border-[#E7E5E4] px-5 md:px-6 py-3.5 flex-shrink-0">
      <div className="flex items-center justify-between gap-4">
        {/* Left: menu + title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-xl hover:bg-[#F5F5F4] transition-colors flex-shrink-0"
          >
            <Menu size={18} className="text-[#78716C]" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-black text-[#1C1917] truncate tracking-tight">{title}</h1>
              <span className="hidden xl:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF0E7] text-[#E8602A] border border-[#FDDFCC]">
                MoSPI · Central IPMD
              </span>
            </div>
            {subtitle && <p className="text-[11px] md:text-xs text-[#78716C] mt-0.5 truncate">{subtitle}</p>}
          </div>
        </div>

        {/* Right: contextual actions if present */}
        {(showDateRange || onExport) && (
          <div className="flex items-center gap-2.5 flex-shrink-0">
            {showDateRange && (
              <button className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-[#44403C] bg-[#F5F5F4] hover:bg-[#E7E5E4] border border-[#E7E5E4] px-3 py-1.5 rounded-xl transition-colors">
                <Calendar size={13} />
                Apr 2026 Cycle
              </button>
            )}

            {onExport && (
              <button
                onClick={onExport}
                className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-white bg-[#1C1917] hover:bg-[#44403C] px-3.5 py-1.5 rounded-xl transition-colors shadow-2xs cursor-pointer"
              >
                <Download size={13} /> Export Report
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
