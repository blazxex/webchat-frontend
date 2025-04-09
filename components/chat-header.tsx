"use client"

import { Globe, Hash, Users, LogOut, Lock, Info, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSocket } from "@/contexts/socket-context"
import { useAuth } from "@/contexts/auth-context"
import { useTheme } from "@/contexts/theme-context"
import { useSidebar } from "@/contexts/sidebar-context"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"

const themes = [
  { name: "Default", value: "bg-background" },
  { name: "Slate", value: "bg-slate-100 dark:bg-slate-900" },
  { name: "Blue", value: "bg-blue-50 dark:bg-blue-950" },
  { name: "Green", value: "bg-green-50 dark:bg-green-950" },
  { name: "Purple", value: "bg-purple-50 dark:bg-purple-950" },
  { name: "Pink", value: "bg-pink-50 dark:bg-pink-950" },
]

export function ChatHeader() {
  const { currentRoom, getRoomMembers } = useSocket()
  const { logout } = useAuth()
  const { setTheme } = useTheme()
  const { toggle } = useSidebar()
  const [showRoomInfo, setShowRoomInfo] = useState(false)

  if (!currentRoom) return null

  const members = getRoomMembers(currentRoom.id)
  const handleThemeChange = (theme: string) => {
    setTheme(currentRoom.id, theme)
  }

  return (
    <div className="h-16 border-b flex items-center justify-between px-4">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={toggle} className="md:hidden mr-2">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
        {currentRoom.type === "global" ? (
          <Globe className="h-5 w-5 mr-2" />
        ) : currentRoom.type === "dm" ? (
          <Users className="h-5 w-5 mr-2" />
        ) : currentRoom.type === "private" ? (
          <Lock className="h-5 w-5 mr-2" />
        ) : (
          <Hash className="h-5 w-5 mr-2" />
        )}
        <div>
          <h2 className="font-semibold">{currentRoom.name}</h2>
          <p className="text-xs text-muted-foreground">{members.length} members</p>
        </div>
        {currentRoom.type === "private" && (
          <Dialog open={showRoomInfo} onOpenChange={setShowRoomInfo}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="ml-2">
                <Info className="h-4 w-4" />
                <span className="sr-only">Room Info</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Room Information</DialogTitle>
                <DialogDescription>Share this room ID with others to let them join.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="p-3 bg-muted rounded-md flex items-center justify-between">
                  <code className="text-sm">{currentRoom.id}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(currentRoom.id)
                    }}
                  >
                    Copy
                  </Button>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Members ({members.length})</h4>
                  <div className="flex flex-wrap gap-2">
                    {members.map((member) => (
                      <Badge key={member} variant="outline">
                        {member}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
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
