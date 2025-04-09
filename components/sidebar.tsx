"use client";

import { useState } from "react";
import { Plus, Users, Globe, Hash, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSocket } from "@/contexts/socket-context";
import { useAuth } from "@/contexts/auth-context";
import { useSidebar } from "@/contexts/sidebar-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { JoinRoomDialog } from "./join-room-dialog";
import { Badge } from "@/components/ui/badge";

export function Sidebar() {
  const { users, rooms, joinRoom, createRoom, getAllRooms } = useSocket();
  const { user } = useAuth();
  const { isOpen } = useSidebar();
  const [newGroupName, setNewGroupName] = useState("");
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [newPrivateRoomName, setNewPrivateRoomName] = useState("");
  const [isCreatingPrivateRoom, setIsCreatingPrivateRoom] = useState(false);
  const [activeTab, setActiveTab] = useState("rooms");

  const handleCreateGroup = () => {
    if (newGroupName.trim()) {
      createRoom(newGroupName.trim(), "group");
      setNewGroupName("");
      setIsCreatingGroup(false);
    }
  };

  const handleCreatePrivateRoom = () => {
    if (newPrivateRoomName.trim()) {
      const room = createRoom(newPrivateRoomName.trim(), "private");
      setNewPrivateRoomName("");
      setIsCreatingPrivateRoom(false);
    }
  };

  const handleStartDM = (username: string) => {
    createRoom(username, "dm");
  };

  const filteredUsers = users.filter((username) => username !== user?.username);
  const allRooms = getAllRooms();
  const publicRooms = allRooms.filter(
    (room) => room.type === "group" || room.type === "global"
  );
  const privateRooms = rooms.filter((room) => room.type === "private");
  const directMessages = rooms.filter((room) => room.type === "dm");

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

      {/* Action buttons at the top */}
      <div
        className={cn(
          "flex justify-between items-center px-4 py-2",
          !isOpen && "hidden md:flex"
        )}
      >
        <JoinRoomDialog />
        <Dialog
          open={isCreatingPrivateRoom}
          onOpenChange={setIsCreatingPrivateRoom}
        >
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              Create Private
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Private Room</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <Input
                placeholder="Room name"
                value={newPrivateRoomName}
                onChange={(e) => setNewPrivateRoomName(e.target.value)}
              />
              <Button onClick={handleCreatePrivateRoom}>Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs navigation */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col"
      >
        <TabsList
          className={cn(
            "grid grid-cols-3 mx-4 mt-2",
            !isOpen && "hidden md:grid"
          )}
        >
          <TabsTrigger value="rooms">Public</TabsTrigger>
          <TabsTrigger value="private">Private</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        {/* Dynamic content based on active tab */}
        <div className="flex-1 overflow-hidden mt-2">
          <ScrollArea className="h-[calc(100vh-160px)]">
            {activeTab === "rooms" && (
              <div className="px-2 py-1">
                <div
                  className={cn(
                    "px-2 py-1 flex justify-between items-center",
                    !isOpen && "hidden md:flex"
                  )}
                >
                  <h3
                    className={cn(
                      "text-xs font-medium text-muted-foreground",
                      !isOpen && "hidden md:hidden"
                    )}
                  >
                    Public Rooms
                  </h3>
                  <Dialog
                    open={isCreatingGroup}
                    onOpenChange={setIsCreatingGroup}
                  >
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Plus className="h-4 w-4" />
                        <span className="sr-only">Create Group</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Group</DialogTitle>
                      </DialogHeader>
                      <div className="flex flex-col gap-4">
                        <Input
                          placeholder="Group name"
                          value={newGroupName}
                          onChange={(e) => setNewGroupName(e.target.value)}
                        />
                        <Button onClick={handleCreateGroup}>
                          Create Group
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                {publicRooms.map((room) => (
                  <Button
                    key={room.id}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start mb-1",
                      !isOpen && "md:justify-center md:px-2"
                    )}
                    onClick={() => joinRoom(room)}
                  >
                    {room.type === "global" ? (
                      <Globe className="h-4 w-4 mr-2" />
                    ) : (
                      <Hash className="h-4 w-4 mr-2" />
                    )}
                    <span
                      className={cn(
                        "truncate flex-1",
                        !isOpen && "hidden md:hidden"
                      )}
                    >
                      {room.name}
                    </span>
                    {isOpen && (
                      <Badge variant="outline" className="ml-2">
                        {room.members.length}
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            )}

            {activeTab === "private" && (
              <div className="px-2 py-1">
                <h3
                  className={cn(
                    "px-2 py-1 text-xs font-medium text-muted-foreground",
                    !isOpen && "hidden md:hidden"
                  )}
                >
                  Private Rooms
                </h3>
                {privateRooms.length === 0 ? (
                  <div className="px-4 py-2 text-sm text-muted-foreground">
                    {isOpen ? "No private rooms joined" : ""}
                  </div>
                ) : (
                  privateRooms.map((room) => (
                    <Button
                      key={room.id}
                      variant="ghost"
                      className={cn(
                        "w-full justify-start mb-1",
                        !isOpen && "md:justify-center md:px-2"
                      )}
                      onClick={() => joinRoom(room)}
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      <span
                        className={cn(
                          "truncate flex-1",
                          !isOpen && "hidden md:hidden"
                        )}
                      >
                        {room.name}
                      </span>
                      {isOpen && (
                        <Badge variant="outline" className="ml-2">
                          {room.members.length}
                        </Badge>
                      )}
                    </Button>
                  ))
                )}

                <h3
                  className={cn(
                    "px-2 py-1 mt-4 text-xs font-medium text-muted-foreground",
                    !isOpen && "hidden md:hidden"
                  )}
                >
                  Direct Messages
                </h3>
                {directMessages.length === 0 ? (
                  <div className="px-4 py-2 text-sm text-muted-foreground">
                    {isOpen ? "No direct messages" : ""}
                  </div>
                ) : (
                  directMessages.map((room) => (
                    <Button
                      key={room.id}
                      variant="ghost"
                      className={cn(
                        "w-full justify-start mb-1",
                        !isOpen && "md:justify-center md:px-2"
                      )}
                      onClick={() => joinRoom(room)}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      <span
                        className={cn(
                          "truncate",
                          !isOpen && "hidden md:hidden"
                        )}
                      >
                        {room.members.find((m) => m !== user?.username) ||
                          "Unknown"}
                      </span>
                    </Button>
                  ))
                )}
              </div>
            )}

            {activeTab === "users" && (
              <div className="px-2 py-1">
                <h3
                  className={cn(
                    "px-2 py-1 text-xs font-medium text-muted-foreground",
                    !isOpen && "hidden md:hidden"
                  )}
                >
                  Online Users
                </h3>
                {filteredUsers.map((username) => (
                  <Button
                    key={username}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start mb-1",
                      !isOpen && "md:justify-center md:px-2"
                    )}
                    onClick={() => handleStartDM(username)}
                  >
                    <div className="h-2 w-2 rounded-full bg-green-500 mr-2" />
                    <span
                      className={cn("truncate", !isOpen && "hidden md:hidden")}
                    >
                      {username}
                    </span>
                  </Button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </Tabs>
    </div>
  );
}
