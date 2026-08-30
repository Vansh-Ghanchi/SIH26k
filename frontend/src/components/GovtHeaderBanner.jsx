import { Menu, Calendar, Download } from "lucide-react";
import mospiLogo from "../assets/mospi-emblem-clean.png";
import drishtiLogo from "../assets/drishti-logo.png";

export default function GovtHeaderBanner({
  title,
  subtitle,
  onMenuClick,
  showDateRange,
  onExport
}) {
  return (
    <header className="bg-white border-b border-[#E7E5E4] flex-shrink-0 shadow-2xs">
      {/* Official Top Navy Blue Govt Accent Strip */}
      <div className="h-1 bg-[#0b1354] w-full" />

      {/* Unified Single Master Header Bar */}
      <div className="px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-4">
        {/* Left Side: Mobile Menu Button + Ministry of Statistics Emblem */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-xl hover:bg-[#F5F5F4] transition-colors flex-shrink-0"
            aria-label="Open sidebar"
          >
            <Menu size={18} className="text-[#78716C]" />
          </button>
          <div className="flex items-center">
            <img
              src={mospiLogo}
              alt="Ministry of Statistics and Programme Implementation - Government of India"
              className="h-10 sm:h-12 md:h-13 w-auto max-w-[200px] sm:max-w-[280px] md:max-w-[340px] object-contain select-none"
            />
          </div>
        </div>

        {/* Center: Perfectly Aligned Page Title, Department Badge & Subtitle */}
        <div className="flex-1 min-w-0 text-center px-2">
          <div className="inline-flex items-center justify-center gap-2 flex-wrap">
            <h1 className="text-base sm:text-lg md:text-xl font-black text-[#1C1917] tracking-tight truncate max-w-lg">
              {title || "DRISHTI Portal"}
            </h1>
            <span className="hidden lg:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF0E7] text-[#E8602A] border border-[#FDDFCC] whitespace-nowrap">
              MoSPI · Central IPMD
            </span>
          </div>
          {subtitle && (
            <p className="text-[11px] sm:text-xs text-[#78716C] mt-0.5 truncate max-w-xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        {/* Right Side: DRISHTI Typography Logo with Infrastructure & Vision Symbols */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {showDateRange && (
            <button className="hidden xl:flex items-center gap-1.5 text-xs font-semibold text-[#44403C] bg-[#F5F5F4] hover:bg-[#E7E5E4] border border-[#E7E5E4] px-3 py-1.5 rounded-xl transition-colors">
              <Calendar size={13} />
              Apr 2026 Cycle
            </button>
          )}

          {onExport && (
            <button
              onClick={onExport}
              className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-white bg-[#1C1917] hover:bg-[#44403C] px-3.5 py-1.5 rounded-xl transition-colors shadow-2xs cursor-pointer"
            >
              <Download size={13} /> Export Report
            </button>
          )}

          <div className="flex items-center">
            <img
              src={drishtiLogo}
              alt="DRISHTI - Data-driven Risk Intelligence System for Infrastructure Tracking & Insights"
              className="h-10 sm:h-12 md:h-14 lg:h-15 w-auto max-w-[180px] sm:max-w-[240px] md:max-w-[300px] object-contain select-none transition-transform hover:scale-105"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
