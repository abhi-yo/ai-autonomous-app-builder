"use client"

import { useState } from "react"
import { CodeViewer } from "./code-viewer"
import { PreviewViewer } from "./preview-viewer"
import { TrashIcon, CodeBracketIcon, ChevronDownIcon, ChevronUpIcon, ArrowDownTrayIcon, EyeIcon } from "@heroicons/react/24/outline"

export function AppCard({ app, onDelete }: { app: any; onDelete?: (id: string) => void }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showCode, setShowCode] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const statusColors = {
    pending: "bg-muted text-muted-foreground border border-border",
    building: "bg-muted text-muted-foreground border border-border",
    completed: "bg-foreground text-background",
    failed: "bg-muted text-muted-foreground border border-border",
  }

  const statusIcons = {
    pending: "⏳",
    building: "⚙️",
    completed: "✓",
    failed: "✗",
  }

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this app?")) return

    try {
      const response = await fetch(`/api/apps/${app.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        onDelete?.(app.id)
      }
    } catch (error) {
      console.error("Failed to delete app:", error)
    }
  }

  const handleExport = () => {
    if (!app.app_code) return

    const files = parseCodeFiles(app.app_code)
    const zipData: Record<string, string> = {}

    files.forEach((file) => {
      zipData[file.path] = file.content
    })

    const exportData = {
      appName: app.app_name,
      description: app.app_description,
      prompt: app.app_prompt,
      generatedAt: app.generated_at,
      completedAt: app.completed_at,
      files: zipData,
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${app.app_name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_export.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const parseCodeFiles = (code: string) => {
    const files: Array<{ path: string; content: string }> = []
    const filePattern = /--- FILE: ([^\n]+) ---\n([\s\S]*?)(?=--- FILE:|$)/g
    let match

    while ((match = filePattern.exec(code)) !== null) {
      files.push({
        path: match[1].trim(),
        content: match[2].trim(),
      })
    }

    if (files.length === 0) {
      files.push({
        path: "app.tsx",
        content: code,
      })
    }

    return files
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="p-4 bg-background border-b border-border">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base truncate">{app.app_name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">{app.app_description}</p>
          </div>
          <span
            className={`px-3 py-1 text-xs rounded font-medium whitespace-nowrap flex items-center gap-1 ${statusColors[app.app_status as keyof typeof statusColors]}`}
          >
            <span>{statusIcons[app.app_status as keyof typeof statusIcons]}</span>
            {app.app_status}
          </span>
        </div>

        <div className="text-xs text-muted-foreground mb-3">
          {app.generated_at && <p>Generated: {new Date(app.generated_at).toLocaleString()}</p>}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1.5 text-xs border border-border rounded hover:bg-muted transition-colors flex items-center gap-1"
          >
            {isExpanded ? (
              <>
                <ChevronUpIcon className="w-3.5 h-3.5" />
                Hide
              </>
            ) : (
              <>
                <ChevronDownIcon className="w-3.5 h-3.5" />
                Show
              </>
            )}
            Details
          </button>
          {app.app_code && (
            <>
              <button
                onClick={() => setShowCode(!showCode)}
                className="px-3 py-1.5 text-xs border border-border rounded hover:bg-muted transition-colors flex items-center gap-1"
              >
                <CodeBracketIcon className="w-3.5 h-3.5" />
                {showCode ? "Hide" : "View"} Code
              </button>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="px-3 py-1.5 text-xs border border-border rounded hover:bg-muted transition-colors flex items-center gap-1"
              >
                <EyeIcon className="w-3.5 h-3.5" />
                {showPreview ? "Hide" : "View"} Preview
              </button>
              <button
                onClick={handleExport}
                className="px-3 py-1.5 text-xs border border-border rounded hover:bg-muted transition-colors flex items-center gap-1"
              >
                <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                Export
              </button>
            </>
          )}
          <button
            onClick={handleDelete}
            className="px-3 py-1.5 text-xs border border-border rounded hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground ml-auto flex items-center gap-1"
          >
            <TrashIcon className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 bg-muted space-y-3 text-sm">
          <div>
            <p className="font-semibold text-foreground mb-1">Prompt</p>
            <p className="text-muted-foreground">{app.app_prompt}</p>
          </div>

          {app.app_error && (
            <div>
              <p className="font-semibold text-foreground mb-1">Error</p>
              <p className="text-muted-foreground bg-background p-2 rounded border border-border text-xs font-mono">
                {app.app_error}
              </p>
            </div>
          )}

          {app.completed_at && (
            <div>
              <p className="font-semibold text-foreground mb-1">Completed</p>
              <p className="text-muted-foreground">{new Date(app.completed_at).toLocaleString()}</p>
            </div>
          )}
        </div>
      )}

      {showCode && app.app_code && <CodeViewer code={app.app_code} appName={app.app_name} />} 
      {showPreview && <PreviewViewer appId={app.id} />}
    </div>
  )
}
