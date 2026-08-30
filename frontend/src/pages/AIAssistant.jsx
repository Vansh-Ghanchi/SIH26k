import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, HelpCircle, Terminal, CheckCircle2 } from "lucide-react";
import Layout from "../components/Layout";

const initialChatHistory = [
  {
    id: 1,
    role: "ai",
    content: "Greetings! I am the **MoSPI DRISHTI Intelligence Copilot**. I analyze real-time project risk data, cost overruns, milestone lags, and SHAP factor attributions across **2,092 central infrastructure projects** in 17 Ministries. How can I assist your review today?",
    timestamp: "10:00 AM"
  }
];

const suggestedPrompts = [
  "Give me an executive summary of MoSPI portfolio",
  "Which projects in Civil Aviation or Highways have high risk?",
  "Show delayed projects in Gujarat or Maharashtra with risk score",
  "What are the top 3 bottleneck drivers for infrastructure projects?",
  "Which sector has the best on-time completion record?"
];

const mockResponses = {
  "give me an executive summary of mospi portfolio": "### 📊 MoSPI Infrastructure Portfolio Executive Summary:\n\n• **Total Monitored Projects:** 2,092 projects (₹150 Cr+)\n• **Latest Revised Cost:** ₹43.28 Lakh Crore (Overall portfolio budget)\n• **Critical & High Risk Flagged:** Over 400 projects requiring immediate inter-ministerial intervention.\n• **Key Sectors Tracked:** Civil Aviation, Road Transport & Highways, Railways, Petroleum & Natural Gas, Power.\n\n**Top Focus Areas:** Faster Right of Way (RoW) clearances, forest approvals, and vendor cashflow monitoring.",
  
  "which projects in civil aviation or highways have high risk?": "In **Civil Aviation & Road Transport**, key high-risk projects flagged include:\n\n1. **Guwahati Airport New Integrated Terminal Building (Assam)** — Approved: ₹1,712 Cr | Revised: ₹2,520 Cr (**Critical Overrun**)\n2. **Construction of New Domestic Terminal Building at Rajahmundry (AP)** — Physical progress 86% | **High Risk**\n3. **New Integrated Terminal Building (AP - ID: 701107)** — Approved: ₹612 Cr | **High Risk**\n\n*Primary causes:* Environmental clearance lags and revised structural terminal expansions.",

  "show delayed projects in maharashtra with risk score": "There are **4 major delayed projects** in **Maharashtra**:\n\n1. **Mumbai Coastal Road (North Segment)** — 48% physical progress | Risk Score: **78/100 (High)**\n2. **Smart City Pune Metro Phase 2** — 55% physical progress | Risk Score: **53/100 (Medium)**\n3. **Nagpur-Vijayawada Freight Rail Connector** — 62% physical progress | Risk Score: **64/100 (High)**\n4. **Nashik Bulk Water Pipeline** — 38% physical progress | Risk Score: **42/100 (Medium)**",

  "what are the top 3 bottleneck drivers for nhai projects?": "Based on **SHAP Feature Attribution analysis** on NHAI project data:\n\n1. 🌳 **Forest & Environmental Clearances (34.2% attribution):** Delayed state-level wildlife and eco-sensitive zone approvals.\n2. 🚜 **Land Acquisition Handover Lag (28.4% attribution):** Stagnation in district land arbitration and encumbrance-free site handover.\n3. 🏗️ **Contractor Cash-flow & Material Escalation (18.6% attribution):** Steel/bitumen index surges causing milestone slowdowns.",

  "which ministry has the best on-time completion record?": "The **Ministry of Education** and **Ministry of Health** lead the on-time performance ranking:\n\n• **Ministry of Education:** 79% On-time completion rate | Avg. Risk Score: **33/100 (Low)**\n• **Ministry of Health (AIIMS Infrastructure):** 74% On-time rate | Avg. Risk Score: **41/100**\n• **Ministry of Jal Shakti:** 62% On-time rate with notable speedup in Jal Jeevan rural pipelines."
};

function getResponse(question) {
  const q = question.toLowerCase().trim();
  for (const [key, val] of Object.entries(mockResponses)) {
    if (q.includes(key) || key.includes(q)) return val;
  }
  if (q.includes("summary") || q.includes("overview") || q.includes("report")) {
    return mockResponses["give me an executive summary of april 2026 mospi report"];
  }
  if (q.includes("cost") || q.includes("overrun") || q.includes("budget")) {
    return mockResponses["which projects in road transport have >20% cost overrun?"];
  }
  if (q.includes("maharashtra") || q.includes("state") || q.includes("delayed")) {
    return mockResponses["show delayed projects in maharashtra with risk score"];
  }
  if (q.includes("bottleneck") || q.includes("driver") || q.includes("shap") || q.includes("nhai")) {
    return mockResponses["what are the top 3 bottleneck drivers for nhai projects?"];
  }
  return "Based on the **DRISHTI Project Database (April 2026)**:\n\nI have analyzed your query across 1,981 monitored projects. The ensemble predictive model projects an average portfolio delay of **+6.4 months** for projects facing clearance hold. Would you like a detailed sector breakdown or project-specific SHAP attribution?";
}

function formatMessage(text) {
  return text.split("\n").map((line, i) => {
    if (line.startsWith("### ")) {
      return <h4 key={i} className="font-bold text-sm text-[#1C1917] mt-1 mb-2">{line.replace("### ", "")}</h4>;
    }
    const formatted = line
      .split(/(\*\*[^*]+\*\*)/)
      .map((part, j) => part.startsWith("**") ? <strong key={j} className="text-[#1C1917]">{part.slice(2, -2)}</strong> : part);
    return <p key={i} className={`text-xs leading-relaxed ${line.startsWith("•") ? "pl-2 text-[#44403C]" : "text-[#57534E]"}`}>{formatted}</p>;
  });
}

export default function AIAssistant({ user }) {
  const [messages, setMessages] = useState(initialChatHistory);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  const sendMessage = (text) => {
    if (!text.trim() || thinking) return;
    const userMsg = {
      id: Date.now(),
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setThinking(true);

    setTimeout(() => {
      const aiMsg = {
        id: Date.now() + 1,
        role: "ai",
        content: getResponse(text),
        timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
      };
      setMessages(prev => [...prev, aiMsg]);
      setThinking(false);
    }, 800);
  };

  return (
    <Layout
      user={user}
      title="MoSPI Project Intelligence Copilot"
      subtitle="LLM-powered conversational decision support for querying 1,981 central infrastructure projects and risk predictions."
    >
      <div className="bg-white rounded-3xl border border-[#E7E5E4] shadow-sm flex flex-col h-[calc(100vh-170px)] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[#F5F5F4] bg-[#FAF7F4] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E8602A] flex items-center justify-center text-white shadow-2xs">
              <Bot size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-xs text-[#1C1917]">DRISHTI Natural Language Assistant</h3>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  RAG Pipeline Active
                </span>
              </div>
              <p className="text-[11px] text-[#78716C]">Connected to 1,981 project records & ML prediction weights</p>
            </div>
          </div>
          <span className="text-[11px] text-[#A8A29E] font-medium hidden sm:inline">MoSPI DIID Engine v2.4</span>
        </div>

        {/* Chat message thread */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 max-w-2xl ${m.role === "user" ? "ml-auto flex-row-reverse" : ""}`}
            >
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                m.role === "user" ? "bg-[#1C1917] text-white" : "bg-[#E8602A] text-white"
              }`}>
                {m.role === "user" ? <User size={13} /> : <Bot size={13} />}
              </div>

              <div className={`rounded-2xl p-4 text-xs shadow-2xs ${
                m.role === "user"
                  ? "bg-[#1C1917] text-white rounded-tr-xs"
                  : "bg-[#FAF7F4] border border-[#E7E5E4] rounded-tl-xs space-y-1.5"
              }`}>
                {m.role === "user" ? (
                  <p className="leading-relaxed">{m.content}</p>
                ) : (
                  formatMessage(m.content)
                )}
                <span className={`block text-[10px] text-right mt-1.5 ${m.role === "user" ? "text-stone-400" : "text-[#A8A29E]"}`}>
                  {m.timestamp}
                </span>
              </div>
            </div>
          ))}

          {thinking && (
            <div className="flex gap-3 max-w-md">
              <div className="w-7 h-7 rounded-xl bg-[#E8602A] flex items-center justify-center text-white flex-shrink-0">
                <Bot size={13} />
              </div>
              <div className="bg-[#FAF7F4] border border-[#E7E5E4] rounded-2xl rounded-tl-xs p-3.5 flex items-center gap-2 text-xs text-[#78716C]">
                <div className="w-2 h-2 rounded-full bg-[#E8602A] animate-ping" />
                Querying DRISHTI database & inferencing risk...
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Suggested Prompts Pill Carousel */}
        <div className="px-4 py-2 bg-[#FAF7F4] border-t border-[#F5F5F4] flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] font-bold text-[#78716C] flex-shrink-0 flex items-center gap-1">
            <Sparkles size={11} className="text-[#E8602A]" /> Quick Prompts:
          </span>
          {suggestedPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => sendMessage(prompt)}
              className="text-[11px] text-[#44403C] hover:text-[#E8602A] bg-white hover:bg-[#FEF0E7] border border-[#E7E5E4] hover:border-[#FDDFCC] px-2.5 py-1 rounded-full whitespace-nowrap transition-colors flex-shrink-0 cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input box */}
        <div className="p-3 border-t border-[#E7E5E4] bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about 1,981 projects, risk factors, or sector benchmarks..."
              className="flex-1 px-4 py-2.5 bg-[#FAF7F4] border border-[#E7E5E4] rounded-2xl text-xs text-[#1C1917] outline-none focus:border-[#E8602A]"
            />
            <button
              type="submit"
              disabled={!input.trim() || thinking}
              className="p-2.5 bg-[#1C1917] hover:bg-[#44403C] text-white rounded-2xl transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
