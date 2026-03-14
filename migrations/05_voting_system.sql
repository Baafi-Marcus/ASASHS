-- Migration: Voting System Module
-- Description: Adds tables for elections, positions, candidates, and voting tracking.
-- Supports progressive onboarding by allowing NULLs in student records initially.

-- 1. Update students table to allow NULLs for progressive registration
ALTER TABLE students 
  ALTER COLUMN date_of_birth DROP NOT NULL,
  ALTER COLUMN nationality DROP NOT NULL,
  ALTER COLUMN hometown DROP NOT NULL,
  ALTER COLUMN district_of_origin DROP NOT NULL,
  ALTER COLUMN region_of_origin DROP NOT NULL,
  ALTER COLUMN guardian_name DROP NOT NULL,
  ALTER COLUMN guardian_relationship DROP NOT NULL,
  ALTER COLUMN guardian_phone DROP NOT NULL,
  ALTER COLUMN enrollment_date DROP NOT NULL;

-- Add registration_status to track completion
ALTER TABLE students 
  ADD COLUMN IF NOT EXISTS registration_status TEXT DEFAULT 'voter_only';

-- 2. Elections Table
CREATE TABLE IF NOT EXISTS elections (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft', -- draft, open, closed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Positions Table
CREATE TABLE IF NOT EXISTS positions (
  id SERIAL PRIMARY KEY,
  election_id INTEGER REFERENCES elections(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  max_selections INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0
);

-- 4. Candidates Table
CREATE TABLE IF NOT EXISTS candidates (
  id SERIAL PRIMARY KEY,
  position_id INTEGER REFERENCES positions(id) ON DELETE CASCADE,
  student_id INTEGER REFERENCES students(id) ON DELETE SET NULL,
  name_override TEXT, -- In case we want to show a specific name
  display_name TEXT NOT NULL,
  manifesto TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Voter Status Table (Tracks who has voted in which election)
CREATE TABLE IF NOT EXISTS voter_status (
  id SERIAL PRIMARY KEY,
  election_id INTEGER REFERENCES elections(id) ON DELETE CASCADE,
  student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
  voted_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  UNIQUE(election_id, student_id)
);

-- 6. Votes Table (The actual tallies)
-- Design: Decoupled from student_id for anonymity (one-way hash used locally instead)
CREATE TABLE IF NOT EXISTS votes (
  id SERIAL PRIMARY KEY,
  election_id INTEGER REFERENCES elections(id) ON DELETE CASCADE,
  position_id INTEGER REFERENCES positions(id) ON DELETE CASCADE,
  candidate_id INTEGER REFERENCES candidates(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  action TEXT NOT NULL,
  performed_by TEXT NOT NULL, -- user_id (admin)
  target_type TEXT, -- 'election', 'candidate', 'student'
  target_id TEXT,
  details JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_votes_candidate ON votes(candidate_id);
CREATE INDEX IF NOT EXISTS idx_votes_position ON votes(position_id);
CREATE INDEX IF NOT EXISTS idx_voter_status_student ON voter_status(student_id);
CREATE INDEX IF NOT EXISTS idx_candidates_position ON candidates(position_id);
