"use client"

import { useState } from "react"

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

const highlightCode = (code: string) => {
  const lines = code.split("\n")
  return lines.map((line, i) => {
    const parts: React.ReactNode[] = []
    let remaining = line

    const keywords = ["import", "export", "const", "function", "default", "interface", "type", "return", "from", "async", "await", "if", "else", "for", "while", "try", "catch"]
    const keywordPattern = new RegExp(`\\b(${keywords.join("|")})\\b`)
    
    if (keywordPattern.test(remaining)) {
      const match = remaining.match(keywordPattern)
      if (match) {
        const before = remaining.substring(0, remaining.indexOf(match[0]))
        const after = remaining.substring(remaining.indexOf(match[0]) + match[0].length)
        if (before) parts.push(<span key={`b-${i}`} className="text-foreground">{before}</span>)
        parts.push(<span key={`kw-${i}`} className="text-blue-400">{match[0]}</span>)
        if (after) parts.push(<span key={`a-${i}`} className="text-foreground">{after}</span>)
        remaining = ""
      }
    }

    if (remaining.includes('"use client"')) {
      const match = remaining.match(/"use client"/)
      if (match) {
        const before = remaining.substring(0, remaining.indexOf(match[0]))
        const after = remaining.substring(remaining.indexOf(match[0]) + match[0].length)
        if (before) parts.push(<span key={`b-str-${i}`} className="text-foreground">{before}</span>)
        parts.push(<span key={`str-${i}`} className="text-green-400">{match[0]}</span>)
        if (after) parts.push(<span key={`a-str-${i}`} className="text-foreground">{after}</span>)
        remaining = ""
      }
    }

    if (remaining.includes("useState") || remaining.includes("useEffect")) {
      const hookPattern = /\b(useState|useEffect|useRef|useCallback|useMemo)\b/
      const match = remaining.match(hookPattern)
      if (match) {
        const before = remaining.substring(0, remaining.indexOf(match[0]))
        const after = remaining.substring(remaining.indexOf(match[0]) + match[0].length)
        if (before) parts.push(<span key={`b-hook-${i}`} className="text-foreground">{before}</span>)
        parts.push(<span key={`hook-${i}`} className="text-purple-400">{match[0]}</span>)
        if (after) parts.push(<span key={`a-hook-${i}`} className="text-foreground">{after}</span>)
        remaining = ""
      }
    }

    if (remaining.includes('"') || remaining.includes("'")) {
      const stringPattern = /(["'])(?:(?=(\\?))\2.)*?\1/
      const match = remaining.match(stringPattern)
      if (match) {
        const before = remaining.substring(0, remaining.indexOf(match[0]))
        const after = remaining.substring(remaining.indexOf(match[0]) + match[0].length)
        if (before) parts.push(<span key={`b-quote-${i}`} className="text-foreground">{before}</span>)
        parts.push(<span key={`quote-${i}`} className="text-green-400">{match[0]}</span>)
        if (after) parts.push(<span key={`a-quote-${i}`} className="text-foreground">{after}</span>)
        remaining = ""
      }
    }

    if (remaining.trim()) {
      parts.push(<span key={`rest-${i}`} className="text-foreground">{remaining}</span>)
    }

    return parts.length > 0 ? parts : <span key={`line-${i}`} className="text-foreground">{line || " "}</span>
  })
}

export function CodeViewer({ code, appName }: { code: string; appName: string }) {
  const [copied, setCopied] = useState(false)
  const [activeFile, setActiveFile] = useState(0)
  
  const files = parseCodeFiles(code)
  const activeCode = files[activeFile]

  const handleCopy = () => {
    navigator.clipboard.writeText(activeCode.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="border-t border-border bg-muted/30 dark:bg-background/20">
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-mono text-sm font-semibold text-foreground">Generated Code</h4>
          <button
            onClick={handleCopy}
            className="px-3 py-1 text-xs border border-border rounded hover:bg-muted transition-colors"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        {files.length > 1 && (
          <div className="flex gap-2 border-b border-border overflow-x-auto">
            {files.map((file, index) => {
              const fileName = file.path.split("/").pop() || file.path
              return (
                <button
                  key={index}
                  onClick={() => setActiveFile(index)}
                  className={`px-3 py-2 text-xs font-mono transition-colors border-b-2 -mb-[1px] whitespace-nowrap ${
                    activeFile === index
                      ? "border-purple-400 text-purple-400"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {fileName}
                </button>
              )
            })}
          </div>
        )}

        <div className="border border-border bg-muted/60 dark:bg-background/50 rounded-lg overflow-hidden">
          <div className="px-4 py-2 bg-muted/80 dark:bg-background/70 border-b border-border flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="ml-2 text-xs text-muted-foreground font-mono">{activeCode.path}</span>
          </div>
          <pre className="p-4 font-mono text-xs overflow-x-auto max-h-96 overflow-y-auto space-y-0">
            <code>
              {highlightCode(activeCode.content)}
            </code>
          </pre>
        </div>
      </div>
    </div>
  )
}
