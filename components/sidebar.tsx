"use client";

import {
  Lock,
  Unlock,
  Users,
  Globe,
  MessageCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSocket } from "@/contexts/socket-context";
import { useSidebar } from "@/contexts/sidebar-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { JoinRoomDialog } from "./join-room-dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActiveUsers } from "./active-users";
import { CreateRoomDialog } from "./create-room-dialog";
import { useAuth } from "@/contexts/auth-context";

export function Sidebar() {
  const { rooms, currentRoom, joinRoomByHashName, loading } = useSocket();
  const { isOpen } = useSidebar();
  const { user } = useAuth();

  const handleSelectRoom = (room: any) => {
    if (room.isUserJoined) {
      joinRoomByHashName(room.hashName);
    }
  };

  const getRoomDisplayName = (roomName: string): string => {
    if (!user?.username) return roomName;

    const regex = /^(.+)-(.+)$/;
    const match = roomName.match(regex);

    if (match) {
      const [_, userA, userB] = match;
      if (user.username === userA && user.username === userB) {
        return `${userA} (self)`;
      }
      if (user.username === userA) return userB;
      if (user.username === userB) return userA;
    }

    return roomName;
  };

  const globalRoom = rooms.find((room) => room.name === "Global");
  const privateRooms = rooms.filter(
    (room) => room.type === "public" && room.name !== "Global"
  );
  const dms = rooms.filter((room) => room.type === "private");

  const renderRoomSection = (
    title: string,
    roomList: any[],
    getIcon: (room: any) => React.ReactNode
  ) => (
    <div className="px-2 py-1">
      <h3
        className={cn(
          "px-2 py-1 text-xs font-medium text-muted-foreground",
          !isOpen && "hidden md:hidden"
        )}
      >
        {title}
      </h3>
      {roomList.length === 0 ? (
        <div className="px-4 py-2 text-sm text-muted-foreground">
          {isOpen ? "No rooms available" : ""}
        </div>
      ) : (
        roomList.map((room) => (
          <Button
            key={room.hashName}
            variant={
              currentRoom?.hashName === room.hashName ? "secondary" : "ghost"
            }
            className={cn(
              "w-full justify-start mb-1",
              !isOpen && "md:justify-center md:px-2",
              !room.isUserJoined && "cursor-not-allowed opacity-50"
            )}
            onClick={() => handleSelectRoom(room)}
            disabled={!room.isUserJoined}
          >
            {getIcon(room)}
            <span
              className={cn("truncate whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px]", !isOpen && "hidden md:hidden")}
            >
              {getRoomDisplayName(room.name)}
            </span>
            {isOpen && (
              <Badge variant="outline" className="ml-auto">
                {room.members?.length ?? 0}
              </Badge>
            )}
          </Button>
        ))
      )}
    </div>
  );

  return (
    <div
      className={cn(
        "border-r h-full flex flex-col bg-background transition-all duration-300 ease-in-out",
        isOpen ? "w-64" : "w-0 md:w-16 overflow-hidden"
      )}
    >
      <div className="p-4 border-b flex justify-between items-center">
        <h2
          className={cn(
            "font-semibold text-lg transition-opacity",
            isOpen ? "opacity-100" : "opacity-0 md:opacity-0"
          )}
        >
          WebChat
        </h2>
      </div>

      <div
        className={cn(
          "grid grid-cols-2 gap-2 px-4 py-2",
          !isOpen && "hidden md:grid"
        )}
      >
        <JoinRoomDialog />
        <CreateRoomDialog />
      </div>

      <Tabs defaultValue="rooms" className="flex-1 flex flex-col">
        <TabsList className="mx-4 mb-2">
          <TabsTrigger value="rooms" className="flex-1">
            <Lock className="h-4 w-4 mr-2" />
            <span className={cn(!isOpen && "hidden md:hidden")}>Rooms</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex-1">
            <Users className="h-4 w-4 mr-2" />
            <span className={cn(!isOpen && "hidden md:hidden")}>Users</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="rooms"
          className="flex-1 overflow-hidden mt-0 data-[state=active]:flex-1"
        >
          <ScrollArea className="h-[calc(100vh-160px)]">
            {loading ? (
              <div className="flex justify-center items-center py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : (
              <>
                {globalRoom &&
                  renderRoomSection("Global", [globalRoom], (room) => (
                    <Globe className="h-4 w-4 mr-2" />
                  ))}

                {renderRoomSection("Public Rooms", privateRooms, (room) =>
                  room.isUserJoined ? (
                    <Unlock className="h-4 w-4 mr-2 text-green-500" />
                  ) : (
                    <Lock className="h-4 w-4 mr-2 text-red-500" />
                  )
                )}

                {renderRoomSection("Private Rooms", dms, (room) =>
                  room.isUserJoined ? (
                    <Unlock className="h-4 w-4 mr-2 text-green-500" />
                  ) : (
                    <Lock className="h-4 w-4 mr-2 text-red-500" />
                  )
                )}
              </>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent
          value="users"
          className="flex-1 overflow-hidden mt-0 data-[state=active]:flex-1"
        >
          <ActiveUsers isOpen={isOpen} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
