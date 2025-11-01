import { processCronJobs } from "@/lib/cron-scheduler"

export const maxDuration = 60

export async function GET(req: Request) {
  // Verify the request has the correct authorization header
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await processCronJobs()
    return Response.json({
      success: true,
      message: `Processed ${result.processed} cron jobs`,
      processed: result.processed,
    })
  } catch (error: any) {
    console.error("Cron endpoint error:", error)
    return Response.json(
      {
        error: "Failed to process cron jobs",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

export async function POST(req: Request) {
  return GET(req)
}
