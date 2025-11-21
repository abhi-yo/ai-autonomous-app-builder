import { generateText } from "ai"
import { google } from "@ai-sdk/google"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.NEON_NEON_DATABASE_URL!)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { config_id } = body

    const configs = await sql`SELECT * FROM configurations WHERE id = ${config_id}`
    if (configs.length === 0) {
      return Response.json({ error: "Configuration not found" }, { status: 404 })
    }

    // Generate a random app idea
    const { text: idea } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt: `Generate a unique, creative but simple web app idea. The idea should be:
- Something that can be built in ~5 minutes as a Next.js app
- Useful and interesting
- Not too complex

Return ONLY the app idea name and brief description in this format:
Name: [app name]
Description: [one-line description]

Examples could be:
Name: Pomodoro Timer
Description: A simple productivity timer with task tracking

Name: Color Palette Generator
Description: Generate and export beautiful color palettes

Generate a NEW idea different from the examples above.`,
      temperature: 0.8,
    })

    return Response.json({ idea })
  } catch (error: any) {
    console.error("[v0] Error generating idea:", error.message, error)
    return Response.json({ error: "Failed to generate idea", details: error.message }, { status: 500 })
  }
}
