"use client"

import { ThemeSwitcher } from "@/components/theme-switcher"
import LightRays from "@/components/LightRays"
import Link from "next/link"
import { Instrument_Serif } from "next/font/google"

const instrumentSerif = Instrument_Serif({ 
  subsets: ["latin"], 
  weight: ["400"],
  style: ["italic"]
})

export default function LandingPage() {
  return (
    <main className="relative min-h-screen w-full bg-background text-foreground transition-colors duration-200">
      <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-6">
        <header className="w-full max-w-5xl bg-background/40 backdrop-blur-md border border-border/50 rounded-2xl shadow-lg">
          <div className="px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 className="text-lg font-medium tracking-tight">Netloom</h1>
              <nav className="hidden md:flex items-center gap-6 text-sm">
                <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</Link>
                <Link href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How it works</Link>
                <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <ThemeSwitcher />
              <Link href="/" className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors">
                Get Started
              </Link>
            </div>
          </div>
        </header>
      </div>

      <div className="absolute inset-0 w-full h-screen pointer-events-none">
        <LightRays
          raysOrigin="top-center"
          raysColor="#a855f7"
          raysSpeed={1.5}
          lightSpread={0.8}
          rayLength={1.2}
          followMouse={true}
          mouseInfluence={0.1}
          noiseAmount={0.1}
          distortion={0.05}
        />
      </div>

      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <h2 className="leading-[1.15]">
            <span className="block text-[clamp(2.5rem,5.5vw,4.5rem)] font-normal text-foreground tracking-[-0.03em]">
              Build apps in the
            </span>
            <span className="block text-[clamp(2.5rem,5.5vw,4.5rem)] font-normal text-foreground tracking-[-0.03em] mt-1">
              Age of{' '}
              <span className={`${instrumentSerif.className} text-[clamp(2.5rem,5.5vw,4.5rem)] text-purple-500 italic font-medium`}>
                Automation.
              </span>
            </span>
          </h2>
          <p className="text-[clamp(0.95rem,1.3vw,1.0625rem)] text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Our platform generates production-ready Next.js apps automatically, so you can stop firefighting and start focusing on what matters.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Link href="/" className="px-7 py-2.5 bg-foreground text-background rounded-xl text-sm font-medium transition-all hover:opacity-90">
              Start Building
            </Link>
            <Link href="#features" className="px-7 py-2.5 bg-transparent hover:bg-muted border border-border rounded-xl text-sm font-medium transition-all">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      <section id="features" className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="border border-border bg-muted/50 dark:bg-black/40 backdrop-blur-sm shadow-[0_0_50px_-12px] shadow-purple-500/20 hover:shadow-[0_0_80px_-10px] hover:shadow-purple-600/40 hover:border-purple-500/30 transition-all duration-500">
            <div className="grid lg:grid-cols-2">
              <div className="p-12 lg:border-r border-border">
                <h3 className="text-4xl md:text-5xl font-medium tracking-tight mb-4">
                  Plan, execute, see the trace.
                </h3>
                <p className="text-muted-foreground mb-8">
                  netloom generates complete Next.js apps from your ideas, runs them through your custom rules, and keeps the full build trace in view.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                    <p className="text-foreground">Analyzes your idea and builds production-ready code.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                    <p className="text-foreground">Applies your custom building rules automatically.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                    <p className="text-foreground">Returns complete TypeScript/React code with proper structure.</p>
                  </div>
                </div>

                <div className="mt-8 p-4 border border-border bg-muted/60 dark:bg-background/50 font-mono text-xs">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-muted-foreground mb-1">Step 1</div>
                      <div className="text-foreground">Parse idea</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Step 2</div>
                      <div className="text-foreground">Apply rules</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Step 3</div>
                      <div className="text-foreground">Generate app</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-12 bg-muted/30 dark:bg-background/20">
                <h4 className="text-2xl font-medium mb-6">Custom Building Rules</h4>
                <p className="text-muted-foreground mb-6">
                  Define your own rules to guide the AI generation process. Every rule is automatically applied to generated apps.
                </p>

                <div className="space-y-3">
                  <div className="border border-border bg-muted/40 dark:bg-background/30 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Use TypeScript</span>
                      <span className="text-xs text-purple-400">UI</span>
                    </div>
                    <p className="text-xs text-muted-foreground">All apps must use TypeScript with proper type definitions</p>
                  </div>

                  <div className="border border-border bg-muted/40 dark:bg-background/30 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Dark Mode Support</span>
                      <span className="text-xs text-purple-400">UI</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Include light and dark theme with proper color variables</p>
                  </div>

                  <div className="border border-border bg-muted/40 dark:bg-background/30 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">API Error Handling</span>
                      <span className="text-xs text-purple-400">Backend</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Implement proper try-catch blocks and user-friendly errors</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 border-t border-border">
              <div className="p-8 md:border-r border-border">
                <h5 className="text-lg font-medium mb-3">Zero Boilerplate</h5>
                <p className="text-sm text-muted-foreground">Just describe your app idea. netloom handles the rest.</p>
              </div>

              <div className="p-8 md:border-r border-border">
                <h5 className="text-lg font-medium mb-3">Automated Scheduling</h5>
                <p className="text-sm text-muted-foreground">Set up cron jobs to auto-generate apps every 2 days.</p>
              </div>

              <div className="p-8">
                <h5 className="text-lg font-medium mb-3">Built with Gemini</h5>
                <p className="text-sm text-muted-foreground">Powered by Google Gemini AI for intelligent code generation.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="border border-border bg-muted/50 dark:bg-black/40 backdrop-blur-sm shadow-[0_0_50px_-12px] shadow-purple-500/20 hover:shadow-[0_0_80px_-10px] hover:shadow-purple-600/40 hover:border-purple-500/30 transition-all duration-500">
            <div className="p-12">
              <h3 className="text-4xl md:text-5xl font-medium tracking-tight mb-4">
                Built for people who like tidy systems.
              </h3>
              <p className="text-lg text-muted-foreground max-w-3xl">
                See every decision the AI makes. Configure your rules once, generate apps automatically.
              </p>
            </div>
            
            <div className="grid md:grid-cols-4 border-t border-border">
              <div className="p-8 md:border-r border-border">
                <h5 className="font-medium mb-2">Simplicity</h5>
                <p className="text-sm text-muted-foreground">Configure once, generate unlimited apps with your rules.</p>
              </div>
              <div className="p-8 md:border-r border-border">
                <h5 className="font-medium mb-2">Transparency</h5>
                <p className="text-sm text-muted-foreground">View complete build logs and generated code for every app.</p>
              </div>
              <div className="p-8 md:border-r border-border">
                <h5 className="font-medium mb-2">Precision</h5>
                <p className="text-sm text-muted-foreground">Every rule you define is enforced in generated code.</p>
              </div>
              <div className="p-8">
                <h5 className="font-medium mb-2">Autonomy</h5>
                <p className="text-sm text-muted-foreground">Schedule auto-generation to run on your schedule.</p>
              </div>
            </div>
          </div>

          <div className="border border-border bg-muted/50 dark:bg-black/40 backdrop-blur-sm shadow-[0_0_50px_-12px] shadow-purple-500/20 hover:shadow-[0_0_80px_-10px] hover:shadow-purple-600/40 hover:border-purple-500/30 transition-all duration-500 border-t-0">
            <div className="p-12">
              <h3 className="text-3xl md:text-4xl font-medium tracking-tight mb-4">
                Three steps, that's it.
              </h3>
              <p className="text-muted-foreground mb-8">
                Set your API key, define your rules, and let netloom generate apps.
              </p>
            </div>

            <div className="grid md:grid-cols-2 border-t border-border">
              <div className="p-12 md:border-r border-border">
                <h4 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wide">Configuration</h4>
                <div className="border border-border bg-muted/60 dark:bg-background/50 p-6 font-mono text-xs space-y-2">
                  <div><span className="text-muted-foreground">1.</span> <span className="text-foreground">Set your Google AI API key</span></div>
                  <div><span className="text-muted-foreground">2.</span> <span className="text-foreground">Configure auto-build schedule (every 2 days)</span></div>
                  <div><span className="text-muted-foreground">3.</span> <span className="text-foreground">Save configuration</span></div>
                </div>
              </div>

              <div className="p-12">
                <h4 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wide">Building Rules</h4>
                <div className="border border-border bg-muted/60 dark:bg-background/50 p-6 font-mono text-xs space-y-2">
                  <div><span className="text-muted-foreground">1.</span> <span className="text-foreground">Add rule: "Use TypeScript"</span></div>
                  <div><span className="text-muted-foreground">2.</span> <span className="text-foreground">Set category: UI / Backend / General</span></div>
                  <div><span className="text-muted-foreground">3.</span> <span className="text-foreground">Rules auto-apply to all generated apps</span></div>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-border bg-muted/50 dark:bg-black/40 backdrop-blur-sm shadow-[0_0_50px_-12px] shadow-purple-500/20 hover:shadow-[0_0_80px_-10px] hover:shadow-purple-600/40 hover:border-purple-500/30 transition-all duration-500 border-t-0">
            <div className="grid lg:grid-cols-2">
              <div className="p-12 lg:border-r border-border">
                <h3 className="text-3xl md:text-4xl font-medium tracking-tight mb-4">
                  Production-ready code, instantly.
                </h3>
                <p className="text-muted-foreground mb-8">
                  Describe your app in plain language. netloom generates complete Next.js applications with proper structure, TypeScript, and your custom rules applied.
                </p>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="text-purple-400">→</div>
                    <p className="text-sm">Complete file structure with app router</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-purple-400">→</div>
                    <p className="text-sm">TypeScript interfaces and proper typing</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-purple-400">→</div>
                    <p className="text-sm">Reusable components with proper props</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-purple-400">→</div>
                    <p className="text-sm">State management and API handling</p>
                  </div>
                </div>
              </div>

              <div className="p-12 bg-muted/30 dark:bg-background/20">
                <h4 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wide">Example Output</h4>
                <div className="border border-border bg-muted/60 dark:bg-background/50 p-6 font-mono text-xs overflow-x-auto space-y-1">
                  <div><span className="text-purple-400">---</span> <span className="text-muted-foreground">FILE: app/page.tsx</span></div>
                  <div><span className="text-green-400">"use client"</span></div>
                  <div></div>
                  <div><span className="text-blue-400">import</span> {'{ useState }'} <span className="text-blue-400">from</span> <span className="text-green-400">'react'</span></div>
                  <div></div>
                  <div><span className="text-blue-400">export default function</span> <span className="text-yellow-400">Home</span>() {'{'}</div>
                  <div>  <span className="text-blue-400">const</span> [data, setData] = <span className="text-yellow-400">useState</span>([...])</div>
                  <div>  <span className="text-blue-400">return</span> {'<'}<span className="text-green-400">div</span>{'>'}</div>
                  <div>    <span className="text-muted-foreground">{'<'}!-- Your app here --{'>'}</span></div>
                  <div>  {'</'}<span className="text-green-400">div</span>{'>'}</div>
                  <div>{'}'}</div>
                  <div></div>
                  <div><span className="text-purple-400">---</span> <span className="text-muted-foreground">FILE: components/Header.tsx</span></div>
                  <div><span className="text-muted-foreground">...</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="border border-border bg-muted/50 dark:bg-black/40 backdrop-blur-sm p-16 shadow-[0_0_50px_-12px] shadow-purple-500/20 text-center">
            <h3 className="text-4xl md:text-5xl font-medium tracking-tight mb-6">
              Ready to build your next app?
            </h3>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join developers who are shipping faster with AI-powered automation.
            </p>
            <Link href="/" className="inline-block px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white text-base font-medium transition-colors shadow-lg shadow-purple-500/20">
              Start Building Now
            </Link>
          </div>
        </div>
      </section>

      <footer className="relative py-12 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            © 2025 netloom. Built with Next.js and AI SDK.
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground transition-colors">Documentation</Link>
            <Link href="#" className="hover:text-foreground transition-colors">GitHub</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Twitter</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}

