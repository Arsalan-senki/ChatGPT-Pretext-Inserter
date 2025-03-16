chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({ pretext: '', enabled: false });
});

// Store repeatable text
function saveRepeatableText(text) {
    chrome.storage.sync.set({ repeatableText: text });
}

// Get repeatable text
async function getRepeatableText() {
    const data = await chrome.storage.sync.get("repeatableText");
    return data.repeatableText || "";
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "getState") {
        chrome.storage.sync.get(['pretext', 'enabled']).then(sendResponse);
        return true;
    }
});
