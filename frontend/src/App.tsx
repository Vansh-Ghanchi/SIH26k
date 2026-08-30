import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectDetails from "./pages/ProjectDetails";
import AIPrediction from "./pages/AIPrediction";
import Alerts from "./pages/Alerts";
import Analytics from "./pages/Analytics";
import ExplainableAI from "./pages/ExplainableAI";
import AIAssistant from "./pages/AIAssistant";
import Reports from "./pages/Reports";

function ProtectedRoute({ user, children }) {
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("infrawatch_user");
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
    setReady(true);
  }, []);

  if (!ready) return (
    <div className="h-full flex items-center justify-center bg-[#FAF7F4]">
      <div className="w-8 h-8 border-2 border-[#E8602A] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const protect = (children) => (
    <ProtectedRoute user={user}>{children}</ProtectedRoute>
  );

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login onLogin={setUser} />} />
        <Route path="/dashboard" element={protect(<Dashboard user={user} />)} />
        <Route path="/projects" element={protect(<Projects user={user} />)} />
        <Route path="/projects/:id" element={protect(<ProjectDetails user={user} />)} />
        <Route path="/ai-prediction" element={protect(<AIPrediction user={user} />)} />
        <Route path="/alerts" element={protect(<Alerts user={user} />)} />
        <Route path="/analytics" element={protect(<Analytics user={user} />)} />
        <Route path="/explainable-ai" element={protect(<ExplainableAI user={user} />)} />
        <Route path="/ai-assistant" element={protect(<AIAssistant user={user} />)} />
        <Route path="/reports" element={protect(<Reports user={user} />)} />
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
