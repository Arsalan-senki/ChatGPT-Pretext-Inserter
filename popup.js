// Load saved state when popup opens
document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.sync.get(['pretext', 'enabled'], (data) => {
        document.getElementById("repeatableTextInput").value = data.pretext || '';
    });
});

document.getElementById("setTextButton").addEventListener("click", () => {
    const pretext = document.getElementById("repeatableTextInput").value.trim();
    if (pretext) {
        chrome.storage.sync.set({ pretext, enabled: true }, () => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, { 
                    type: 'updatePretext',
                    pretext,
                    enabled: true
                });
            });
            showStatus("Pretext set and enabled!");
        });
    } else {
        showStatus("Please enter some text first", "error");
    }
});

document.getElementById("clearTextButton").addEventListener("click", () => {
    document.getElementById("repeatableTextInput").value = '';
    chrome.storage.sync.set({ pretext: '', enabled: false }, () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { 
                type: 'updatePretext',
                pretext: '',
                enabled: false
            });
        });
        showStatus("Pretext cleared!");
    });
});

function showStatus(message, type = 'success') {
    const statusMessage = document.getElementById("statusMessage");
    statusMessage.textContent = message;
    statusMessage.className = `status-message show ${type}`;
    setTimeout(() => {
        statusMessage.className = "status-message";
    }, 2500);
}

// Auto-resize textarea as user types
const textarea = document.getElementById("repeatableTextInput");
textarea.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 'px';
});
