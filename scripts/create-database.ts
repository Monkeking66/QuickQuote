import * as dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

if (!process.env.SUPABASE_URL) {
  throw new Error('Missing SUPABASE_URL environment variable');
}

if (!process.env.SUPABASE_SERVICE_KEY) {
  throw new Error('Missing SUPABASE_SERVICE_KEY environment variable');
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const createTables = async () => {
  console.log('Starting database setup...');

  try {
    // 1. Create profiles table
    console.log('Creating profiles table...');
    const { error: profilesError } = await supabase.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS profiles (
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
      `
    });
    
    if (profilesError) throw profilesError;
    console.log('Profiles table created successfully');

    // 2. Create clients table
    console.log('Creating clients table...');
    const { error: clientsError } = await supabase.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS clients (
          id         BIGSERIAL     PRIMARY KEY,
          user_id    UUID          NOT NULL
                        REFERENCES profiles(id) ON DELETE CASCADE,
          name       TEXT          NOT NULL,
          email      TEXT,
          phone      TEXT,
          created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS clients_user_id_idx ON clients(user_id);
        CREATE UNIQUE INDEX IF NOT EXISTS clients_user_id_name_idx ON clients(user_id, name);
      `
    });
    
    if (clientsError) throw clientsError;
    console.log('Clients table created successfully');

    // 3. Create ENUM types
    console.log('Creating ENUM types...');
    const { error: enumsError } = await supabase.rpc('exec_sql', {
      query: `
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'quote_status') THEN
            CREATE TYPE quote_status AS ENUM (
              'draft',
              'sent',
              'viewed',
              'approved',
              'rejected'
            );
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'quote_style') THEN
            CREATE TYPE quote_style AS ENUM (
              'professional',
              'modern',
              'casual'
            );
          END IF;
        END
        $$;
      `
    });
    
    if (enumsError) throw enumsError;
    console.log('ENUM types created successfully');

    // 4. Create quotes table
    console.log('Creating quotes table...');
    const { error: quotesError } = await supabase.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS quotes (
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
        CREATE INDEX IF NOT EXISTS quotes_user_id_idx ON quotes(user_id);
        CREATE INDEX IF NOT EXISTS quotes_status_idx ON quotes(status);
        CREATE INDEX IF NOT EXISTS quotes_created_at_idx ON quotes(created_at);
      `
    });
    
    if (quotesError) throw quotesError;
    console.log('Quotes table created successfully');

    // 5. Create plan_name ENUM and subscriptions table
    console.log('Creating plan_name ENUM and subscriptions table...');
    const { error: subscriptionsError } = await supabase.rpc('exec_sql', {
      query: `
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'plan_name') THEN
            CREATE TYPE plan_name AS ENUM ('trial','monthly','annual');
          END IF;
        END
        $$;
        
        CREATE TABLE IF NOT EXISTS subscriptions (
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
        CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON subscriptions(user_id);
      `
    });
    
    if (subscriptionsError) throw subscriptionsError;
    console.log('Subscriptions table created successfully');

    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
};

createTables();
