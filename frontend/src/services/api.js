/**
 * Central API Service Layer
 * 
 * Note for Backend Team:
 * When connecting live FastAPI/Express backend, configure VITE_API_URL in .env
 * and uncomment axios/fetch calls below.
 */

import { projects, riskTrendData, sectorData } from "../data/projects";
import { alerts } from "../data/alerts";
import { ministryComparisonData, sectorRadarData, costOverrunTrendData } from "../data/analytics";
import { users } from "../data/users";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// Helper to simulate network latency for realistic demo
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const apiService = {
  // Authentication
  async login(email, password) {
    await delay(400);
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) throw new Error("Invalid credentials");
    return user;
  },

  // Projects
  async getProjects(filters = {}) {
    await delay(300);
    return projects;
  },

  async getProjectById(id) {
    await delay(200);
    return projects.find(p => p.id === parseInt(id));
  },

  // AI CUF Prediction Engine
  async predictCUFRisk(cufPayload) {
    await delay(600);
    const { approvedCost, expenditure, physicalProgress, landAcquired, forestClearanceLag } = cufPayload;
    
    const financialProgress = (expenditure / (approvedCost || 1)) * 100;
    const progressLag = Math.max(0, financialProgress - physicalProgress);
    
    const costRisk = Math.min(98, Math.round(30 + (progressLag * 1.4) + (forestClearanceLag ? 18 : 0)));
    const timeRisk = Math.min(98, Math.round(25 + ((100 - landAcquired) * 0.5) + (forestClearanceLag ? 22 : 0)));
    const overallRisk = Math.round((costRisk * 0.5) + (timeRisk * 0.5));
    
    const predictedDelayMonths = Math.max(1, Math.round((timeRisk / 10) * 1.5));
    const predictedCostEscalationCr = Math.round((approvedCost * (costRisk / 100) * 0.28));

    return {
      overallRisk,
      costRisk,
      timeRisk,
      predictedDelayMonths,
      predictedCostEscalationCr,
      confidenceScore: "94.2%",
      riskLevel: overallRisk >= 75 ? "Critical" : overallRisk >= 50 ? "High" : "Moderate",
      topDrivers: [
        { name: "Land Acquisition Lag", weight: `${Math.round((100 - landAcquired) * 0.35)}% impact` },
        { name: "Physical vs Financial Discrepancy", weight: `${Math.round(progressLag * 1.2)}% impact` },
        { name: "Environmental Clearance Hold", weight: forestClearanceLag ? "22% delay attribution" : "Cleared" }
      ]
    };
  },

  // Alerts
  async getAlerts() {
    await delay(200);
    return alerts;
  },

  // Analytics & Benchmarks
  async getAnalytics() {
    await delay(300);
    return {
      ministryComparison: ministryComparisonData,
      sectorRadar: sectorRadarData,
      costOverrunTrend: costOverrunTrendData,
      riskTrend: riskTrendData,
      sectorData: sectorData
    };
  }
};
