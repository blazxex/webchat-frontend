"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "./auth-context"

// Mock socket events and data
type Message = {
  id: string
  content: string
  sender: string
  room: string
  timestamp: number
  type: "text" | "gif"
  gifUrl?: string
}

type Room = {
  id: string
  name: string
  type: "dm" | "group" | "global"
  users?: string[]
}

type SocketContextType = {
  connected: boolean
  users: string[]
  rooms: Room[]
  currentRoom: Room | null
  messages: Record<string, Message[]>
  sendMessage: (content: string, room: string, type?: "text" | "gif", gifUrl?: string) => void
  joinRoom: (room: Room) => void
  createRoom: (name: string, type: "dm" | "group") => void
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

// Mock data
const mockUsers = ["alice", "bob", "charlie", "david"]
const mockRooms: Room[] = [
  { id: "global", name: "Global Chat", type: "global" },
  { id: "1", name: "devs", type: "group" },
  { id: "2", name: "design", type: "group" },
]

const mockMessages: Record<string, Message[]> = {
  global: [
    {
      id: "1",
      content: "Welcome to the global chat!",
      sender: "system",
      room: "global",
      timestamp: Date.now() - 3600000,
      type: "text",
    },
    {
      id: "2",
      content: "Hey everyone!",
      sender: "alice",
      room: "global",
      timestamp: Date.now() - 1800000,
      type: "text",
    },
  ],
  "1": [
    {
      id: "3",
      content: "Any React devs here?",
      sender: "bob",
      room: "1",
      timestamp: Date.now() - 900000,
      type: "text",
    },
  ],
  "2": [
    {
      id: "4",
      content: "Check out this new design",
      sender: "charlie",
      room: "2",
      timestamp: Date.now() - 600000,
      type: "text",
    },
    {
      id: "5",
      content: "Looks great!",
      sender: "david",
      room: "2",
      timestamp: Date.now() - 300000,
      type: "text",
    },
  ],
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [connected, setConnected] = useState(false)
  const [users, setUsers] = useState<string[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null)
  const [messages, setMessages] = useState<Record<string, Message[]>>({})

  // Connect to socket when user logs in
  useEffect(() => {
    if (user) {
      // Mock socket connection
      console.log("Connecting to socket...")
      setConnected(true)
      setUsers([...mockUsers, user.username])
      setRooms(mockRooms)
      setMessages(mockMessages)
      setCurrentRoom(mockRooms[0]) // Default to global chat
    } else {
      setConnected(false)
      setUsers([])
      setRooms([])
      setCurrentRoom(null)
      setMessages({})
    }
  }, [user])

  const sendMessage = (content: string, room: string, type: "text" | "gif" = "text", gifUrl?: string) => {
    if (!user || !connected) return

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      content,
      sender: user.username,
      room,
      timestamp: Date.now(),
      type,
      gifUrl,
    }

    setMessages((prev) => ({
      ...prev,
      [room]: [...(prev[room] || []), newMessage],
    }))
  }

  const joinRoom = (room: Room) => {
    setCurrentRoom(room)

    // If we don't have messages for this room yet, initialize with empty array
    if (!messages[room.id]) {
      setMessages((prev) => ({
        ...prev,
        [room.id]: [],
      }))
    }
  }

  const createRoom = (name: string, type: "dm" | "group") => {
    const newRoom: Room = {
      id: `room-${Date.now()}`,
      name,
      type,
      users: type === "dm" ? [user?.username || "", name] : undefined,
    }

    setRooms((prev) => [...prev, newRoom])
    setCurrentRoom(newRoom)
    setMessages((prev) => ({
      ...prev,
      [newRoom.id]: [],
    }))
  }

  return (
    <SocketContext.Provider
      value={{
        connected,
        users,
        rooms,
        currentRoom,
        messages,
        sendMessage,
        joinRoom,
        createRoom,
      }}
    >
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider")
  }
  return context
}
