"use client"

import { useState } from "react"

export function CodeViewer({ code, appName }: { code: string; appName: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="border-t border-border p-4 bg-foreground text-background space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-mono text-sm font-bold">{appName} - Generated Code</h4>
        <button
          onClick={handleCopy}
          className="px-2 py-1 text-xs border border-background rounded hover:bg-background/10 transition-colors"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      <pre className="overflow-x-auto bg-background text-foreground p-3 rounded text-xs font-mono max-h-96 overflow-y-auto border border-border/50">
        <code>{code}</code>
      </pre>
    </div>
  )
}
