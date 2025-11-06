import { neon } from "@neondatabase/serverless"
export const runtime = "nodejs"

const sql = neon(process.env.NEON_NEON_DATABASE_URL!)

function parseFiles(code: string) {
  const files: Record<string, string> = {}
  const re = /--- FILE: ([^\n]+) ---\n([\s\S]*?)(?=--- FILE:|$)/g
  let m
  while ((m = re.exec(code)) !== null) {
    files[m[1].trim()] = m[2].trim()
  }
  if (Object.keys(files).length === 0) files["app/page.tsx"] = code
  return files
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const appRows = await sql`SELECT app_code FROM generated_apps WHERE id = ${id}`
    if (!appRows.length || !appRows[0].app_code) {
      return new Response("<html><body><div>No code</div></body></html>", { headers: { "content-type": "text/html" } })
    }

    const all = parseFiles(appRows[0].app_code as string)
    const normalize = (p: string) => "/" + p.replace(/^\//, "")
    const files = Object.fromEntries(Object.entries(all).map(([k, v]) => [normalize(k), v]))
    const mainPath = Object.keys(files).find((p) => p.includes("app/page.tsx") || p.includes("app/page.ts")) || Object.keys(files)[0]

    const { transform } = await import("sucrase")

    const sanitizeTemplates = (src: string) => {
      const count = (src.match(/`/g) || []).length
      if (count % 2 !== 0) {
        let s = src.replace(/`/g, "'")
        s = s.replace(/\$\{[^}]*\}/g, '')
        return s
      }
      return src
    }

    const balanceQuotes = (src: string) => {
      let out = ''
      let q: '"' | "'" | '`' | null = null
      let escaped = false
      let depth = 0
      for (let i = 0; i < src.length; i++) {
        const ch = src[i]
        if (!q) {
          if ((ch === '"' || ch === "'" || ch === '`') && !escaped) {
            q = ch as any
          }
          out += ch
          escaped = ch === '\\'
          continue
        }
        if (q === '`' && ch === '$' && src[i + 1] === '{') {
          depth++
          out += ''
          while (i < src.length && depth > 0) {
            i++
            const c2 = src[i]
            if (c2 === '{') depth++
            else if (c2 === '}') depth--
          }
          i++
          if (i >= src.length) break
        }
        if (ch === '\n') {
          out += q
          q = null
          out += ch
          escaped = false
          continue
        }
        if (ch === q && !escaped) {
          q = null
          out += ch
          escaped = false
          continue
        }
        out += ch
        escaped = ch === '\\' && !escaped
      }
      if (q) out += q
      return out
    }

    const stripModules = (src: string) => {
      let s = src
        .replace(/^\s*"use client";?/gm, '')
        .replace(/^\s*'use client';?/gm, '')
        .replace(/^\s*import[\s\S]*?;\s*$/gm, '')
        .replace(/export\s+default\s+function\s*([A-Za-z0-9_]*)\s*\(/g, 'module.exports.default = function $1(')
        .replace(/export\s+default\s*\(/g, 'module.exports.default = (')
        .replace(/export\s+default\s+([A-Za-z0-9_]+)/g, 'module.exports.default = $1')
        .replace(/export\s+\{[^}]+\};?/g, '')
        .replace(/export\s+(const|let|var|function)\s+/g, '$1 ')
      return s
    }

    const mainSrc = files[mainPath]
    const m = mainSrc.match(/return\s*\(([^]*?)\)\s*;?\s*\}/)
    let inner = m ? m[1] : '<div>Preview unavailable</div>'
    inner = inner.replace(/className=/g, 'class=')
    let prev = ''
    while (prev !== inner) {
      prev = inner
      inner = inner.replace(/\{[^{}]*\}/g, '')
    }
    inner = inner
      .replace(/on[a-zA-Z]+=\{[^}]*\}/g, '')
      .replace(/on[a-zA-Z]+="[^"]*"/g, '')
      .replace(/\s{2,}/g, ' ')
    const html = `<!DOCTYPE html><html><head><meta charset='utf-8'/><meta name='viewport' content='width=device-width, initial-scale=1'/><style>html,body{margin:0}#root{min-height:100vh;font-family:system-ui,-apple-system,sans-serif}</style></head><body><div id='root'>${inner}</div></body></html>`
    return new Response(html, { headers: { "content-type": "text/html" } })
  } catch (err: any) {
    const html = `<!DOCTYPE html><html><body><pre style="color:#b91c1c">${(err?.message || String(err)).replace(/[<>&]/g, (c)=>({"<":"&lt;",">":"&gt;","&":"&amp;"}[c] as string))}</pre></body></html>`
    return new Response(html, { headers: { "content-type": "text/html" }, status: 500 })
  }
}


