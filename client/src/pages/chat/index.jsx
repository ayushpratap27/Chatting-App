import { useAppStore } from "@/store";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

function Chat() {
  const { userInfo } = useAppStore();
  const navigate = useNavigate();
  useEffect(() => {
    if(!userInfo.profileSetup) {
      toast.error("Please complete your profile setup");
      navigate("/profile");
    }
  }, [userInfo, navigate]);

  return (
    <div>Chat</div>
  )
}

export default Chat;