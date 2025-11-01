"use client"

import { useState } from "react"

export function useGeneration() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentIdea, setCurrentIdea] = useState("")
  const [generatedCode, setGeneratedCode] = useState("")

  const generateIdea = async (configId: string) => {
    try {
      setIsGenerating(true)
      const response = await fetch("/api/generate-idea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config_id: configId }),
      })
      const data = await response.json()
      setCurrentIdea(data.idea)
      return data.idea
    } catch (error) {
      console.error("Failed to generate idea:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const generateApp = async (configId: string, appIdea: string) => {
    try {
      setIsGenerating(true)
      const response = await fetch("/api/generate-app", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config_id: configId, app_idea: appIdea }),
      })
      const data = await response.json()
      if (data.code) {
        setGeneratedCode(data.code)
      }
      return data
    } catch (error) {
      console.error("Failed to generate app:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  return {
    generateIdea,
    generateApp,
    isGenerating,
    currentIdea,
    generatedCode,
  }
}
