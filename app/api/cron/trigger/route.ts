import { processCronJobs } from "@/lib/cron-scheduler"

export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const result = await processCronJobs()
    return Response.json({
      success: true,
      message: `Manually triggered ${result.processed} cron jobs`,
      processed: result.processed,
    })
  } catch (error: any) {
    console.error("Manual trigger error:", error)
    return Response.json(
      {
        error: "Failed to trigger cron jobs",
        details: error.message,
      },
      { status: 500 },
    )
  }
}


