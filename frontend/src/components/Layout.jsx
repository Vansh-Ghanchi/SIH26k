import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import GovtHeaderBanner from "./GovtHeaderBanner";

export default function Layout({
  user,
  children,
  title,
  subtitle,
  showDateRange,
  onExport,
  showGovtBanner
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Show official government header banner for Admin role first (or if explicitly enabled)
  const isGovtBannerActive = showGovtBanner !== undefined 
    ? showGovtBanner 
    : user?.role === "Project Administrator";

  return (
    <div className="flex h-full bg-[#FAF7F4]">
      <Sidebar user={user} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Official Top Government Banner (Left: MoSPI Emblem, Right: PAIMANA Logo) */}
        {isGovtBannerActive && <GovtHeaderBanner />}

        {/* Standard Inner Header */}
        <Header
          user={user}
          title={title}
          subtitle={subtitle}
          onMenuClick={() => setMobileOpen(true)}
          showDateRange={showDateRange}
          onExport={onExport}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
