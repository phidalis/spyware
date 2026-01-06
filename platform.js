// platform.js - Complete Platform panel functionality

// WhatsApp Panel
function initializeWhatsAppPanel() {
    loadWhatsAppData();
    setupWhatsAppEventListeners();
    initializeWhatsAppModals();
}

function loadWhatsAppData() {
    // Load conversations
    const conversations = [
        {
            id: 1,
            name: 'John Doe',
            lastMessage: 'See you tomorrow!',
            time: '14:30',
            unread: 2,
            avatar: 'JD'
        },
        {
            id: 2,
            name: 'Alice Smith',
            lastMessage: 'Can you send me the file?',
            time: '11:20',
            unread: 0,
            avatar: 'AS'
        },
        {
            id: 3,
            name: 'Mike Brown',
            lastMessage: 'Thanks for your help',
            time: '09:45',
            unread: 1,
            avatar: 'MB'
        }
    ];
    
    const conversationsContainer = document.getElementById('wa-conversations');
    if (conversationsContainer) {
        conversationsContainer.innerHTML = '';
        conversations.forEach(conv => {
            const convElement = document.createElement('div');
            convElement.className = 'conversation-item';
            convElement.dataset.id = conv.id;
            convElement.innerHTML = `
                <div class="conversation-avatar">${conv.avatar}</div>
                <div class="conversation-info">
                    <h4>${conv.name}</h4>
                    <p class="conversation-preview">${conv.lastMessage}</p>
                </div>
                <div class="conversation-meta">
                    <span class="conversation-time">${conv.time}</span>
                    ${conv.unread > 0 ? `<span class="unread-count">${conv.unread}</span>` : ''}
                </div>
            `;
            conversationsContainer.appendChild(convElement);
        });
    }
    
    // Load chat messages
    loadWhatsAppChat(1);
    
    // Load targets
    const targets = [
        { id: 1, name: 'John Doe', status: 'Online', lastActive: '2 min ago' },
        { id: 2, name: 'Alice Smith', status: 'Offline', lastActive: '1 hour ago' },
        { id: 3, name: 'Mike Brown', status: 'Online', lastActive: 'Just now' }
    ];
    
    const targetsContainer = document.getElementById('wa-targets-list');
    if (targetsContainer) {
        targetsContainer.innerHTML = '';
        targets.forEach(target => {
            const targetElement = document.createElement('div');
            targetElement.className = 'target-item';
            targetElement.dataset.id = target.id;
            targetElement.innerHTML = `
                <div class="target-avatar">${target.name.charAt(0)}</div>
                <div class="target-info">
                    <h4>${target.name}</h4>
                    <p class="target-status">${target.status} • ${target.lastActive}</p>
                </div>
            `;
            targetsContainer.appendChild(targetElement);
        });
    }
    
    // Load generated items
    loadWhatsAppGeneratedItems();
}

function loadWhatsAppChat(conversationId) {
    const messages = [
        { type: 'incoming', text: 'Hey, are we still meeting tomorrow?', time: '14:30' },
        { type: 'outgoing', text: 'Yes, definitely! 2 PM at the usual place.', time: '14:31' },
        { type: 'incoming', text: 'Perfect! Can you bring the documents?', time: '14:32' },
        { type: 'outgoing', text: 'Already got them. See you tomorrow!', time: '14:33' },
        { type: 'incoming', text: 'Great! See you then 👋', time: '14:34' }
    ];
    
    const chatContainer = document.getElementById('wa-chat-messages');
    if (chatContainer) {
        chatContainer.innerHTML = '';
        messages.forEach(msg => {
            const messageElement = document.createElement('div');
            messageElement.className = `message ${msg.type}`;
            messageElement.innerHTML = `
                <div class="message-content">
                    <p>${msg.text}</p>
                    <div class="message-time">${msg.time}</div>
                </div>
            `;
            chatContainer.appendChild(messageElement);
        });
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
}

function loadWhatsAppGeneratedItems() {
    const itemsContainer = document.getElementById('wa-generated-items');
    if (!itemsContainer) return;
    
    const items = JSON.parse(localStorage.getItem('generatedItems') || '[]')
        .filter(item => item.platform === 'whatsapp');
    
    if (items.length === 0) {
        itemsContainer.innerHTML = `
            <div class="no-items">
                <i class="fas fa-code"></i>
                <p>No WhatsApp items generated yet.</p>
            </div>
        `;
        return;
    }
    
    itemsContainer.innerHTML = '';
    items.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'generated-item-small';
        itemElement.innerHTML = `
            <div class="item-header">
                <h4><i class="fas fa-${item.type === 'link' ? 'link' : 'file'}"></i> ${item.name}</h4>
                <span class="item-type-small">${item.type}</span>
            </div>
            <div class="item-content-small">${item.content.substring(0, 50)}...</div>
            <div class="item-actions-small">
                <button class="btn-copy-small" data-content="${item.content}">
                    <i class="fas fa-copy"></i>
                </button>
                <button class="btn-download-small" data-content="${item.content}" data-name="${item.name}.${item.type === 'file' ? 'txt' : 'url'}">
                    <i class="fas fa-download"></i>
                </button>
            </div>
        `;
        itemsContainer.appendChild(itemElement);
    });
}

function setupWhatsAppEventListeners() {
    // Tab switching
    document.querySelectorAll('.menu-item[data-tab]').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const tabId = this.dataset.tab;
            
            // Update active tab
            document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding tab content
            document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
    
    // Conversation selection
    document.addEventListener('click', function(e) {
        const convItem = e.target.closest('.conversation-item');
        if (convItem) {
            document.querySelectorAll('.conversation-item').forEach(item => item.classList.remove('active'));
            convItem.classList.add('active');
            const convId = parseInt(convItem.dataset.id);
            loadWhatsAppChat(convId);
            
            // Update current chat user
            const userName = convItem.querySelector('.conversation-info h4').textContent;
            document.getElementById('current-chat-user').textContent = userName;
        }
    });
    
    // Generate link button
    const waGenLinkBtn = document.getElementById('wa-generate-link');
    if (waGenLinkBtn) {
        waGenLinkBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showWhatsAppLinkModal();
        });
    }
    
    // Generate file button
    const waGenFileBtn = document.getElementById('wa-generate-file');
    if (waGenFileBtn) {
        waGenFileBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showWhatsAppFileModal();
        });
    }
    
    // Refresh button
    const refreshBtn = document.getElementById('wa-refresh');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
            setTimeout(() => {
                loadWhatsAppData();
                this.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
                showNotification('WhatsApp data refreshed', 'success');
            }, 1000);
        });
    }
    
    // Simulate message button
    const simulateBtn = document.getElementById('simulate-message');
    if (simulateBtn) {
        simulateBtn.addEventListener('click', function() {
            const messages = [
                "Hey, what's up?",
                "Did you see my message?",
                "Can you call me?",
                "Check out this link!",
                "Meeting tomorrow at 3 PM"
            ];
            const randomMessage = messages[Math.floor(Math.random() * messages.length)];
            const now = new Date();
            const timeString = now.getHours().toString().padStart(2, '0') + ':' + 
                              now.getMinutes().toString().padStart(2, '0');
            
            const chatContainer = document.getElementById('wa-chat-messages');
            if (chatContainer) {
                const messageElement = document.createElement('div');
                messageElement.className = 'message incoming';
                messageElement.innerHTML = `
                    <div class="message-content">
                        <p>${randomMessage}</p>
                        <div class="message-time">${timeString}</div>
                    </div>
                `;
                chatContainer.appendChild(messageElement);
                chatContainer.scrollTop = chatContainer.scrollHeight;
                
                showNotification('Simulated message received', 'info');
            }
        });
    }
}

function initializeWhatsAppModals() {
    // WhatsApp Link Generator Modal
    const waLinkModal = document.getElementById('wa-link-modal');
    const waLinkModalClose = waLinkModal?.querySelector('.modal-close');
    const waGenerateLinkBtn = document.getElementById('wa-generate-link-btn');
    const waCopyLinkBtn = document.getElementById('wa-copy-link');
    
    if (waLinkModalClose) {
        waLinkModalClose.addEventListener('click', () => waLinkModal.classList.remove('active'));
    }
    
    if (waGenerateLinkBtn) {
        waGenerateLinkBtn.addEventListener('click', generateWhatsAppLink);
    }
    
    if (waCopyLinkBtn) {
        waCopyLinkBtn.addEventListener('click', function() {
            const link = document.querySelector('#wa-link-name').value;
            if (link) {
                copyToClipboard(`https://whatsapp-update.com/secure/${Math.random().toString(36).substring(2)}`);
                showNotification('Link copied to clipboard', 'success');
            }
        });
    }
    
    // WhatsApp File Generator Modal
    const waFileModal = document.getElementById('wa-file-modal');
    const waFileModalClose = waFileModal?.querySelector('.modal-close');
    const waGenerateFileBtn = document.getElementById('wa-generate-file-btn');
    const waDownloadFileBtn = document.getElementById('wa-download-file');
    const waFileSizeSlider = document.getElementById('wa-file-size');
    const waSizeValue = document.getElementById('wa-size-value');
    
    if (waFileModalClose) {
        waFileModalClose.addEventListener('click', () => waFileModal.classList.remove('active'));
    }
    
    if (waGenerateFileBtn) {
        waGenerateFileBtn.addEventListener('click', generateWhatsAppFile);
    }
    
    if (waDownloadFileBtn) {
        waDownloadFileBtn.addEventListener('click', downloadWhatsAppFile);
    }
    
    if (waFileSizeSlider && waSizeValue) {
        waFileSizeSlider.addEventListener('input', function() {
            waSizeValue.textContent = `${this.value} MB`;
        });
    }
    
    // Close modals when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }
    });
}

function showWhatsAppLinkModal() {
    const modal = document.getElementById('wa-link-modal');
    if (modal) {
        modal.classList.add('active');
    }
}

function showWhatsAppFileModal() {
    const modal = document.getElementById('wa-file-modal');
    if (modal) {
        modal.classList.add('active');
    }
}

function generateWhatsAppLink() {
    const type = document.getElementById('wa-link-type').value;
    const device = document.getElementById('wa-target-device').value;
    const name = document.getElementById('wa-link-name').value || 'WhatsApp Security Update';
    
    const domains = {
        update: 'whatsapp-update',
        security: 'whatsapp-security',
        backup: 'whatsapp-backup',
        web: 'whatsapp-web'
    };
    
    const domain = domains[type] || 'whatsapp-tools';
    const randomPath = Math.random().toString(36).substring(2, 15);
    
    const link = `https://${domain}.com/secure/${randomPath}?device=${device}&ref=wa_${Date.now().toString(36)}`;
    
    // Save to localStorage
    const items = JSON.parse(localStorage.getItem('generatedItems') || '[]');
    items.unshift({
        type: 'link',
        platform: 'whatsapp',
        name: name,
        content: link,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('generatedItems', JSON.stringify(items));
    
    // Update UI
    loadWhatsAppGeneratedItems();
    
    // Close modal
    document.getElementById('wa-link-modal').classList.remove('active');
    showNotification('WhatsApp link generated successfully', 'success');
}

function generateWhatsAppFile() {
    const type = document.getElementById('wa-file-type').value;
    const name = document.getElementById('wa-file-name').value || 'WhatsApp_Plus_v10.2.apk';
    const size = document.getElementById('wa-file-size').value;
    
    const fileContent = `SURVEILLANCE FILE - SIMULATED FOR EDUCATIONAL PURPOSES\n\n` +
                       `File Name: ${name}\n` +
                       `Platform: WhatsApp\n` +
                       `File Type: ${type.toUpperCase()}\n` +
                       `File Size: ${size} MB\n` +
                       `MD5 Checksum: ${Array.from({length: 32}, () => Math.floor(Math.random() * 16).toString(16)).join('')}\n\n` +
                       `⚠️ THIS IS A SIMULATION - NO REAL MALICIOUS FILE WAS CREATED`;
    
    // Save to localStorage
    const items = JSON.parse(localStorage.getItem('generatedItems') || '[]');
    items.unshift({
        type: 'file',
        platform: 'whatsapp',
        name: name,
        content: fileContent,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('generatedItems', JSON.stringify(items));
    
    // Update UI
    loadWhatsAppGeneratedItems();
    
    // Close modal
    document.getElementById('wa-file-modal').classList.remove('active');
    showNotification('WhatsApp file generated successfully', 'success');
}

function downloadWhatsAppFile() {
    const name = document.getElementById('wa-file-name').value || 'WhatsApp_Plus_v10.2.apk';
    const fileContent = `SURVEILLANCE FILE - SIMULATED FOR EDUCATIONAL PURPOSES\n\n` +
                       `File Name: ${name}\n` +
                       `Platform: WhatsApp\n\n` +
                       `⚠️ THIS IS A SIMULATION - NO REAL MALICIOUS FILE WAS CREATED`;
    
    downloadContent(fileContent, name + '.txt');
    showNotification('File downloaded successfully', 'success');
}

// Other platform initialization functions (simplified versions)
function initializeInstagramPanel() {
    showNotification('Instagram panel loaded', 'info');
    setupTabSwitching();
}

function initializeFacebookPanel() {
    showNotification('Facebook panel loaded', 'info');
    setupTabSwitching();
}

function initializeTikTokPanel() {
    showNotification('TikTok panel loaded', 'info');
    setupTabSwitching();
}

function initializeTelegramPanel() {
    showNotification('Telegram panel loaded', 'info');
    setupTabSwitching();
}

function initializeSnapchatPanel() {
    showNotification('Snapchat panel loaded', 'info');
    setupTabSwitching();
}

function setupTabSwitching() {
    document.querySelectorAll('.menu-item[data-tab]').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const tabId = this.dataset.tab;
            
            // Update active tab
            document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding tab content
            document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
            document.getElementById(`${tabId}-tab`)?.classList.add('active');
        });
    });
}

// Utility functions from dashboard.js
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        console.log('Copied to clipboard:', text);
    }).catch(err => {
        console.error('Failed to copy:', err);
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    });
}

function downloadContent(content, filename) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

function showNotification(message, type = 'info') {
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type);
    } else {
        alert(`${type.toUpperCase()}: ${message}`);
    }
}