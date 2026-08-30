import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, FolderOpen, Brain, Bell, BarChart3,
  Lightbulb, MessageSquare, FileText, LogOut, Shield, X,
  ShieldCheck, CheckSquare, Activity
} from "lucide-react";

export default function Sidebar({ user, mobileOpen, onClose }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("infrawatch_user");
    window.dispatchEvent(new Event("infrawatch_logout"));
    navigate("/login");
  };

  // Strictly Role-Based Navigation Items
  const getNavItems = () => {
    // 1. Reviewer / Monitoring Officer (Audit & Verification Authority)
    if (user?.role === "Reviewer / Monitoring Officer") {
      return [
        { path: "/reviewer-dashboard", label: "Reviewer Centre", icon: CheckSquare },
        { path: "/projects", label: "Projects Repository", icon: FolderOpen },
        { path: "/explainable-ai", label: "Explainable AI (XAI)", icon: Lightbulb },
        { path: "/alerts", label: "Verification Alerts", icon: Bell },
        { path: "/reports", label: "Audit Logs & Export", icon: FileText },
      ];
    }

    // 2. Project Administrator (System & Ingestion Authority)
    if (user?.role === "Project Administrator") {
      return [
        { path: "/admin-dashboard", label: "Admin Console", icon: ShieldCheck },
        { path: "/projects", label: "Project Registry", icon: FolderOpen },
        { path: "/analytics", label: "Ingestion Analytics", icon: BarChart3 },
        { path: "/reports", label: "System Logs & Reports", icon: FileText },
      ];
    }

    // 3. Government Officer (Decision-Maker & Executive Authority)
    return [
      { path: "/dashboard", label: "Overview & Actions", icon: LayoutDashboard },
      { path: "/projects", label: "Projects Repository", icon: FolderOpen },
      { path: "/ai-prediction", label: "AI Prediction Engine", icon: Brain },
      { path: "/alerts", label: "Early Warnings", icon: Bell },
      { path: "/analytics", label: "Sector Analytics", icon: BarChart3 },
      { path: "/ai-assistant", label: "MoSPI AI Copilot", icon: MessageSquare },
      { path: "/reports", label: "Reports & Export", icon: FileText },
    ];
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-white border-r border-[#E7E5E4] h-full flex-shrink-0">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="px-5 py-5 border-b border-[#F5F5F4] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#E8602A] flex items-center justify-center shadow-xs">
                <Shield size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-black text-[#1C1917] tracking-tight">DRISHTI AI</p>
                <p className="text-[9px] font-bold text-[#E8602A] uppercase tracking-wider">MoSPI · Central IPMD</p>
              </div>
            </div>
          </div>

          {/* Role Indicator Banner inside Sidebar */}
          <div className="px-3 pt-3">
            <div className="px-3 py-1.5 rounded-xl bg-[#FAF7F4] border border-[#E7E5E4] flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider">Active Workspace</span>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-[#FEF0E7] text-[#E8602A]">
                {user?.role === "Reviewer / Monitoring Officer" ? "Reviewer" : user?.role === "Project Administrator" ? "Admin" : "Officer"}
              </span>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
            {navItems.map(({ path, label, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group
                  ${isActive
                    ? "bg-[#FEF0E7] text-[#E8602A] shadow-2xs font-bold"
                    : "text-[#78716C] hover:bg-[#F5F5F4] hover:text-[#1C1917]"}`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={16} className={`flex-shrink-0 ${isActive ? "text-[#E8602A]" : "text-[#A8A29E] group-hover:text-[#78716C]"}`} />
                    <span>{label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* User profile */}
          <div className="px-3 pb-4 border-t border-[#F5F5F4] pt-4">
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#F5F5F4] mb-2">
              <div className="w-8 h-8 rounded-full bg-[#E8602A] text-white text-xs font-black flex items-center justify-center flex-shrink-0 shadow-2xs">
                {user?.avatar || "U"}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#1C1917] truncate">{user?.name || "User"}</p>
                <p className="text-[10px] text-[#E8602A] font-semibold truncate">{user?.role || ""}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-[#78716C] hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
            >
              <LogOut size={13} /> Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={onClose} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white slide-in shadow-xl z-10 flex flex-col">
            <div className="px-5 py-5 border-b border-[#F5F5F4] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#E8602A] flex items-center justify-center">
                  <Shield size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1C1917]">PAIMANA AI</p>
                  <p className="text-[9px] text-[#E8602A] font-bold uppercase">MoSPI · IPMD</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1 rounded-lg hover:bg-[#F5F5F4]">
                <X size={16} className="text-[#78716C]" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
              {navItems.map(({ path, label, icon: Icon }) => (
                <NavLink
                  key={path}
                  to={path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all
                    ${isActive
                      ? "bg-[#FEF0E7] text-[#E8602A]"
                      : "text-[#78716C] hover:bg-[#F5F5F4] hover:text-[#1C1917]"}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon size={16} className={isActive ? "text-[#E8602A]" : "text-[#A8A29E]"} />
                      <span>{label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
