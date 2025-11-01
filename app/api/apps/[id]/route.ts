import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.NEON_NEON_DATABASE_URL!)

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const app = await sql`SELECT * FROM generated_apps WHERE id = ${params.id}`

    if (app.length === 0) {
      return Response.json({ error: "App not found" }, { status: 404 })
    }

    return Response.json(app[0])
  } catch (error: any) {
    console.error("[v0] Error fetching app:", error.message, error)
    return Response.json({ error: "Failed to fetch app", details: error.message }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await sql`DELETE FROM generated_apps WHERE id = ${params.id}`
    return Response.json({ success: true })
  } catch (error: any) {
    console.error("[v0] Error deleting app:", error.message, error)
    return Response.json({ error: "Failed to delete app", details: error.message }, { status: 500 })
  }
}
