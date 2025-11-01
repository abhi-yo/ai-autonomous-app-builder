import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.NEON_NEON_DATABASE_URL!)

export async function initializeCronJobs() {
  try {
    const configs = await sql`
      SELECT c.id, c.cron_interval_minutes 
      FROM configurations c
      WHERE c.ai_api_key IS NOT NULL
    `

    for (const config of configs) {
      const existing = await sql`SELECT id, next_run FROM cron_jobs WHERE config_id = ${config.id}`

      if (existing.length === 0) {
        const nextRun = new Date(Date.now() + config.cron_interval_minutes * 60000)
        await sql`
          INSERT INTO cron_jobs (config_id, status, next_run) 
          VALUES (${config.id}, ${"active"}, ${nextRun})
        `
      } else if (existing[0].next_run === null || new Date(existing[0].next_run) < new Date()) {
        const nextRun = new Date(Date.now() + config.cron_interval_minutes * 60000)
        await sql`
          UPDATE cron_jobs 
          SET next_run = ${nextRun}, status = ${"active"}
          WHERE config_id = ${config.id}
        `
      }
    }
  } catch (error) {
    console.error("[v0] Error initializing cron jobs:", error)
  }
}

export async function processCronJobs() {
  try {
    const now = new Date()
    const baseUrl = process.env.NEXTAUTH_URL || 
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")

    const dueCrons = await sql`
      SELECT cj.*, c.cron_interval_minutes, c.ai_api_key, c.id as config_id
      FROM cron_jobs cj
      JOIN configurations c ON cj.config_id = c.id
      WHERE cj.status = 'active' 
      AND (cj.next_run IS NULL OR cj.next_run <= NOW())
      AND c.ai_api_key IS NOT NULL
    `

    for (const cron of dueCrons) {
      try {
        console.log(`[v0] Starting autonomous build cycle for config ${cron.config_id}`)

        const ideasResponse = await fetch(`${baseUrl}/api/generate-ideas`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ config_id: cron.config_id, count: 10 }),
        })

        if (!ideasResponse.ok) {
          const errorData = await ideasResponse.json().catch(() => ({}))
          const errorMsg = errorData.details || errorData.error || ideasResponse.statusText
          console.error(`[v0] Error from generate-ideas API: ${errorMsg}`)
          throw new Error(`Failed to generate ideas: ${errorMsg}`)
        }

        const ideasData = await ideasResponse.json()
        const ideas = ideasData.ideas

        if (!ideas || ideas.length === 0) {
          throw new Error("No ideas generated")
        }

        console.log(`[v0] Generated ${ideas.length} ideas, evaluating...`)

        const evaluateResponse = await fetch(`${baseUrl}/api/evaluate-ideas`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ config_id: cron.config_id, ideas }),
        })

        if (!evaluateResponse.ok) {
          const errorData = await evaluateResponse.json().catch(() => ({}))
          const errorMsg = errorData.details || errorData.error || evaluateResponse.statusText
          console.error(`[v0] Error from evaluate-ideas API: ${errorMsg}`)
          throw new Error(`Failed to evaluate ideas: ${errorMsg}`)
        }

        const evaluatedData = await evaluateResponse.json()
        const evaluatedIdeas = evaluatedData.evaluatedIdeas

        if (!evaluatedIdeas || evaluatedIdeas.length === 0) {
          throw new Error("No evaluated ideas received")
        }

        const bestIdea = evaluatedIdeas[0]
        console.log(`[v0] Selected best idea: "${bestIdea.name}" (Score: ${bestIdea.scores.total})`)

        const ideaString = `Name: ${bestIdea.name}\nDescription: ${bestIdea.description}\nTarget Audience: ${bestIdea.targetAudience}\nProblem: ${bestIdea.problem}\nMonetization: ${bestIdea.monetization}`

        const appResponse = await fetch(`${baseUrl}/api/generate-app`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ config_id: cron.config_id, app_idea: ideaString }),
        })

        if (!appResponse.ok) {
          throw new Error("Failed to generate app")
        }

        const nextRun = new Date(now.getTime() + cron.cron_interval_minutes * 60000)

        await sql`
          UPDATE cron_jobs 
          SET last_run = NOW(), next_run = ${nextRun}, status = 'active', error_message = NULL
          WHERE id = ${cron.id}
        `

        console.log(`[v0] Autonomous build completed for config ${cron.config_id}, next run: ${nextRun}`)
      } catch (error: any) {
        console.error(`[v0] Error processing cron job ${cron.id}:`, error)

        const nextRun = new Date(now.getTime() + 5 * 60000)
        await sql`
          UPDATE cron_jobs 
          SET error_message = ${error.message}, next_run = ${nextRun}, status = 'active'
          WHERE id = ${cron.id}
        `
      }
    }

    return { processed: dueCrons.length }
  } catch (error) {
    console.error("[v0] Error processing cron jobs:", error)
    return { processed: 0, error: error }
  }
}
