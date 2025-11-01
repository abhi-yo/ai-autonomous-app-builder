import { ThemeSwitcher } from "@/components/theme-switcher"
import { ConfigurationPanel } from "@/components/configuration-panel"
import { AppsGallery } from "@/components/apps-gallery"

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground transition-colors duration-200">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm transition-colors duration-200">
        <div className="flex items-center justify-between p-4 md:p-6 max-w-7xl mx-auto">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">AI App Builder</h1>
            <p className="text-sm text-muted-foreground">Generate production-ready apps automatically</p>
          </div>
          <ThemeSwitcher />
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <ConfigurationPanel />
            </div>
          </div>

          {/* Main Gallery */}
          <div className="lg:col-span-2">
            <AppsGallery />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-background/50 mt-12 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <p className="text-xs text-muted-foreground text-center">AI App Builder · Powered by Next.js and AI SDK</p>
        </div>
      </footer>
    </main>
  )
}
