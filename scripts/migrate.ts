import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.NEON_NEON_DATABASE_URL!)

const schema = `
CREATE TABLE IF NOT EXISTS configurations (
  id SERIAL PRIMARY KEY,
  ai_api_key TEXT NOT NULL,
  cron_interval_minutes INT NOT NULL DEFAULT 60,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS build_rules (
  id SERIAL PRIMARY KEY,
  configuration_id INT NOT NULL REFERENCES configurations(id) ON DELETE CASCADE,
  rule_type VARCHAR(50) NOT NULL,
  rule_value TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS generated_apps (
  id SERIAL PRIMARY KEY,
  configuration_id INT NOT NULL REFERENCES configurations(id) ON DELETE CASCADE,
  app_name VARCHAR(255) NOT NULL,
  prompt TEXT NOT NULL,
  code TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cron_jobs (
  id SERIAL PRIMARY KEY,
  configuration_id INT NOT NULL REFERENCES configurations(id) ON DELETE CASCADE,
  last_run TIMESTAMP,
  next_run TIMESTAMP,
  status VARCHAR(50) DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_build_rules_config ON build_rules(configuration_id);
CREATE INDEX IF NOT EXISTS idx_generated_apps_config ON generated_apps(configuration_id);
CREATE INDEX IF NOT EXISTS idx_generated_apps_status ON generated_apps(status);
CREATE INDEX IF NOT EXISTS idx_cron_jobs_config ON cron_jobs(configuration_id);
CREATE INDEX IF NOT EXISTS idx_cron_jobs_next_run ON cron_jobs(next_run);
`

async function migrate() {
  try {
    console.log("[v0] Starting database migration...")

    const statements = schema
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0)

    for (const statement of statements) {
      console.log("[v0] Executing:", statement.substring(0, 50) + "...")
      await sql`${statement}`
    }

    console.log("[v0] ✅ Database migration completed successfully!")
  } catch (error) {
    console.error("[v0] ❌ Migration failed:", error)
    process.exit(1)
  }
}

migrate()
