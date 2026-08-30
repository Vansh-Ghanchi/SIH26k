export const ministryComparisonData = [
  { ministry: "Road Transport", avgRisk: 58, projects: 312, delayed: 89 },
  { ministry: "Jal Shakti", avgRisk: 52, projects: 405, delayed: 102 },
  { ministry: "Power", avgRisk: 44, projects: 218, delayed: 48 },
  { ministry: "Health", avgRisk: 41, projects: 280, delayed: 52 },
  { ministry: "Education", avgRisk: 33, projects: 366, delayed: 61 },
  { ministry: "Urban Dev.", avgRisk: 55, projects: 400, delayed: 120 },
];

export const sectorRadarData = [
  { subject: "Risk Score", Transport: 58, Energy: 44, Water: 47, Health: 41, Education: 33 },
  { subject: "On-time", Transport: 52, Energy: 68, Water: 62, Health: 71, Education: 79 },
  { subject: "Budget Adherence", Transport: 55, Energy: 72, Water: 58, Health: 74, Education: 82 },
  { subject: "Milestone Hit", Transport: 48, Energy: 65, Water: 55, Health: 68, Education: 76 },
  { subject: "Quality Score", Transport: 62, Energy: 70, Water: 65, Health: 72, Education: 78 },
];

export const costOverrunTrendData = [
  { month: "Jan 23", overrun: 12.4 },
  { month: "Feb 23", overrun: 13.1 },
  { month: "Mar 23", overrun: 14.8 },
  { month: "Apr 23", overrun: 13.9 },
  { month: "May 23", overrun: 15.2 },
  { month: "Jun 23", overrun: 18.7 },
  { month: "Jul 23", overrun: 17.3 },
  { month: "Aug 23", overrun: 19.1 },
  { month: "Sep 23", overrun: 22.4 },
  { month: "Oct 23", overrun: 21.8 },
  { month: "Nov 23", overrun: 20.5 },
  { month: "Dec 23", overrun: 18.2 },
];

export const keyInsights = [
  {
    id: 1,
    icon: "TrendingUp",
    color: "danger",
    title: "Transport sector most at-risk",
    detail: "Transport has 34% higher average risk score than Energy sector projects.",
  },
  {
    id: 2,
    icon: "AlertTriangle",
    color: "warning",
    title: "Q3 peak cost overrun",
    detail: "September 2023 recorded the highest cost overrun spike at 22.4% above baseline.",
  },
  {
    id: 3,
    icon: "CheckCircle",
    color: "success",
    title: "Water projects improving",
    detail: "Jal Jeevan Mission projects show strongest schedule performance at 62% on-time rate.",
  },
  {
    id: 4,
    icon: "BarChart2",
    color: "accent",
    title: "Education fastest completion",
    detail: "Education sector projects complete 18% faster than cross-sector average.",
  },
];

export const shapFactors = [
  { factor: "Physical Progress Gap", contribution: 32, direction: "positive" },
  { factor: "Milestone Delays", contribution: 25, direction: "positive" },
  { factor: "Cost Revision History", contribution: 20, direction: "positive" },
  { factor: "Historical Sector Risk", contribution: 12, direction: "positive" },
  { factor: "Weather / External", contribution: 6, direction: "positive" },
  { factor: "Contractor Performance", contribution: -5, direction: "negative" },
];

export const chatHistory = [
  {
    id: 1,
    role: "user",
    content: "Why is NH-48 Highway high risk?",
    timestamp: "10:32 AM",
  },
  {
    id: 2,
    role: "ai",
    content:
      "NH-48 is currently classified as **HIGH RISK** (score: 89/100) primarily because:\n\n• Physical progress is 32% behind the planned schedule\n• Three consecutive milestones have been missed\n• Two cost revisions have increased projected expenditure by ₹480 Cr\n• Contractor has reported labor and material shortages\n\nThe AI model predicts an 84% probability of further cost overrun and 91% probability of schedule delay if no intervention is taken.",
    timestamp: "10:32 AM",
  },
  {
    id: 3,
    role: "user",
    content: "Which projects are most likely to exceed budget?",
    timestamp: "10:35 AM",
  },
  {
    id: 4,
    role: "ai",
    content:
      "Based on current financial trends and AI predictions, the top 3 projects most likely to exceed budget are:\n\n1. **NH-48 Highway Expansion** — 84% probability, ₹480 Cr projected overrun\n2. **Kaleshwaram Lift Irrigation** — 79% probability, already at 98% expenditure\n3. **AIIMS Darbhanga** — 72% probability, cost escalation risk from CPWD estimates\n\nAll three are recommended for immediate financial review.",
    timestamp: "10:35 AM",
  },
];

export const suggestedQuestions = [
  "Which projects are most likely to exceed budget?",
  "Why is NH-48 Highway high risk?",
  "Compare transport projects in Gujarat",
  "Show all delayed projects in Maharashtra",
  "What is the average risk score for Energy sector?",
  "Which ministry has the best on-time record?",
];
