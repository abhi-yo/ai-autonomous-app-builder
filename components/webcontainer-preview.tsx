"use client"

import { useRef, useState } from "react"

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { WebContainer as WebContainerApi } from "@webcontainer/api"

interface WebcontainerPreviewProps {
  appName: string
  code: string
  appId?: string // Add appId for code fixing
}

export function WebcontainerPreview({ appName, code, appId }: WebcontainerPreviewProps) {
  const [status, setStatus] = useState<"idle" | "starting" | "ready" | "error">("idle")
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isFixing, setIsFixing] = useState(false)
  const [buildError, setBuildError] = useState<string | null>(null)
  const wcRef = useRef<any>(null)
  const startedRef = useRef(false)

  const handleStart = async () => {
    if (startedRef.current || !code || typeof window === "undefined") return
    startedRef.current = true

    try {
      setStatus("starting")
      setError(null)
      setBuildError(null)

      const webcontainer = wcRef.current ?? (await WebContainerApi.boot())
      wcRef.current = webcontainer

      const files: any = {
        "index.html": {
          file: {
            contents: `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${appName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,
          },
        },
        "package.json": {
          file: {
            contents: JSON.stringify(
              {
                name: appName.toLowerCase().replace(/\s+/g, "-"),
                private: true,
                scripts: {
                  dev: "vite",
                },
                dependencies: {
                  react: "^18.0.0",
                  "react-dom": "^18.0.0",
                },
                devDependencies: {
                  vite: "^5.0.0",
                  typescript: "^5.0.0",
                },
              },
              null,
              2
            ),
          },
        },
        "tsconfig.json": {
          file: {
            contents: JSON.stringify(
              {
                compilerOptions: {
                  target: "ESNext",
                  module: "ESNext",
                  moduleResolution: "Node",
                  jsx: "react-jsx",
                  strict: true,
                  esModuleInterop: true,
                },
                include: ["src"],
              },
              null,
              2
            ),
          },
        },
        src: {
          directory: {
            "main.tsx": {
              file: {
                contents: code,
              },
            },
          },
        },
      }

      console.log("[webcontainer] mounting files")
      await webcontainer.mount(files)

      console.log("[webcontainer] npm install")
      const install = await webcontainer.spawn("npm", ["install"])
      install.output.pipeTo(
        new WritableStream({
          write(data) {
            console.log("[webcontainer:npm]", data)
          },
        })
      )
      const installExitCode = await install.exit
      console.log("[webcontainer] npm install exit", installExitCode)
      if (installExitCode !== 0) {
        throw new Error("npm install failed")
      }

      console.log("[webcontainer] npm run dev")
      const server = await webcontainer.spawn("npm", [
        "run",
        "dev",
        "--",
        "--host",
        "0.0.0.0",
        "--port",
        "5173",
      ])

      server.output.pipeTo(
        new WritableStream({
          write(data) {
            console.log("[webcontainer:dev]", data)
            // Detect build errors
            if (data.includes("ERROR:") || data.includes("Transform failed") || data.includes("error:")) {
              console.log("[webcontainer] Build error detected:", data)
              setBuildError(data)
            }
          },
        })
      )

      webcontainer.on("server-ready", (_port: number, url: string) => {
        console.log("[webcontainer] server ready", _port, url)
        setPreviewUrl(url)
        setStatus("ready")
      })
    } catch (e: any) {
      console.error("Webcontainer error", e)
      setError(e?.message ?? "Failed to start webcontainer")
      setStatus("error")
    }
  }

  const handleFixCode = async () => {
    if (!appId || !buildError) return

    setIsFixing(true)
    try {
      console.log("[webcontainer] Requesting code fix...")
      const response = await fetch("/api/fix-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appId,
          originalCode: code,
          error: buildError,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to fix code")
      }

      const data = await response.json()
      console.log("[webcontainer] Code fixed, reloading page...")
      
      // Reload the page to show the fixed code
      window.location.reload()
    } catch (error: any) {
      console.error("[webcontainer] Fix failed:", error)
      alert("Failed to fix code: " + error.message)
    } finally {
      setIsFixing(false)
    }
  }

  if (!code) {
    return <div className="text-xs text-muted-foreground">No code to preview.</div>
  }

  if (status === "idle") {
    return (
      <button
        onClick={handleStart}
        className="px-3 py-1.5 text-xs border border-border rounded hover:bg-muted transition-colors"
      >
        🚀 Run in WebContainer
      </button>
    )
  }

  if (status === "starting") {
    return (
      <div className="border rounded-md p-3 text-xs text-muted-foreground space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-t-transparent border-foreground rounded-full animate-spin"></div>
          <span>Booting WebContainer and installing dependencies…</span>
        </div>
        <p className="text-[10px] opacity-60">Check browser console for detailed logs</p>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="border border-destructive/40 rounded-md p-3 text-xs space-y-2">
        <p className="text-destructive font-medium">Failed to start WebContainer</p>
        <p className="text-muted-foreground">{error}</p>
        <button
          onClick={() => {
            startedRef.current = false
            setStatus("idle")
            setError(null)
          }}
          className="px-2 py-1 text-[10px] border border-border rounded hover:bg-muted transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (status === "ready" && previewUrl) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>✓ WebContainer running</span>
          <div className="flex items-center gap-2">
            {buildError && appId && (
              <button
                onClick={handleFixCode}
                disabled={isFixing}
                className="px-2 py-1 text-[10px] bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                {isFixing ? "Fixing..." : "🔧 Fix Code"}
              </button>
            )}
            <button
              onClick={() => window.open(previewUrl, "_blank")}
              className="px-2 py-1 text-[10px] border border-border rounded hover:bg-muted transition-colors"
            >
              Open in new tab
            </button>
          </div>
        </div>
        {buildError && (
          <div className="text-[10px] bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded p-2 text-orange-900 dark:text-orange-200">
            <p className="font-medium mb-1">⚠️ Build Error Detected</p>
            <pre className="text-[9px] overflow-x-auto whitespace-pre-wrap">{buildError.substring(0, 200)}...</pre>
            {appId && <p className="mt-1 text-orange-600 dark:text-orange-400">Click "Fix Code" to auto-repair</p>}
          </div>
        )}
        <iframe
          src={previewUrl}
          className="w-full h-[480px] border rounded-md bg-white"
          sandbox="allow-scripts allow-same-origin allow-forms"
        />
      </div>
    )
  }

  return null
}
