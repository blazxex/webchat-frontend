"use client"

import { useState } from "react"
import { Plus, Users, Globe, Hash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSocket } from "@/contexts/socket-context"
import { useAuth } from "@/contexts/auth-context"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export function Sidebar() {
  const { users, rooms, joinRoom, createRoom } = useSocket()
  const { user } = useAuth()
  const [newGroupName, setNewGroupName] = useState("")
  const [isCreatingGroup, setIsCreatingGroup] = useState(false)

  const handleCreateGroup = () => {
    if (newGroupName.trim()) {
      createRoom(newGroupName.trim(), "group")
      setNewGroupName("")
      setIsCreatingGroup(false)
    }
  }

  const handleStartDM = (username: string) => {
    createRoom(username, "dm")
  }

  const filteredUsers = users.filter((username) => username !== user?.username)

  return (
    <div className="w-64 border-r h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-lg">WebChat</h2>
      </div>

      <Tabs defaultValue="rooms" className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-2 mx-4 mt-4">
          <TabsTrigger value="rooms">Rooms</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="rooms" className="flex-1 flex flex-col">
          <div className="px-4 py-2 flex justify-between items-center">
            <h3 className="font-medium text-sm">Rooms</h3>
            <Dialog open={isCreatingGroup} onOpenChange={setIsCreatingGroup}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Plus className="h-4 w-4" />
                  <span className="sr-only">Create Group</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Group</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                  <Input
                    placeholder="Group name"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                  />
                  <Button onClick={handleCreateGroup}>Create Group</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <ScrollArea className="flex-1">
            <div className="px-2 py-1">
              {rooms.map((room) => (
                <Button
                  key={room.id}
                  variant="ghost"
                  className="w-full justify-start mb-1"
                  onClick={() => joinRoom(room)}
                >
                  {room.type === "global" ? (
                    <Globe className="h-4 w-4 mr-2" />
                  ) : room.type === "dm" ? (
                    <Users className="h-4 w-4 mr-2" />
                  ) : (
                    <Hash className="h-4 w-4 mr-2" />
                  )}
                  <span className="truncate">{room.name}</span>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="users" className="flex-1">
          <div className="px-4 py-2">
            <h3 className="font-medium text-sm">Online Users</h3>
          </div>

          <ScrollArea className="flex-1">
            <div className="px-2 py-1">
              {filteredUsers.map((username) => (
                <Button
                  key={username}
                  variant="ghost"
                  className="w-full justify-start mb-1"
                  onClick={() => handleStartDM(username)}
                >
                  <div className="h-2 w-2 rounded-full bg-green-500 mr-2" />
                  <span className="truncate">{username}</span>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}
