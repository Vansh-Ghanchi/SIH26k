import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, FolderOpen, Brain, Bell, BarChart3,
  Lightbulb, MessageSquare, FileText, LogOut, Shield, X
} from "lucide-react";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/projects", label: "Projects", icon: FolderOpen },
  { path: "/ai-prediction", label: "AI Prediction", icon: Brain },
  { path: "/alerts", label: "Alerts", icon: Bell },
  { path: "/analytics", label: "Analytics", icon: BarChart3 },
  { path: "/explainable-ai", label: "Explainable AI", icon: Lightbulb },
  { path: "/ai-assistant", label: "AI Assistant", icon: MessageSquare },
  { path: "/reports", label: "Reports", icon: FileText },
];

export default function Sidebar({ user, mobileOpen, onClose }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("infrawatch_user");
    navigate("/login");
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#F5F5F4] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#E8602A] flex items-center justify-center">
            <Shield size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#1C1917] leading-tight">InfraWatch</p>
            <p className="text-[10px] text-[#A8A29E] leading-tight">Risk Monitoring</p>
          </div>
        </div>
        {mobileOpen !== undefined && (
          <button onClick={onClose} className="md:hidden p-1 rounded-lg hover:bg-[#F5F5F4]">
            <X size={16} className="text-[#78716C]" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group
              ${isActive
                ? "bg-[#FEF0E7] text-[#E8602A]"
                : "text-[#78716C] hover:bg-[#F5F5F4] hover:text-[#1C1917]"}`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={17} className={`flex-shrink-0 ${isActive ? "text-[#E8602A]" : "text-[#A8A29E] group-hover:text-[#78716C]"}`} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User profile */}
      <div className="px-3 pb-4 border-t border-[#F5F5F4] pt-4">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#F5F5F4] mb-2">
          <div className="w-8 h-8 rounded-full bg-[#E8602A] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
            {user?.avatar || "U"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#1C1917] truncate">{user?.name || "User"}</p>
            <p className="text-[10px] text-[#A8A29E] truncate">{user?.role || ""}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-[#78716C] hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
        >
          <LogOut size={14} /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-white border-r border-[#E7E5E4] h-full flex-shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={onClose} />
          <aside className="absolute left-0 top-0 bottom-0 w-60 bg-white slide-in shadow-xl">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
