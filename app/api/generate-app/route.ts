import { generateText } from "ai"
import { google } from "@ai-sdk/google"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.NEON_NEON_DATABASE_URL!)

export async function POST(req: Request) {
  let appId: string | null = null
  let errorConfigId: string | null = null
  let errorAppIdea: string | null = null
  
  try {
    const body = await req.json()
    const { config_id, app_idea } = body
    errorConfigId = config_id
    errorAppIdea = app_idea

    const configs = await sql`SELECT * FROM configurations WHERE id = ${config_id}`
    if (configs.length === 0) {
      return Response.json({ error: "Configuration not found" }, { status: 404 })
    }

    const config = configs[0]
    const rules = await sql`SELECT * FROM build_rules WHERE config_id = ${config_id}`

    const appNameMatch = app_idea.match(/Name:\s*([^\n]+)/i)
    const appName = appNameMatch ? appNameMatch[1].trim() : app_idea.split('\n')[0].substring(0, 50)
    const appDescription = app_idea.includes('Description:') 
      ? app_idea.match(/Description:\s*([^\n]+)/i)?.[1]?.trim() || app_idea.substring(0, 200)
      : app_idea.substring(0, 200)

    const appResult = await sql`
      INSERT INTO generated_apps (config_id, app_name, app_description, app_prompt, app_status) 
      VALUES (${config_id}, ${appName}, ${appDescription}, ${app_idea}, ${"building"}) 
      RETURNING *
    `

    appId = appResult[0].id

    // Build the system prompt with rules
    const rulesText = rules.map((r: any) => `- ${r.rule_name}: ${r.rule_description}`).join("\n")

    const systemPrompt = `You are an expert Next.js app builder who creates PRODUCTION-READY, FULLY FUNCTIONAL web applications.

CRITICAL REQUIREMENTS - The app MUST have:
1. REAL FUNCTIONALITY - Not just UI mockups. Implement actual logic, calculations, data processing
2. STATE MANAGEMENT - Use React hooks (useState, useEffect, useReducer) for dynamic behavior
3. FORM HANDLING - Proper input validation, error messages, submission handling
4. DATA PERSISTENCE - Use localStorage or generate realistic data dynamically
5. ERROR HANDLING - Try-catch blocks, user-friendly error messages, loading states
6. INTERACTIVE UI - Buttons that do things, forms that work, real-time updates
7. PROFESSIONAL DESIGN - Proper spacing, typography hierarchy, smooth transitions
8. COMPLETE FEATURES - Every feature mentioned in the idea must be fully implemented

DESIGN REQUIREMENTS:
${rulesText}

TECHNICAL REQUIREMENTS:
- Use only black (#000000) and white (#FFFFFF) colors with gray shades (#f5f5f5, #e5e5e5, #999999)
- Use Tailwind CSS for styling with proper responsive design
- TypeScript with proper type definitions
- Next.js 16 app router with "use client" where needed
- NO external libraries (no axios, no date-fns, no third-party UI libs)
- Include loading states, empty states, error states
- Add smooth animations and transitions
- Make it fully responsive (mobile, tablet, desktop)

CODE STRUCTURE:
- Modular, reusable components
- Clear separation of concerns
- Well-commented code explaining logic
- Proper TypeScript interfaces/types
- Clean, readable code formatting

WHAT NOT TO DO:
❌ NO placeholder/mock UI with "coming soon" or "TODO"
❌ NO fake buttons that don't work
❌ NO hardcoded data that should be dynamic
❌ NO incomplete features
❌ NO lazy instructions like "Cook according to your needs"

Return ONLY valid TypeScript/JSX code. No markdown formatting, no explanations.`

    const userPrompt = `Build a COMPLETE, FULLY FUNCTIONAL Next.js app for: ${app_idea}

REQUIREMENTS:
1. Implement EVERY feature mentioned in the idea description
2. Add real logic - calculations, validations, data transformations
3. Include state management for dynamic behavior
4. Create a beautiful, professional UI with excellent UX
5. Add proper error handling and edge cases
6. Make it production-ready - something users could actually use

STRUCTURE:
Provide complete code with clear file separators:
--- FILE: app/page.tsx ---
[Main page with "use client" if interactive]

--- FILE: components/[ComponentName].tsx ---
[Reusable components with proper props and types]

--- FILE: lib/[utilName].ts ---
[Utility functions, helpers, business logic]

--- FILE: types/index.ts ---
[TypeScript interfaces and types]

Make this app impressive, complete, and truly functional. This should be a real SaaS product, not a demo.`

    // Call AI to generate app code
    const { text: generatedCode } = await generateText({
      model: google("gemini-2.0-flash-exp"),
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.8,
    })

    await sql`
      UPDATE generated_apps 
      SET app_code = ${generatedCode}, app_status = ${"completed"}, completed_at = NOW() 
      WHERE id = ${appId}
    `

    return Response.json({
      id: appId,
      success: true,
      code: generatedCode,
    })
  } catch (error: any) {
    console.error("[v0] Error generating app:", error.message, error)

    try {
      if (appId) {
        await sql`
          UPDATE generated_apps 
          SET app_status = ${"failed"}, app_error = ${error.message || String(error)} 
          WHERE id = ${appId}
        `
      } else if (errorConfigId && errorAppIdea) {
        const appNameMatch = errorAppIdea.match(/Name:\s*([^\n]+)/i)
        const appName = appNameMatch ? appNameMatch[1].trim() : errorAppIdea.split('\n')[0].substring(0, 50)
        
        const recentApp = await sql`
          SELECT id FROM generated_apps 
          WHERE config_id = ${errorConfigId} 
          AND app_name = ${appName}
          AND app_status = ${"building"}
          ORDER BY created_at DESC
          LIMIT 1
        `
        if (recentApp.length > 0) {
          await sql`
            UPDATE generated_apps 
            SET app_status = ${"failed"}, app_error = ${error.message || String(error)} 
            WHERE id = ${recentApp[0].id}
          `
        }
      }
    } catch (updateError) {
      console.error("[v0] Failed to update app status:", updateError)
    }

    return Response.json({ error: "Failed to generate app", details: error.message }, { status: 500 })
  }
}
