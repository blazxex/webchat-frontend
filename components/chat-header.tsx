"use client";

import { Lock, LogOut, Info, Menu, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSocket } from "@/contexts/socket-context";
import { useAuth } from "@/contexts/auth-context";
import { useSidebar } from "@/contexts/sidebar-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Theme } from "@/contexts/socket-context";
import { toast } from "@/components/ui/use-toast";

const themeOptions = [
  { name: "Default", value: Theme.DEFAULT },
  { name: "Dark", value: Theme.DARK },
  { name: "Light", value: Theme.LIGHT },
  { name: "Space", value: Theme.SPACE },
  { name: "Nature", value: Theme.NATURE },
  { name: "Retro", value: Theme.RETRO },
];

export function ChatHeader() {
  const { currentRoom, getRoomMembers, setRoomTheme, loading } = useSocket();
  const { logout } = useAuth();
  const { toggle } = useSidebar();
  const [showRoomInfo, setShowRoomInfo] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!currentRoom) return null;

  const members = getRoomMembers(currentRoom.hashName);

  const handleThemeChange = async (theme: Theme) => {
    const success = await setRoomTheme(currentRoom.hashName, theme);
    if (success) {
      toast({
        title: "Theme updated",
        description: `Room theme has been changed to ${theme.toLowerCase()}.`,
      });
    }
  };

  const handleCopyHashName = () => {
    navigator.clipboard.writeText(currentRoom.hashName);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Format room name for display
  const displayName =
    currentRoom.type === "private"
      ? members
          .filter((m) => m.name !== localStorage.getItem("username"))
          .map((m) => m.name)
          .join(", ")
      : currentRoom.name;

  return (
    <div className="h-16 border-b flex items-center justify-between px-4">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          className="md:hidden mr-2"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
        <Lock className="h-5 w-5 mr-2" />
        <div>
          <h2 className="font-semibold">{displayName}</h2>
          <p className="text-xs text-muted-foreground">
            {members.length} members
          </p>
        </div>
        <Dialog open={showRoomInfo} onOpenChange={setShowRoomInfo}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="ml-2">
              <Info className="h-4 w-4" />
              <span className="sr-only">Room Info</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Room Information</DialogTitle>
              <DialogDescription>
                Share this room hash with others to let them join.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-md flex items-center justify-between">
                <code className="text-sm">{currentRoom.hashName}</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyHashName}
                  className="flex items-center gap-1"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">
                  Members ({members.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {members.map((member) => (
                    <Badge key={member.id} variant="outline">
                      {member.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Theme
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {themeOptions.map((theme) => (
              <DropdownMenuItem
                key={theme.value}
                onClick={() => handleThemeChange(theme.value)}
                disabled={loading}
              >
                {theme.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon" onClick={logout}>
          <LogOut className="h-5 w-5" />
          <span className="sr-only">Logout</span>
        </Button>
      </div>
    </div>
  );
}
