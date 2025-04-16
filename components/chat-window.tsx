"use client";

import { useEffect, useRef } from "react";
import { useSocket } from "@/contexts/socket-context";
import { ChatMessage } from "./chat-message";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Theme } from "@/contexts/socket-context";

// Map theme enum to CSS classes
const themeClasses = {
  [Theme.DEFAULT]: "bg-background",
  [Theme.DARK]: "bg-slate-900 text-slate-100",
  [Theme.LIGHT]: "bg-slate-50",
  [Theme.SPACE]: "bg-indigo-950 text-indigo-50",
  [Theme.NATURE]: "bg-green-50 dark:bg-green-950",
  [Theme.RETRO]: "bg-amber-50 dark:bg-amber-950",
};

export function ChatWindow() {
  const { currentRoom, messages } = useSocket();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, currentRoom]);

  if (!currentRoom) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">
          Select a chat to start messaging
        </p>
      </div>
    );
  }

  const currentMessages = messages[currentRoom.hashName] || [];
  const themeClass =
    themeClasses[currentRoom.theme] || themeClasses[Theme.DEFAULT];

  return (
    <div className={`flex-1 flex flex-col ${themeClass} overflow-hidden`}>
      <ScrollArea
        className="flex-1 p-4"
        // style={{ height: "calc(100vh - 180px)" }}
      >
        {currentMessages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-muted-foreground">No messages yet</p>
          </div>
        ) : (
          <div className="h-[calc(60vh)] space-y-4">
            {currentMessages.map((msg, index) => (
              <ChatMessage
                key={`${msg.id}-${index}`}
                id={msg.id}
                content={msg.content}
                sender={msg.sender}
                createdAt={msg.createdAt}
                type={msg.type}
                gifUrl={msg.gifUrl}
              />
            ))}
            <div ref={scrollRef} />
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
