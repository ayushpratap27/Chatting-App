import ChatHeader from "./components/chat-header";
import MessageBar from "./components/message-bar";
import MessageContainer from "./components/message-container";
import SummarizeBanner from "./components/summarize-banner";
import SummaryTile from "./components/summary-tile";
import ReplySuggestions from "./components/reply-suggestions";
import { useAppStore } from "@/store";
import { apiClient } from "@/lib/api-client";
import { SUMMARIZE_ROUTE, SUGGEST_REPLIES_ROUTE } from "@/utils/constants";
import { toast } from "sonner";
import { setLastRead } from "@/lib/last-read";

function ChatContainer() {
  const {
    selectedChatType,
    selectedChatData,
    userInfo,
    unreadMessages,
    summary,
    setSummary,
    setIsSummarizing,
    setShowSummaryBanner,
    selectedChatMessages,
    setReplySuggestions,
    setIsFetchingSuggestions,
    setShowReplySuggestions,
    setSelectedReplyTone,
  } = useAppStore();

  // Format messages into the shape the server expects
  const buildPayload = (msgs) =>
    msgs.map((m) => {
      let senderName;
      if (selectedChatType === "channel") {
        senderName = m.sender?.firstName
          ? `${m.sender.firstName} ${m.sender.lastName || ""}`.trim()
          : m.sender?.email || "Unknown";
      } else {
        senderName =
          m.sender === userInfo.id
            ? "You"
            : selectedChatData.firstName
            ? `${selectedChatData.firstName} ${selectedChatData.lastName || ""}`.trim()
            : selectedChatData.email;
      }
      return { senderName, content: m.content, timestamp: m.timestamp };
    });

  // ── Summarizer handlers ──────────────────────────────────────────────────
  const handleSummarize = async () => {
    setShowSummaryBanner(false);
    setLastRead(selectedChatData._id);
    setIsSummarizing(true);
    setSummary(null);
    try {
      const response = await apiClient.post(
        SUMMARIZE_ROUTE,
        {
          messages: buildPayload(unreadMessages),
          type: selectedChatType === "channel" ? "channel" : "dm",
          mode: "overall",
        },
        { withCredentials: true }
      );
      setSummary({ overall: response.data.summary, perUser: null, view: "overall" });
    } catch (error) {
      toast.error("Failed to generate summary");
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleBreakdown = async (action) => {
    if (action === "back") {
      setSummary({ ...summary, view: "overall" });
      return;
    }
    if (summary?.perUser) {
      setSummary({ ...summary, view: "per-user" });
      return;
    }
    setIsSummarizing(true);
    try {
      const response = await apiClient.post(
        SUMMARIZE_ROUTE,
        { messages: buildPayload(unreadMessages), type: "channel", mode: "per-user" },
        { withCredentials: true }
      );
      setSummary({ ...summary, perUser: response.data.perUser, view: "per-user" });
    } catch (error) {
      toast.error("Failed to generate per-member summary");
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleCloseTile = () => {
    setSummary(null);
    setIsSummarizing(false);
  };

  // ── Reply suggestion handler ─────────────────────────────────────────────
  const handleFetchSuggestions = async (tone) => {
    setIsFetchingSuggestions(true);
    // Use last 8 text messages as context
    const contextMsgs = selectedChatMessages
      .filter((m) => m.messageType === "text")
      .slice(-8);
    try {
      const response = await apiClient.post(
        SUGGEST_REPLIES_ROUTE,
        { lastMessages: buildPayload(contextMsgs), tone },
        { withCredentials: true }
      );
      setReplySuggestions(response.data.suggestions || []);
    } catch (error) {
      toast.error("Failed to fetch suggestions");
    } finally {
      setIsFetchingSuggestions(false);
    }
  };

  const handleToggleSuggestions = () => {
    const { showReplySuggestions } = useAppStore.getState();
    if (!showReplySuggestions) {
      setShowReplySuggestions(true);
      const { selectedReplyTone } = useAppStore.getState();
      handleFetchSuggestions(selectedReplyTone);
    } else {
      setShowReplySuggestions(false);
    }
  };

  return (
    <div className="fixed top-0 h-[100vh] w-[100vw] bg-[#1c1d25] flex flex-col md:static md:flex-1 relative">
      <ChatHeader />
      <SummarizeBanner onSummarize={handleSummarize} />
      <MessageContainer />
      <SummaryTile onBreakdown={handleBreakdown} onClose={handleCloseTile} />
      <ReplySuggestions onFetch={handleFetchSuggestions} />
      <MessageBar onToggleSuggestions={handleToggleSuggestions} />
    </div>
  );
}

export default ChatContainer;
