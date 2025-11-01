"use client"

import { useState, useEffect, useRef } from "react"

export function useApps() {
  const [apps, setApps] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const isInitialLoad = useRef(true)
  const appsRef = useRef<any[]>([])

  const fetchApps = async (showLoading = false) => {
    try {
      if (showLoading) {
        setIsLoading(true)
      }
      const response = await fetch("/api/apps")
      const data = await response.json()
      setApps(data)
      appsRef.current = data
      if (isInitialLoad.current) {
        isInitialLoad.current = false
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Failed to fetch apps:", error)
      if (isInitialLoad.current) {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    fetchApps(true)

    const interval = setInterval(() => {
      const hasActiveApps = appsRef.current?.some((app: any) => 
        app.app_status === "building" || app.app_status === "pending"
      )
      if (hasActiveApps) {
        fetchApps(false)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return { apps, isLoading, refetch: () => fetchApps(true) }
}
