import { useAppStore } from "@/store";
import { getColor } from "@/lib/utils";
import { IoCloseSharp } from "react-icons/io5";
import { IoArrowBack } from "react-icons/io5";

function SummaryTile({ onBreakdown, onClose }) {
  const { summary, isSummarizing, selectedChatType } = useAppStore();

  if (!isSummarizing && !summary) return null;

  const isChannel = selectedChatType === "channel";
  const showPerUser = summary?.view === "per-user";

  return (
    <div className="absolute bottom-[130px] left-1/2 -translate-x-1/2 w-[92%] max-w-lg z-50">
      <div className="bg-[#1c1d25] border border-[#8417ff]/50 rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#2a2b33]">
          <div className="flex items-center gap-2">
            {showPerUser && (
              <button
                onClick={() => onBreakdown("back")}
                className="text-white/60 hover:text-white transition-all mr-1"
              >
                <IoArrowBack className="text-base" />
              </button>
            )}
            <span className="text-white font-semibold text-sm">
              ✨ AI Summary
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#8417ff]/20 text-[#8417ff] border border-[#8417ff]/30">
              {showPerUser ? "Per Member" : "Overall"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white/90 transition-all"
          >
            <IoCloseSharp className="text-lg" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 max-h-[52vh] overflow-y-auto scrollbar-hidden">

          {/* Loading */}
          {isSummarizing && (
            <div className="flex flex-col items-center justify-center gap-3 py-6">
              <div className="w-8 h-8 rounded-full border-2 border-[#8417ff] border-t-transparent animate-spin" />
              <p className="text-white/50 text-sm animate-pulse">Generating summary…</p>
            </div>
          )}

          {/* Overall summary */}
          {!isSummarizing && summary?.overall && !showPerUser && (
            <p className="text-white/80 text-sm leading-relaxed">{summary.overall}</p>
          )}

          {/* Per-user summary */}
          {!isSummarizing && showPerUser && summary?.perUser && (
            <div className="flex flex-col gap-3">
              {Object.entries(summary.perUser).map(([name, text], i) => (
                <div key={name} className="bg-[#2a2b33] rounded-xl p-3 flex gap-3 items-start">
                  <div
                    className={`uppercase h-9 w-9 shrink-0 flex items-center justify-center text-sm border rounded-full ${getColor(i % 4)}`}
                  >
                    {name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium mb-1">{name}</p>
                    <p className="text-white/65 text-xs leading-relaxed">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer — channel overall: show breakdown button */}
        {!isSummarizing && isChannel && summary?.overall && !showPerUser && (
          <div className="px-5 py-3 border-t border-[#2a2b33]">
            <button
              onClick={() => onBreakdown("per-user")}
              className="text-[#8417ff] hover:text-[#a855f7] text-xs font-medium transition-all duration-200 flex items-center gap-1"
            >
              Break down by member →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default SummaryTile;
