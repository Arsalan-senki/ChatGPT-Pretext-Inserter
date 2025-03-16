let state = {
    pretext: '',
    enabled: false
};

// Initialize state from storage
chrome.storage.sync.get(['pretext', 'enabled'], (data) => {
    state = { pretext: data.pretext || '', enabled: data.enabled || false };
    if (state.enabled && state.pretext) {
        checkAndInsertPretext();
    }
});

function findPromptTextarea() {
    return document.querySelector('div[contenteditable="true"].ProseMirror#prompt-textarea');
}

function checkAndInsertPretext() {
    const textarea = findPromptTextarea();
    if (!textarea) return;

    const placeholder = textarea.querySelector('p.placeholder[data-placeholder="Ask anything"]');
    if (placeholder && state.enabled && state.pretext) {
        insertPretext(textarea);
    }
}

function insertPretext(textarea) {
    // Clear existing content first
    textarea.innerHTML = '';

    // Create and add pretext paragraph
    const pretextP = document.createElement('p');
    pretextP.textContent = state.pretext;
    textarea.appendChild(pretextP);

    // Add two empty paragraphs for double spacing
    const spacingP = document.createElement('p');
    const spacingBr = document.createElement('br');
    spacingBr.className = 'ProseMirror-trailingBreak';
    spacingP.appendChild(spacingBr);
    textarea.appendChild(spacingP);

    // Add empty paragraph for cursor position
    const emptyP = document.createElement('p');
    const br = document.createElement('br');
    br.className = 'ProseMirror-trailingBreak';
    emptyP.appendChild(br);
    textarea.appendChild(emptyP);

    // Focus the textarea and move cursor to end
    textarea.focus();
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(emptyP);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);

    // Trigger input event for ChatGPT to recognize the change
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
}

// Watch for changes in the chat interface
const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        const textarea = findPromptTextarea();
        if (textarea && state.enabled && state.pretext) {
            const placeholder = textarea.querySelector('p.placeholder[data-placeholder="Ask anything"]');
            if (placeholder) {
                requestAnimationFrame(() => insertPretext(textarea));
            }
        }
    }
});

// Start observing with specific configuration
observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
});

// Message handler with cross-browser support
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'updatePretext') {
        state.pretext = message.pretext;
        state.enabled = message.enabled;
        
        if (state.enabled && state.pretext) {
            const textarea = findPromptTextarea();
            if (textarea) {
                insertPretext(textarea);
            }
        } else {
            // Clear all textareas when disabling
            const allTextareas = document.querySelectorAll('div[contenteditable="true"].ProseMirror#prompt-textarea');
            allTextareas.forEach(textarea => {
                textarea.innerHTML = '<p class="placeholder" data-placeholder="Ask anything"><br class="ProseMirror-trailingBreak"></p>';
                textarea.dispatchEvent(new Event('input', { bubbles: true }));
            });
        }
    }
});
