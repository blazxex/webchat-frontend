"use client";

import type React from "react";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { GifPicker } from "./gif-picker";
import { useSocket } from "@/contexts/socket-context";
import { toast } from "@/components/ui/use-toast";

export function ChatInput() {
  const [message, setMessage] = useState("");
  const [selectedGif, setSelectedGif] = useState<string | null>(null);
  const { currentRoom, sendMessage } = useSocket();

  const handleSendMessage = () => {
    if (!currentRoom) return;

    try {
      if (selectedGif) {
        // Send the GIF URL as the message content or append it to the message
        const gifMessage = message.trim()
          ? `${message}\n${selectedGif}` // If there's a message, append the GIF URL
          : selectedGif; // Otherwise, just send the GIF URL

        sendMessage(gifMessage, currentRoom.hashName);
        setSelectedGif(null);
      } else if (message.trim()) {
        // Send as regular text message
        sendMessage(message, currentRoom.hashName);
      }

      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleGifSelect = (gifUrl: string) => {
    setSelectedGif(gifUrl);
  };

  return (
    <div className="p-4 border-t">
      {selectedGif && (
        <div className="mb-2 relative">
          <img
            src={selectedGif || "/placeholder.svg"}
            alt="Selected GIF"
            className="h-20 rounded-md object-cover"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-1 right-1 h-6 w-6"
            onClick={() => setSelectedGif(null)}
          >
            <span className="sr-only">Remove GIF</span>
            <span className="text-xs">×</span>
          </Button>
        </div>
      )}
      <div className="flex items-end gap-2">
        <Textarea
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          className="min-h-[60px] resize-none"
        />
        <div className="flex flex-col gap-2">
          <GifPicker onSelect={handleGifSelect} />
          <Button
            onClick={handleSendMessage}
            size="icon"
            className="h-8 w-8"
            disabled={!message.trim() && !selectedGif}
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
