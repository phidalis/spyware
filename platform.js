// platform.js - Complete Platform panel functionality

// Generic empty-state renderer used by the target panels
function renderEmpty(selector, icon, title, text) {
    const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (!el) return;
    el.innerHTML =
        '<div class="no-items">' +
            '<i class="' + icon + '"></i>' +
            (title ? '<h4>' + title + '</h4>' : '') +
            (text ? '<p>' + text + '</p>' : '') +
        '</div>';
}

// WhatsApp Panel
function initializeWhatsAppPanel() {
    loadWhatsAppData();
    setupWhatsAppEventListeners();
    initializeWhatsAppModals();
}

function loadWhatsAppData() {
    // No conversations are captured until a target device is monitored
    renderEmpty('#wa-conversations', 'fas fa-comments', 'No conversations', 'Captured conversations will appear here.');
    
    // Fresh deployment - clear the chat pane
    loadWhatsAppChat();
    
    // Reset the chat header
    const chatUser = document.getElementById('current-chat-user');
    if (chatUser) chatUser.textContent = 'No conversation selected';
    const chatStatus = document.querySelector('.chat-user .user-status');
    if (chatStatus) chatStatus.textContent = 'Awaiting data \u00b7 no active capture';
    
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
    const chatContainer = document.getElementById('wa-chat-messages');
    if (!chatContainer) return;
    renderEmpty(chatContainer, 'fas fa-comment-slash', 'No messages yet', 'Messages will appear here once a target device is monitored.');
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
                const empty = chatContainer.querySelector('.no-items');
                if (empty) empty.remove();
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
                
                showNotification('New message received', 'info');
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
    
    const fileContent = `PAYLOAD MANIFEST\n\n` +
                       `File Name: ${name}\n` +
                       `Platform: WhatsApp\n` +
                       `File Type: ${type.toUpperCase()}\n` +
                       `File Size: ${size} MB\n` +
                       `MD5 Checksum: ${Array.from({length: 32}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    
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
    const fileContent = `PAYLOAD MANIFEST\n\n` +
                       `File Name: ${name}\n` +
                       `Platform: WhatsApp`;
    
    downloadContent(fileContent, name + '.txt');
    showNotification('File downloaded successfully', 'success');
}

// Other platform initialization functions
function initializeInstagramPanel() {
    setupTabSwitching();
    renderEmpty('#ig-stories', 'fas fa-history', 'No stories captured', 'Recent stories will appear here.');
    renderEmpty('#ig-posts', 'fas fa-images', 'No posts captured', 'Recent posts will appear here.');
    renderEmpty('#ig-dm-list', 'fas fa-comments', 'No conversations', 'Direct messages will appear after capture.');
    renderEmpty('#ig-chat-messages', 'fas fa-comment-slash', 'No messages yet', 'Select a captured conversation to view messages.');
    const igUser = document.getElementById('ig-current-chat-user');
    if (igUser) igUser.textContent = 'No conversation selected';
}

function initializeFacebookPanel() {
    setupTabSwitching();
    renderEmpty('#fb-posts', 'fas fa-newspaper', 'No posts captured', 'Facebook activity will appear here once a target device is monitored.');
}

function initializeTikTokPanel() {
    setupTabSwitching();
    renderEmpty('#tt-videos', 'fas fa-video', 'No videos captured', 'Watched videos will appear here.');
    renderEmpty('#tt-activity', 'fas fa-history', 'No activity yet', 'Recent activity will appear here.');
}

function initializeTelegramPanel() {
    setupTabSwitching();
    renderEmpty('#tg-chats', 'fas fa-comments', 'No chats captured', 'Connect the Telegram module to begin capturing chats.');
}

function initializeSnapchatPanel() {
    setupTabSwitching();
    renderEmpty('#sc-stories', 'fas fa-history', 'No stories captured', 'Recent stories will appear here.');
    renderEmpty('#sc-snaps', 'fas fa-camera', 'No snaps captured', 'Recent snaps will appear here.');
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

function ensureNotificationStyles() {
    if (document.getElementById('notification-styles')) return;
    const styles = document.createElement('style');
    styles.id = 'notification-styles';
    styles.textContent = `
        .notification {
            position: fixed;
            top: 16px;
            right: 16px;
            max-width: 360px;
            padding: 14px 16px;
            display: flex;
            align-items: center;
            gap: 10px;
            border-radius: 12px;
            background: rgba(30, 41, 59, 0.98);
            border: 1px solid rgba(255, 255, 255, 0.12);
            color: #fff;
            font-size: 0.9rem;
            box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45);
            z-index: 9999;
            animation: notifIn 0.3s ease;
        }
        .notification-success { border-left: 4px solid #38a169; }
        .notification-info { border-left: 4px solid #4299e1; }
        .notification-warning { border-left: 4px solid #d69e2e; }
        .notification-error { border-left: 4px solid #e53e3e; }
        .notification i { color: #a0aec0; }
        .notification-success i { color: #38a169; }
        .notification-error i { color: #e53e3e; }
        .notification-info i { color: #4299e1; }
        .notification-close {
            margin-left: auto;
            background: none;
            border: none;
            color: #a0aec0;
            font-size: 1.2rem;
            line-height: 1;
            cursor: pointer;
        }
        @keyframes notifIn {
            from { transform: translateY(-16px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        @keyframes notifOut {
            from { transform: translateY(0); opacity: 1; }
            to { transform: translateY(-16px); opacity: 0; }
        }
        @media (max-width: 600px) {
            .notification {
                left: 12px;
                right: 12px;
                top: auto;
                bottom: calc(16px + env(safe-area-inset-bottom));
                max-width: none;
            }
            @keyframes notifIn {
                from { transform: translateY(16px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            @keyframes notifOut {
                from { transform: translateY(0); opacity: 1; }
                to { transform: translateY(16px); opacity: 0; }
            }
        }
    `;
    document.head.appendChild(styles);
}

function showNotification(message, type = 'info') {
    ensureNotificationStyles();
    
    const iconName = type === 'success' ? 'check-circle'
        : type === 'error' ? 'exclamation-circle'
        : type === 'warning' ? 'exclamation-triangle'
        : 'info-circle';
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML =
        `<i class="fas fa-${iconName}"></i>` +
        `<span></span>` +
        `<button class="notification-close" aria-label="Dismiss">&times;</button>`;
    notification.querySelector('span').textContent = message;
    document.body.appendChild(notification);
    
    const remove = () => {
        notification.style.animation = 'notifOut 0.3s ease forwards';
        setTimeout(() => notification.remove(), 300);
    };
    notification.querySelector('.notification-close').addEventListener('click', remove);
    setTimeout(remove, 4000);
}

// Build the mobile app shell (top bar + slide-in drawer) for platform panels
function initMobileLayout() {
    const container = document.querySelector('.dashboard-container');
    if (!container) return;
    
    const sidebar = container.querySelector('.sidebar');
    if (!sidebar) return;
    
    let overlay = document.querySelector('.sidebar-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);
    }
    
    if (!document.querySelector('.mobile-topbar')) {
        const headerTitle = document.querySelector('.content-header h1');
        const titleText = (headerTitle ? headerTitle.textContent : 'Panel').trim();
        
        const topbar = document.createElement('div');
        topbar.className = 'mobile-topbar';
        topbar.innerHTML =
            '<button class="mobile-menu-btn" aria-label="Open menu"><i class="fas fa-bars"></i></button>' +
            '<span class="mobile-topbar-title"></span>' +
            '<span class="mobile-topbar-status"><i class="fas fa-circle"></i> Online</span>';
        topbar.querySelector('.mobile-topbar-title').textContent = titleText;
        container.parentNode.insertBefore(topbar, container);
    }
    
    if (!sidebar.querySelector('.sidebar-close')) {
        const header = sidebar.querySelector('.sidebar-header');
        if (header) {
            const closeBtn = document.createElement('button');
            closeBtn.className = 'sidebar-close';
            closeBtn.setAttribute('aria-label', 'Close menu');
            closeBtn.innerHTML = '<i class="fas fa-times"></i>';
            header.appendChild(closeBtn);
        }
    }
    
    const isMobile = () => window.innerWidth <= 1024;
    const openNav = () => {
        if (!isMobile()) return;
        sidebar.classList.add('open');
        overlay.classList.add('active');
        document.body.classList.add('nav-open');
    };
    const closeNav = () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
        document.body.classList.remove('nav-open');
    };
    const toggleNav = () => {
        if (sidebar.classList.contains('open')) { closeNav(); } else { openNav(); }
    };
    
    document.querySelectorAll('.mobile-menu-btn').forEach(btn => btn.addEventListener('click', toggleNav));
    overlay.addEventListener('click', closeNav);
    
    const closeBtn = sidebar.querySelector('.sidebar-close');
    if (closeBtn) closeBtn.addEventListener('click', closeNav);
    
    // Selecting a menu item closes the drawer (delegated so injected links work too)
    sidebar.addEventListener('click', (e) => {
        if (e.target.closest('.menu-item')) closeNav();
    });
    
    window.addEventListener('resize', () => {
        if (window.innerWidth > 1024) closeNav();
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeNav();
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileLayout);
} else {
    initMobileLayout();
}