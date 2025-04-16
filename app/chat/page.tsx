"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useSidebar } from "@/contexts/sidebar-context"
import { Sidebar } from "@/components/sidebar"
import { ChatHeader } from "@/components/chat-header"
import { ChatWindow } from "@/components/chat-window"
import { ChatInput } from "@/components/chat-input"
import { RoomMembers } from "@/components/room-members"

export default function ChatPage() {
  const { user, isLoading } = useAuth()
  const { isOpen } = useSidebar()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <ChatHeader />
        <div className="flex-1 flex">
          <div className="flex-1 flex flex-col">
            <ChatWindow />
            <ChatInput />
          </div>
          <RoomMembers />
        </div>
      </div>
    </div>
  )
}
