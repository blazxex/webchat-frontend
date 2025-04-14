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
import { Loader2, Copy, Check } from "lucide-react";

export function CreateRoomDialog() {
  const [roomName, setRoomName] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [createdRoom, setCreatedRoom] = useState<{
    hashName: string;
    name: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const { createRoom, loading } = useSocket();

  const handleCreateRoom = async () => {
    if (!roomName.trim()) return;

    const room = await createRoom(roomName.trim());

    if (room) {
      setCreatedRoom(room);
      toast({
        title: "Room created",
        description: "Your room has been created successfully.",
      });
    } else {
      toast({
        title: "Failed to create room",
        description: "Could not create the room. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCopyHashName = () => {
    if (!createdRoom) return;

    navigator.clipboard.writeText(createdRoom.hashName);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setIsOpen(false);
    setRoomName("");
    setCreatedRoom(null);
    setCopied(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          Create Room
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Room</DialogTitle>
          <DialogDescription>
            Create a new private room and share the hash with others to let them
            join.
          </DialogDescription>
        </DialogHeader>

        {!createdRoom ? (
          <>
            <Input
              placeholder="Enter room name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateRoom();
              }}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateRoom}
                disabled={loading || !roomName.trim()}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Create Room
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="space-y-4">
              <div>
                <p className="text-sm mb-1">Room created successfully!</p>
                <p className="text-sm font-medium">{createdRoom.name}</p>
              </div>

              <div>
                <p className="text-sm mb-1">
                  Share this room hash with others:
                </p>
                <div className="p-3 bg-muted rounded-md flex items-center justify-between">
                  <code className="text-sm">{createdRoom.hashName}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyHashName}
                    className="flex items-center gap-1"
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleClose}>Done</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
