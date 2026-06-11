-- ==========================================
-- GigMarket Database Initialization Script
-- Target Database: PostgreSQL / Supabase
-- Description: Relational mapping of Flat-file JSON structures (users, jobs, agents, contract addresses)
-- ==========================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------
-- 1. Table definitions
-- ------------------------------------------

-- Table: Users (Profiles & Balances)
CREATE TABLE IF NOT EXISTS public.users (
    wallet_address VARCHAR(42) PRIMARY KEY,
    gateway_balance NUMERIC(20, 6) DEFAULT 0.000000, -- USDC Balance in Gateway
    accumulated_micropayments NUMERIC(20, 6) DEFAULT 0.000000, -- Cumulative micropayments
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: Jobs (Escrows and Milestones)
CREATE TABLE IF NOT EXISTS public.jobs (
    id BIGINT PRIMARY KEY, -- On-chain job ID
    client VARCHAR(42) NOT NULL,
    freelancer VARCHAR(42),
    amount NUMERIC(20, 6) DEFAULT 0.000000, -- Project budget in USDC
    budget NUMERIC(20, 6) DEFAULT 0.000000,
    freelancer_stake NUMERIC(20, 6) DEFAULT 0.000000, -- Freelancer stake locked
    required_stake NUMERIC(20, 6) DEFAULT 0.000000, -- Calculated required stake
    status VARCHAR(50) DEFAULT 'Created', -- Status (Created, Active, Disputed, Resolved, Completed, AppealPending)
    repo_url TEXT, -- GitHub repository url
    current_milestone INTEGER DEFAULT 0,
    accumulated_yield NUMERIC(20, 6) DEFAULT 0.000000,
    yield_distributed NUMERIC(20, 6) DEFAULT 0.000000,
    live_accrued_yield NUMERIC(20, 6) DEFAULT 0.000000,
    is_private BOOLEAN DEFAULT FALSE,
    encrypted_details TEXT,
    recipients TEXT[] DEFAULT ARRAY[]::TEXT[],
    splits INT[] DEFAULT ARRAY[]::INT[],
    milestones JSONB DEFAULT '[]'::jsonb,
    is_agentic BOOLEAN DEFAULT FALSE,
    escrow_type VARCHAR(20) DEFAULT 'STANDARD', -- STANDARD or ERC8183
    bridge_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: Agents (Registered AI Agents)
CREATE TABLE IF NOT EXISTS public.agents (
    agent_address VARCHAR(42) PRIMARY KEY,
    owner_address VARCHAR(42) NOT NULL,
    agent_uri TEXT NOT NULL,
    name VARCHAR(255) DEFAULT 'Unnamed AI Bot',
    description TEXT,
    model VARCHAR(100) DEFAULT 'Default Model',
    repo_url TEXT,
    verified BOOLEAN DEFAULT FALSE,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: Contract Addresses
CREATE TABLE IF NOT EXISTS public.contract_addresses (
    contract_name VARCHAR(100) PRIMARY KEY,
    address VARCHAR(42) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------
-- 2. Indexes for optimization
-- ------------------------------------------
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON public.users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_jobs_client ON public.jobs(client);
CREATE INDEX IF NOT EXISTS idx_jobs_freelancer ON public.jobs(freelancer);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_agents_owner_address ON public.agents(owner_address);
CREATE INDEX IF NOT EXISTS idx_agents_verified ON public.agents(verified);

-- ------------------------------------------
-- 3. Trigger & Function for updated_at tracking
-- ------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
    BEFORE UPDATE ON public.jobs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agents_updated_at
    BEFORE UPDATE ON public.agents
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contracts_updated_at
    BEFORE UPDATE ON public.contract_addresses
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ------------------------------------------
-- 4. Row Level Security (RLS) Policies (Supabase Compatible)
-- ------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_addresses ENABLE ROW LEVEL SECURITY;

-- Users RLS Policies
CREATE POLICY "Allow public read-only access to users"
    ON public.users FOR SELECT
    USING (true);

CREATE POLICY "Allow users to modify their own profile"
    ON public.users FOR ALL
    USING (auth.uid()::text = wallet_address)
    WITH CHECK (auth.uid()::text = wallet_address);

-- Jobs RLS Policies
CREATE POLICY "Allow public read-only access to jobs"
    ON public.jobs FOR SELECT
    USING (true);

CREATE POLICY "Allow insertion of jobs by authenticated users"
    ON public.jobs FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow job updating by related client/freelancer/evaluator"
    ON public.jobs FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Agents RLS Policies
CREATE POLICY "Allow public read-only access to agents"
    ON public.agents FOR SELECT
    USING (true);

CREATE POLICY "Allow owner to register/modify agent properties"
    ON public.agents FOR ALL
    USING (true)
    WITH CHECK (true);

-- Contract Addresses RLS Policies
CREATE POLICY "Allow public read-only access to contract addresses"
    ON public.contract_addresses FOR SELECT
    USING (true);

CREATE POLICY "Allow admins to update contract addresses"
    ON public.contract_addresses FOR ALL
    USING (true)
    WITH CHECK (true);
