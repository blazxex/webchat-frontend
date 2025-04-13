"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState, useRef } from "react";
import { useAuth } from "./auth-context";
import { io, type Socket } from "socket.io-client";

// Types based on the provided schema
export enum Theme {
  DEFAULT = "DEFAULT",
  DARK = "DARK",
  LIGHT = "LIGHT",
  SPACE = "SPACE",
  NATURE = "NATURE",
  RETRO = "RETRO",
}

type Message = {
  id: number;
  content: string;
  sender: {
    id: number;
    name: string;
  };
  roomId: number;
  createdAt: string;
  type?: "text" | "gif";
  gifUrl?: string;
};

type Room = {
  id: number;
  hashName: string;
  name: string;
  type: "private" | "public";
  theme: Theme;
  members: {
    user: {
      id: number;
      name: string;
    };
  }[];
  messages?: Message[];
  createdAt: string;
};

type User = {
  id: number;
  name: string;
  socketId?: string;
};

type SocketContextType = {
  connected: boolean;
  activeUsers: User[];
  rooms: Room[];
  currentRoom: Room | null;
  messages: Record<string, Message[]>;
  sendMessage: (
    content: string,
    roomHashName: string,
    type?: "text" | "gif",
    gifUrl?: string
  ) => void;
  joinRoomByHashName: (hashName: string) => Promise<boolean>;
  startPrivateChat: (otherUsername: string) => Promise<Room | null>;
  leaveRoom: (roomHashName: string) => void;
  getRoomMembers: (roomHashName: string) => User[];
  setRoomTheme: (roomHashName: string, theme: Theme) => Promise<boolean>;
  loading: boolean;
};

const SocketContext = createContext<SocketContextType | undefined>(undefined);

// API base URL
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [connected, setConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [loading, setLoading] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  // Connect to socket when user logs in
  useEffect(() => {
    if (user) {
      // Connect to socket.io server
      console.log("Connecting to socket...");

      // Initialize socket connection with headers for authentication
      const socket = io(`${API_BASE_URL.replace("/api", "")}`, {
        extraHeaders: {
          username: user.username,
          password: user.id, // In a real app, you'd use a proper password
        },
      });

      socketRef.current = socket;

      socket.on("connect", () => {
        console.log("Socket connected");
        setConnected(true);

        // Fetch rooms from API
        fetchRooms();
      });

      socket.on("user connected", (data) => {
        console.log("Users connected:", data);
        // Format active users from the event data
        const formattedUsers = data.users.map((u: any) => ({
          id: u.user.id,
          name: u.user.name,
          socketId: u.socketId,
        }));
        setActiveUsers(formattedUsers);
      });

      socket.on("new user joined", (data) => {
        console.log("New user joined:", data);
        setActiveUsers((prev) => [
          ...prev,
          { id: data.user.id, name: data.user.name, socketId: data.socketId },
        ]);
      });

      // Handle join room event
      socket.on("join room", (data) => {
        console.log("Joined room:", data);
        const { room } = data;

        // Add room to state if not already there
        setRooms((prev) => {
          if (!prev.some((r) => r.hashName === room.hashName)) {
            return [...prev, room];
          }
          return prev;
        });

        // Set as current room
        setCurrentRoom(room);

        // Initialize messages for this room if needed
        if (!messages[room.hashName]) {
          setMessages((prev) => ({
            ...prev,
            [room.hashName]: room.messages || [],
          }));
        }
      });

      // Handle private messages
      socket.on("private message", (data) => {
        console.log("Private message received:", data);
        const { content, from, room: roomHashName, createdAt } = data;
        const newMessage = {
          id: Date.now(),
          content,
          sender: from,
          roomId: 0, // We don't have the room ID here, but it's not critical
          createdAt: createdAt || new Date().toISOString(),
          type: "text",
        };

        setMessages((prev) => ({
          ...prev,
          [roomHashName]: [...(prev[roomHashName] || []), newMessage],
        }));
      });

      // Handle global messages
      socket.on("global message", (data) => {
        console.log("Global message received:", data);
        const { content, from, to } = data;
        const newMessage = {
          id: Date.now(),
          content,
          sender: from,
          roomId: to.id,
          createdAt: new Date().toISOString(),
          type: "text",
        };

        setMessages((prev) => ({
          ...prev,
          [to.hashName]: [...(prev[to.hashName] || []), newMessage],
        }));
      });

      // Handle user disconnection
      socket.on("user disconnected", (data) => {
        console.log("User disconnected:", data);
        setActiveUsers((prev) => prev.filter((u) => u.id !== data.userID));
      });

      // Clean up on unmount
      return () => {
        socket.disconnect();
        setConnected(false);
      };
    }
  }, [user]);

  // Fetch rooms from API
  const fetchRooms = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get joined rooms
      const joinedResponse = await fetch(`${API_BASE_URL}/room/joined`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id }),
      });

      const joinedData = await joinedResponse.json();

      if (joinedData.success) {
        // Filter to only show private rooms as per requirements
        const privateRooms = joinedData.data.filter(
          (room: Room) => room.type === "private"
        );
        setRooms(privateRooms);

        // Initialize messages for each room
        const messagesObj: Record<string, Message[]> = {};
        for (const room of privateRooms) {
          // Fetch messages for each room
          const msgResponse = await fetch(
            `${API_BASE_URL}/room/${room.hashName}`
          );
          const msgData = await msgResponse.json();

          if (msgData.success && msgData.data.messages) {
            messagesObj[room.hashName] = msgData.data.messages;
          } else {
            messagesObj[room.hashName] = [];
          }
        }

        setMessages(messagesObj);
      }
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
    } finally {
      setLoading(false);
    }
  };

  // Send message to a room
  const sendMessage = (
    content: string,
    roomHashName: string,
    type: "text" | "gif" = "text",
    gifUrl?: string
  ) => {
    if (!user || !connected || !socketRef.current) return;

    // Find the room by hashName
    const room = rooms.find((r) => r.hashName === roomHashName);
    if (!room) return;

    // For private rooms, we need to find the other user
    const otherMember = room.members.find((m) => m.user.id !== Number(user.id));

    if (room.type === "private" && otherMember) {
      // Emit private message event
      socketRef.current.emit(
        "private message",
        JSON.stringify({
          content,
          otherName: otherMember.user.name,
          type,
          gifUrl,
        })
      );
    } else {
      // Emit global message event
      socketRef.current.emit(
        "global message",
        JSON.stringify({
          content,
          type,
          gifUrl,
        })
      );
    }

    // Optimistically update UI
    const newMessage: Message = {
      id: Date.now(),
      content,
      sender: { id: Number(user.id), name: user.username },
      roomId: room.id,
      createdAt: new Date().toISOString(),
      type,
      gifUrl,
    };

    setMessages((prev) => ({
      ...prev,
      [roomHashName]: [...(prev[roomHashName] || []), newMessage],
    }));
  };

  // Join a room by hashName
  const joinRoomByHashName = async (hashName: string): Promise<boolean> => {
    if (!user || !connected || !socketRef.current) return false;
    setLoading(true);

    try {
      // Fetch room details from API
      const response = await fetch(`${API_BASE_URL}/room/${hashName}`);
      const data = await response.json();

      if (data.success) {
        const room = data.data;

        // Join the room via socket
        socketRef.current.emit(
          "join public room", // This works for both public and private rooms
          JSON.stringify({
            hashRoomName: hashName,
          })
        );

        // Add room to state if not already there
        setRooms((prev) => {
          if (!prev.some((r) => r.hashName === hashName)) {
            return [...prev, room];
          }
          return prev;
        });

        setCurrentRoom(room);

        // Initialize messages for this room
        if (!messages[hashName]) {
          setMessages((prev) => ({
            ...prev,
            [hashName]: room.messages || [],
          }));
        }

        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to join room:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Start a private chat with another user
  const startPrivateChat = async (
    otherUsername: string
  ): Promise<Room | null> => {
    if (!user || !connected || !socketRef.current) return null;
    setLoading(true);

    try {
      // Emit join private room event (which creates the room if it doesn't exist)
      socketRef.current.emit(
        "join private room",
        JSON.stringify({
          otherName: otherUsername,
        })
      );

      // Wait for room to be created and joined
      // The "join room" event will be emitted by the server
      // We'll wait a bit to allow the event to be processed
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Refresh rooms to get the newly created room
      await fetchRooms();

      // Find the newly created room
      const newRoom = rooms.find(
        (r) =>
          r.members.some((m) => m.user.name === otherUsername) &&
          r.members.some((m) => m.user.id === Number(user.id))
      );

      if (newRoom) {
        setCurrentRoom(newRoom);
        return newRoom;
      }

      return null;
    } catch (error) {
      console.error("Failed to create room:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Leave a room
  const leaveRoom = (roomHashName: string) => {
    if (!user) return;

    // Find the room
    const roomToLeave = rooms.find((r) => r.hashName === roomHashName);
    if (!roomToLeave) return;

    // Remove from user's rooms
    setRooms((prev) => prev.filter((r) => r.hashName !== roomHashName));

    // If current room is the one being left, switch to another room
    if (currentRoom?.hashName === roomHashName) {
      const anotherRoom = rooms.find((r) => r.hashName !== roomHashName);
      setCurrentRoom(anotherRoom || null);
    }
  };

  // Get room members
  const getRoomMembers = (roomHashName: string): User[] => {
    const room = rooms.find((r) => r.hashName === roomHashName);
    return room ? room.members.map((m) => m.user) : [];
  };

  // Set room theme
  const setRoomTheme = async (
    roomHashName: string,
    theme: Theme
  ): Promise<boolean> => {
    if (!user || !connected) return false;
    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/room/${roomHashName}/theme`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ theme }),
        }
      );

      const data = await response.json();
      if (data.success) {
        setRooms((prev) =>
          prev.map((r) => (r.hashName === roomHashName ? { ...r, theme } : r))
        );
        if (currentRoom?.hashName === roomHashName) {
          setCurrentRoom((prev) => (prev ? { ...prev, theme } : null));
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to set room theme:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        connected,
        activeUsers,
        rooms,
        currentRoom,
        messages,
        sendMessage,
        joinRoomByHashName,
        startPrivateChat,
        leaveRoom,
        getRoomMembers,
        setRoomTheme,
        loading,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
