-- Run this in Supabase SQL editor before deploying any backend
-- One Supabase project, one database, all 4 backends share it

-- EternalVault
CREATE TABLE IF NOT EXISTS vaults (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_address TEXT NOT NULL,
  heir_address TEXT NOT NULL,
  file_cid TEXT,
  unlock_date TIMESTAMPTZ,
  status TEXT DEFAULT 'locked',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TrustMesh
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_pubkey TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  permissions JSONB DEFAULT '[]',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agent_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id),
  action TEXT NOT NULL,
  signature TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ShadowLedger
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  admin_pubkey TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shadow_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  agent_type TEXT NOT NULL,
  action TEXT NOT NULL,
  result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PalmFlow
CREATE TABLE IF NOT EXISTS treasury (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_pubkey TEXT NOT NULL,
  balance NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payroll_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  treasury_id UUID REFERENCES treasury(id),
  recipient TEXT NOT NULL,
  rate_per_second NUMERIC NOT NULL,
  token TEXT DEFAULT 'SOL',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
