import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles } from "lucide-react";
import Layout from "../components/Layout";
import { chatHistory, suggestedQuestions } from "../data/analytics";

const mockResponses = {
  "compare transport projects in gujarat": "In Gujarat, there are currently **3 major Transport projects** under monitoring:\n\n1. **NH-48 Highway Expansion** — Risk: 89/100 (Critical)\n2. **Delhi-Ahmedabad Expressway** — Risk: 45/100 (Medium)\n3. **GIFT City Metro** — Risk: 28/100 (Low)\n\nNH-48 is the highest-risk project and warrants immediate attention.",
  "show all delayed projects in maharashtra": "There are **4 delayed projects** in Maharashtra:\n\n1. Smart City Pune Phase 2 — 55% complete\n2. Mumbai Coastal Road — 48% complete\n3. Nagpur Metro Extension — 62% complete\n4. Nashik Water Supply — 38% complete\n\nSmart City Pune has the highest risk score at 53/100.",
  "what is the average risk score for energy sector": "The **Energy sector** currently has an average risk score of **44/100 (Medium)**.\n\n• Best performing: Rajasthan Solar Power Grid (42/100)\n• Worst performing: Kochi-Bangalore Transmission (58/100)\n• On-time rate: 68% — above the cross-sector average of 58%",
  "which ministry has the best on-time record": "Based on current data, the **Ministry of Education** has the best on-time record:\n\n• On-time rate: 79%\n• Average risk score: 33/100\n• Avg. completion time: 12% faster than industry average\n\nJal Shakti follows closely with a 62% on-time rate for rural water schemes.",
};

function getResponse(question) {
  const q = question.toLowerCase();
  for (const [key, val] of Object.entries(mockResponses)) {
    if (q.includes(key.split(" ")[0]) && q.includes(key.split(" ").slice(-1)[0])) return val;
  }
  if (q.includes("budget") || q.includes("cost") || q.includes("overrun")) {
    return "Based on current financial trends, **NH-48 Highway Expansion** (84%), **Kaleshwaram Lift Irrigation** (79%), and **AIIMS Darbhanga** (72%) have the highest probability of exceeding budget. All three are recommended for immediate financial review.";
  }
  if (q.includes("nh-48") || q.includes("highway")) {
    return "NH-48 is classified as **HIGH RISK** (89/100) due to:\n\n• Physical progress 32% behind schedule\n• 3 missed consecutive milestones\n• 2 cost revisions totaling ₹240 Cr\n• Contractor performance issues\n\nAI recommends immediate site inspection and ministry escalation.";
  }
  return "I can help you analyze infrastructure project risks, budget trends, delays, and sector benchmarks. Could you please rephrase your question with a specific project name, ministry, sector, or state?";
}

function formatMessage(text) {
  return text.split("\n").map((line, i) => {
    const formatted = line
      .split(/(\*\*[^*]+\*\*)/)
      .map((part, j) => part.startsWith("**") ? <strong key={j}>{part.slice(2, -2)}</strong> : part);
    return <p key={i} className={line.startsWith("•") ? "flex gap-1.5" : ""}>{formatted}</p>;
  });
}

export default function AIAssistant({ user }) {
  const [messages, setMessages] = useState(chatHistory);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  const sendMessage = (text) => {
    if (!text.trim() || thinking) return;
    const userMsg = { id: Date.now(), role: "user", content: text, timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setThinking(true);

    setTimeout(() => {
      const aiMsg = { id: Date.now() + 1, role: "ai", content: getResponse(text), timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) };
      setMessages(prev => [...prev, aiMsg]);
      setThinking(false);
    }, 1200);
  };

  return (
    <Layout user={user} title="AI Project Assistant" subtitle="Ask questions about project risks, delays, costs, and performance.">
      <div className="flex gap-4 h-[calc(100vh-160px)] min-h-[500px]">
        {/* Suggestions sidebar */}
        <div className="hidden md:flex flex-col w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-[#E7E5E4] shadow-sm p-4 flex-1">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={14} className="text-[#E8602A]" />
              <h3 className="text-sm font-semibold text-[#1C1917]">Suggested Questions</h3>
            </div>
            <div className="space-y-2">
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q)}
                  className="w-full text-left text-xs text-[#44403C] bg-[#F5F5F4] hover:bg-[#FEF0E7] hover:text-[#E8602A] px-3 py-2.5 rounded-xl transition-colors leading-relaxed"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl border border-[#E7E5E4] shadow-sm overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"} fade-in`}>
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold
                  ${msg.role === "user" ? "bg-[#1C1917] text-white" : "bg-[#E8602A] text-white"}`}>
                  {msg.role === "user" ? <User size={14} /> : <Bot size={14} />}
                </div>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3
                  ${msg.role === "user"
                    ? "bg-[#1C1917] text-white rounded-tr-sm"
                    : "bg-[#F5F5F4] text-[#1C1917] rounded-tl-sm"}`}>
                  <div className="text-sm leading-relaxed space-y-1">
                    {formatMessage(msg.content)}
                  </div>
                  <p className={`text-[10px] mt-1.5 ${msg.role === "user" ? "text-white/50 text-right" : "text-[#A8A29E]"}`}>
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            ))}

            {thinking && (
              <div className="flex gap-3 fade-in">
                <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-[#E8602A] text-white">
                  <Bot size={14} />
                </div>
                <div className="bg-[#F5F5F4] rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1 items-center h-5">
                    {[0, 1, 2].map(i => (
                      <span key={i} className="w-1.5 h-1.5 rounded-full bg-[#A8A29E] animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-[#F5F5F4]">
            <div className="flex gap-2.5 items-end">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
                placeholder="Ask about projects, risks, delays or costs..."
                className="flex-1 text-sm border border-[#E7E5E4] rounded-xl px-4 py-3 outline-none focus:border-[#E8602A] resize-none placeholder:text-[#D6D3D1] transition-colors"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || thinking}
                className="w-10 h-10 bg-[#E8602A] hover:bg-[#C45320] text-white rounded-xl flex items-center justify-center flex-shrink-0 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send size={16} />
              </button>
            </div>
            <p className="text-[10px] text-[#A8A29E] mt-2 text-center">AI responses are based on mock data for demonstration purposes.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
