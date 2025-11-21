"use client"

import { useState, useEffect } from "react"
import { ClockIcon, CheckCircleIcon, ExclamationTriangleIcon, ChevronDownIcon, ChevronUpIcon, PlayIcon } from "@heroicons/react/24/outline"

interface CronJob {
  id: string
  config_id: string
  last_run: string | null
  next_run: string | null
  status: string
  error_message: string | null
  cron_interval_minutes: number
}

export function CronDashboard() {
  const [crons, setCrons] = useState<CronJob[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedCrons, setExpandedCrons] = useState<Set<string>>(new Set())
  const [isTriggering, setIsTriggering] = useState(false)

  useEffect(() => {
    fetchCronStatus()
    const interval = setInterval(fetchCronStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchCronStatus = async () => {
    try {
      const response = await fetch("/api/cron/status")
      if (!response.ok) {
        console.error("Failed to fetch cron status:", await response.text())
        setCrons([])
        return
      }
      const data = await response.json()
      setCrons(Array.isArray(data.crons) ? data.crons : [])
    } catch (error) {
      console.error("Failed to fetch cron status:", error)
      setCrons([])
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "--"
    return new Date(dateString).toLocaleString()
  }

  const formatTimeRemaining = (nextRunString: string | null) => {
    if (!nextRunString) return "--"

    const nextRun = new Date(nextRunString)
    const now = new Date()
    const diff = nextRun.getTime() - now.getTime()

    if (diff <= 0) return "running..."

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const toggleExpanded = (cronId: string) => {
    const newExpanded = new Set(expandedCrons)
    if (newExpanded.has(cronId)) {
      newExpanded.delete(cronId)
    } else {
      newExpanded.add(cronId)
    }
    setExpandedCrons(newExpanded)
  }

  const handleManualTrigger = async () => {
    console.log("[CronDashboard] Manual trigger clicked")
    setIsTriggering(true)
    try {
      console.log("[CronDashboard] Calling /api/cron/trigger...")
      const response = await fetch("/api/cron/trigger", {
        method: "POST",
      })
      const data = await response.json()
      console.log("[CronDashboard] Trigger response:", { ok: response.ok, status: response.status, data })
      
      if (response.ok) {
        console.log("[CronDashboard] Trigger successful, refreshing status...")
        setTimeout(() => fetchCronStatus(), 2000)
      } else {
        console.error("[CronDashboard] Trigger failed:", data)
        alert(`Failed to trigger: ${data.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error("[CronDashboard] Failed to trigger cron:", error)
      alert(`Error: ${error}`)
    } finally {
      setIsTriggering(false)
    }
  }

  if (isLoading) {
    return (
      <div className="border border-border rounded-lg p-4 bg-background animate-pulse">
        <div className="h-4 bg-muted rounded w-32 mb-4"></div>
        <div className="space-y-2">
          <div className="h-12 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  const activeCrons = crons.filter(c => c.status === 'active' && !c.error_message)
  const errorCrons = crons.filter(c => c.error_message).slice(0, 1)

  return (
    <section className="border border-border rounded-lg p-5 bg-background space-y-4 hover:border-foreground/20 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ClockIcon className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm uppercase tracking-wide">Cron Status</h3>
        </div>
        <button
          onClick={handleManualTrigger}
          disabled={isTriggering || crons.length === 0}
          className="px-3 py-1.5 bg-foreground text-background rounded-md text-xs font-medium hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
        >
          <PlayIcon className="w-3.5 h-3.5" />
          {isTriggering ? "Running..." : "Run Now"}
        </button>
      </div>

      {crons.length === 0 ? (
        <p className="text-xs text-muted-foreground">No cron jobs configured</p>
      ) : (
        <div className="space-y-2">
          {[...activeCrons, ...errorCrons].map((cron) => (
            <div
              key={cron.id}
              className="text-xs bg-muted rounded-md border border-border hover:border-foreground/20 transition-colors overflow-hidden"
            >
              <button
                onClick={() => toggleExpanded(cron.id)}
                className="w-full p-3 space-y-2 text-left hover:bg-muted/80 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {cron.error_message ? (
                      <ExclamationTriangleIcon className="w-4 h-4 text-destructive" />
                    ) : cron.status === "active" ? (
                      <CheckCircleIcon className="w-4 h-4 text-foreground" />
                    ) : (
                      <ClockIcon className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className="font-medium capitalize">{cron.error_message ? "Error" : cron.status}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Every {Math.floor(cron.cron_interval_minutes / 1440)}d</span>
                    {expandedCrons.has(cron.id) ? (
                      <ChevronUpIcon className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDownIcon className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </div>

                <div className="text-muted-foreground flex items-center justify-between">
                  <span>Next run: {formatTimeRemaining(cron.next_run)}</span>
                  {cron.last_run && <span className="text-xs">Last: {formatDate(cron.last_run)}</span>}
                </div>
              </button>

              {expandedCrons.has(cron.id) && (
                <div className="px-3 pb-3 space-y-2 border-t border-border pt-2">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Config ID</p>
                      <p className="font-mono text-foreground break-all">{cron.config_id.substring(0, 8)}...</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <p className="font-medium capitalize">{cron.status}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Run</p>
                      <p className="font-medium">{formatDate(cron.last_run)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Next Run</p>
                      <p className="font-medium">{formatDate(cron.next_run)}</p>
                    </div>
                  </div>

                  {cron.error_message && (
                    <div className="bg-background p-2 rounded border border-destructive/20">
                      <p className="font-medium text-destructive mb-1 text-xs flex items-center gap-1">
                        <ExclamationTriangleIcon className="w-3 h-3" />
                        Error Details
                      </p>
                      <p className="text-xs text-muted-foreground">{cron.error_message}</p>
                    </div>
                  )}

                  <div className="bg-background p-2 rounded border border-border">
                    <p className="font-medium text-foreground mb-1">What it does:</p>
                    <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Generates 10 unique app ideas</li>
                      <li>Evaluates each for profitability & uniqueness</li>
                      <li>Selects the highest-scoring idea</li>
                      <li>Builds the complete app automatically</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
