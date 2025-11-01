"use client"

import { useState } from "react"
import { useApps } from "@/hooks/use-apps"
import { useConfiguration } from "@/hooks/use-configuration"
import { AppCard } from "@/components/app-card"

type StatusFilter = "all" | "pending" | "building" | "completed" | "failed"

export function AppsGallery() {
  const { apps, isLoading, refetch } = useApps()
  const { config } = useConfiguration()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest")

  const filteredApps = apps
    ?.filter((app: any) => statusFilter === "all" || app.app_status === statusFilter)
    .sort((a: any, b: any) => {
      const timeA = new Date(a.generated_at).getTime()
      const timeB = new Date(b.generated_at).getTime()
      return sortBy === "newest" ? timeB - timeA : timeA - timeB
    })

  const statusCounts = {
    all: apps?.length || 0,
    pending: apps?.filter((a: any) => a.app_status === "pending").length || 0,
    building: apps?.filter((a: any) => a.app_status === "building").length || 0,
    completed: apps?.filter((a: any) => a.app_status === "completed").length || 0,
    failed: apps?.filter((a: any) => a.app_status === "failed").length || 0,
  }

  const handleDeleteApp = () => {
    refetch()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Autonomous Startup Builder</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {filteredApps?.length || 0} {filteredApps?.length === 1 ? "app generated" : "apps generated"} automatically
          </p>
          {config?.cron_interval_minutes && (
            <p className="text-xs text-muted-foreground mt-1">
              Building new apps every {config.cron_interval_minutes} minutes
            </p>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap items-center">
        <div className="flex gap-1 border border-border rounded-lg p-1 bg-muted overflow-x-auto">
          {(["all", "pending", "building", "completed", "failed"] as StatusFilter[]).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors capitalize whitespace-nowrap ${
                statusFilter === status
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {status}
              <span className="text-xs opacity-70 ml-1">({statusCounts[status]})</span>
            </button>
          ))}
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "newest" | "oldest")}
          className="px-3 py-1.5 text-xs border border-border rounded-lg bg-background text-foreground hover:bg-muted transition-colors cursor-pointer"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      {/* Apps Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-border rounded-lg p-4 animate-pulse h-48 bg-muted" />
          ))}
        </div>
      ) : filteredApps && filteredApps.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredApps.map((app: any) => (
            <AppCard key={app.id} app={app} onDelete={handleDeleteApp} />
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-border rounded-lg p-12 text-center bg-muted/30">
          {apps && apps.length > 0 ? (
            <>
              <p className="text-muted-foreground font-medium">No apps in this filter</p>
              <p className="text-sm text-muted-foreground mt-1">Try a different status</p>
            </>
          ) : (
            <>
              <p className="text-muted-foreground font-medium">No apps yet</p>
              <p className="text-sm text-muted-foreground mt-1">Configure your API key and cron interval. The system will automatically generate and build apps.</p>
            </>
          )}
        </div>
      )}

      {/* Stats */}
      {apps && apps.length > 0 && (
        <div className="border border-border rounded-lg p-4 bg-muted grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground font-medium uppercase">Total</p>
            <p className="text-2xl font-semibold mt-2">{apps.length}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground font-medium uppercase">Completed</p>
            <p className="text-2xl font-semibold mt-2 text-foreground">{statusCounts.completed}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground font-medium uppercase">Building</p>
            <p className="text-2xl font-semibold mt-2">{statusCounts.building}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground font-medium uppercase">Pending</p>
            <p className="text-2xl font-semibold mt-2">{statusCounts.pending}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground font-medium uppercase">Failed</p>
            <p className="text-2xl font-semibold mt-2">{statusCounts.failed}</p>
          </div>
        </div>
      )}
    </div>
  )
}
