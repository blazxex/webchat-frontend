"use client"

import { useState } from "react"
import { useSocket } from "@/contexts/socket-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"

export function JoinRoomDialog() {
  const [roomId, setRoomId] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const { joinRoomById } = useSocket()

  const handleJoinRoom = () => {
    if (!roomId.trim()) return

    const success = joinRoomById(roomId.trim())

    if (success) {
      toast({
        title: "Room joined",
        description: "You have successfully joined the room.",
      })
      setRoomId("")
      setIsOpen(false)
    } else {
      toast({
        title: "Failed to join room",
        description: "The room ID is invalid or the room doesn't exist.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Join Room
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join Private Room</DialogTitle>
          <DialogDescription>Enter the room ID to join a private chat room.</DialogDescription>
        </DialogHeader>
        <Input
          placeholder="Enter room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleJoinRoom()
          }}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleJoinRoom}>Join</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
