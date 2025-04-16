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
  sendMessage: (content: string, roomHashName: string) => void;
  joinRoomByHashName: (hashName: string) => Promise<boolean>;
  startPrivateChat: (otherUsername: string) => Promise<Room | null>;
  createRoom: (roomName: string) => Promise<Room | null>;
  leaveRoom: (roomHashName: string) => void;
  getRoomMembers: (roomHashName: string) => User[];
  setRoomTheme: (roomHashName: string, theme: Theme) => Promise<boolean>;
  loading: boolean;
};

const SocketContext = createContext<SocketContextType | undefined>(undefined);

// API base URL
const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:3001/api";

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [connected, setConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [loading, setLoading] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  // Store sent message IDs to prevent duplicates
  const sentMessagesRef = useRef<Set<string>>(new Set());

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

        // Create a unique ID for this message
        const messageId = `${roomHashName}-${from.id}-${content}-${
          createdAt || Date.now()
        }`;

        // Check if we've already processed this message
        if (sentMessagesRef.current.has(messageId)) {
          console.log("Duplicate message detected, ignoring:", messageId);
          return;
        }

        const newMessage = {
          id: Date.now(),
          content,
          sender: from,
          roomId: 0, // We don't have the room ID here, but it's not critical
          createdAt: createdAt || new Date().toISOString(),
        };
        console.log("New message:", newMessage);
        setMessages((prev) => ({
          ...prev,
          [roomHashName]: [...(prev[roomHashName] || []), newMessage],
        }));
      });

      // Handle public messages
      socket.on("public message", (data) => {
        console.log("Public message received:", data);
        const { content, from, to } = data;

        // Create a unique ID for this message
        const messageId = `${to.hashName}-${from.id}-${content}-${Date.now()}`;

        // Check if we've already processed this message
        if (sentMessagesRef.current.has(messageId)) {
          console.log("Duplicate message detected, ignoring:", messageId);
          return;
        }

        const newMessage = {
          id: Date.now(),
          content,
          sender: from,
          roomId: to.id,
          createdAt: new Date().toISOString(),
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

      socket.on("public : user connected", (data) => {
        fetchRooms()
      });

      // Clean up on unmount
      return () => {
        socket.disconnect();
        setConnected(false);
      };
    }
  }, [user]);

  // Fetch rooms from API
  const fetchRooms = async (): Promise<Room[] | null> => {
    if (!user) return null;

    setLoading(true);
    try {
      const joinedResponse = await fetch(
        `${API_BASE_URL}/room/joined?username=${user.username}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const joinedData = await joinedResponse.json();

      if (joinedData.success) {
        const Rooms = joinedData.data;
        setRooms(Rooms);

        // Initialize messages for each room
        const messagesObj: Record<string, Message[]> = {};
        for (const room of Rooms) {
          const msgResponse = await fetch(
            `${API_BASE_URL}/room/${room.hashName}`,
            {
              headers: {
                username: user.username,
                password: user.id,
              },
            }
          );
          const msgData = await msgResponse.json();

          if (msgData.success && msgData.data.messages) {
            messagesObj[room.hashName] = msgData.data.messages;
          } else {
            messagesObj[room.hashName] = [];
          }
        }

        setMessages(messagesObj);
        return Rooms;
      }
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
    } finally {
      setLoading(false);
    }

    return null;
  };

  // Send message to a room
  const sendMessage = (content: string, roomHashName: string) => {
    if (!user || !connected || !socketRef.current) return;

    // Find the room by hashName
    const room = rooms.find((r) => r.hashName === roomHashName);
    if (!room) return;

    // Create a unique ID for this message to track it
    const messageId = `${roomHashName}-${user.id}-${content}-${Date.now()}`;

    // Add to sent messages set to prevent duplicates
    sentMessagesRef.current.add(messageId);

    // Clean up old message IDs after 10 seconds to prevent memory leaks
    setTimeout(() => {
      sentMessagesRef.current.delete(messageId);
    }, 10000);

    // Create the message payload
    const messagePayload: any = {
      content,
    };

    if (room.type === "private") {
      // For private rooms, we need to find the other user
      const otherMember = room.members.find(
        (m) => m.user.name !== user.username
      );

      messagePayload.otherName = otherMember?.user.name ?? null;
      console.log("Emitting private message to:", messagePayload.otherName);
      socketRef.current.emit("private message", JSON.stringify(messagePayload));
    } else {
      // Emit public message event
      messagePayload.hashRoomName = roomHashName;
      socketRef.current.emit("public message", JSON.stringify(messagePayload));
    }

    // Add message to UI immediately for better UX
    // const newMessage: Message = {
    //   id: Date.now(),
    //   content,
    //   sender: { id: Number(user.id), name: user.username },
    //   roomId: room.id,
    //   createdAt: new Date().toISOString(),
    // };

    // setMessages((prev) => ({
    //   ...prev,
    //   [roomHashName]: [...(prev[roomHashName] || []), newMessage],
    // }));
  };

  // Join a room by hashName
  const joinRoomByHashName = async (hashName: string): Promise<boolean> => {
    console.log("using joinRoomByHashName", hashName);
    if (!user || !connected || !socketRef.current) return false;
    setLoading(true);

    try {
      // Fetch room details from API
      const response = await fetch(`${API_BASE_URL}/room/${hashName}`, {
        headers: {
          username: user.username,
          password: user.id,
        },
      });
      console.log("Response:", response);
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

        // Wait for the join room event to be processed
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Add room to state if not already there
        setRooms((prev) => {
          if (!prev.some((r) => r.hashName === hashName)) {
            return [...prev, room];
          }
          return prev;
        });

        setCurrentRoom(room);

        // Initialize messages for this room
        setMessages((prev) => ({
          ...prev,
          [hashName]: room.messages || [],
        }));

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
    console.log("Using startPrivateChat");
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
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Refresh rooms to get the newly created room
      const rooms = await fetchRooms();

      // Find the newly created room
      console.log("Rooms after fetching:", rooms);
      console.log("Other username:", otherUsername);
      const possibleNames = [
        `${user.username}-${otherUsername}`,
        `${otherUsername}-${user.username}`,
      ];

      const newRoom = rooms.find((r) => possibleNames.includes(r.name));

      console.log("New room found:", newRoom);
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
    if (!room || !room.members) return [];

    return room.members.map((m) => ({
      id: m.user.id,
      name: m.user.name,
    }));
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
            username: user.username,
            password: user.id,
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

  // Create a new room using socket events
  const createRoom = async (roomName: string): Promise<Room | null> => {
    if (!user || !connected || !socketRef.current) return null;
    setLoading(true);

    try {
      // Use the create public room socket event instead of API call
      socketRef.current.emit(
        "create public room",
        JSON.stringify({
          roomName: roomName,
        })
      );

      // Wait for the room to be created and joined
      // The server will emit a "join room" event
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Refresh rooms to get the newly created room
      const rooms = await fetchRooms();

      // Find the newly created room by name
      console.log("Rooms after creating:", rooms);
      console.log("Room name:", roomName);
      const newRoom = rooms.find((r) => r.name === roomName);

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
        createRoom,
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
