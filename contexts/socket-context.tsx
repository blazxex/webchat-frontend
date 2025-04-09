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
  type: "dm" | "group" | "global" | "private"
  members: string[]
  createdBy?: string
}

type SocketContextType = {
  connected: boolean
  users: string[]
  rooms: Room[]
  currentRoom: Room | null
  messages: Record<string, Message[]>
  sendMessage: (content: string, room: string, type?: "text" | "gif", gifUrl?: string) => void
  joinRoom: (room: Room) => void
  createRoom: (name: string, type: "dm" | "group" | "private") => Room
  joinRoomById: (roomId: string) => boolean
  leaveRoom: (roomId: string) => void
  getAllRooms: () => Room[]
  getRoomMembers: (roomId: string) => string[]
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

// Mock data
const mockUsers = ["alice", "bob", "charlie", "david"]
const initialRooms: Room[] = [
  { id: "global", name: "Global Chat", type: "global", members: [...mockUsers] },
  { id: "dev-123", name: "devs", type: "group", members: ["alice", "bob"] },
  { id: "design-456", name: "design", type: "group", members: ["charlie", "david"] },
  { id: "private-789", name: "Project X", type: "private", members: ["alice", "charlie"], createdBy: "alice" },
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
  "dev-123": [
    {
      id: "3",
      content: "Any React devs here?",
      sender: "bob",
      room: "dev-123",
      timestamp: Date.now() - 900000,
      type: "text",
    },
  ],
  "design-456": [
    {
      id: "4",
      content: "Check out this new design",
      sender: "charlie",
      room: "design-456",
      timestamp: Date.now() - 600000,
      type: "text",
    },
    {
      id: "5",
      content: "Looks great!",
      sender: "david",
      room: "design-456",
      timestamp: Date.now() - 300000,
      type: "text",
    },
  ],
  "private-789": [
    {
      id: "6",
      content: "This is a private room for Project X",
      sender: "alice",
      room: "private-789",
      timestamp: Date.now() - 100000,
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
  const [allRooms, setAllRooms] = useState<Room[]>([])

  // Connect to socket when user logs in
  useEffect(() => {
    if (user) {
      // Mock socket connection
      console.log("Connecting to socket...")
      setConnected(true)
      setUsers([...mockUsers, user.username])

      // Filter rooms the user has access to
      const accessibleRooms = initialRooms.filter(
        (room) =>
          room.type === "global" ||
          room.type === "group" ||
          (room.type === "private" && room.members.includes(user.username)) ||
          (room.type === "dm" && room.members.includes(user.username)),
      )

      setRooms(accessibleRooms)
      setAllRooms(initialRooms) // All rooms for discovery
      setMessages(mockMessages)
      setCurrentRoom(accessibleRooms[0]) // Default to global chat
    } else {
      setConnected(false)
      setUsers([])
      setRooms([])
      setCurrentRoom(null)
      setMessages({})
      setAllRooms([])
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

  const createRoom = (name: string, type: "dm" | "group" | "private") => {
    if (!user) throw new Error("User must be logged in to create a room")

    const roomId =
      type === "dm"
        ? `dm-${user.username}-${name}-${Date.now()}`
        : type === "private"
          ? `private-${Date.now()}`
          : `group-${Date.now()}`

    const members = type === "dm" ? [user.username, name] : [user.username]

    const newRoom: Room = {
      id: roomId,
      name,
      type,
      members,
      createdBy: user.username,
    }

    setRooms((prev) => [...prev, newRoom])
    setAllRooms((prev) => [...prev, newRoom])
    setCurrentRoom(newRoom)
    setMessages((prev) => ({
      ...prev,
      [newRoom.id]: [],
    }))

    // Add system message for new room
    const systemMessage: Message = {
      id: `system-${Date.now()}`,
      content:
        type === "private"
          ? `Private room "${name}" created. Share the room ID: ${roomId} with others to join.`
          : `${type === "dm" ? "Direct message" : "Group"} chat started.`,
      sender: "system",
      room: roomId,
      timestamp: Date.now(),
      type: "text",
    }

    setMessages((prev) => ({
      ...prev,
      [roomId]: [systemMessage],
    }))

    return newRoom
  }

  const joinRoomById = (roomId: string) => {
    if (!user) return false

    // Find the room in all available rooms
    const roomToJoin = allRooms.find((r) => r.id === roomId)

    if (!roomToJoin) {
      return false
    }

    // Check if user is already a member
    if (roomToJoin.members.includes(user.username)) {
      // Just switch to this room
      setCurrentRoom(roomToJoin)
      return true
    }

    // Add user to room members
    const updatedRoom = {
      ...roomToJoin,
      members: [...roomToJoin.members, user.username],
    }

    // Update rooms
    setAllRooms((prev) => prev.map((r) => (r.id === roomId ? updatedRoom : r)))

    // Add to user's accessible rooms if not already there
    if (!rooms.some((r) => r.id === roomId)) {
      setRooms((prev) => [...prev, updatedRoom])
    } else {
      setRooms((prev) => prev.map((r) => (r.id === roomId ? updatedRoom : r)))
    }

    // Set as current room
    setCurrentRoom(updatedRoom)

    // Add system message about user joining
    const joinMessage: Message = {
      id: `join-${Date.now()}`,
      content: `${user.username} joined the room.`,
      sender: "system",
      room: roomId,
      timestamp: Date.now(),
      type: "text",
    }

    setMessages((prev) => ({
      ...prev,
      [roomId]: [...(prev[roomId] || []), joinMessage],
    }))

    return true
  }

  const leaveRoom = (roomId: string) => {
    if (!user) return

    // Find the room
    const roomToLeave = rooms.find((r) => r.id === roomId)
    if (!roomToLeave || roomToLeave.type === "global") return

    // Remove user from members
    const updatedRoom = {
      ...roomToLeave,
      members: roomToLeave.members.filter((m) => m !== user.username),
    }

    // Update all rooms
    setAllRooms((prev) => prev.map((r) => (r.id === roomId ? updatedRoom : r)))

    // Remove from user's rooms if it's a private room
    if (roomToLeave.type === "private" || roomToLeave.type === "dm") {
      setRooms((prev) => prev.filter((r) => r.id !== roomId))

      // If current room is the one being left, switch to global
      if (currentRoom?.id === roomId) {
        const globalRoom = rooms.find((r) => r.id === "global")
        if (globalRoom) setCurrentRoom(globalRoom)
      }
    } else {
      setRooms((prev) => prev.map((r) => (r.id === roomId ? updatedRoom : r)))
    }

    // Add system message about user leaving
    const leaveMessage: Message = {
      id: `leave-${Date.now()}`,
      content: `${user.username} left the room.`,
      sender: "system",
      room: roomId,
      timestamp: Date.now(),
      type: "text",
    }

    setMessages((prev) => ({
      ...prev,
      [roomId]: [...(prev[roomId] || []), leaveMessage],
    }))
  }

  const getAllRooms = () => {
    return allRooms
  }

  const getRoomMembers = (roomId: string) => {
    const room = allRooms.find((r) => r.id === roomId)
    return room ? room.members : []
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
        joinRoomById,
        leaveRoom,
        getAllRooms,
        getRoomMembers,
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
