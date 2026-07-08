import { useAppStore } from "@/store";
import { setLastRead } from "@/lib/last-read";

function SummarizeBanner({ onSummarize }) {
  const {
    unreadMessages,
    showSummaryBanner,
    setShowSummaryBanner,
    selectedChatData,
  } = useAppStore();

  if (!showSummaryBanner || unreadMessages.length === 0) return null;

  const count = unreadMessages.length;
  const label = count === 1 ? "1 unread message" : `${count} unread messages`;

  const handleDismiss = () => {
    setShowSummaryBanner(false);
    setLastRead(selectedChatData._id);
  };

  return (
    <div className="flex items-center justify-between px-5 py-2 bg-[#2a2b33] border-l-4 border-[#8417ff] text-sm text-white/90">
      <span>
        <span className="mr-1">✨</span>
        {label} — want a quick summary?
      </span>
      <div className="flex items-center gap-3">
        <button
          onClick={onSummarize}
          className="bg-[#8417ff] hover:bg-[#741bda] text-white text-xs px-3 py-1.5 rounded-full transition-all duration-200"
        >
          Summarize
        </button>
        <button
          onClick={handleDismiss}
          className="text-white/50 hover:text-white/90 transition-all duration-200 text-base leading-none"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export default SummarizeBanner;
