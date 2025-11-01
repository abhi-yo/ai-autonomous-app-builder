"use client"

import { useState } from "react"
import { useConfiguration } from "@/hooks/use-configuration"
import { CronDashboard } from "@/components/cron-dashboard"
import { KeyIcon, CheckIcon, TrashIcon, Cog6ToothIcon, PlusIcon } from "@heroicons/react/24/outline"

export function ConfigurationPanel() {
  const { config, updateConfig, isLoading } = useConfiguration()
  const [apiKey, setApiKey] = useState("")
  const [newRule, setNewRule] = useState({
    name: "",
    description: "",
    category: "ui",
  })

  const handleSaveConfig = async () => {
    if (!apiKey.trim()) return
    await updateConfig({
      ai_api_key: apiKey,
      ai_provider: "google",
      cron_interval_minutes: 2880,
    })
    setApiKey("")
  }

  const handleAddRule = async () => {
    if (!newRule.name.trim() || !newRule.description.trim()) return

    try {
      const response = await fetch("/api/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rule_name: newRule.name,
          rule_description: newRule.description,
          rule_category: newRule.category,
        }),
      })

      if (response.ok) {
        setNewRule({ name: "", description: "", category: "ui" })
        window.location.reload()
      }
    } catch (error) {
      console.error("Failed to add rule:", error)
    }
  }

  const handleDeleteRule = async (ruleId: string) => {
    try {
      const response = await fetch("/api/rules", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rule_id: ruleId }),
      })

      if (response.ok) {
        window.location.reload()
      }
    } catch (error) {
      console.error("Failed to delete rule:", error)
    }
  }

  return (
    <div className="space-y-4">
      {/* API Configuration */}
      <section className="border border-border rounded-lg p-5 bg-background space-y-4 hover:border-foreground/20 transition-colors">
        <div className="flex items-center gap-3">
          <KeyIcon className="w-4 h-4 text-muted-foreground" />
          <h2 className="font-semibold text-sm uppercase tracking-wide">Configuration</h2>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">API Key</label>
            <input
              type="password"
              placeholder="sk-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full mt-1.5 px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all"
            />
          </div>

          <div className="bg-muted/50 p-3 rounded-md border border-border">
            <p className="text-xs font-medium text-foreground">Auto-build Schedule</p>
            <p className="text-xs text-muted-foreground mt-1">
              System automatically generates and builds apps every <span className="font-semibold">2 days</span>
            </p>
          </div>

          <button
            onClick={handleSaveConfig}
            disabled={isLoading || !apiKey.trim()}
            className="w-full px-4 py-2.5 bg-foreground text-background rounded-md font-medium text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckIcon className="w-4 h-4" />
                Save Configuration
              </>
            )}
          </button>
        </div>
      </section>

      {/* Building Rules */}
      <section className="border border-border rounded-lg p-5 bg-background space-y-4 hover:border-foreground/20 transition-colors">
        <div className="flex items-center gap-3">
          <Cog6ToothIcon className="w-4 h-4 text-muted-foreground" />
          <h2 className="font-semibold text-sm uppercase tracking-wide">Building Rules</h2>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Rule Name</label>
            <input
              type="text"
              placeholder="E.g., Use TypeScript"
              value={newRule.name}
              onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
              className="w-full mt-1.5 px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Description</label>
            <textarea
              placeholder="E.g., All apps must use TypeScript for type safety..."
              value={newRule.description}
              onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
              className="w-full mt-1.5 px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all min-h-20 resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Category</label>
            <select
              value={newRule.category}
              onChange={(e) => setNewRule({ ...newRule, category: e.target.value })}
              className="w-full mt-1.5 px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all cursor-pointer"
            >
              <option value="ui">UI</option>
              <option value="backend">Backend</option>
              <option value="general">General</option>
            </select>
          </div>

          <button
            onClick={handleAddRule}
            disabled={!newRule.name.trim() || !newRule.description.trim()}
            className="w-full px-4 py-2.5 border border-border rounded-md font-medium text-sm hover:bg-muted active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            Add Rule
          </button>
        </div>

        {/* Display existing rules */}
        {config?.rules && config.rules.length > 0 && (
          <div className="pt-4 border-t border-border space-y-2">
            {config.rules.map((rule: any) => (
              <div
                key={rule.id}
                className="text-xs bg-muted p-3 rounded-md border border-border flex justify-between items-start gap-2 hover:border-foreground/20 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">{rule.rule_name}</p>
                  <p className="text-muted-foreground line-clamp-2 mt-0.5">{rule.rule_description}</p>
                </div>
                <button
                  onClick={() => handleDeleteRule(rule.id)}
                  className="text-muted-foreground hover:text-destructive flex-shrink-0 transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Cron Dashboard */}
      <CronDashboard />
    </div>
  )
}
