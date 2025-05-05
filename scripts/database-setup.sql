-- =====================================
-- 1) PROFILES
-- Stores each user's account & branding settings
-- Features:  
--   • User signup & auth  
--   • Onboarding (business name, industry, sample PDF for AI)  
--   • Personalized styling (accent_color, font_choice)  
-- =====================================
CREATE TABLE profiles (
  id               UUID           PRIMARY KEY
                   REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name        TEXT           NOT NULL,   -- Freelancer/business owner name
  business_name    TEXT           NOT NULL,   -- Company or brand
  industry         TEXT,                     -- e.g. 'Graphic Design'
  sample_quote_url TEXT,                     -- URL to uploaded sample quote (AI tuning)
  accent_color     TEXT      NOT NULL DEFAULT '#7E57C2',
  font_choice      TEXT      NOT NULL DEFAULT 'Rubik',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================
-- 2) CLIENTS
-- (Optional) Stores repeat‐client data
-- Features:  
--   • Save & re-use client info in quote form  
-- =====================================
CREATE TABLE clients (
  id         BIGSERIAL     PRIMARY KEY,
  user_id    UUID          NOT NULL
                  REFERENCES profiles(id) ON DELETE CASCADE,
  name       TEXT          NOT NULL,
  email      TEXT,
  phone      TEXT,
  created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
CREATE INDEX ON clients(user_id);
CREATE UNIQUE INDEX ON clients(user_id, name);

-- =====================================
-- 3) ENUMS FOR QUOTES
-- Ensures valid status & style values
-- Features:  
--   • Quote lifecycle (draft → sent → viewed → approved/rejected)  
--   • Style picker (professional, modern, casual)  
-- =====================================
CREATE TYPE quote_status AS ENUM (
  'draft',
  'sent',
  'viewed',
  'approved',
  'rejected'
);
CREATE TYPE quote_style AS ENUM (
  'professional',
  'modern',
  'casual'
);

-- =====================================
-- 4) QUOTES
-- Core table for each generated proposal
-- Features:  
--   • Quick form input (client, hours, price, description)  
--   • AI-generated content (content)  
--   • PDF storage link (pdf_url)  
--   • Status transitions & timestamps  
--   • Style selection  
-- =====================================
CREATE TABLE quotes (
  id              BIGSERIAL        PRIMARY KEY,
  user_id         UUID             NOT NULL
                    REFERENCES profiles(id) ON DELETE CASCADE,
  client_id       BIGSERIAL        REFERENCES clients(id),
  client_name     TEXT             NOT NULL,
  description     TEXT,                            
  hours           INT              NOT NULL,
  price           NUMERIC(12,2)    NOT NULL,
  include_tax     BOOLEAN          NOT NULL DEFAULT FALSE,
  style           quote_style      NOT NULL DEFAULT 'professional',
  content         TEXT             NOT NULL,       -- AI-generated proposal text
  pdf_url         TEXT,                              -- Storage bucket URL
  status          quote_status     NOT NULL DEFAULT 'draft',
  created_at      TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
  sent_at         TIMESTAMPTZ,                      -- When "send" was clicked
  viewed_at       TIMESTAMPTZ,                      -- When client opened quote
  approved_at     TIMESTAMPTZ,                      -- When status → approved
  rejected_at     TIMESTAMPTZ                       -- When status → rejected
);
CREATE INDEX ON quotes(user_id);
CREATE INDEX ON quotes(status);
CREATE INDEX ON quotes(created_at);

-- =====================================
-- 5) SUBSCRIPTIONS (optional)
-- Tracks user plan & billing status
-- Features:  
--   • Free trial period  
--   • Monthly/annual plan selection  
--   • Display trial/plan in dashboard  
-- =====================================
CREATE TYPE plan_name AS ENUM ('trial','monthly','annual');
CREATE TABLE subscriptions (
  id                    BIGSERIAL      PRIMARY KEY,
  user_id               UUID           NOT NULL
                          REFERENCES profiles(id) ON DELETE CASCADE,
  plan                  plan_name      NOT NULL DEFAULT 'trial',
  status                TEXT           NOT NULL,   -- 'active', 'canceled', etc.
  started_at            TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  current_period_end    TIMESTAMPTZ,                  -- From Stripe/webhook
  cancelled_at          TIMESTAMPTZ,
  created_at            TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);
CREATE INDEX ON subscriptions(user_id);

-- =====================================
-- 6) Row Level Security Policies
-- Ensures users can only access their own data
-- =====================================

-- Profiles RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" 
  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Clients RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own clients" 
  ON clients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own clients" 
  ON clients FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own clients" 
  ON clients FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own clients" 
  ON clients FOR DELETE USING (auth.uid() = user_id);

-- Quotes RLS
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own quotes" 
  ON quotes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own quotes" 
  ON quotes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own quotes" 
  ON quotes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own quotes" 
  ON quotes FOR DELETE USING (auth.uid() = user_id);

-- Subscriptions RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own subscription" 
  ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Only service role can insert subscriptions" 
  ON subscriptions FOR INSERT WITH CHECK (false); -- Set to false, only service role should modify
CREATE POLICY "Only service role can update subscriptions" 
  ON subscriptions FOR UPDATE USING (false); -- Set to false, only service role should modify
