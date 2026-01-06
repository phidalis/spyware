// dashboard.js - Complete Dashboard functionality

document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

function initializeDashboard() {
    // Update current time
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
    
    // Load initial data
    loadActivityData();
    loadGeneratedItems();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize modals
    initializeModals();
}

function updateCurrentTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const dateString = now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    const timeElement = document.getElementById('current-time');
    if (timeElement) {
        timeElement.textContent = `${dateString} • ${timeString}`;
    }
}

function loadActivityData() {
    const activityList = document.getElementById('activity-list');
    if (!activityList) return;
    
    const activities = [
        {
            icon: 'fab fa-whatsapp',
            iconColor: '#25D366',
            title: 'New WhatsApp Message Captured',
            description: 'From John Doe: "Meeting at 3 PM tomorrow"',
            time: '2 minutes ago'
        },
        {
            icon: 'fab fa-instagram',
            iconColor: '#E4405F',
            title: 'Instagram Story Viewed',
            description: 'Target viewed Alice Smith\'s story',
            time: '15 minutes ago'
        },
        {
            icon: 'fab fa-facebook',
            iconColor: '#1877F2',
            title: 'Facebook Login Detected',
            description: 'New device login from New York',
            time: '1 hour ago'
        },
        {
            icon: 'fas fa-link',
            iconColor: '#4299e1',
            title: 'Surveillance Link Clicked',
            description: 'WhatsApp security update link was clicked',
            time: '3 hours ago'
        },
        {
            icon: 'fas fa-file-download',
            iconColor: '#38a169',
            title: 'File Downloaded',
            description: 'Instagram_Pro_Mod.apk was downloaded',
            time: '5 hours ago'
        }
    ];
    
    activityList.innerHTML = '';
    
    activities.forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.innerHTML = `
            <div class="activity-icon" style="background: ${activity.iconColor}20; color: ${activity.iconColor}">
                <i class="${activity.icon}"></i>
            </div>
            <div class="activity-content">
                <h4>${activity.title}</h4>
                <p>${activity.description}</p>
            </div>
            <div class="activity-time">${activity.time}</div>
        `;
        activityList.appendChild(activityItem);
    });
}

function loadGeneratedItems() {
    const generatedItems = document.getElementById('generated-items');
    if (!generatedItems) return;
    
    const items = JSON.parse(localStorage.getItem('generatedItems') || '[]');
    
    if (items.length === 0) {
        generatedItems.innerHTML = `
            <div class="no-items">
                <i class="fas fa-code"></i>
                <p>No generated items yet. Create links or files to see them here.</p>
            </div>
        `;
        return;
    }
    
    generatedItems.innerHTML = '';
    
    items.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'generated-item fade-in';
        itemElement.innerHTML = `
            <div class="generated-item-header">
                <h4>
                    <i class="fas fa-${item.type === 'link' ? 'link' : 'file'}"></i>
                    ${item.name}
                    <span class="item-type type-${item.type}">${item.type.toUpperCase()}</span>
                </h4>
                <button class="item-delete" data-index="${index}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="generated-content">${item.content}</div>
            <div class="item-actions">
                <button class="item-btn btn-copy" data-content="${item.content}">
                    <i class="fas fa-copy"></i> Copy
                </button>
                <button class="item-btn btn-download" data-content="${item.content}" data-name="${item.name}.${item.type === 'file' ? 'txt' : 'url'}">
                    <i class="fas fa-download"></i> Download
                </button>
            </div>
        `;
        generatedItems.appendChild(itemElement);
    });
    
    // Update counts
    updateItemCounts();
    
    // Add event listeners for new items
    addItemEventListeners();
}

function updateItemCounts() {
    const items = JSON.parse(localStorage.getItem('generatedItems') || '[]');
    const linkCount = items.filter(item => item.type === 'link').length;
    const fileCount = items.filter(item => item.type === 'file').length;
    
    const linksCountElement = document.getElementById('links-count');
    const filesCountElement = document.getElementById('files-count');
    
    if (linksCountElement) linksCountElement.textContent = linkCount;
    if (filesCountElement) filesCountElement.textContent = fileCount;
}

function addItemEventListeners() {
    // Copy buttons
    document.querySelectorAll('.btn-copy').forEach(button => {
        button.addEventListener('click', function() {
            const content = this.getAttribute('data-content');
            copyToClipboard(content);
            showNotification('Copied to clipboard!', 'success');
        });
    });
    
    // Download buttons
    document.querySelectorAll('.btn-download').forEach(button => {
        button.addEventListener('click', function() {
            const content = this.getAttribute('data-content');
            const filename = this.getAttribute('data-name');
            downloadContent(content, filename);
            showNotification('File downloaded!', 'success');
        });
    });
    
    // Delete buttons
    document.querySelectorAll('.item-delete').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            deleteGeneratedItem(index);
        });
    });
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        console.log('Copied to clipboard:', text);
    }).catch(err => {
        console.error('Failed to copy:', err);
        // Fallback for older browsers
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

function deleteGeneratedItem(index) {
    const items = JSON.parse(localStorage.getItem('generatedItems') || '[]');
    items.splice(index, 1);
    localStorage.setItem('generatedItems', JSON.stringify(items));
    loadGeneratedItems();
    showNotification('Item deleted', 'info');
}

function setupEventListeners() {
    // Generate link from sidebar
    const genLinkBtn = document.getElementById('generate-link');
    const genFileBtn = document.getElementById('generate-file');
    const genLinkBtnAction = document.getElementById('gen-link-btn');
    const genFileBtnAction = document.getElementById('gen-file-btn');
    const clearAllBtn = document.getElementById('clear-all');
    const refreshBtn = document.querySelector('.btn-refresh');
    
    if (genLinkBtn) genLinkBtn.addEventListener('click', showLinkModal);
    if (genFileBtn) genFileBtn.addEventListener('click', showFileModal);
    if (genLinkBtnAction) genLinkBtnAction.addEventListener('click', showLinkModal);
    if (genFileBtnAction) genFileBtnAction.addEventListener('click', showFileModal);
    
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', function() {
            if (confirm('Clear all generated items?')) {
                localStorage.removeItem('generatedItems');
                loadGeneratedItems();
                showNotification('All items cleared', 'info');
            }
        });
    }
    
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
            setTimeout(() => {
                loadActivityData();
                this.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh Data';
                showNotification('Data refreshed', 'success');
            }, 1000);
        });
    }
}

function initializeModals() {
    // Link Generator Modal
    const linkModal = document.getElementById('link-modal');
    const linkModalClose = linkModal?.querySelector('.modal-close');
    const generateLinkBtn = document.getElementById('generate-link-btn');
    
    if (linkModalClose) {
        linkModalClose.addEventListener('click', () => linkModal.classList.remove('active'));
    }
    
    if (generateLinkBtn) {
        generateLinkBtn.addEventListener('click', generateNewLink);
    }
    
    // File Generator Modal
    const fileModal = document.getElementById('file-modal');
    const fileModalClose = fileModal?.querySelector('.modal-close');
    const generateFileBtn = document.getElementById('generate-file-btn');
    
    if (fileModalClose) {
        fileModalClose.addEventListener('click', () => fileModal.classList.remove('active'));
    }
    
    if (generateFileBtn) {
        generateFileBtn.addEventListener('click', generateNewFile);
    }
    
    // Close modals when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }
    });
}

function showLinkModal() {
    const modal = document.getElementById('link-modal');
    if (modal) {
        modal.classList.add('active');
    }
}

function showFileModal() {
    const modal = document.getElementById('file-modal');
    if (modal) {
        modal.classList.add('active');
    }
}

function generateNewLink() {
    const platform = document.getElementById('link-platform').value;
    const type = document.getElementById('link-type').value;
    const name = document.getElementById('link-name').value || `Surveillance Link for ${platform}`;
    
    const domains = {
        whatsapp: ['whatsapp-update', 'whatsapp-security', 'whatsapp-verify'],
        instagram: ['instagram-tools', 'ig-verification', 'insta-pro'],
        facebook: ['fb-security', 'facebook-help', 'fb-tools'],
        tiktok: ['tiktok-tools', 'tiktok-creators', 'tiktok-verify'],
        telegram: ['telegram-update', 'tg-tools', 'telegram-plus'],
        snapchat: ['snapchat-filters', 'snap-tools', 'snapchat-plus']
    };
    
    const platformDomains = domains[platform] || ['secure-link', 'update-required', 'verification-needed'];
    const randomDomain = platformDomains[Math.floor(Math.random() * platformDomains.length)];
    const randomPath = Math.random().toString(36).substring(2, 15);
    
    let path = '';
    switch(type) {
        case 'phishing': path = '/login/secure'; break;
        case 'update': path = '/update/required'; break;
        case 'security': path = '/security/verify'; break;
        case 'promotion': path = '/promo/claim'; break;
        default: path = '/redirect';
    }
    
    const link = `https://${randomDomain}.com${path}/${randomPath}?ref=${platform}_${Date.now().toString(36)}`;
    
    // Save to localStorage
    const items = JSON.parse(localStorage.getItem('generatedItems') || '[]');
    items.unshift({
        type: 'link',
        platform: platform,
        name: name,
        content: link,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('generatedItems', JSON.stringify(items));
    
    // Update UI
    loadGeneratedItems();
    
    // Close modal
    document.getElementById('link-modal').classList.remove('active');
    
    // Show notification
    showNotification(`Link generated for ${platform}`, 'success');
    
    // Clear form
    document.getElementById('link-name').value = '';
}

function generateNewFile() {
    const platform = document.getElementById('file-platform').value;
    const type = document.getElementById('file-type').value;
    const name = document.getElementById('file-name').value || `${platform}_surveillance_tool`;
    
    const extensions = {
        apk: 'apk',
        exe: 'exe',
        dmg: 'dmg',
        pdf: 'pdf',
        zip: 'zip'
    };
    
    const extension = extensions[type] || 'bin';
    const randomName = Math.random().toString(36).substring(2, 10);
    const fileSize = Math.floor(Math.random() * 50000000) + 1000000;
    const md5 = Array.from({length: 32}, () => Math.floor(Math.random() * 16).toString(16)).join('');
    
    const fileContent = `SURVEILLANCE FILE \n\n` +
                       `File Name: ${name}.${extension}\n` +
                       `Internal Name: ${randomName}_${platform}_${type}.${extension}\n` +
                       `File Size: ${(fileSize / 1000000).toFixed(2)} MB\n` +
                       `MD5 Checksum: ${md5}\n` +
                       `Target Platform: ${platform}\n` +
                       `File Type: ${type}\n` +
                       `Simulated Payload: Trojan.${platform}.${type}.${randomName}\n\n` +
                       `⚠️ LINK SUCCESFUL GENERATED`;
    
    // Save to localStorage
    const items = JSON.parse(localStorage.getItem('generatedItems') || '[]');
    items.unshift({
        type: 'file',
        platform: platform,
        name: name,
        content: fileContent,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('generatedItems', JSON.stringify(items));
    
    // Update UI
    loadGeneratedItems();
    
    // Close modal
    document.getElementById('file-modal').classList.remove('active');
    
    // Show notification
    showNotification(`File generated for ${platform}`, 'success');
    
    // Clear form
    document.getElementById('file-name').value = '';
}

function showNotification(message, type = 'info') {
    // Check if notification function exists from main.js
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type);
    } else {
        // Fallback notification
        alert(`${type.toUpperCase()}: ${message}`);
    }
}