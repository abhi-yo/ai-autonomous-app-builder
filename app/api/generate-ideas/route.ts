import { generateText } from "ai"
import { google } from "@ai-sdk/google"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.NEON_NEON_DATABASE_URL!)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { config_id, count = 10 } = body

    const configs = await sql`SELECT * FROM configurations WHERE id = ${config_id}`
    if (configs.length === 0) {
      return Response.json({ error: "Configuration not found" }, { status: 404 })
    }

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      console.error("[v0] Missing GOOGLE_GENERATIVE_AI_API_KEY environment variable")
      return Response.json({ 
        error: "API key not configured", 
        details: "GOOGLE_GENERATIVE_AI_API_KEY environment variable is not set" 
      }, { status: 500 })
    }

    console.log("[v0] Generating ideas with Gemini 2.5 Flash...")

    const { text: ideasText } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt: `Generate ${count} unique, SUBSTANTIAL web app ideas that could be profitable SaaS products. 

CRITICAL: These must be apps that require REAL FUNCTIONALITY, not just simple forms or display pages.

Each idea should:
1. Require complex logic, calculations, or data processing
2. Have multiple interactive features (not just a single form)
3. Include data management (CRUD operations, filtering, sorting)
4. Solve a specific, valuable problem for a niche audience
5. Have clear monetization potential ($10-50/month SaaS)
6. Be feasible as a single-page application with local storage
7. NOT be: Simple recipe generators, basic calculators, todo lists, or portfolio sites

Examples of GOOD complexity levels:
- Expense tracking with analytics and budget forecasting
- Project time tracker with reporting and invoicing
- Habit tracker with streak tracking and statistics
- Meal planner with nutrition calculations and shopping lists
- Workout builder with progressive overload calculations
- Personal CRM with contact management and follow-up reminders
- Content calendar with scheduling and analytics
- Invoice generator with client management and payment tracking

Return ONLY a JSON array in this exact format (no markdown, no explanations):
[
  {
    "name": "App Name (be specific and descriptive)",
    "description": "Detailed description of core features and functionality (2-3 sentences)",
    "targetAudience": "Specific niche audience",
    "problem": "Specific problem it solves with measurable outcomes",
    "monetization": "Subscription tier structure"
  }
]

Make each idea UNIQUE, FUNCTIONAL, and SUBSTANTIAL. Avoid oversaturated markets.`,
      temperature: 0.9,
    })

    let ideas = []
    try {
      const jsonMatch = ideasText.match(/\[[\s\S]*\]/)?.[0]
      if (jsonMatch) {
        ideas = JSON.parse(jsonMatch)
      } else {
        throw new Error("No JSON array found")
      }
    } catch (parseError) {
      const lines = ideasText.split("\n").filter((l: string) => l.trim())
      ideas = lines.slice(0, count).map((line: string, idx: number) => ({
        name: `Idea ${idx + 1}`,
        description: line.replace(/^\d+\.\s*/, "").trim(),
        targetAudience: "General users",
        problem: "To be determined",
        monetization: "Subscription/Freemium",
      }))
    }

    return Response.json({ ideas: ideas.slice(0, count) })
  } catch (error: any) {
    console.error("[v0] Error generating ideas:", error.message, error)
    const errorDetails = error.cause?.message || error.message || String(error)
    return Response.json({ 
      error: "Failed to generate ideas", 
      details: errorDetails,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}

