-- ==============================================================================
-- MoSPI DRISHTI - Central Sector Infrastructure Projects Database Schema
-- Supabase (PostgreSQL) Initial Migration Script
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Master Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id TEXT UNIQUE NOT NULL,
    project_name TEXT NOT NULL,
    ministry TEXT NOT NULL,
    sector TEXT NOT NULL,
    implementing_agency TEXT,
    state_ut TEXT NOT NULL,
    approval_date TEXT,
    start_date TEXT,
    original_completion_date TEXT,
    revised_completion_date TEXT,
    original_cost_cr NUMERIC(12, 2) DEFAULT 0.00,
    revised_cost_cr NUMERIC(12, 2) DEFAULT 0.00,
    cumulative_expenditure_cr NUMERIC(12, 2) DEFAULT 0.00,
    physical_progress_pct NUMERIC(5, 2) DEFAULT 0.00,
    cost_revision_pct NUMERIC(6, 2) DEFAULT 0.00,
    deadline_revision_flag BOOLEAN DEFAULT FALSE,
    project_status TEXT DEFAULT 'Ongoing',
    data_quality_flag TEXT DEFAULT 'OK',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Monthly Snapshots Table (Time-Series 2025-07 to 2026-03)
CREATE TABLE IF NOT EXISTS public.monthly_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporting_month TEXT NOT NULL,
    project_id TEXT REFERENCES public.projects(project_id) ON DELETE CASCADE,
    physical_progress_pct NUMERIC(5, 2) DEFAULT 0.00,
    cumulative_expenditure_cr NUMERIC(12, 2) DEFAULT 0.00,
    revised_cost_cr NUMERIC(12, 2) DEFAULT 0.00,
    status_at_month_end TEXT DEFAULT 'Ongoing',
    source_page INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. AI Predictive Risk Logs & Overrun Intelligence Table
CREATE TABLE IF NOT EXISTS public.ai_risk_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id TEXT REFERENCES public.projects(project_id) ON DELETE CASCADE,
    risk_score NUMERIC(5, 2) NOT NULL,
    risk_level TEXT NOT NULL, -- 'Critical', 'High', 'Medium', 'Low'
    high_risk_probability NUMERIC(5, 2),
    deadline_slip_probability NUMERIC(5, 2),
    cost_escalation_probability NUMERIC(5, 2),
    predicted_delay_months INT DEFAULT 0,
    top_risk_drivers JSONB,
    recommendation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Fast Query Indexes
CREATE INDEX IF NOT EXISTS idx_projects_state ON public.projects(state_ut);
CREATE INDEX IF NOT EXISTS idx_projects_ministry ON public.projects(ministry);
CREATE INDEX IF NOT EXISTS idx_projects_sector ON public.projects(sector);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(project_status);
CREATE INDEX IF NOT EXISTS idx_snapshots_month ON public.monthly_snapshots(reporting_month);
CREATE INDEX IF NOT EXISTS idx_risk_level ON public.ai_risk_logs(risk_level);

-- 5. Enable Row Level Security (RLS) & Public Read Access
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_risk_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Allow public read access on snapshots" ON public.monthly_snapshots FOR SELECT USING (true);
CREATE POLICY "Allow public read access on risk logs" ON public.ai_risk_logs FOR SELECT USING (true);
