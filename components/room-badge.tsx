import { useState, useEffect, useRef } from "react";
import { Badge } from "./ui/badge";

export function RoomBadge({ room }: { room: any }) {
    const [isMembersVisible, setIsMembersVisible] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const toggleMembersVisibility = () => {
        setIsMembersVisible((prev) => !prev);
    };

    // Close popup on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsMembersVisible(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="relative" ref={wrapperRef}>
            {/* Badge to toggle member visibility */}
            <Badge variant="outline" className="ml-auto cursor-pointer" onClick={toggleMembersVisibility}>
                {room.members?.length ?? 0}
            </Badge>

            {/* Show member list if isMembersVisible is true */}
            {isMembersVisible && (
                <div className="absolute right-0 top-full mt-2 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-xl w-48 max-h-64 overflow-y-auto z-10 border border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-base text-gray-800 dark:text-gray-100 mb-3 pb-2 border-b border-gray-300 dark:border-gray-600">
                        Room Members
                    </h4>
                    <ul className="space-y-2">
                        {room.members?.map((member: any, index: number) => (
                            <li
                                key={index}
                                className="text-sm text-gray-700 dark:text-gray-200"
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
