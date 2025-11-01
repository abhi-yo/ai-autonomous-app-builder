-- Create tables for AI app builder

-- Configurations table (stores API keys and rules)
CREATE TABLE IF NOT EXISTS configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ai_api_key TEXT NOT NULL,
  ai_provider TEXT NOT NULL DEFAULT 'openai', -- openai, anthropic, etc.
  cron_interval_minutes INT NOT NULL DEFAULT 60,
  ui_strategy TEXT NOT NULL DEFAULT 'minimalistic',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Rules table (stores building rules for AI)
CREATE TABLE IF NOT EXISTS build_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id UUID NOT NULL REFERENCES configurations(id) ON DELETE CASCADE,
  rule_name TEXT NOT NULL,
  rule_description TEXT NOT NULL,
  rule_category TEXT NOT NULL, -- 'ui', 'backend', 'general'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(config_id, rule_name)
);

-- Generated apps table
CREATE TABLE IF NOT EXISTS generated_apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id UUID NOT NULL REFERENCES configurations(id) ON DELETE CASCADE,
  app_name TEXT NOT NULL,
  app_description TEXT NOT NULL,
  app_prompt TEXT NOT NULL,
  app_code TEXT NOT NULL,
  app_status TEXT NOT NULL DEFAULT 'pending', -- pending, building, completed, failed
  app_error TEXT,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Cron jobs tracking table
CREATE TABLE IF NOT EXISTS cron_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id UUID NOT NULL REFERENCES configurations(id) ON DELETE CASCADE,
  last_run TIMESTAMP WITH TIME ZONE,
  next_run TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'active', -- active, paused, failed
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_build_rules_config_id ON build_rules(config_id);
CREATE INDEX IF NOT EXISTS idx_generated_apps_config_id ON generated_apps(config_id);
CREATE INDEX IF NOT EXISTS idx_cron_jobs_config_id ON cron_jobs(config_id);
