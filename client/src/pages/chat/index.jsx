import { useAppStore } from "@/store";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ContactsContainer from "./components/contacts-container";
import EmptyChatContainer from "./components/empty-chat-container";
import ChatContainer from "./components/chat-container";

function Chat() {
  const { userInfo, selectedChatType, isUploading, isDownloading, fileUploadProgress, fileDownloadProgress, } = useAppStore();
  const navigate = useNavigate();
  useEffect(() => {
    if(!userInfo.profileSetup) {
      toast.error("Please complete your profile setup");
      navigate("/profile");
    }
  }, [userInfo, navigate]);

  return (
    <div className="flex h-[100vh] text-white overflow-hidden bg-[#1b1c24]">
      {
        isUploading && (
        <div className="h-[100vh] w-[100vw] fixed top-0 z-10 left-0 bg-black/80 flex items-center justify-center flex-col gap-5 backdrop-blur-lg">
          <h5 className="text-3xl md:text-5xl animate-pulse">Uploading File</h5>
          {fileUploadProgress}%
        </div>
      )}
      {
        isDownloading && (
        <div className="h-[100vh] w-[100vw] fixed top-0 z-10 left-0 bg-black/80 flex items-center justify-center flex-col gap-5 backdrop-blur-lg">
          <h5 className="text-3xl md:text-5xl animate-pulse">Downloading File</h5>
          {fileDownloadProgress}%
        </div>
      )}

      {/* Sidebar: full-screen on mobile when no chat open, fixed width on sm+ */}
      <div className={`
        ${selectedChatType !== undefined ? "hidden sm:flex" : "flex"}
        flex-col w-full sm:w-[45vw] md:w-[35vw] lg:w-[30vw] xl:w-[20vw] shrink-0
      `}>
        <ContactsContainer />
      </div>

      {/* Chat area: full-screen on mobile when chat open */}
      {selectedChatType === undefined ? (
        <EmptyChatContainer />
      ) : (
        <ChatContainer />
      )}
    </div>
  )
}

export default Chat;