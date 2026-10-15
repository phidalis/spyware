// dashboard.js - Complete Dashboard functionality

document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

function initializeDashboard() {
    // Build the mobile app shell (top bar + slide-in drawer)
    initMobileLayout();
    
    // Update current time
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
    
    // Load initial data
    loadActivityData();
    loadGeneratedItems();
    
    // Build the live SOC console
    buildKpis();
    buildTargets();
    startTrafficChart();
    startSystemStats();
    startTerminal();
    startLiveFeed();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize modals
    initializeModals();
}

function updateCurrentTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'});
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

// Pool of simulated events used by the live feed
const feedPool = [
    { icon: 'fab fa-whatsapp', color: '#25D366', title: 'Message Captured', desc: 'WhatsApp · John Doe → "Meeting moved to 3 PM"' },
    { icon: 'fab fa-instagram', color: '#E4405F', title: 'Story Viewed', desc: 'Instagram · Alice Smith viewed a story' },
    { icon: 'fab fa-facebook', color: '#1877F2', title: 'Login Detected', desc: 'Facebook · New device from New York, US' },
    { icon: 'fab fa-tiktok', color: '#69C9D0', title: 'Video Watched', desc: 'TikTok · Target watched a 42s clip' },
    { icon: 'fab fa-telegram', color: '#229ED9', title: 'Session Started', desc: 'Telegram · Encrypted session opened' },
    { icon: 'fas fa-link', color: '#4299e1', title: 'Link Clicked', desc: 'Tracking link opened from Android device' },
    { icon: 'fas fa-file-download', color: '#38a169', title: 'File Downloaded', desc: 'sample_report.pdf downloaded by target' },
    { icon: 'fas fa-shield-alt', color: '#9f7aea', title: 'Connection Secured', desc: 'TLS channel established · AES-256-GCM' },
    { icon: 'fas fa-map-marker-alt', color: '#f6c453', title: 'Location Resolved', desc: 'Geo lookup · Berlin, DE (±2 km)' },
    { icon: 'fas fa-exclamation-triangle', color: '#f56565', title: 'Anomaly Flagged', desc: 'Unusual login pattern · risk score 0.63' }
];

function relTime(ts) {
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 5) return 'just now';
    if (s < 60) return s + 's ago';
    const m = Math.floor(s / 60);
    if (m < 60) return m + 'm ago';
    const h = Math.floor(m / 60);
    if (h < 24) return h + 'h ago';
    return Math.floor(h / 24) + 'd ago';
}

function makeFeedItem(ev) {
    const el = document.createElement('div');
    el.className = 'activity-item';
    el.dataset.ts = ev.ts;
    el.innerHTML = `
        <div class="activity-icon" style="background: ${ev.color}22; color: ${ev.color}">
            <i class="${ev.icon}"></i>
        </div>
        <div class="activity-content">
            <h4>${ev.title}</h4>
            <p>${ev.desc}</p>
        </div>
        <div class="activity-time">${relTime(ev.ts)}</div>
    `;
    return el;
}

function loadActivityData() {
    const activityList = document.getElementById('activity-list');
    if (!activityList) return;
    
    activityList.innerHTML = '';
    const now = Date.now();
    for (let i = 0; i < 7; i++) {
        const ev = Object.assign({}, feedPool[i % feedPool.length], {
            ts: now - i * (90 + Math.random() * 120) * 1000
        });
        activityList.appendChild(makeFeedItem(ev));
    }
}

function startLiveFeed() {
    const activityList = document.getElementById('activity-list');
    if (!activityList) return;
    
    // Keep relative timestamps fresh
    setInterval(() => {
        activityList.querySelectorAll('.activity-item').forEach((el) => {
            const timeEl = el.querySelector('.activity-time');
            if (timeEl) timeEl.textContent = relTime(parseInt(el.dataset.ts, 10));
        });
    }, 5000);
    
    // Stream new simulated events in
    setInterval(() => {
        const ev = Object.assign({}, feedPool[Math.floor(Math.random() * feedPool.length)], { ts: Date.now() });
        activityList.insertBefore(makeFeedItem(ev), activityList.firstChild);
        while (activityList.children.length > 30) {
            activityList.removeChild(activityList.lastChild);
        }
    }, 6500);
}

/* ---------------- KPI cards ---------------- */
function sparkline(values, color) {
    const w = 120, h = 34, pad = 3;
    const max = Math.max.apply(null, values);
    const min = Math.min.apply(null, values);
    const range = (max - min) || 1;
    const pts = values.map((v, i) => {
        const x = pad + (i / (values.length - 1)) * (w - pad * 2);
        const y = h - pad - ((v - min) / range) * (h - pad * 2);
        return x.toFixed(1) + ',' + y.toFixed(1);
    }).join(' ');
    return `<svg class="sparkline" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">\
<polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/></svg>`;
}

function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'), 10) || 0;
    const duration = 1200;
    const start = performance.now();
    function step(t) {
        const p = Math.min((t - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.floor(eased * target).toLocaleString();
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target.toLocaleString();
    }
    requestAnimationFrame(step);
}

function buildKpis() {
    const grid = document.getElementById('kpi-grid');
    if (!grid) return;
    
    const kpis = [
        { label: 'WhatsApp Targets', value: 3, trend: 12, icon: 'fab fa-whatsapp', color: '#25D366', data: [1, 2, 2, 3, 3, 3] },
        { label: 'Instagram Targets', value: 2, trend: 8, icon: 'fab fa-instagram', color: '#E4405F', data: [1, 1, 2, 2, 2, 2] },
        { label: 'Facebook Targets', value: 4, trend: -3, icon: 'fab fa-facebook', color: '#1877F2', data: [5, 5, 4, 4, 4, 4] },
        { label: 'TikTok Targets', value: 3, trend: 15, icon: 'fab fa-tiktok', color: '#69C9D0', data: [1, 2, 2, 3, 3, 3] },
        { label: 'Messages Captured', value: 1284, trend: 21, icon: 'fas fa-comment-dots', color: '#22d3ee', data: [900, 980, 1050, 1120, 1200, 1284] },
        { label: 'Threats Blocked', value: 37, trend: 6, icon: 'fas fa-shield-alt', color: '#9f7aea', data: [18, 22, 27, 30, 34, 37] }
    ];
    
    grid.innerHTML = kpis.map((k) => {
        const dir = k.trend >= 0 ? 'up' : 'down';
        return `
        <div class="kpi-card">
            <div class="kpi-top">
                <span class="kpi-ic" style="--c:${k.color}"><i class="${k.icon}"></i></span>
                <span class="kpi-trend ${dir}"><i class="fas fa-arrow-${dir}"></i>${Math.abs(k.trend)}%</span>
            </div>
            <div class="kpi-value" data-target="${k.value}">0</div>
            <div class="kpi-label">${k.label}</div>
            ${sparkline(k.data, k.color)}
        </div>`;
    }).join('');
    
    grid.querySelectorAll('.kpi-value').forEach(animateCounter);
}

/* ---------------- Monitored targets ---------------- */
function buildTargets() {
    const wrap = document.getElementById('targets-table');
    if (!wrap) return;
    
    const targets = [
        { name: 'John Doe', handle: '@j.doe', icon: 'fab fa-whatsapp', color: '#25D366', ip: '192.168.1.24', loc: 'London, UK', device: 'iPhone 14 · iOS 17', status: 'online' },
        { name: 'Alice Smith', handle: '@alice.s', icon: 'fab fa-instagram', color: '#E4405F', ip: '10.0.0.87', loc: 'Berlin, DE', device: 'Galaxy S23 · Android 14', status: 'online' },
        { name: 'Mike Brown', handle: '@mikeb', icon: 'fab fa-facebook', color: '#1877F2', ip: '172.16.4.19', loc: 'New York, US', device: 'Pixel 8 · Android 14', status: 'idle' },
        { name: 'Sara Lee', handle: '@sara.lee', icon: 'fab fa-tiktok', color: '#69C9D0', ip: '192.168.0.55', loc: 'Singapore, SG', device: 'Redmi Note 12 · Android 13', status: 'online' },
        { name: 'Tomas Ruiz', handle: '@tomas.r', icon: 'fab fa-telegram', color: '#229ED9', ip: '10.10.2.31', loc: 'Madrid, ES', device: 'MacBook Pro · macOS 14', status: 'offline' },
        { name: 'Nina Kovac', handle: '@nina.k', icon: 'fab fa-snapchat', color: '#FFFC00', ip: '192.168.3.77', loc: 'Toronto, CA', device: 'iPad Air · iPadOS 17', status: 'online' }
    ];
    const statusText = { online: 'ACTIVE', idle: 'IDLE', offline: 'OFFLINE' };
    
    wrap.innerHTML = targets.map((t) => {
        const initials = t.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
        return `
        <div class="target-row">
            <div class="target-av" style="background:${t.color}22;color:${t.color}">${initials}</div>
            <div class="target-main">
                <h4><i class="${t.icon}" style="color:${t.color}"></i> ${t.name} <span class="handle">${t.handle}</span></h4>
                <div class="target-meta">
                    <span><i class="fas fa-network-wired"></i>${t.ip}</span>
                    <span><i class="fas fa-map-marker-alt"></i>${t.loc}</span>
                    <span><i class="fas fa-mobile-alt"></i>${t.device}</span>
                </div>
            </div>
            <span class="status-pill ${t.status}">${statusText[t.status]}</span>
        </div>`;
    }).join('');
    
    const count = document.getElementById('target-count');
    if (count) count.textContent = targets.length + ' sessions';
}

/* ---------------- Network traffic chart ---------------- */
function startTrafficChart() {
    const canvas = document.getElementById('traffic-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const MAX = 60;
    const inbound = [];
    const outbound = [];
    for (let i = 0; i < MAX; i++) {
        inbound.push(40 + Math.random() * 30);
        outbound.push(20 + Math.random() * 25);
    }
    
    const dpr = window.devicePixelRatio || 1;
    let w = 0, h = 0;
    
    function resize() {
        const rect = canvas.getBoundingClientRect();
        w = Math.max(1, rect.width);
        h = Math.max(1, rect.height);
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        draw();
    }
    
    function drawLine(arr, color, fill) {
        const stepX = w / (MAX - 1);
        ctx.beginPath();
        arr.forEach((v, i) => {
            const x = i * stepX;
            const y = h - (v / 120) * h * 0.9 - 6;
            if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
        });
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.stroke();
        if (fill) {
            ctx.lineTo(w, h);
            ctx.lineTo(0, h);
            ctx.closePath();
            const g = ctx.createLinearGradient(0, 0, 0, h);
            g.addColorStop(0, color + '55');
            g.addColorStop(1, color + '00');
            ctx.fillStyle = g;
            ctx.fill();
        }
    }
    
    function draw() {
        ctx.clearRect(0, 0, w, h);
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = (h / 4) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }
        drawLine(inbound, '#22d3ee', true);
        drawLine(outbound, '#9f7aea', false);
    }
    
    setInterval(() => {
        const nextIn = Math.max(18, Math.min(72, inbound[inbound.length - 1] + (Math.random() - 0.5) * 18));
        const nextOut = Math.max(10, Math.min(50, outbound[outbound.length - 1] + (Math.random() - 0.5) * 14));
        inbound.push(nextIn); inbound.shift();
        outbound.push(nextOut); outbound.shift();
        draw();
    }, 900);
    
    window.addEventListener('resize', resize);
    requestAnimationFrame(resize);
}

/* ---------------- System stats ---------------- */
function startSystemStats() {
    const cpu = document.getElementById('stat-cpu');
    if (!cpu) return;
    const ram = document.getElementById('stat-ram');
    const net = document.getElementById('stat-net');
    const bcpu = document.getElementById('bar-cpu');
    const bram = document.getElementById('bar-ram');
    const bnet = document.getElementById('bar-net');
    
    setInterval(() => {
        const c = 15 + Math.round(Math.random() * 55);
        const r = 35 + Math.round(Math.random() * 40);
        const n = (5 + Math.random() * 22);
        cpu.textContent = c + '%';
        ram.textContent = r + '%';
        net.textContent = n.toFixed(1) + ' Mb/s';
        bcpu.style.width = c + '%';
        bram.style.width = r + '%';
        bnet.style.width = Math.min(100, (n / 30) * 100) + '%';
    }, 2000);
}

/* ---------------- System log terminal ---------------- */
function startTerminal() {
    const term = document.getElementById('terminal');
    if (!term) return;
    
    const lines = [
        ['info', 'TLS handshake established · cipher=TLS_AES_256_GCM_SHA384'],
        ['dim', 'sensor grid synchronised · nodes=6 · latency=42ms'],
        ['ok', 'packet capture active on eth0 · mode=monitor'],
        ['info', 'session token rotated · expires in 3600s'],
        ['warn', 'anomalous login pattern flagged · score=0.63'],
        ['ok', 'encrypted channel verified · integrity=ok'],
        ['dim', 'heartbeat ok · buffer=12% · queue=empty'],
        ['warn', 'rate limit approaching on edge-node-03'],
        ['ok', 'signature database updated · 1284501 entries'],
        ['info', 'geo-resolver refreshed · accuracy=medium'],
        ['dim', 'snapshot written to /var/log/edge/2024.log'],
        ['ok', 'integrity check passed · 0 errors']
    ];
    let i = 0;
    
    function stamp() {
        return new Date().toTimeString().slice(0, 8);
    }
    function addLine() {
        const item = lines[i % lines.length];
        i++;
        const div = document.createElement('div');
        div.className = 'log-line';
        div.innerHTML = `<span class="ts">[${stamp()}]</span> <span class="log-${item[0]}">${item[1]}</span>`;
        term.appendChild(div);
        while (term.children.length > 60) term.removeChild(term.firstChild);
        term.scrollTop = term.scrollHeight;
    }
    
    for (let k = 0; k < 6; k++) addLine();
    setInterval(addLine, 1600);
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
    
    const fileContent = `PAYLOAD MANIFEST\n\n` +
                       `File Name: ${name}.${extension}\n` +
                       `Internal Name: ${randomName}_${platform}_${type}.${extension}\n` +
                       `File Size: ${(fileSize / 1000000).toFixed(2)} MB\n` +
                       `MD5 Checksum: ${md5}\n` +
                       `Target Platform: ${platform}\n` +
                       `File Type: ${type}\n` +
                       `Payload: Trojan.${platform}.${type}.${randomName}\n\n` +
                       `Status: ready`;
    
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

function initMobileLayout() {
    // Only relevant for the dashboard shell
    const container = document.querySelector('.dashboard-container');
    if (!container) return;
    
    const sidebar = container.querySelector('.sidebar');
    if (!sidebar) return;
    
    // Overlay
    let overlay = document.querySelector('.sidebar-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);
    }
    
    // Sticky top app bar
    if (!document.querySelector('.mobile-topbar')) {
        const headerTitle = document.querySelector('.content-header h1');
        const titleText = (headerTitle ? headerTitle.textContent : 'Dashboard').trim();
        
        const topbar = document.createElement('div');
        topbar.className = 'mobile-topbar';
        topbar.innerHTML =
            '<button class="mobile-menu-btn" aria-label="Open menu"><i class="fas fa-bars"></i></button>' +
            '<span class="mobile-topbar-title"></span>' +
            '<span class="mobile-topbar-status"><i class="fas fa-circle"></i> Online</span>';
        topbar.querySelector('.mobile-topbar-title').textContent = titleText;
        container.parentNode.insertBefore(topbar, container);
    }
    
    // Close button inside the drawer
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
    
    // Reset when resizing back to desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth > 1024) closeNav();
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeNav();
    });
}