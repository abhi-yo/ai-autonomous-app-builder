import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.NEON_NEON_DATABASE_URL!)

export async function GET() {
  try {
    const apps = await sql`SELECT * FROM generated_apps ORDER BY created_at DESC`
    return Response.json(apps)
  } catch (error: any) {
    console.error("[v0] Error fetching apps:", error.message, error)
    return Response.json({ error: "Failed to fetch apps", details: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { config_id, app_name, app_description, app_prompt } = body

    const result = await sql`
      INSERT INTO generated_apps (config_id, app_name, app_description, app_prompt, app_status) 
      VALUES (${config_id}, ${app_name}, ${app_description}, ${app_prompt}, ${"pending"}) 
      RETURNING *
    `

    return Response.json(result[0])
  } catch (error: any) {
    console.error("[v0] Error creating app:", error.message, error)
    return Response.json({ error: "Failed to create app", details: error.message }, { status: 500 })
  }
}
