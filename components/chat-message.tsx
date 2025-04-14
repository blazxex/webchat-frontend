"use client";

import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/contexts/auth-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ChatMessageProps {
  id: number;
  content: string;
  sender: {
    id: number;
    name: string;
  };
  createdAt: string;
}

export function ChatMessage({ content, sender, createdAt }: ChatMessageProps) {
  const { user } = useAuth();
  const isCurrentUser = user?.username === sender.name;
  const isSystem = sender.name === "system";

  // Get first letter of sender name for avatar
  const avatarText = sender.name.charAt(0).toUpperCase();

  // Format timestamp
  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true });

  // Check if the message contains a GIF URL
  const isGif = (content: string) => {
    return (
      content.match(/\.(gif|gifv)(\?.*)?$/i) ||
      content.includes("giphy.com/media") ||
      content.includes("media.giphy.com") ||
      content.includes("tenor.com") ||
      content.includes("gfycat.com")
    );
  };

  // Extract GIF URL and text content
  const extractGifAndText = (content: string) => {
    const lines = content.split("\n");
    const urls = lines.filter((line) => isGif(line));
    const text = lines.filter((line) => !isGif(line)).join("\n");

    return {
      gifUrl: urls.length > 0 ? urls[0] : null,
      text: text.trim(),
    };
  };

  const { gifUrl, text } = extractGifAndText(content);

  if (isSystem) {
    return (
      <div className="flex justify-center my-2">
        <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex gap-2 mb-4 ${
        isCurrentUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      <Avatar className="h-8 w-8">
        <AvatarFallback className="text-xs">{avatarText}</AvatarFallback>
      </Avatar>
      <div
        className={`flex flex-col ${
          isCurrentUser ? "items-end" : "items-start"
        }`}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium">{sender.name}</span>
          <span className="text-xs text-muted-foreground">{timeAgo}</span>
        </div>
        <div
          className={`max-w-[80%] rounded-lg p-3 ${
            isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted"
          }`}
        >
          {gifUrl ? (
            <div className="max-w-xs">
              <img
                src={gifUrl || "/placeholder.svg"}
                alt="GIF"
                className="rounded-md w-full h-auto"
                onError={(e) => {
                  // Fallback if GIF fails to load
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = "/placeholder.svg?height=200&width=300";
                }}
              />
              {text && <p className="text-sm mt-2">{text}</p>}
            </div>
          ) : (
            <p className="text-sm">{content}</p>
          )}
        </div>
      </div>
    </div>
  );
}
