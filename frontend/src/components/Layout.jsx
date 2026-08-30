import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout({ user, children, title, subtitle, showDateRange, onExport }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-full bg-[#FAF7F4]">
      <Sidebar user={user} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header
          user={user}
          title={title}
          subtitle={subtitle}
          onMenuClick={() => setMobileOpen(true)}
          showDateRange={showDateRange}
          onExport={onExport}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
