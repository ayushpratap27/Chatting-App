const STORAGE_KEY = "baat-karlo-last-read";

const getMap = () => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch {
        return {};
    }
};

/**
 * Returns the ISO timestamp when the user last read this chat, or null if never.
 * @param {string} chatId
 * @returns {string|null}
 */
export const getLastRead = (chatId) => {
    return getMap()[chatId] || null;
};

/**
 * Marks the current time as the last-read timestamp for this chat.
 * @param {string} chatId
 */
export const setLastRead = (chatId) => {
    const map = getMap();
    map[chatId] = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
};
