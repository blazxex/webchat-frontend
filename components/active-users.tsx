"use client";

import { useState } from "react";
import { useSocket } from "@/contexts/socket-context";
import { useAuth } from "@/contexts/auth-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2, MessageSquare } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export function ActiveUsers() {
  const { activeUsers, startPrivateChat, loading } = useSocket();
  const { user } = useAuth();
  const [startingChat, setStartingChat] = useState<number | null>(null);

  const handleStartChat = async (otherUser: { id: number; name: string }) => {
    if (otherUser.id === Number(user?.id)) {
      toast({
        title: "Cannot message yourself",
        description: "You cannot start a chat with yourself.",
        variant: "destructive",
      });
      return;
    }

    setStartingChat(otherUser.id);
    try {
      const room = await startPrivateChat(otherUser.name);
      if (room) {
        toast({
          title: "Chat started",
          description: `You are now chatting with ${otherUser.name}.`,
        });
      } else {
        toast({
          title: "Failed to start chat",
          description: "Could not start a chat with this user.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error starting chat:", error);
      toast({
        title: "Error",
        description: "An error occurred while starting the chat.",
        variant: "destructive",
      });
    } finally {
      setStartingChat(null);
    }
  };

  // Filter out current user from active users
  const filteredUsers = activeUsers.filter((u) => u.id !== Number(user?.id));

  return (
    <div className="p-4 border-t">
      <h3 className="font-medium mb-2">
        Active Users ({filteredUsers.length})
      </h3>
      <ScrollArea className="h-[calc(100vh-400px)]">
        <div className="space-y-2">
          {filteredUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">
              No active users
            </p>
          ) : (
            filteredUsers.map((activeUser) => (
              <div
                key={activeUser.id}
                className="flex items-center justify-between p-2 rounded-md hover:bg-muted"
              >
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {activeUser.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{activeUser.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleStartChat(activeUser)}
                  disabled={loading || startingChat === activeUser.id}
                >
                  {startingChat === activeUser.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MessageSquare className="h-4 w-4" />
                  )}
                  <span className="sr-only">Message {activeUser.name}</span>
                </Button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
