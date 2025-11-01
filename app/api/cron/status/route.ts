import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.NEON_NEON_DATABASE_URL!)

export async function GET() {
  try {
    const crons = await sql`
      SELECT cj.*, c.cron_interval_minutes
      FROM cron_jobs cj
      JOIN configurations c ON cj.config_id = c.id
      ORDER BY cj.updated_at DESC
    `

    return Response.json({ crons })
  } catch (error: any) {
    console.error("[v0] Error fetching cron status:", error.message, error)
    return Response.json({ error: "Failed to fetch cron status", details: error.message }, { status: 500 })
  }
}
