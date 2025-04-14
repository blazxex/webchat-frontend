"use client";

import { Lock, Users, Loader2 } from "lucide-react";
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
import { useAuth } from "@/contexts/auth-context"; // ✅ added

export function Sidebar() {
  const { rooms, currentRoom, joinRoomByHashName, loading } = useSocket();
  const { isOpen } = useSidebar();
  const { user } = useAuth(); // ✅ current user info

  const handleSelectRoom = (room: any) => {
    joinRoomByHashName(room.hashName);
  };

  // ✅ Extract display name based on format
  const getRoomDisplayName = (roomName: string): string => {
    if (!user?.username) return roomName;

    const regex = /^(.+)-(.+)$/;
    const match = roomName.match(regex);

    if (match) {
      const [_, userA, userB] = match;
      if (user.username === userA) return userB;
      if (user.username === userB) return userA;
    }

    return roomName;
  };

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
          "flex flex-col gap-2 px-4 py-2",
          !isOpen && "hidden md:flex"
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
            <div className="px-2 py-1">
              <h3
                className={cn(
                  "px-2 py-1 text-xs font-medium text-muted-foreground",
                  !isOpen && "hidden md:hidden"
                )}
              >
                Private Rooms
              </h3>
              {loading ? (
                <div className="flex justify-center items-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : rooms.length === 0 ? (
                <div className="px-4 py-2 text-sm text-muted-foreground">
                  {isOpen ? "No rooms joined" : ""}
                </div>
              ) : (
                rooms.map((room) => (
                  <Button
                    key={room.hashName}
                    variant={
                      currentRoom?.hashName === room.hashName
                        ? "secondary"
                        : "ghost"
                    }
                    className={cn(
                      "w-full justify-start mb-1",
                      !isOpen && "md:justify-center md:px-2"
                    )}
                    onClick={() => handleSelectRoom(room)}
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    <span
                      className={cn(
                        "truncate flex-1",
                        !isOpen && "hidden md:hidden"
                      )}
                    >
                      {getRoomDisplayName(room.name)} {}
                    </span>
                    {isOpen && (
                      <Badge variant="outline" className="ml-2">
                        {room.members.length}
                      </Badge>
                    )}
                  </Button>
                ))
              )}
            </div>
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
