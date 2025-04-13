"use client"

import { formatDistanceToNow } from "date-fns"
import { useAuth } from "@/contexts/auth-context"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface ChatMessageProps {
  id: number
  content: string
  sender: {
    id: number
    name: string
  }
  createdAt: string
  type?: "text" | "gif"
  gifUrl?: string
}

export function ChatMessage({ content, sender, createdAt, type = "text", gifUrl }: ChatMessageProps) {
  const { user } = useAuth()
  const isCurrentUser = user?.username === sender.name
  const isSystem = sender.name === "system"

  // Get first letter of sender name for avatar
  const avatarText = sender.name.charAt(0).toUpperCase()

  // Format timestamp
  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true })

  if (isSystem) {
    return (
      <div className="flex justify-center my-2">
        <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">{content}</div>
      </div>
    )
  }

  return (
    <div className={`flex gap-2 mb-4 ${isCurrentUser ? "flex-row-reverse" : "flex-row"}`}>
      <Avatar className="h-8 w-8">
        <AvatarFallback className="text-xs">{avatarText}</AvatarFallback>
      </Avatar>
      <div className={`flex flex-col ${isCurrentUser ? "items-end" : "items-start"}`}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium">{sender.name}</span>
          <span className="text-xs text-muted-foreground">{timeAgo}</span>
        </div>
        <div
          className={`max-w-[80%] rounded-lg p-3 ${isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted"}`}
        >
          {type === "text" ? (
            <p className="text-sm">{content}</p>
          ) : (
            <div className="max-w-xs">
              <img src={gifUrl || "/placeholder.svg"} alt="GIF" className="rounded-md w-full h-auto" />
              {content && <p className="text-sm mt-2">{content}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
