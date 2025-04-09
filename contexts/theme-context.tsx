"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type ThemeContextType = {
  themes: Record<string, string>
  setTheme: (roomId: string, theme: string) => void
  getTheme: (roomId: string) => string
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themes, setThemes] = useState<Record<string, string>>({})

  useEffect(() => {
    // Load themes from localStorage
    const storedThemes = localStorage.getItem("chat-themes")
    if (storedThemes) {
      setThemes(JSON.parse(storedThemes))
    }
  }, [])

  const setTheme = (roomId: string, theme: string) => {
    const updatedThemes = { ...themes, [roomId]: theme }
    setThemes(updatedThemes)
    localStorage.setItem("chat-themes", JSON.stringify(updatedThemes))
  }

  const getTheme = (roomId: string) => {
    return themes[roomId] || "bg-background" // Default theme
  }

  return <ThemeContext.Provider value={{ themes, setTheme, getTheme }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
