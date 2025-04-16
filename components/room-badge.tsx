import { useState } from "react";
import { Badge } from "./ui/badge";

export function RoomBadge({ room }: { room: any }) {
    const [isMembersVisible, setIsMembersVisible] = useState(false);

    const toggleMembersVisibility = () => {
        setIsMembersVisible((prev) => !prev);
    };

    return (
        <div className="relative">
            {/* Badge to toggle member visibility */}
            <Badge 
                variant="outline" 
                className="ml-auto cursor-pointer"
                onClick={toggleMembersVisibility}
            >
                {room.members?.length ?? 0}
            </Badge>

            {/* Show member list if isMembersVisible is true */}
            {isMembersVisible && (
                <div className="absolute right-0 top-full mt-2 p-4 bg-gray-100 rounded-md shadow-lg w-60 max-h-64 overflow-y-auto z-10">
                    <h4 className="font-semibold text-lg mb-2">Room Members:</h4>
                    <ul className="space-y-2">
                        {room.members?.map((member: any, index: number) => (
                            <li key={index} className="text-sm">
                                {member.name}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
