"use client";

import { useState } from "react";
import { useSocket } from "@/contexts/socket-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

export function JoinRoomDialog() {
  const [roomHashName, setRoomHashName] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { joinRoomByHashName, loading } = useSocket();

  const handleJoinRoom = async () => {
    if (!roomHashName.trim()) return;

    const success = await joinRoomByHashName(roomHashName.trim());

    if (success) {
      toast({
        title: "Room joined",
        description: "You have successfully joined the room.",
      });
      setRoomHashName("");
      setIsOpen(false);
    } else {
      toast({
        title: "Failed to join room",
        description: "The room hash is invalid or the room doesn't exist.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          Join Room by Hash
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join Room</DialogTitle>
          <DialogDescription>
            Enter the room hash to join a chat room.
          </DialogDescription>
        </DialogHeader>
        <Input
          placeholder="Enter room hash"
          value={roomHashName}
          onChange={(e) => setRoomHashName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleJoinRoom();
          }}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleJoinRoom} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Join
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
