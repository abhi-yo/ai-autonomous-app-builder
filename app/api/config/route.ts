import { neon } from "@neondatabase/serverless"
import { initializeCronJobs } from "@/lib/cron-scheduler"

const sql = neon(process.env.NEON_NEON_DATABASE_URL!)

export async function GET() {
  try {
    const configs = await sql`SELECT * FROM configurations ORDER BY created_at DESC LIMIT 1`

    if (configs.length === 0) {
      return Response.json({ error: "No configuration found" }, { status: 404 })
    }

    const config = configs[0]

    if (config.ai_api_key) {
      await initializeCronJobs()
    }

    const rules = await sql`SELECT * FROM build_rules WHERE config_id = ${config.id}`

    return Response.json({ ...config, rules })
  } catch (error: any) {
    console.error("[v0] Error fetching config:", error.message, error)
    return Response.json({ error: "Failed to fetch configuration", details: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { ai_api_key, ai_provider, cron_interval_minutes } = body

    const existing = await sql`SELECT id FROM configurations LIMIT 1`

    let configId
    if (existing.length > 0) {
      const result = await sql`
        UPDATE configurations 
        SET ai_api_key = ${ai_api_key}, ai_provider = ${ai_provider}, cron_interval_minutes = ${cron_interval_minutes}, updated_at = NOW() 
        WHERE id = ${existing[0].id} 
        RETURNING *
      `
      configId = result[0].id
    } else {
      const result = await sql`
        INSERT INTO configurations (ai_api_key, ai_provider, cron_interval_minutes) 
        VALUES (${ai_api_key}, ${ai_provider}, ${cron_interval_minutes}) 
        RETURNING *
      `
      configId = result[0].id
    }

    await initializeCronJobs()

    const rules = await sql`SELECT * FROM build_rules WHERE config_id = ${configId}`
    const config = await sql`SELECT * FROM configurations WHERE id = ${configId}`

    return Response.json({ ...config[0], rules })
  } catch (error: any) {
    console.error("[v0] Error updating config:", error.message, error)
    return Response.json({ error: "Failed to update configuration", details: error.message }, { status: 500 })
  }
}
