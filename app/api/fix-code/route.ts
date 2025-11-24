import { generateText } from "ai"
import { google } from "@ai-sdk/google"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.NEON_NEON_DATABASE_URL!)

export async function POST(req: Request) {
  try {
    const { appId, originalCode, error } = await req.json()

    if (!appId || !originalCode || !error) {
      return Response.json(
        { error: "Missing required fields: appId, originalCode, error" },
        { status: 400 }
      )
    }

    console.log(`[v0] Fixing code for app ${appId}...`)
    console.log(`[v0] Error: ${error}`)

    const systemPrompt = `You are an expert code debugger. Your job is to fix syntax and runtime errors in React/TypeScript code.

CRITICAL RULES:
1. Fix the specific error mentioned
2. Maintain all existing functionality
3. Do NOT add file delimiters like "--- FILE: path ---"
4. Do NOT use markdown code fences (backticks)
5. Return ONLY the fixed, executable code
6. Preserve the original structure and logic
7. Fix syntax errors carefully (missing semicolons, brackets, quotes, etc.)
8. Ensure all JSX is valid and properly escaped

OUTPUT FORMAT:
Return ONLY the complete, corrected TypeScript/JSX code. No explanations, no markdown, no delimiters.`

    const userPrompt = `Fix this code that has the following error:

ERROR:
${error}

ORIGINAL CODE:
${originalCode}

Return the FIXED code only (no markdown, no explanations).`

    const { text: fixedCode } = await generateText({
      model: google("gemini-2.5-flash"),
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.3, // Lower temperature for more precise fixes
    })

    // Sanitize the fixed code
    let sanitized = fixedCode
    sanitized = sanitized.replace(/^---\s*FILE:.*?---\s*$/gm, '')
    sanitized = sanitized.replace(/^```[\w]*\s*$/gm, '')
    sanitized = sanitized.split('\n').filter(line => {
      const trimmed = line.trim()
      return trimmed !== '```' && !trimmed.match(/^```[\w]+$/)
    }).join('\n')

    // Update the database with fixed code
    await sql`
      UPDATE generated_apps 
      SET app_code = ${sanitized}
      WHERE id = ${appId}
    `

    console.log(`[v0] Code fixed and saved for app ${appId}`)

    return Response.json({
      success: true,
      fixedCode: sanitized,
      message: "Code fixed successfully",
    })
  } catch (error: any) {
    console.error("[v0] Error fixing code:", error)
    return Response.json(
      {
        error: "Failed to fix code",
        details: error.message,
      },
      { status: 500 }
    )
  }
}
