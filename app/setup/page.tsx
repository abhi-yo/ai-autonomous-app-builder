"use client"

import { useState } from "react"
import { ThemeSwitcher } from "@/components/theme-switcher"

export default function SetupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<{
    type: "idle" | "loading" | "success" | "error"
    message: string
  }>({ type: "idle", message: "" })

  const handleSetup = async () => {
    setIsLoading(true)
    setStatus({ type: "loading", message: "Initializing database..." })

    try {
      const response = await fetch("/api/setup", {
        method: "POST",
      })

      const data = await response.json()

      if (data.success) {
        setStatus({
          type: "success",
          message: "Database initialized successfully! Redirecting...",
        })
        setTimeout(() => {
          window.location.href = "/"
        }, 2000)
      } else {
        setStatus({
          type: "error",
          message: `Setup failed: ${data.error}`,
        })
      }
    } catch (error) {
      setStatus({
        type: "error",
        message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold tracking-tight">AI App Builder</h1>
          <ThemeSwitcher />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="border border-border rounded-lg p-8 text-center space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Database Setup</h2>
              <p className="text-sm text-muted-foreground">Initialize your Neon PostgreSQL database to get started</p>
            </div>

            <button
              onClick={handleSetup}
              disabled={isLoading || status.type === "success"}
              className="w-full px-6 py-3 bg-foreground text-background rounded hover:opacity-80 disabled:opacity-50 transition-opacity font-medium"
            >
              {isLoading ? "Setting up..." : "Initialize Database"}
            </button>

            {status.message && (
              <div
                className={`text-sm p-3 rounded border ${
                  status.type === "success"
                    ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-900 dark:text-green-100"
                    : status.type === "error"
                      ? "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100"
                      : "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100"
                }`}
              >
                {status.message}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
