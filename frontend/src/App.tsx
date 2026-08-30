import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ReviewerDashboard from "./pages/ReviewerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Projects from "./pages/Projects";
import ProjectDetails from "./pages/ProjectDetails";
import AIPrediction from "./pages/AIPrediction";
import Alerts from "./pages/Alerts";
import Analytics from "./pages/Analytics";
import ExplainableAI from "./pages/ExplainableAI";
import AIAssistant from "./pages/AIAssistant";
import Reports from "./pages/Reports";

interface ProtectedRouteProps {
  user: any;
  children: React.ReactNode;
}

function ProtectedRoute({ user, children }: ProtectedRouteProps) {
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [ready, setReady] = useState<boolean>(false);

  useEffect(() => {
    const stored = localStorage.getItem("infrawatch_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        // fallback
      }
    }
    setReady(true);

    const handleLogout = () => {
      setUser(null);
    };

    window.addEventListener("infrawatch_logout", handleLogout);
    return () => window.removeEventListener("infrawatch_logout", handleLogout);
  }, []);

  if (!ready) {
    return (
      <div className="h-full flex items-center justify-center bg-[#FAF7F4]">
        <div className="w-8 h-8 border-2 border-[#E8602A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const protect = (children: React.ReactNode) => (
    <ProtectedRoute user={user}>{children}</ProtectedRoute>
  );

  // 3-Tier Role-Based Home Redirection
  const getHomeRoute = (): string => {
    if (!user) return "/login";
    if (user.role === "Reviewer / Monitoring Officer") return "/reviewer-dashboard";
    if (user.role === "Project Administrator") return "/admin-dashboard";
    return "/dashboard";
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to={getHomeRoute()} replace /> : <Login onLogin={setUser} />}
        />

        {/* 3 Dedicated Role Dashboards */}
        <Route path="/dashboard" element={protect(<Dashboard user={user} />)} />
        <Route path="/reviewer-dashboard" element={protect(<ReviewerDashboard user={user} />)} />
        <Route path="/admin-dashboard" element={protect(<AdminDashboard user={user} />)} />

        {/* Core System Pages */}
        <Route path="/projects" element={protect(<Projects user={user} />)} />
        <Route path="/projects/:id" element={protect(<ProjectDetails user={user} />)} />
        <Route path="/ai-prediction" element={protect(<AIPrediction user={user} />)} />
        <Route path="/alerts" element={protect(<Alerts user={user} />)} />
        <Route path="/analytics" element={protect(<Analytics user={user} />)} />
        <Route path="/explainable-ai" element={protect(<ExplainableAI user={user} />)} />
        <Route path="/ai-assistant" element={protect(<AIAssistant user={user} />)} />
        <Route path="/reports" element={protect(<Reports user={user} />)} />

        {/* Wildcard Fallback */}
        <Route path="*" element={<Navigate to={getHomeRoute()} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
