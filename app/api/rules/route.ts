import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.NEON_NEON_DATABASE_URL!)

export async function GET() {
  try {
    const config = await sql`SELECT id FROM configurations LIMIT 1`
    if (config.length === 0) {
      return Response.json({ rules: [] })
    }

    const rules = await sql`SELECT * FROM build_rules WHERE config_id = ${config[0].id}`
    return Response.json({ rules })
  } catch (error: any) {
    console.error("[v0] Error fetching rules:", error.message, error)
    return Response.json({ error: "Failed to fetch rules", details: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { rule_name, rule_description, rule_category } = body

    const config = await sql`SELECT id FROM configurations LIMIT 1`
    if (config.length === 0) {
      return Response.json({ error: "No configuration found" }, { status: 404 })
    }

    const result = await sql`
      INSERT INTO build_rules (config_id, rule_name, rule_description, rule_category) 
      VALUES (${config[0].id}, ${rule_name}, ${rule_description}, ${rule_category}) 
      RETURNING *
    `

    return Response.json(result[0])
  } catch (error: any) {
    console.error("[v0] Error creating rule:", error.message, error)
    return Response.json({ error: "Failed to create rule", details: error.message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json()
    const { rule_id } = body

    await sql`DELETE FROM build_rules WHERE id = ${rule_id}`
    return Response.json({ success: true })
  } catch (error: any) {
    console.error("[v0] Error deleting rule:", error.message, error)
    return Response.json({ error: "Failed to delete rule", details: error.message }, { status: 500 })
  }
}
