export const createChatSlice = (set, get) => ({
    selectedChatType: undefined,
    selectedChatData: undefined,
    selectedChatMessages: [],
    directMessagesContacts: [],
    isUploading: false,
    isDownloading: false,
    fileUploadProgress: 0,
    fileDownloadProgress: 0,
    channels: [],
    // AI summarizer state
    unreadMessages: [],
    showSummaryBanner: false,
    summary: null,       // { overall: string|null, perUser: object|null }
    isSummarizing: false,
    // AI reply suggestions state
    replySuggestions: [],
    isFetchingSuggestions: false,
    showReplySuggestions: false,
    selectedReplyTone: "Friendly",
    draftMessage: "",
    setChannels: (channels) => set({ channels }),
    setIsUploading: (isUploading) => set({ isUploading }),
    setIsDownloading: (isDownloading) => set({ isDownloading }),
    setFileUploadProgress: (fileUploadProgress) => set({ fileUploadProgress }),
    setFileDownloadProgress: (fileDownloadProgress) => set({ fileDownloadProgress }),   
    setSelectedChatType: (selectedChatType) => set({ selectedChatType }),
    setSelectedChatData: (selectedChatData) => set({ selectedChatData }),
    setSelectedChatMessages: (selectedChatMessages) => set({ selectedChatMessages }),
    setDirectMessagesContacts: (directMessagesContacts) => set({ directMessagesContacts }),
    setUnreadMessages: (unreadMessages) => set({ unreadMessages }),
    setShowSummaryBanner: (showSummaryBanner) => set({ showSummaryBanner }),
    setSummary: (summary) => set({ summary }),
    setIsSummarizing: (isSummarizing) => set({ isSummarizing }),
    setReplySuggestions: (replySuggestions) => set({ replySuggestions }),
    setIsFetchingSuggestions: (isFetchingSuggestions) => set({ isFetchingSuggestions }),
    setShowReplySuggestions: (showReplySuggestions) => set({ showReplySuggestions }),
    setSelectedReplyTone: (selectedReplyTone) => set({ selectedReplyTone }),
    setDraftMessage: (draftMessage) => set({ draftMessage }),
    addChannel: (channel) => {
        const channels = get().channels;
        set({ channels: [channel, ...channels] });
    },

    closeChat: () => set({
        selectedChatData: undefined,
        selectedChatType: undefined,
        selectedChatMessages: [],
        unreadMessages: [],
        showSummaryBanner: false,
        summary: null,
        isSummarizing: false,
        replySuggestions: [],
        isFetchingSuggestions: false,
        showReplySuggestions: false,
        draftMessage: "",
    }),
    addMessage: (message) => {
        const selectedChatMessages = get().selectedChatMessages;
        const selectedChatType = get().selectedChatType;

        set({
            selectedChatMessages: [
                ...selectedChatMessages,
                {
                    ...message,
                    recipient: selectedChatType === "channel" ? message.recipient : message.recipient._id,
                    sender: selectedChatType === "channel" ? message.sender : message.sender._id,
                },
            ],
        });
    },
    addChannelInChannelList: (message) => {
        const channels = get().channels;
        const index = channels.findIndex(
            (channel) => channel._id === message.channelId
        );
        if(index !== -1) {
            const updated = [...channels];
            const [moved] = updated.splice(index, 1);
            set({ channels: [moved, ...updated] });
        }
    },

    addContactsInDMContacts: (message) => {
        const userId = get().userInfo.id;
        const fromId = message.sender._id === userId
            ? message.recipient._id
            : message.sender._id;
        const fromData = message.sender._id === userId ? message.recipient : message.sender;
        const dmContacts = get().directMessagesContacts;
        const index = dmContacts.findIndex((contact) => contact._id === fromId);
        let updated;
        if(index !== -1) {
            updated = [...dmContacts];
            const [moved] = updated.splice(index, 1);
            updated = [moved, ...updated];
        } else {
            updated = [fromData, ...dmContacts];
        }
        set({ directMessagesContacts: updated });
    },
});