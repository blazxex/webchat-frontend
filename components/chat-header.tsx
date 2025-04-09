"use client"

import { Globe, Hash, Users, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSocket } from "@/contexts/socket-context"
import { useAuth } from "@/contexts/auth-context"
import { useTheme } from "@/contexts/theme-context"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const themes = [
  { name: "Default", value: "bg-background" },
  { name: "Slate", value: "bg-slate-100 dark:bg-slate-900" },
  { name: "Blue", value: "bg-blue-50 dark:bg-blue-950" },
  { name: "Green", value: "bg-green-50 dark:bg-green-950" },
  { name: "Purple", value: "bg-purple-50 dark:bg-purple-950" },
  { name: "Pink", value: "bg-pink-50 dark:bg-pink-950" },
]

export function ChatHeader() {
  const { currentRoom } = useSocket()
  const { logout } = useAuth()
  const { setTheme } = useTheme()

  if (!currentRoom) return null

  const handleThemeChange = (theme: string) => {
    setTheme(currentRoom.id, theme)
  }

  return (
    <div className="h-16 border-b flex items-center justify-between px-4">
      <div className="flex items-center">
        {currentRoom.type === "global" ? (
          <Globe className="h-5 w-5 mr-2" />
        ) : currentRoom.type === "dm" ? (
          <Users className="h-5 w-5 mr-2" />
        ) : (
          <Hash className="h-5 w-5 mr-2" />
        )}
        <h2 className="font-semibold">{currentRoom.name}</h2>
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Theme
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {themes.map((theme) => (
              <DropdownMenuItem key={theme.value} onClick={() => handleThemeChange(theme.value)}>
                {theme.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon" onClick={logout}>
          <LogOut className="h-5 w-5" />
          <span className="sr-only">Logout</span>
        </Button>
      </div>
    </div>
  )
}
