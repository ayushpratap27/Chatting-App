import { useSocket } from '@/context/SocketContext';
import { apiClient } from '@/lib/api-client';
import { useAppStore } from '@/store';
import { UPLOAD_FILE_ROUTE, ENHANCE_MESSAGE_ROUTE } from '@/utils/constants';
import EmojiPicker from 'emoji-picker-react';
import React, { useEffect, useRef, useState } from 'react';
import { GrAttachment } from "react-icons/gr"
import { IoSend } from 'react-icons/io5';
import { RiEmojiStickerLine } from 'react-icons/ri';
import { HiSparkles } from 'react-icons/hi2';
import { PiMagicWandBold } from 'react-icons/pi';
import { toast } from 'sonner';

const ENHANCE_TONES = ["Professional", "Friendly", "Formal", "Casual", "Flirty", "Witty"];

function MessageBar({ onToggleSuggestions }) {
    const emojiRef = useRef();
    const wandRef = useRef();
    const fileInputRef = useRef();
    const socket = useSocket();
    const { selectedChatType,
            selectedChatData, 
            userInfo, 
            setIsUploading,
            setFileUploadProgress,
            draftMessage,
            setDraftMessage,
        } = useAppStore();
    const [message, setMessage] = useState("");
    const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
    const [showEnhanceMenu, setShowEnhanceMenu] = useState(false);
    const [isEnhancing, setIsEnhancing] = useState(false);

    // Apply draft message from reply suggestions
    useEffect(() => {
        if (draftMessage) {
            setMessage(draftMessage);
            setDraftMessage("");
        }
    }, [draftMessage, setDraftMessage]);

    // Close emoji picker on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if(emojiRef.current && !emojiRef.current.contains(event.target)) {
                setEmojiPickerOpen(false);
            }
            if(wandRef.current && !wandRef.current.contains(event.target)) {
                setShowEnhanceMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleAddEmoji = (emoji) => {
        setMessage((msg) => msg + emoji.emoji);
    };

    const handleSendMessage = async () => {
        if(!message.trim()) return;
        if(selectedChatType === "contact") {
            socket.emit("sendMessage", {
                sender: userInfo.id,
                content: message,
                recipient: selectedChatData._id,
                messageType: "text",
                fileUrl: undefined,
            });
        }else if (selectedChatType === "channel"){
            socket.emit("send-channel-message", {
                sender: userInfo.id,
                content: message,
                messageType: "text",
                fileUrl: undefined,
                channelId: selectedChatData._id,
            });
        }
        setMessage("");
    };

    const handleAttachmentClick = () => {
        if(fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleAttachmentChange = async (event) => {
        const file = event.target.files[0];
        if (fileInputRef.current) fileInputRef.current.value = "";
        if (!file) return;
        try {
            const formData = new FormData();
            formData.append("file", file);
            setIsUploading(true);
            setFileUploadProgress(0);
            const response = await apiClient.post(UPLOAD_FILE_ROUTE, formData, {
                withCredentials: true,
                onUploadProgress: (data) => {
                    setFileUploadProgress(Math.round((100 * data.loaded) / data.total));
                },
            });
            if(response.status === 200 && response.data) {
                if (selectedChatType === "contact") {
                    socket.emit("sendMessage", {
                        sender: userInfo.id,
                        content: undefined,
                        recipient: selectedChatData._id,
                        messageType: "file",
                        fileUrl: response.data.filePath,
                    });
                } else if (selectedChatType === "channel") {
                    socket.emit("send-channel-message", {
                        sender: userInfo.id,
                        content: undefined,
                        messageType: "file",
                        fileUrl: response.data.filePath,
                        channelId: selectedChatData._id,
                    });
                }
            }
        } catch (error) {
            console.log({error});
        } finally {
            setIsUploading(false);
        }
    };

    // Composer AI — fix grammar or change tone
    const handleEnhance = async (action, tone) => {
        setShowEnhanceMenu(false);
        setIsEnhancing(true);
        try {
            const response = await apiClient.post(
                ENHANCE_MESSAGE_ROUTE,
                { message, action, tone },
                { withCredentials: true }
            );
            if (response.data.enhanced) {
                setMessage(response.data.enhanced);
            }
        } catch (error) {
            toast.error("Failed to enhance message");
        } finally {
            setIsEnhancing(false);
        }
    };

  return (
    <div className='h-[10vh] bg-[#1c1d25] flex justify-center items-center px-8 mb-6 gap-6'>
        <div className={`flex-1 flex bg-[#2a2b33] rounded-md items-center gap-5 pr-5 transition-all duration-200 ${isEnhancing ? "ring-1 ring-[#8417ff]/50" : ""}`}>
            <textarea
                className="flex-1 p-5 bg-transparent text-1xl rounded-md focus:border-none focus:outline-none resize-none"
                placeholder={isEnhancing ? "Enhancing…" : "Enter Message"}
                value={message}
                disabled={isEnhancing}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        if (e.shiftKey) return;
                        e.preventDefault();
                        handleSendMessage();
                    }
                }}
                rows={1}
            />

            {/* ✨ Reply Suggestions toggle */}
            <button
                className="text-neutral-500 focus:border-none focus:outline-none hover:text-[#8417ff] duration-300 transition-all"
                onClick={onToggleSuggestions}
                title="Suggest replies"
            >
                <HiSparkles className="text-xl" />
            </button>

            {/* 🪄 Composer AI — only visible when text is present and not currently enhancing */}
            {message.trim().length > 0 && !isEnhancing && (
                <div className="relative" ref={wandRef}>
                    <button
                        className="text-neutral-500 focus:border-none focus:outline-none hover:text-[#8417ff] duration-300 transition-all"
                        onClick={() => setShowEnhanceMenu((v) => !v)}
                        title="Improve message"
                    >
                        <PiMagicWandBold className="text-xl" />
                    </button>

                    {showEnhanceMenu && (
                        <div className="absolute bottom-10 right-0 bg-[#1c1d25] border border-[#2a2b33] rounded-xl shadow-2xl overflow-hidden w-44 z-50">
                            <button
                                onClick={() => handleEnhance("fix-grammar")}
                                className="w-full text-left px-4 py-2.5 text-xs text-white/80 hover:bg-[#2a2b33] hover:text-white transition-all flex items-center gap-2"
                            >
                                ✏️ Fix Grammar
                            </button>
                            <div className="border-t border-[#2a2b33] my-0.5" />
                            {ENHANCE_TONES.map((tone) => (
                                <button
                                    key={tone}
                                    onClick={() => handleEnhance("change-tone", tone)}
                                    className="w-full text-left px-4 py-2 text-xs text-white/70 hover:bg-[#2a2b33] hover:text-white transition-all"
                                >
                                    {tone}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <button className='text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all'
            onClick={handleAttachmentClick}>
                <GrAttachment className='text-2xl' />
            </button>
            <input type="file" className='hidden' ref={fileInputRef} onChange={handleAttachmentChange} />
            <div className='relative'>
                <button className='text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all' onClick={() => setEmojiPickerOpen(true)}>
                    <RiEmojiStickerLine className='text-2xl' />
                </button>
                <div className='absolute bottom-16 right-0' ref={emojiRef}>
                    <EmojiPicker 
                        theme='dark'
                        open={emojiPickerOpen}
                        onEmojiClick={handleAddEmoji}
                        autoFocusSearch={false}
                    />
                </div>
            </div>
        </div>
        <button className='bg-[#8417ff] rounded-md flex items-center justify-center p-5 focus:border-none hover:bg-[#741bda] focus:bg-[#741bda] focus:outline-none focus:text-white duration-300 transition-all' onClick={handleSendMessage}>
            <IoSend className='text-2xl' />
        </button>
    </div>
  )
}

export default MessageBar;