"use client"

import { useEffect, useRef } from "react"
import { useSocket } from "@/contexts/socket-context"
import { useTheme } from "@/contexts/theme-context"
import { ChatMessage } from "./chat-message"
import { ScrollArea } from "@/components/ui/scroll-area"

export function ChatWindow() {
  const { currentRoom, messages } = useSocket()
  const { getTheme } = useTheme()
  const scrollRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, currentRoom])

  if (!currentRoom) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Select a chat to start messaging</p>
      </div>
    )
  }

  const currentMessages = messages[currentRoom.id] || []
  const theme = getTheme(currentRoom.id)

  return (
    <ScrollArea className={`flex-1 p-4 ${theme}`}>
      {currentMessages.length === 0 ? (
        <div className="h-full flex items-center justify-center">
          <p className="text-muted-foreground">No messages yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {currentMessages.map((msg) => (
            <ChatMessage
              key={msg.id}
              id={msg.id}
              content={msg.content}
              sender={msg.sender}
              timestamp={msg.timestamp}
              type={msg.type}
              gifUrl={msg.gifUrl}
            />
          ))}
          <div ref={scrollRef} />
        </div>
      )}
    </ScrollArea>
  )
}
