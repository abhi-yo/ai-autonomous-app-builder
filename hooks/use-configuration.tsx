"use client"

import { useState, useEffect } from "react"

export function useConfiguration() {
  const [config, setConfig] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/config")
      const data = await response.json()
      setConfig(data)
    } catch (error) {
      console.error("Failed to fetch config:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateConfig = async (newConfig: any) => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newConfig),
      })
      const data = await response.json()
      setConfig(data)
    } catch (error) {
      console.error("Failed to update config:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return { config, updateConfig, isLoading }
}
