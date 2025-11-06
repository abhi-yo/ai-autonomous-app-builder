"use client"

import { useState, useEffect } from "react"

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

const extractJSXFromCode = (code: string) => {
  const returnPatterns = [
    /return\s*\(([\s\S]*?)\)\s*;?\s*}/,
    /return\s*\{([\s\S]*?)\}\s*;?\s*}/,
    /return\s*([\s\S]*?)\s*;?\s*}/,
  ]

  for (const pattern of returnPatterns) {
    const match = code.match(pattern)
    if (match && match[1]) {
      return match[1].trim()
    }
  }

  const exportMatch = code.match(/export default function[^{]*\{([\s\S]*)\}/)
  if (exportMatch) {
    return extractJSXFromCode(exportMatch[1])
  }

  return null
}

const convertJSXToHTML = (jsx: string) => {
  let html = jsx
    .replace(/className="([^"]*)"/g, 'class="$1"')
    .replace(/className=\{\s*(["'`].*?["'`])\s*\}/g, (m, g1) => `class=${g1}`)
    .replace(/<([\w-]+)\s+([^>]*)\/>/g, '<$1 $2></$1>')
    .replace(/<\/>/g, '')
    .replace(/<Fragment>/g, '')
    .replace(/<\/(Fragment)>/g, '')
    .replace(/on[A-Z][a-zA-Z]+=\{[^}]*\}/g, '')
    .replace(/on[A-Z][a-zA-Z]+="[^"]*"/g, '')
    .replace(/dangerouslySetInnerHTML=\{[^}]*\}/g, '')
    .replace(/import\s+.*?from\s+['"][^'"]+['"];?/g, '')
    .replace(/export\s+.*?;/g, '')
    .replace(/"use client"/g, '')

  html = html
    .replace(/\{[\s\S]*?\}/g, '')
    .replace(/>\s*\)\s*<\/[^>]+>/g, (m) => m.replace(/\)\s*/, ''))
    .replace(/\([\s\S]*?\)/g, (m) => (m.includes('<') ? '' : m))
    .replace(/>\s*\{/g, '>')
    .replace(/\}\s*</g, '<')
    .replace(/\s{2,}/g, ' ')

  return html
}

const createPreviewHTML = (files: Array<{ path: string; content: string }>) => {
  const mainPage = files.find(f => f.path.includes("page.tsx") || f.path.includes("page.ts")) || files[0]
  if (!mainPage) return null

  const stripTypes = (src: string) => {
    let out = src
      .replace(/:\s*FC<[^>]+>/g, '')
      .replace(/\.FC<[^>]+>\s*=/g, ' =')
      .replace(/ as [A-Za-z0-9_<>\[\], ]+/g, '')
      .replace(/interface [^{]+{[\s\S]*?}/g, '')
      .replace(/type [^=]+=[\s\S]*?;/g, '')
    return out
  }

  const transformModule = (src: string, isMain = false) => {
    let s = src
      .replace(/\r\n/g, '\n')
      .replace(/^\s*"use client";?/gm, '')
      .replace(/^\s*'use client';?/gm, '')
      .replace(/^\s*import[\s\S]*?;\s*/gm, '')
      .replace(/import[\s\S]*?from\s+['"][^'"]+['"];?/g, '')
      .replace(/import\s+['"][^'"]+['"];?/g, '')
      .replace(/^\s*import\s+type[\s\S]*?;\s*/gm, '')
      .replace(/^\s*const\s+React\s*=\s*require\([\s\S]*?\);?\s*/gm, '')
      .replace(/^\s*var\s+React\s*=\s*require\([\s\S]*?\);?\s*/gm, '')
      .replace(/export\s+(function|const|let|var)\s+/g, '$1 ')
      .replace(/export\s+\{[^}]+\};?/g, '')
      .replace(/^\s*export\s+\{};?\s*$/gm, '')

    s = stripTypes(s)

    if (isMain) {
      if (!/function\s+App\s*\(/.test(s) && !/const\s+App\s*=/.test(s)) {
        s = s
          .replace(/export\s+default\s+function\s*[A-Za-z0-9_]*\s*\(/, 'function App(')
          .replace(/export\s+default\s+([A-Za-z0-9_]+)/, 'const App = $1')
          .replace(/export\s+default\s*\(/, 'const App = (')

        if (!/function\s+App\s*\(/.test(s) && !/const\s+App\s*=/.test(s)) {
          const jsx = extractJSXFromCode(s)
          if (jsx) {
            const html = convertJSXToHTML(jsx)
            s += `\nfunction App(){ return (<div className=\\"p-4\\">${html}</div>) }\n`
          }
        }
      }
    } else {
      s = s
        .replace(/export\s+default\s+function\s*([A-Za-z0-9_]*)\s*\(/, 'function $1(')
        .replace(/export\s+default\s+([A-Za-z0-9_]+)/, '$1')
        .replace(/export\s+default\s*\(/, '(')
    }
    return s
  }

  const rewriteAliases = (p: string) => p.replace(/^@\//g, '').replace(/^src\//g, '')

  const filesMap: Record<string, { code: string }> = {}
  files.forEach(f => {
    const path = '/' + rewriteAliases(f.path)
    if (path.endsWith('.tsx') || path.endsWith('.ts') || path.endsWith('.jsx') || path.endsWith('.js')) {
      filesMap[path] = { code: f.content.replace(/from\s+['"]@\//g, "from '\/") }
    }
  })

  const mainPath = '/' + rewriteAliases(mainPage.path)
  const indexTsx = `import React from 'react';\nimport { createRoot } from 'react-dom/client';\nimport * as Mod from '${mainPath}';\nconst C = (Mod.default || Mod.App || Mod.Home || (()=>React.createElement('div',null,'No App component found')));\nconst root = createRoot(document.getElementById('root')!);\nroot.render(React.createElement(C));`
  filesMap['/index.tsx'] = { code: indexTsx }
  filesMap['/index.html'] = { code: '<div id="root"></div>' }
  filesMap['/package.json'] = { code: JSON.stringify({
    name: 'preview-app',
    private: true,
    dependencies: { react: '18.2.0', 'react-dom': '18.2.0', typescript: '5.6.2' }
  }, null, 2) }
  filesMap['/tsconfig.json'] = { code: JSON.stringify({
    compilerOptions: {
      target: 'ES2019',
      module: 'ESNext',
      jsx: 'react-jsx',
      esModuleInterop: true,
      skipLibCheck: true,
      moduleResolution: 'bundler',
      resolveJsonModule: true,
      allowJs: true,
      strict: false
    }
  }, null, 2) }

  if (!filesMap['/next/link.tsx']) {
    filesMap['/next/link.tsx'] = { code: `export default function Link({ href, children, ...rest }: any){ return <a href={href} {...rest}>{children}</a>; }` }
  }
  if (!filesMap['/next/image.tsx']) {
    filesMap['/next/image.tsx'] = { code: `export default function Image(props: any){ return <img {...props} /> }` }
  }

  const fallbackJSX = extractJSXFromCode(mainPage.content)
  const fallbackHTML = fallbackJSX ? convertJSXToHTML(fallbackJSX) : null

  const fullHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>html,body{margin:0;padding:0;background:#0b0b0b;font-family:system-ui,-apple-system,sans-serif} .preview-container{background:#fff;border-radius:8px;padding:24px;min-height:400px} #sandpack{height:560px;width:100%;}</style>
</head>
<body>
  <div class="preview-container">
    <div id="sandpack"><div style="padding:12px;color:#111;font-size:12px">Loading preview…</div></div>
  </div>
  <script src="https://unpkg.com/@codesandbox/sandpack-client@2.13.8/dist/sandpack-client.umd.js"></script>
  <script>
    const files = ${JSON.stringify(filesMap)};
    const { SandpackClient } = window.Sandpack || {};
    (function(){
      var el = document.getElementById('sandpack');
      if(!SandpackClient || !el){ return; }
      var client = new SandpackClient(el, {
        files,
        template: 'react-ts',
        entry: '/index.tsx'
      }, {
        showOpenInCodeSandbox: false,
        showErrorScreen: true,
        showLoadingScreen: true,
        bundlerURL: 'https://sandpack.codesandbox.io'
      });
      try {
        client.listen((msg) => {
          if (msg.type === 'done' && msg.state === 'idle') {
            /* compiled */
          }
          if (msg.type === 'error') {
            el.innerHTML = '<div style="padding:12px;color:#b91c1c;font-family:ui-monospace,monospace">' + (msg.message || 'Preview error') + '</div>'
          }
        })
      } catch(e) {}
      setTimeout(function(){
        var hasIframe = !!(el && el.querySelector('iframe'))
        if(!hasIframe && el){
          if(${fallbackHTML ? 'true' : 'false'}){
            el.innerHTML = '<div style="padding:16px;color:#111;">' + ${JSON.stringify(fallbackHTML || '')} + '</div>'
          } else {
            el.innerHTML = '<div style="padding:12px;color:#6b7280;font-size:12px">Preview timed out.</div>'
          }
        }
      }, 7000);
    })();
  </script>
</body>
</html>`

  return fullHTML
}

export function PreviewViewer({ appId }: { appId: string }) {
  const [showPreview, setShowPreview] = useState(true)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/preview/${appId}`)
        const html = await res.text()
        if (cancelled) return
        const blob = new Blob([html], { type: "text/html" })
        const url = URL.createObjectURL(blob)
        setPreviewUrl(url)
      } catch {}
    })()
    return () => {
      cancelled = true
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [appId])

  const files: any[] = []

  return (
    <div className="border-t border-border bg-muted/30 dark:bg-background/20">
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-mono text-sm font-semibold text-foreground">Live Preview</h4>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="px-3 py-1 text-xs border border-border rounded hover:bg-muted transition-colors"
          >
            {showPreview ? "Hide" : "Show"}
          </button>
        </div>

        {showPreview && (
          <div className="border border-border bg-white dark:bg-black rounded-lg overflow-hidden shadow-lg">
            <div className="px-4 py-2 bg-muted/50 dark:bg-background/30 border-b border-border flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="ml-2 text-xs text-muted-foreground">Preview</span>
            </div>
            <div className="bg-background min-h-[400px] max-h-[600px] overflow-auto">
              {previewUrl ? (
                <iframe
                  src={previewUrl}
                  className="w-full h-full min-h-[400px] border-0"
                  sandbox="allow-same-origin allow-scripts"
                  title="App Preview"
                />
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <p className="mb-2">Preview unavailable</p>
                  <p className="text-xs">The generated code structure cannot be previewed in this format.</p>
                  <div className="mt-4 text-left text-xs bg-muted/50 dark:bg-background/30 p-4 rounded border border-border">
                    <p className="font-semibold mb-2">Available files:</p>
                    <ul className="space-y-1">
                      {files.map((file, i) => (
                        <li key={i} className="font-mono text-muted-foreground">
                          • {file.path}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

