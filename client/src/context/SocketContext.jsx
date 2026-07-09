import { useAppStore } from "@/store";
import { HOST } from "@/utils/constants";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";


const SocketContext = createContext(null);

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const socket = useRef();
    const [socketInstance, setSocketInstance] = useState(null);
    const { userInfo } = useAppStore();

    useEffect(() => {
        if(userInfo) {
            socket.current = io(HOST, {
                withCredentials: true,
                query: { userId: userInfo.id },
            });
            socket.current.on("connect", () => {
                // socket connected
            });

            const handleReceiveMessage = (message) => {
                const { selectedChatData, selectedChatType, addMessage, addContactsInDMContacts, incrementUnread } = useAppStore.getState();

                if(selectedChatType !== undefined && (selectedChatData._id === message.sender._id || selectedChatData._id === message.recipient._id)) {
                    addMessage(message);
                } else {
                    // Not currently viewing this chat — increment unread count
                    incrementUnread(message.sender._id);
                }
                addContactsInDMContacts(message);
            };

            const handleReceiveChannelMessage = (message) => {
                const { selectedChatData, selectedChatType, addMessage, addChannelInChannelList, incrementUnread } = useAppStore.getState();

                if(selectedChatType !== undefined && selectedChatData._id === message.channelId) {
                    addMessage(message);
                } else {
                    // Not currently viewing this channel — increment unread count
                    incrementUnread(message.channelId);
                }
                addChannelInChannelList(message);
            };

            socket.current.on("receiveMessage", handleReceiveMessage);
            socket.current.on("receive-channel-message", handleReceiveChannelMessage);
            setSocketInstance(socket.current);

            return () => {
                socket.current.disconnect();
                setSocketInstance(null);
            };
        }
    }, [userInfo]);

    return (
        <SocketContext.Provider value={socketInstance}>
            {children}
        </SocketContext.Provider>
    );
};