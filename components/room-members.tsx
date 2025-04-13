"use client"

import { useSocket } from "@/contexts/socket-context"
import { useAuth } from "@/contexts/auth-context"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export function RoomMembers() {
  const { currentRoom, getRoomMembers, leaveRoom } = useSocket()
  const { user } = useAuth()

  if (!currentRoom) return null

  const members = getRoomMembers(currentRoom.hashName)

  const handleLeaveRoom = () => {
    if (currentRoom) {
      leaveRoom(currentRoom.hashName)
    }
  }

  return (
    <div className="p-4 border-l w-64 hidden md:block">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">Members ({members.length})</h3>
        <Button variant="ghost" size="sm" onClick={handleLeaveRoom} className="text-destructive">
          <LogOut className="h-4 w-4 mr-1" />
          Leave
        </Button>
      </div>
      <ScrollArea className="h-[calc(100vh-180px)]">
        <div className="space-y-2">
          {members.map((member) => (
            <div key={member.id} className="flex items-center gap-2 p-2 rounded-md hover:bg-muted">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{member.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium truncate">{member.name}</span>
                </div>
                {member.name === user?.username && <span className="text-xs text-muted-foreground">You</span>}
              </div>
              <div className="h-2 w-2 rounded-full bg-green-500" />
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
