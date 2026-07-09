import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { getColor } from '@/lib/utils';
import { useAppStore } from '@/store';
import { HOST } from '@/utils/constants';
import { useSocket } from '@/context/SocketContext';
import React, { useEffect, useState } from 'react'
import { RiCloseFill } from "react-icons/ri"

function ChatHeader() {

  const { closeChat, selectedChatData, selectedChatType } = useAppStore();
  const socket = useSocket();
  const [isOnline, setIsOnline] = useState(false);

  // Check online status whenever the selected DM contact changes
  useEffect(() => {
    setIsOnline(false);
    if (selectedChatType === "contact" && socket && selectedChatData?._id) {
      socket.emit("get-user-status", selectedChatData._id);
      socket.on("user-status", ({ userId, isOnline: online }) => {
        if (userId === selectedChatData._id) setIsOnline(online);
      });
      return () => socket.off("user-status");
    }
  }, [selectedChatData, selectedChatType, socket]);

  return (
    <div className="h-16 border-b-2 border-[#2f303b] flex items-center justify-between px-5">
      <div className="flex gap-4 items-center w-full justify-between">
        <div className="flex gap-3 items-center">
          <div className="w-10 h-10 relative shrink-0">
            {
              selectedChatType === "contact" ? (
                <Avatar className="w-10 h-10 rounded-full overflow-hidden">
                  {selectedChatData.image ? (
                    <AvatarImage
                      src={`${HOST}/${selectedChatData.image}`}
                      alt="profile"
                      className="object-cover w-full h-full bg-black"
                    />
                  ) : (
                    <div className={`uppercase h-10 w-10 flex items-center justify-center text-base border-[1px] rounded-full ${getColor(selectedChatData.color)}`}>
                      {selectedChatData.firstName ? selectedChatData.firstName.split("").shift() :
                      selectedChatData.email.split("").shift()}
                    </div>
                  )}
                </Avatar>
              ) : (
                <div className='bg-[#ffffff22] h-10 w-10 flex items-center justify-center rounded-full text-sm'>
                  #
                </div>
              )
            }
            {/* Online indicator dot */}
            {selectedChatType === "contact" && isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#22c55e] rounded-full border-2 border-[#1c1d25]" />
            )}
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-white text-base font-semibold">
              {selectedChatType === "channel" && selectedChatData.name}
              {selectedChatType === "contact" && (
                selectedChatData.firstName
                  ? `${selectedChatData.firstName} ${selectedChatData.lastName}`
                  : selectedChatData.email
              )}
            </span>
            {selectedChatType === "contact" && (
              <span className={`text-xs flex items-center gap-1 ${
                isOnline ? "text-[#22c55e]" : "text-white/40"
              }`}>
                {isOnline && <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] inline-block" />}
                {isOnline ? "Active now" : "Offline"}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center justify-center gap-5">
          <button
            className="text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all"
            onClick={closeChat}
          >
            <RiCloseFill className="text-3xl" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatHeader;