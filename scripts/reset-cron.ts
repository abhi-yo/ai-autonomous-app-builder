import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.NEON_NEON_DATABASE_URL!)

async function resetCron() {
  try {
    console.log("Setting up cron job schedule...")
    
    // Get cron jobs with their intervals
    const jobs = await sql`
      SELECT cj.id, cj.config_id, c.cron_interval_minutes
      FROM cron_jobs cj
      JOIN configurations c ON cj.config_id = c.id
      WHERE cj.status = 'active'
    `
    
    console.log(`Found ${jobs.length} active cron jobs`)
    
    for (const job of jobs) {
      // Set next run to NOW - 1 minute (so it triggers immediately)
      const nextRunTime = new Date(Date.now() - 60 * 1000) // 1 minute ago
      const lastRunTime = new Date(Date.now() - job.cron_interval_minutes * 60 * 1000)
      
      const result = await sql`
        UPDATE cron_jobs 
        SET next_run = ${nextRunTime},
            last_run = ${lastRunTime},
            error_message = NULL
        WHERE id = ${job.id}
        RETURNING id, next_run, last_run
      `
      
      const updated = result[0]
      const nextRunDate = new Date(updated.next_run)
      
      console.log(`✅ Job ${job.id}:`)
      console.log(`   Next run: ${nextRunDate.toLocaleString()} (NOW - ready to trigger!)`)
    }
    
    console.log("\n🎯 Cron jobs are set to trigger immediately!")
    console.log("Click 'Run Now' button in the dashboard to start generating apps.")
  } catch (error) {
    console.error("Error setting up cron schedule:", error)
  }
}

resetCron()
