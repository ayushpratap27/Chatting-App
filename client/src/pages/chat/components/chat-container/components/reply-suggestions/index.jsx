import { useAppStore } from "@/store";
import { HiRefresh } from "react-icons/hi";
import { IoCloseSharp } from "react-icons/io5";

const TONES = ["Friendly", "Casual", "Professional", "Formal", "Flirty", "Witty"];

function ReplySuggestions({ onFetch }) {
  const {
    showReplySuggestions,
    setShowReplySuggestions,
    replySuggestions,
    isFetchingSuggestions,
    selectedReplyTone,
    setSelectedReplyTone,
    setDraftMessage,
  } = useAppStore();

  if (!showReplySuggestions) return null;

  const handleToneChange = (tone) => {
    setSelectedReplyTone(tone);
    onFetch(tone);
  };

  const handleSelect = (text) => {
    setDraftMessage(text);
    setShowReplySuggestions(false);
  };

  return (
    <div className="bg-[#1c1d25] border-t border-[#8417ff]/40 px-5 py-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-white/70 text-xs font-medium tracking-wide">
          ✨ Reply Suggestions
        </span>
        <button
          onClick={() => setShowReplySuggestions(false)}
          className="text-white/40 hover:text-white/80 transition-all"
        >
          <IoCloseSharp className="text-base" />
        </button>
      </div>

      {/* Tone selector */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {TONES.map((tone) => (
          <button
            key={tone}
            onClick={() => handleToneChange(tone)}
            className={`text-xs px-3 py-1 rounded-full border transition-all duration-200 ${
              selectedReplyTone === tone
                ? "bg-[#8417ff] border-[#8417ff] text-white"
                : "bg-transparent border-white/20 text-white/60 hover:border-white/50 hover:text-white/90"
            }`}
          >
            {tone}
          </button>
        ))}
      </div>

      {/* Suggestions */}
      <div className="flex items-start gap-2">
        <div className="flex flex-wrap gap-2 flex-1">
          {isFetchingSuggestions ? (
            // Loading skeleton
            [1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-8 w-28 rounded-full bg-[#2a2b33] animate-pulse"
              />
            ))
          ) : replySuggestions.length > 0 ? (
            replySuggestions.map((text, i) => (
              <button
                key={i}
                onClick={() => handleSelect(text)}
                className="text-xs px-4 py-2 rounded-full bg-[#2a2b33] text-white/80 hover:bg-[#8417ff]/20 hover:text-white border border-white/10 hover:border-[#8417ff]/50 transition-all duration-200 max-w-[240px] text-left truncate"
                title={text}
              >
                {text}
              </button>
            ))
          ) : (
            <span className="text-white/30 text-xs italic">
              Click a tone to generate suggestions
            </span>
          )}
        </div>

        {/* Refresh button */}
        {!isFetchingSuggestions && replySuggestions.length > 0 && (
          <button
            onClick={() => onFetch(selectedReplyTone)}
            className="text-white/40 hover:text-[#8417ff] transition-all duration-200 shrink-0 mt-1.5"
            title="Refresh suggestions"
          >
            <HiRefresh className="text-base" />
          </button>
        )}
      </div>
    </div>
  );
}

export default ReplySuggestions;
