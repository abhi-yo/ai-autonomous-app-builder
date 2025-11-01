"use client"

import type React from "react"

import { useEffect, useState } from "react"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Apply saved theme on mount
    const savedTheme = localStorage.getItem("theme") || "light"
    applyTheme(savedTheme)
  }, [])

  const applyTheme = (theme: string) => {
    const htmlElement = document.documentElement
    if (theme === "dark") {
      htmlElement.classList.add("dark")
    } else {
      htmlElement.classList.remove("dark")
    }
  }

  if (!mounted) return <>{children}</>
  return <>{children}</>
}
