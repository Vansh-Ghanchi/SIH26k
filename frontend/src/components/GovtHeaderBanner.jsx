import mospiLogo from "../assets/mospi-emblem-clean.png";
import paimanaLogo from "../assets/paimana-logo-clean.png";

export default function GovtHeaderBanner() {
  return (
    <div className="bg-white border-b border-[#E7E5E4] flex-shrink-0 shadow-2xs">
      {/* Top Navy Blue Accent Strip (Official Govt Portal Style) */}
      <div className="h-1 bg-[#0b1354] w-full" />

      {/* Logos Container */}
      <div className="px-4 sm:px-6 md:px-8 py-3 sm:py-3.5 flex items-center justify-between gap-4">
        {/* Left Side: Ministry of Statistics and Programme Implementation Logo */}
        <div className="flex items-center">
          <img
            src={mospiLogo}
            alt="Ministry of Statistics and Programme Implementation - Government of India"
            className="h-11 sm:h-13 md:h-15 lg:h-16 w-auto max-w-[220px] sm:max-w-[320px] md:max-w-[420px] object-contain select-none"
          />
        </div>

        {/* Right Side: PAIMANA Typography Logo */}
        <div className="flex items-center">
          <img
            src={paimanaLogo}
            alt="PAIMANA - Project Assessment, Infrastructure Monitoring and Analytics for Nation-building"
            className="h-8 sm:h-10 md:h-11 lg:h-12 w-auto max-w-[130px] sm:max-w-[180px] md:max-w-[220px] object-contain select-none"
          />
        </div>
      </div>
    </div>
  );
}
