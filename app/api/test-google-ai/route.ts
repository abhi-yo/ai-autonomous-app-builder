import { generateText } from "ai"
import { google } from "@ai-sdk/google"

export async function GET() {
  try {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return Response.json({ 
        error: "API key not configured", 
        details: "GOOGLE_GENERATIVE_AI_API_KEY environment variable is not set" 
      }, { status: 500 })
    }

    console.log("[v0] Testing Google AI API...")

    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt: "Say 'Hello, World!' and nothing else.",
    })

    return Response.json({ 
      success: true, 
      message: "Google AI API is working!",
      response: text,
      apiKeyConfigured: true
    })
  } catch (error: any) {
    console.error("[v0] Google AI test error:", error)
    return Response.json({ 
      success: false,
      error: error.message,
      details: error.cause?.message || error.toString(),
      apiKeyConfigured: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY
    }, { status: 500 })
  }
}


