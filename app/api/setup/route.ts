import { neon } from "@neondatabase/serverless"

export async function POST() {
  const sql = neon(process.env.NEON_NEON_DATABASE_URL!)

  try {
    console.log("[v0] Starting database setup...")

    // Create configurations table
    await sql`
      CREATE TABLE IF NOT EXISTS configurations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ai_api_key TEXT NOT NULL,
        ai_provider TEXT NOT NULL DEFAULT 'openai',
        cron_interval_minutes INT NOT NULL DEFAULT 2880,
        ui_strategy TEXT NOT NULL DEFAULT 'minimalistic',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `
    console.log("[v0] Created configurations table")

    // Create build_rules table
    await sql`
      CREATE TABLE IF NOT EXISTS build_rules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        config_id UUID NOT NULL REFERENCES configurations(id) ON DELETE CASCADE,
        rule_name TEXT NOT NULL,
        rule_description TEXT NOT NULL,
        rule_category TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(config_id, rule_name)
      )
    `
    console.log("[v0] Created build_rules table")

    // Create generated_apps table
    await sql`
      CREATE TABLE IF NOT EXISTS generated_apps (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        config_id UUID NOT NULL REFERENCES configurations(id) ON DELETE CASCADE,
        app_name TEXT NOT NULL,
        app_description TEXT NOT NULL,
        app_prompt TEXT NOT NULL,
        app_code TEXT,
        app_status TEXT NOT NULL DEFAULT 'pending',
        app_error TEXT,
        generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `
    console.log("[v0] Created generated_apps table")
    
    await sql`
      ALTER TABLE generated_apps 
      ALTER COLUMN app_code DROP NOT NULL
    `.catch(() => console.log("[v0] app_code column already nullable or doesn't exist"))

    // Create cron_jobs table
    await sql`
      CREATE TABLE IF NOT EXISTS cron_jobs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        config_id UUID NOT NULL REFERENCES configurations(id) ON DELETE CASCADE,
        last_run TIMESTAMP WITH TIME ZONE,
        next_run TIMESTAMP WITH TIME ZONE,
        status TEXT NOT NULL DEFAULT 'active',
        error_message TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `
    console.log("[v0] Created cron_jobs table")

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_build_rules_config_id ON build_rules(config_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_generated_apps_config_id ON generated_apps(config_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_cron_jobs_config_id ON cron_jobs(config_id)`
    console.log("[v0] Created indexes")

    return Response.json({
      success: true,
      message: "Database setup completed successfully",
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("[v0] Setup error:", errorMessage)
    return Response.json({ success: false, error: errorMessage }, { status: 500 })
  }
}
