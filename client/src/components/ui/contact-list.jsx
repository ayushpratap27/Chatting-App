import { getColor } from "@/lib/utils";
import { useAppStore } from "@/store"
import { HOST } from "@/utils/constants";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { getLastRead } from "@/lib/last-read";

const ContactList = ({ contacts, isChannel = false }) => {

    const { selectedChatData, setSelectedChatData, setSelectedChatType, selectedChatType, setSelectedChatMessages, clearUnread, unreadCounts, onlineUsers } = useAppStore();

    const handleClick = (contact) => {
        if(isChannel) setSelectedChatType("channel");
        else setSelectedChatType("contact");
        setSelectedChatData(contact);
        clearUnread(contact._id);
        if(selectedChatData && selectedChatData._id !== contact._id) {
            setSelectedChatMessages([]);
        }
    };

    return (
      <div className="mt-5">
        {contacts.map((contact) => {
          const isActive = selectedChatData && selectedChatData._id === contact._id;
          const realtimeCount = unreadCounts[contact._id] || 0;
          const isContactOnline = !isChannel && onlineUsers.includes(contact._id);

          // Offline unread: activity (lastMessageTime or updatedAt) is newer than last-read timestamp
          const lastActivity = isChannel ? contact.updatedAt : contact.lastMessageTime;
          const lastRead = getLastRead(contact._id);
          const hasOfflineUnread = !isActive && lastActivity && (!lastRead || new Date(lastActivity) > new Date(lastRead));

          return (
          <div
            key={contact._id}
            className={`pl-10 py-2 transition-all duration-200 cursor-pointer border-l-2 ${
              isActive
                ? "bg-[#8417ff]/20 border-[#8417ff]"
                : "border-transparent hover:bg-[#f1f1f111]"
            }`}
            onClick={() => handleClick(contact)}
          >
            <div className="flex gap-5 items-center justify-between pr-10 text-neutral-300">
              <div className="flex gap-5 items-center min-w-0">
                {!isChannel && (
                  <div className="relative shrink-0">
                    <Avatar className="h-10 w-10 rounded-full overflow-hidden">
                      {contact.image ? (
                        <AvatarImage
                          src={`${HOST}/${contact.image}`}
                          alt="profile"
                          className="object-cover w-full h-full bg-black"
                        />
                      ) : (
                        <div
                          className={`${getColor(contact.color)} uppercase h-10 w-10 text-lg border-[1px] flex items-center justify-center rounded-full`}
                        >
                          {contact.firstName
                            ? contact.firstName.split("").shift()
                            : contact.email.split("").shift()}
                        </div>
                      )}
                    </Avatar>
                    {isContactOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#22c55e] rounded-full border-2 border-[#1b1c24]" />
                    )}
                  </div>
                )}
                {isChannel && <div className="bg-[#ffffff22] h-10 w-10 flex items-center justify-center rounded-full shrink-0">#</div>}
                <span className={`truncate ${isActive ? "text-white font-medium" : ""}`}>
                  {isChannel
                    ? contact.name
                    : contact.firstName
                    ? `${contact.firstName} ${contact.lastName}`
                    : contact.email}
                </span>
              </div>

              {/* Unread badge — hidden when this chat is active */}
              {!isActive && (
                realtimeCount > 0 ? (
                  <span className="shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-[#8417ff] text-white text-[10px] font-bold flex items-center justify-center">
                    {realtimeCount > 99 ? "99+" : realtimeCount}
                  </span>
                ) : hasOfflineUnread ? (
                  <span className="shrink-0 w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
                ) : null
              )}
            </div>
          </div>
          );
        })}
      </div>
    );
};

export default ContactList;