import { neon } from "@neondatabase/serverless"

export async function POST() {
  const sql = neon(process.env.NEON_NEON_DATABASE_URL!)

  try {
    console.log("[v0] Running migration...")

    await sql`
      ALTER TABLE generated_apps 
      ALTER COLUMN app_code DROP NOT NULL
    `
    
    console.log("[v0] Migration completed: app_code column is now nullable")

    return Response.json({
      success: true,
      message: "Migration completed successfully",
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("[v0] Migration error:", errorMessage)
    return Response.json({ success: false, error: errorMessage }, { status: 500 })
  }
}

