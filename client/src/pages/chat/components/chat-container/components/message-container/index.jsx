import { apiClient } from '@/lib/api-client';
import { useAppStore } from '@/store';
import { GET_ALL_MESSAGES_ROUTE, GET_CHANNEL_MESSAGES, HOST } from '@/utils/constants';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react'
import { MdFolderZip } from 'react-icons/md';
import { IoMdArrowRoundDown } from 'react-icons/io'
import { IoCloseSharp } from 'react-icons/io5';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getColor } from '@/lib/utils';
import { toast } from 'sonner';
import { getLastRead, setLastRead } from '@/lib/last-read';
import { useSocket } from '@/context/SocketContext';

function MessageContainer() {
  const scrollRef = useRef();
  const { selectedChatType, 
          selectedChatData, 
          userInfo, 
          selectedChatMessages, 
          setSelectedChatMessages,
          setFileDownloadProgress,
          setIsDownloading,
          setUnreadMessages,
          setShowSummaryBanner,
          clearUnread,
          hideMessage,
        } = useAppStore();
  const [showImage, setShowImage] = useState(false);
  const [imageURL, setImageURL] = useState(null);
  const [activeMessageId, setActiveMessageId] = useState(null);
  const socket = useSocket();

  const handleDeleteForEveryone = (messageId) => {
    if (!socket) return;
    socket.emit("delete-message", { messageId });
    setActiveMessageId(null);
  };

  const handleDeleteForMe = (messageId) => {
    if (!socket) return;
    socket.emit("delete-message-for-me", { messageId });
    setActiveMessageId(null);
  };

  // Long-press handlers — fires after 500ms hold (works on ALL messages)
  const getLongPressProps = (messageId) => {
    let timer;
    return {
      onMouseDown:  () => { timer = setTimeout(() => setActiveMessageId(messageId), 500); },
      onMouseUp:    () => clearTimeout(timer),
      onMouseLeave: () => clearTimeout(timer),
      onTouchStart: () => { timer = setTimeout(() => setActiveMessageId(messageId), 500); },
      onTouchEnd:   () => clearTimeout(timer),
      onTouchMove:  () => clearTimeout(timer),
    };
  };

  useEffect(() => {
    const detectUnread = (messages, isDM) => {
      const lastRead = getLastRead(selectedChatData._id);
      const unread = messages.filter((m) => {
        if (m.messageType !== "text") return false;
        const senderId = isDM ? m.sender : m.sender?._id;
        if (senderId === userInfo.id) return false;
        if (!lastRead) return true;
        return new Date(m.timestamp) > new Date(lastRead);
      });
      setUnreadMessages(unread);
      setShowSummaryBanner(unread.length > 0);
      // Clear the real-time unread count badge for this chat
      clearUnread(selectedChatData._id);
      // Mark as read after 30 seconds (for unread tracking only — banner stays until user types)
      const timer = setTimeout(() => {
        setLastRead(selectedChatData._id);
      }, 30000);
      return timer;
    };

    let autoReadTimer = null;

    const getMessages = async () => {
      try {
        const response = await apiClient.post(
          GET_ALL_MESSAGES_ROUTE,
          { id: selectedChatData._id },
          { withCredentials: true }
        );
        if(response.data.messages) {
          setSelectedChatMessages(response.data.messages);
          autoReadTimer = detectUnread(response.data.messages, true);
        }
      } catch (error) {
        toast.error("Failed to load messages");
      }
    };
    const getChannelMessages = async () => {
      try {
        const response = await apiClient.get(
          `${GET_CHANNEL_MESSAGES}/${selectedChatData._id}`,
          { withCredentials: true }
        );
        if(response.data.messages) {
          setSelectedChatMessages(response.data.messages);
          autoReadTimer = detectUnread(response.data.messages, false);
        }
      } catch (error) {
        toast.error("Failed to load messages");
      }
    };
    if(selectedChatData._id) {
      if(selectedChatType === "contact") getMessages();
      else if(selectedChatType === "channel") getChannelMessages();
    }
    return () => { if (autoReadTimer) clearTimeout(autoReadTimer); };
  }, [selectedChatData, selectedChatType, setSelectedChatMessages, setUnreadMessages, setShowSummaryBanner]);

  useEffect(() => {
    if(scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedChatMessages]);

  const checkIfImage = (filePath) => {
    const imageRegex = /\.(jpg|jpeg|png|gif|bmp|tiff|tif|webp|svg|ico|heic|heif)$/i;
    return imageRegex.test(filePath);
  };

  const renderMessages = () => {
    let lastDate = null;
    return selectedChatMessages.map((message, index) => {
      const messageDate = moment(message.timestamp).format("YYYY-MM-DD");
      const showDate = messageDate !== lastDate;
      lastDate = messageDate;

      // Show time only for the last message within the same minute
      const currentMinute = moment(message.timestamp).format("YYYY-MM-DD HH:mm");
      const nextMessage = selectedChatMessages[index + 1];
      const nextMinute = nextMessage
        ? moment(nextMessage.timestamp).format("YYYY-MM-DD HH:mm")
        : null;
      const showTime = !nextMinute || currentMinute !== nextMinute;

      return (
        <div key={message._id || index}>
          {showDate && (
            <div className='text-center text-gray-500 my-2'>
              {moment(message.timestamp).format("LL")}
            </div>
          )}
          { selectedChatType === "contact" && renderDMMessages(message, showTime) }
          { selectedChatType === "channel" && renderChannelMessages(message, showTime) }
        </div>
      );
    });
  };

  const downloadFile = async (url) => {
    try {
      setIsDownloading(true);
      setFileDownloadProgress(0);
      const response = await apiClient.get(`${HOST}/${url}`, {
        responseType: "blob",
        onDownloadProgress: (progressEvent) => {
          const { loaded, total } = progressEvent;
          const percentCompleted = Math.round((loaded * 100) / total);
          setFileDownloadProgress(percentCompleted);
        }
      });
      const urlBlob = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = urlBlob;
      link.setAttribute("download", url.split("/").pop());
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(urlBlob);
    } catch (error) {
      console.log({ error });
    } finally {
      setIsDownloading(false);
      setFileDownloadProgress(0);
    }
  };

  const renderDMMessages = (message, showTime) => {
    const isMine = message.sender !== selectedChatData._id;
    const isActive = activeMessageId === message._id;

    return (
      <div className={`${isMine ? "text-right" : "text-left"}`}>
        {message.isDeleted ? (
          <span className="inline-block italic text-white/30 text-xs border border-white/10 rounded-xl py-1.5 px-3 my-0.5">
            This message was deleted
          </span>
        ) : (
          <div
            className="relative inline-block max-w-[75%] md:max-w-[50%]"
            {...getLongPressProps(message._id)}
            onClick={() => { if (isActive) setActiveMessageId(null); }}
          >
            {/* Delete popup */}
            {isActive && (
              <div className={`absolute ${isMine ? "right-0" : "left-0"} bottom-full mb-1 bg-[#1c1d25] border border-[#2a2b33] rounded-xl shadow-2xl z-50 overflow-hidden min-w-[160px]`}>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteForMe(message._id); }}
                  className="flex items-center gap-2 px-4 py-2.5 text-white/70 hover:text-white text-xs hover:bg-[#2a2b33] w-full transition-all"
                >
                  <RiDeleteBin6Line className="text-sm" /> Delete for me
                </button>
                {isMine && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteForEveryone(message._id); }}
                    className="flex items-center gap-2 px-4 py-2.5 text-red-400 text-xs hover:bg-[#2a2b33] w-full transition-all border-t border-[#2a2b33]"
                  >
                    <RiDeleteBin6Line className="text-sm" /> Delete for everyone
                  </button>
                )}
              </div>
            )}

            {message.messageType === "text" && (
              <div
                className={`${
                  isMine
                    ? "bg-[#8417ff]/25 text-white border-[#8417ff]/60"
                    : "bg-[#2a2b33] text-white/90 border-[#ffffff]/10"
                } border py-2 px-3 rounded-xl my-0.5 break-words text-sm select-none`}
                style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}
              >
                {message.content}
              </div>
            )}
            {message.messageType === "file" && (
              <div
                className={`${
                  isMine
                    ? "bg-[#8417ff]/25 text-white border-[#8417ff]/60"
                    : "bg-[#2a2b33] text-white/90 border-[#ffffff]/10"
                } border py-2 px-3 rounded-xl my-0.5 break-words`}
              >
                {checkIfImage(message.fileUrl) ? (
                  <div className="cursor-pointer" onClick={() => { setShowImage(true); setImageURL(message.fileUrl); }}>
                    <img src={`${HOST}/${message.fileUrl}`} height={300} width={300} alt="message file" />
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-4">
                    <span className="text-white/80 text-3xl bg-black/20 rounded-full p-3"><MdFolderZip /></span>
                    <span>{message.fileUrl.split("/").pop()}</span>
                    <span className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all" onClick={() => downloadFile(message.fileUrl)}>
                      <IoMdArrowRoundDown />
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {showTime && !message.isDeleted && (
          <div className="text-[10px] text-gray-500 mt-0.5 mb-1">
            {moment(message.timestamp).format("LT")}
          </div>
        )}
      </div>
    );
  };

  const renderChannelMessages = (message, showTime) => {
    const isMine = message.sender._id === userInfo.id;
    const isActive = activeMessageId === message._id;
    return (
      <div className={`mt-2 ${!isMine ? "text-left" : "text-right"}`}>
        {message.isDeleted ? (
          <span className="inline-block italic text-white/30 text-xs border border-white/10 rounded-xl py-1.5 px-3 my-0.5 ml-9">
            This message was deleted
          </span>
        ) : (
          <>
            {message.messageType === "text" && (
              <div
                className="relative inline-block max-w-[75%] md:max-w-[50%]"
                {...getLongPressProps(message._id)}
                onClick={() => { if (isActive) setActiveMessageId(null); }}
              >
                {isActive && (
                  <div className={`absolute ${isMine ? "right-0" : "left-0"} bottom-full mb-1 bg-[#1c1d25] border border-[#2a2b33] rounded-xl shadow-2xl z-50 overflow-hidden min-w-[160px]`}>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteForMe(message._id); }}
                      className="flex items-center gap-2 px-4 py-2.5 text-white/70 hover:text-white text-xs hover:bg-[#2a2b33] w-full transition-all"
                    >
                      <RiDeleteBin6Line className="text-sm" /> Delete for me
                    </button>
                    {isMine && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteForEveryone(message._id); }}
                        className="flex items-center gap-2 px-4 py-2.5 text-red-400 text-xs hover:bg-[#2a2b33] w-full transition-all border-t border-[#2a2b33]"
                      >
                        <RiDeleteBin6Line className="text-sm" /> Delete for everyone
                      </button>
                    )}
                  </div>
                )}
                <div
                  className={`${
                    isMine
                      ? "bg-[#8417ff]/25 text-white border-[#8417ff]/60"
                      : "bg-[#2a2b33] text-white/90 border-[#ffffff]/10"
                  } border py-2 px-3 rounded-xl my-0.5 break-words text-sm select-none ml-9`}
                  style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}
                >
                  {message.content}
                </div>
              </div>
            )}
            {message.messageType === "file" && (
              <div
                className={`${
                  isMine
                    ? "bg-[#8417ff]/25 text-white border-[#8417ff]/60"
                    : "bg-[#2a2b33] text-white/90 border-[#ffffff]/10"
                } border inline-block py-2 px-3 rounded-xl my-0.5 max-w-[75%] md:max-w-[50%]`}
              >
                {checkIfImage(message.fileUrl) ? (
                  <div className="cursor-pointer" onClick={() => { setShowImage(true); setImageURL(message.fileUrl); }}>
                    <img src={`${HOST}/${message.fileUrl}`} height={300} width={300} alt="Uploaded File" />
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-4">
                    <span className="text-white/80 text-3xl bg-black/20 rounded-full p-3"><MdFolderZip /></span>
                    <span>{message.fileUrl.split("/").pop()}</span>
                    <span className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all" onClick={() => downloadFile(message.fileUrl)}>
                      <IoMdArrowRoundDown />
                    </span>
                  </div>
                )}
              </div>
            )}
          </>
        )}
        {!message.isDeleted && message.sender._id !== userInfo.id ? (
          <div className="flex items-center justify-start gap-2 mt-0.5">
            <Avatar className="w-6 h-6 rounded-full overflow-hidden shrink-0">
              {message.sender.image && <AvatarImage src={`${HOST}/${message.sender.image}`} alt="Sender Avatar" className="object-cover w-full h-full bg-black" />}
              <AvatarFallback className={`uppercase h-6 w-6 flex items-center justify-center text-xs rounded-full ${getColor(message.sender.color)}`}>
                {message.sender.firstName ? message.sender.firstName.split("").shift() : message.sender.email.split("").shift()}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-white/50">{`${message.sender.firstName} ${message.sender.lastName}`}</span>
            {showTime && <span className="text-[10px] text-white/30">{moment(message.timestamp).format("LT")}</span>}
          </div>
        ) : (
          !message.isDeleted && showTime && (
            <div className="text-[10px] text-white/30 mt-0.5 mb-1">
              {moment(message.timestamp).format("LT")}
            </div>
          )
        )}
      </div>
    );
  };

  return (
    <div
      className='flex-1 overflow-y-auto scrollbar-hidden p-3 px-4 md:px-8 w-full'
      onClick={() => setActiveMessageId(null)}
    >
        {renderMessages()}
        <div ref={scrollRef}/>
        {
          showImage && <div className='fixed z-[1000] top-0 left-0 h-[100vh] w-[100vw] flex items-center justify-center backdrop-blur-lg flex-col'>
            <div>
              <img src={`${HOST}/${imageURL}`} className='h-[80vh] w-full bg-cover' />
            </div>
            <div className='flex gap-5 fixed top-0 mt-5'>
              <button 
                className='bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300'
                onClick={() => downloadFile(imageURL)}
              >
                <IoMdArrowRoundDown/>
              </button>
              <button 
                className='bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300'
                onClick={() => {
                  setShowImage(false);
                  setImageURL(null)
                }}
              >
                <IoCloseSharp/>
              </button>
            </div>
          </div>
          
        }
    </div>
  )
}

export default MessageContainer;