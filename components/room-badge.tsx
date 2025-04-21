import { useState, useEffect, useRef } from "react";
import { Badge } from "./ui/badge";
import { Users2 } from "lucide-react"; // Make sure to install lucide-react

export function RoomBadge({ room }: { room: any }) {
  const [isMembersVisible, setIsMembersVisible] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const toggleMembersVisibility = () => {
    setIsMembersVisible((prev) => !prev);
  };

  // Close popup on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsMembersVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block text-left" ref={wrapperRef}>
      {/* Badge to toggle member visibility */}
      <Badge
        variant="outline"
        className="ml-auto cursor-pointer flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        onClick={toggleMembersVisibility}
      >
        <Users2 className="w-4 h-4" />
        {room.members?.length ?? 0}
      </Badge>

      {/* Member popup */}
      {isMembersVisible && (
        <div className="absolute right-0 top-full mt-2 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-64 max-h-72 overflow-y-auto z-50 border border-gray-200 dark:border-gray-700 animate-fadeIn">
          <div className="mb-2">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              Room:{" "}
              <span className="text-indigo-600 dark:text-indigo-400">
                {room.hashName}
              </span>
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {room.members?.length} members
            </p>
          </div>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {room.members?.map((member: any, index: number) => (
              <li
                key={index}
                className="py-2 text-sm text-gray-700 dark:text-gray-300"
              >
                {member.user.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
