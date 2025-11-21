import { generateText } from "ai"
import { google } from "@ai-sdk/google"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.NEON_NEON_DATABASE_URL!)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { config_id, ideas } = body

    if (!ideas || !Array.isArray(ideas) || ideas.length === 0) {
      return Response.json({ error: "No ideas provided" }, { status: 400 })
    }

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      console.error("[v0] Missing GOOGLE_GENERATIVE_AI_API_KEY environment variable")
      return Response.json({ 
        error: "API key not configured", 
        details: "GOOGLE_GENERATIVE_AI_API_KEY environment variable is not set" 
      }, { status: 500 })
    }

    console.log("[v0] Evaluating ideas with Gemini 2.5 Flash...")

    const existingApps = await sql`SELECT app_name, app_description FROM generated_apps`
    const existingNames = existingApps.map((a: any) => a.app_name.toLowerCase())

      const evaluationPrompt = `Evaluate these ${ideas.length} web app ideas for building substantial, functional SaaS products.

SCORING CRITERIA (1-10 for each):
1. **Complexity Score**: Does it require real logic, calculations, state management? (Higher = more complex features)
2. **Functionality Score**: How many interactive features does it have? (Higher = more features beyond basic CRUD)
3. **Value Score**: How much value does it provide to users? (Higher = clear, measurable benefits)
4. **Profitability Score**: Can users justify paying $10-50/month? (Higher = clear ROI)
5. **Uniqueness Score**: Is it differentiated from existing solutions? (Higher = more unique)

SCORING GUIDELINES:
- Prioritize apps with COMPLEX LOGIC over simple forms
- Favor apps with MULTIPLE FEATURES over single-purpose tools
- Reward apps that SOLVE EXPENSIVE PROBLEMS
- Penalize oversaturated ideas (todo lists, recipe generators, basic calculators)
- Boost apps with DATA ANALYTICS, AUTOMATION, or TIME-SAVING features

Existing apps (avoid similar): ${existingNames.join(", ") || "None"}

Ideas to evaluate:
${JSON.stringify(ideas, null, 2)}

Return ONLY a JSON array with scores (no markdown, no explanations):
[
  {
    "index": 0,
    "complexityScore": 8,
    "functionalityScore": 9,
    "valueScore": 7,
    "profitabilityScore": 8,
    "uniquenessScore": 6,
    "totalScore": 38,
    "reasoning": "Why this scored high/low - focus on complexity and functionality"
  }
]

Calculate totalScore as sum of all 5 scores. Prioritize high-complexity, high-functionality apps.`

    const { text: evaluationText } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt: evaluationPrompt,
      temperature: 0.7,
    })

    let evaluations = []
    try {
      const jsonMatch = evaluationText.match(/\[[\s\S]*\]/)?.[0]
      if (jsonMatch) {
        evaluations = JSON.parse(jsonMatch)
      } else {
        throw new Error("No JSON array found")
      }
    } catch (parseError) {
      evaluations = ideas.map((idea: any, idx: number) => ({
        index: idx,
        complexityScore: 5,
        functionalityScore: 5,
        valueScore: 5,
        profitabilityScore: 5,
        uniquenessScore: 5,
        totalScore: 25,
        reasoning: "Default scoring",
      }))
    }

    const evaluatedIdeas = ideas.map((idea: any, idx: number) => {
      const evalData = evaluations.find((e: any) => e.index === idx) || evaluations[idx] || {}
      return {
        ...idea,
        scores: {
          complexity: evalData.complexityScore || 0,
          functionality: evalData.functionalityScore || 0,
          value: evalData.valueScore || 0,
          profitability: evalData.profitabilityScore || 0,
          uniqueness: evalData.uniquenessScore || 0,
          total: evalData.totalScore || 0,
        },
        evaluation: evalData.reasoning || "",
      }
    })

    evaluatedIdeas.sort((a: any, b: any) => b.scores.total - a.scores.total)

    return Response.json({ evaluatedIdeas })
  } catch (error: any) {
    console.error("[v0] Error evaluating ideas:", error.message, error)
    const errorDetails = error.cause?.message || error.message || String(error)
    return Response.json({ 
      error: "Failed to evaluate ideas", 
      details: errorDetails,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}
