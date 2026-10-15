// modules.js - Extended monitoring module pages
// Location tracking, parental controls, app usage, notification mirror, gallery.
// All values are generated locally in the browser.

/* ================= Shared helpers ================= */
function setText(id, value) {
    const el = typeof id === 'string' ? document.getElementById(id) : id;
    if (el) el.textContent = value;
}

function rnd(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function emptyStateHTML(icon, title, text) {
    return '<div class="no-items">' +
        '<i class="' + icon + '"></i>' +
        (title ? '<h4>' + title + '</h4>' : '') +
        (text ? '<p>' + text + '</p>' : '') +
        '</div>';
}

function renderEmptyState(selector, icon, title, text) {
    const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (el) el.innerHTML = emptyStateHTML(icon, title, text);
}

function kpiCardHTML(opts) {
    const trend = (typeof opts.trend === 'number')
        ? '<span class="kpi-trend ' + (opts.trend >= 0 ? 'up' : 'down') + '">' +
          '<i class="fas fa-arrow-' + (opts.trend >= 0 ? 'up' : 'down') + '"></i>' +
          Math.abs(opts.trend) + '%</span>'
        : '';
    const color = opts.color || '#4299e1';
    return '<div class="kpi-card">' +
        '<div class="kpi-top">' +
            '<span class="kpi-ic" style="--c:' + color + '"><i class="' + opts.icon + '"></i></span>' +
            trend +
        '</div>' +
        '<div class="kpi-value">' + opts.value + '</div>' +
        '<div class="kpi-label">' + opts.label + '</div>' +
    '</div>';
}

function wireRefresh(id, cb) {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener('click', function () {
        const original = this.innerHTML;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
        setTimeout(() => {
            this.innerHTML = original;
            if (cb) cb();
            if (typeof showNotification === 'function') showNotification('Data refreshed', 'success');
        }, 900);
    });
}

function wireExport(id, title) {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener('click', function (e) {
        e.preventDefault();
        if (typeof showNotification === 'function') showNotification(title + ' exported', 'success');
    });
}

function fitCanvas(canvas) {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(1, rect.width);
    const h = Math.max(1, rect.height);
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx: ctx, w: w, h: h };
}

function drawBarChart(canvas, values, color) {
    if (!canvas) return;
    const c = fitCanvas(canvas);
    const ctx = c.ctx, w = c.w, h = c.h;
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

    const max = Math.max.apply(null, values) || 1;
    const gap = 3;
    const bw = (w - gap * (values.length - 1)) / values.length;
    values.forEach((v, i) => {
        const bh = (v / max) * (h - 8);
        const x = i * (bw + gap);
        const y = h - bh;
        const grad = ctx.createLinearGradient(0, y, 0, h);
        grad.addColorStop(0, color);
        grad.addColorStop(1, color + '22');
        ctx.fillStyle = grad;
        ctx.fillRect(x, y, bw, bh);
    });
}

/* ================= Sidebar navigation injection ================= */
const MONITORING_PAGES = [
    { href: 'location.html', icon: 'fas fa-map-marked-alt', label: 'Location Tracking' },
    { href: 'parental.html', icon: 'fas fa-child', label: 'Parental Controls' },
    { href: 'appusage.html', icon: 'fas fa-mobile-alt', label: 'App Usage' },
    { href: 'notifications.html', icon: 'fas fa-bell', label: 'Notification Mirror' },
    { href: 'gallery.html', icon: 'fas fa-images', label: 'Camera & Gallery' }
];

function injectMonitoringNav() {
    const menu = document.querySelector('.sidebar-menu');
    if (!menu || menu.querySelector('[data-module-nav]')) return;

    const current = (window.location.pathname.split('/').pop() || 'dashboard.html').toLowerCase();
    const section = document.createElement('div');
    section.className = 'menu-section';
    section.setAttribute('data-module-nav', '');
    section.innerHTML = '<h3><i class="fas fa-satellite-dish"></i> Monitoring Tools</h3>' +
        MONITORING_PAGES.map(function (p) {
            return '<a href="' + p.href + '" class="menu-item' + (current === p.href ? ' active' : '') + '">' +
                '<i class="' + p.icon + '"></i> ' + p.label + '</a>';
        }).join('');

    const first = menu.querySelector('.menu-section');
    if (first) first.insertAdjacentElement('afterend', section);
    else menu.appendChild(section);
}

function injectAboutLink() {
    const menu = document.querySelector('.sidebar-menu');
    if (!menu || menu.querySelector('[data-about-nav]')) return;

    const section = document.createElement('div');
    section.className = 'menu-section';
    section.setAttribute('data-about-nav', '');
    section.innerHTML = '<h3><i class="fas fa-circle-info"></i> Info</h3>' +
        '<a href="about.html" class="menu-item' +
        ((window.location.pathname.split('/').pop() || '').toLowerCase() === 'about.html' ? ' active' : '') +
        '"><i class="fas fa-circle-info"></i> About</a>';

    menu.appendChild(section);
}

injectMonitoringNav();
injectAboutLink();
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
        injectMonitoringNav();
        injectAboutLink();
    });
}

/* ================= Location Tracking ================= */
const LOC_PLACES = [
    { name: 'Westminster, London', lat: 51.5074, lng: -0.1278 },
    { name: 'Camden Town, London', lat: 51.5390, lng: -0.1426 },
    { name: 'Shoreditch, London', lat: 51.5265, lng: -0.0780 },
    { name: 'Greenwich, London', lat: 51.4826, lng: -0.0077 },
    { name: 'Notting Hill, London', lat: 51.5099, lng: -0.1965 },
    { name: 'Canary Wharf, London', lat: 51.5054, lng: -0.0235 }
];
let locTimer = null;

function initializeLocationPanel() {
    setupTabSwitching();
    renderLocationHistory();
    renderGeofences();
    startLocationSim();
    wireRefresh('loc-refresh', startLocationSim);
    wireExport('loc-export', 'Location report');

    const trackBtn = document.getElementById('loc-track');
    if (trackBtn) {
        trackBtn.addEventListener('click', function () {
            if (locTimer) {
                clearInterval(locTimer);
                locTimer = null;
                this.innerHTML = '<i class="fas fa-play"></i> Resume Tracking';
                showNotification('Location tracking paused', 'warning');
            } else {
                startLocationSim();
                this.innerHTML = '<i class="fas fa-pause"></i> Pause Tracking';
                showNotification('Location tracking resumed', 'success');
            }
        });
    }
}

function startLocationSim() {
    const target = document.getElementById('map-target');
    if (!target) return;
    if (locTimer) clearInterval(locTimer);

    let idx = 0;
    const tick = function () {
        const place = LOC_PLACES[idx % LOC_PLACES.length];
        idx++;
        const lat = (place.lat + (Math.random() - 0.5) * 0.012).toFixed(5);
        const lng = (place.lng + (Math.random() - 0.5) * 0.012).toFixed(5);

        target.style.top = (22 + Math.random() * 56) + '%';
        target.style.left = (16 + Math.random() * 68) + '%';

        setText('loc-coords', lat + ', ' + lng);
        setText('loc-address', place.name);
        setText('loc-accuracy', '±' + rnd(5, 32) + ' m');
        setText('loc-speed', (Math.random() * 7).toFixed(1) + ' km/h');
        setText('loc-heading', pick(['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']));
        setText('loc-battery', rnd(38, 100) + '%');
        setText('loc-updated', 'just now');

        addLocationHistory(place, lat, lng);
    };
    tick();
    locTimer = setInterval(tick, 4500);
}

function addLocationHistory(place, lat, lng) {
    const list = document.getElementById('loc-history');
    if (!list) return;
    const empty = list.querySelector('.no-items');
    if (empty) empty.remove();

    const now = new Date();
    const time = now.toTimeString().slice(0, 8);
    const item = document.createElement('div');
    item.className = 'loc-history-item';
    item.innerHTML =
        '<span class="lh-dot"></span>' +
        '<div class="lh-body"><b>' + place.name + '</b>' +
        '<span class="lh-coord">' + lat + ', ' + lng + '</span></div>' +
        '<span class="lh-time">' + time + '</span>';
    list.insertBefore(item, list.firstChild);
    while (list.children.length > 14) list.removeChild(list.lastChild);
}

function renderLocationHistory() {
    const list = document.getElementById('loc-history');
    if (!list) return;
    list.innerHTML = '';
    const now = Date.now();
    for (let i = 0; i < 6; i++) {
        const place = LOC_PLACES[i % LOC_PLACES.length];
        const lat = (place.lat + (Math.random() - 0.5) * 0.01).toFixed(5);
        const lng = (place.lng + (Math.random() - 0.5) * 0.01).toFixed(5);
        const t = new Date(now - i * (7 + Math.random() * 20) * 60000);
        const item = document.createElement('div');
        item.className = 'loc-history-item';
        item.innerHTML =
            '<span class="lh-dot"></span>' +
            '<div class="lh-body"><b>' + place.name + '</b>' +
            '<span class="lh-coord">' + lat + ', ' + lng + '</span></div>' +
            '<span class="lh-time">' + t.toTimeString().slice(0, 8) + '</span>';
        list.appendChild(item);
    }
}

function renderGeofences() {
    const list = document.getElementById('loc-geofences');
    if (!list) return;
    const zones = [
        { name: 'Home', icon: 'fas fa-home', state: 'inside', color: '#38a169' },
        { name: 'School', icon: 'fas fa-school', state: 'left', color: '#d69e2e' },
        { name: 'Downtown Safe Zone', icon: 'fas fa-shield-alt', state: 'inside', color: '#38a169' },
        { name: 'Restricted Area', icon: 'fas fa-ban', state: 'outside', color: '#a0aec0' },
        { name: 'Grandma\u2019s House', icon: 'fas fa-heart', state: 'inside', color: '#38a169' }
    ];
    list.innerHTML = zones.map(function (z) {
        return '<div class="geo-item">' +
            '<span class="geo-ic" style="--c:' + z.color + '"><i class="' + z.icon + '"></i></span>' +
            '<div class="geo-body"><b>' + z.name + '</b><span>Geofence radius 250 m</span></div>' +
            '<span class="status-pill ' + (z.state === 'inside' ? 'online' : (z.state === 'left' ? 'idle' : 'offline')) + '">' +
            (z.state === 'inside' ? 'INSIDE' : (z.state === 'left' ? 'EXITED' : 'OUTSIDE')) + '</span>' +
        '</div>';
    }).join('');
}

/* ================= Parental Controls ================= */
const PC_APPS = [
    { name: 'YouTube Kids', icon: 'fab fa-youtube', color: '#e53e3e', time: 65, allow: true },
    { name: 'Roblox', icon: 'fas fa-gamepad', color: '#f56565', time: 42, allow: false },
    { name: 'WhatsApp', icon: 'fab fa-whatsapp', color: '#25D366', time: 28, allow: true },
    { name: 'Chrome', icon: 'fab fa-chrome', color: '#4299e1', time: 21, allow: true },
    { name: 'TikTok', icon: 'fab fa-tiktok', color: '#69C9D0', time: 0, allow: false },
    { name: 'Maths Practice', icon: 'fas fa-calculator', color: '#38a169', time: 15, allow: true }
];

function initializeParentalPanel() {
    setupTabSwitching();
    renderParentalStats();
    renderParentalApps();
    renderParentalRules();
    renderParentalBedtime();
    renderParentalAlerts();
    wireRefresh('pc-refresh', null);
    wireExport('pc-export', 'Parental report');
}

function renderParentalStats() {
    const grid = document.getElementById('pc-stats');
    if (!grid) return;
    grid.innerHTML = [
        kpiCardHTML({ label: 'Screen Time Today', value: '3h 12m', icon: 'fas fa-hourglass-half', color: '#22d3ee', trend: 8 }),
        kpiCardHTML({ label: 'Daily Limit', value: '4h 00m', icon: 'fas fa-stopwatch', color: '#9f7aea' }),
        kpiCardHTML({ label: 'Blocked Attempts', value: '7', icon: 'fas fa-ban', color: '#f56565', trend: 12 }),
        kpiCardHTML({ label: 'Apps Monitored', value: '6', icon: 'fas fa-mobile-alt', color: '#38a169' })
    ].join('');
}

function renderParentalApps() {
    const wrap = document.getElementById('pc-apps');
    if (!wrap) return;
    wrap.innerHTML = PC_APPS.map(function (a) {
        const pct = Math.min(100, Math.round((a.time / 90) * 100));
        return '<div class="usage-row">' +
            '<span class="usage-ic" style="--c:' + a.color + '"><i class="' + a.icon + '"></i></span>' +
            '<div class="usage-main"><div class="usage-top"><b>' + a.name + '</b><span>' + a.time + ' min</span></div>' +
            '<div class="usage-bar"><i style="width:' + pct + '%;background:' + a.color + '"></i></div></div>' +
        '</div>';
    }).join('');
}

function renderParentalRules() {
    const wrap = document.getElementById('pc-rules');
    if (!wrap) return;
    wrap.innerHTML = PC_APPS.map(function (a) {
        return '<div class="rule-item">' +
            '<span class="usage-ic" style="--c:' + a.color + '"><i class="' + a.icon + '"></i></span>' +
            '<div class="rule-body"><b>' + a.name + '</b><span>' + (a.allow ? 'Allowed' : 'Blocked') + '</span></div>' +
            '<button class="toggle' + (a.allow ? ' on' : '') + '" data-app="' + a.name + '" aria-label="Toggle ' + a.name + '"><span></span></button>' +
        '</div>';
    }).join('');

    wrap.querySelectorAll('.toggle').forEach(function (t) {
        t.addEventListener('click', function () {
            this.classList.toggle('on');
            const on = this.classList.contains('on');
            const label = this.parentNode.querySelector('.rule-body span');
            if (label) label.textContent = on ? 'Allowed' : 'Blocked';
            showNotification(this.dataset.app + (on ? ' allowed' : ' blocked'), on ? 'success' : 'warning');
        });
    });
}

function renderParentalBedtime() {
    const wrap = document.getElementById('pc-bedtime');
    if (!wrap) return;
    wrap.innerHTML =
        '<div class="bedtime-row">' +
            '<span class="usage-ic" style="--c:#9f7aea"><i class="fas fa-moon"></i></span>' +
            '<div class="rule-body"><b>Bedtime Schedule</b><span>21:00 \u2192 07:00 \u00b7 every night</span></div>' +
            '<button class="toggle on" id="pc-bedtime-toggle" aria-label="Toggle bedtime"><span></span></button>' +
        '</div>';
    const t = document.getElementById('pc-bedtime-toggle');
    if (t) t.addEventListener('click', function () {
        this.classList.toggle('on');
        showNotification('Bedtime ' + (this.classList.contains('on') ? 'enabled' : 'disabled'), this.classList.contains('on') ? 'success' : 'warning');
    });
}

function renderParentalAlerts() {
    const wrap = document.getElementById('pc-alerts');
    if (!wrap) return;
    const alerts = [
        { type: 'warn', icon: 'fas fa-ban', text: 'Blocked app opened: TikTok', time: '21:42' },
        { type: 'info', icon: 'fas fa-hourglass-end', text: 'Screen time limit reached (4h)', time: '20:15' },
        { type: 'warn', icon: 'fas fa-download', text: 'New app installed: Roblox', time: '18:03' },
        { type: 'info', icon: 'fas fa-moon', text: 'Bedtime reminder sent', time: '21:00' },
        { type: 'warn', icon: 'fas fa-map-marker-alt', text: 'Left safe zone: School', time: '15:36' },
        { type: 'info', icon: 'fas fa-battery-quarter', text: 'Device battery low (15%)', time: '13:10' }
    ];
    wrap.innerHTML = alerts.map(function (a) {
        return '<div class="alert-item ' + a.type + '">' +
            '<i class="' + a.icon + '"></i>' +
            '<span class="alert-text">' + a.text + '</span>' +
            '<span class="alert-time">' + a.time + '</span>' +
        '</div>';
    }).join('');
}

/* ================= App Usage / Screen Time ================= */
const AU_APPS = [
    { name: 'YouTube', icon: 'fab fa-youtube', color: '#e53e3e', min: 84 },
    { name: 'WhatsApp', icon: 'fab fa-whatsapp', color: '#25D366', min: 62 },
    { name: 'Instagram', icon: 'fab fa-instagram', color: '#E4405F', min: 47 },
    { name: 'Chrome', icon: 'fab fa-chrome', color: '#4299e1', min: 38 },
    { name: 'TikTok', icon: 'fab fa-tiktok', color: '#69C9D0', min: 31 },
    { name: 'Gmail', icon: 'fas fa-envelope', color: '#f6c453', min: 19 },
    { name: 'Google Maps', icon: 'fas fa-map-marked-alt', color: '#38a169', min: 12 }
];

function initializeAppUsagePanel() {
    setupTabSwitching();
    renderUsageStats();
    renderUsageApps();
    renderUsageCategories();
    drawBarChart(document.getElementById('au-hourly'), hourlyValues(), '#22d3ee');
    wireRefresh('au-refresh', function () {
        drawBarChart(document.getElementById('au-hourly'), hourlyValues(), '#22d3ee');
    });
    wireExport('au-export', 'Usage report');
    window.addEventListener('resize', function () {
        drawBarChart(document.getElementById('au-hourly'), hourlyValues(), '#22d3ee');
    });
}

function hourlyValues() {
    const vals = [];
    for (let i = 0; i < 24; i++) {
        let base = 8;
        if (i >= 7 && i <= 9) base = 42;
        else if (i >= 12 && i <= 13) base = 34;
        else if (i >= 17 && i <= 22) base = 58;
        else if (i >= 0 && i <= 5) base = 4;
        vals.push(Math.round(base + Math.random() * 22));
    }
    return vals;
}

function renderUsageStats() {
    const grid = document.getElementById('au-stats');
    if (!grid) return;
    grid.innerHTML = [
        kpiCardHTML({ label: 'Total Screen Time', value: '4h 53m', icon: 'fas fa-hourglass-half', color: '#22d3ee', trend: 6 }),
        kpiCardHTML({ label: 'Pickups', value: '96', icon: 'fas fa-hand-pointer', color: '#9f7aea', trend: 4 }),
        kpiCardHTML({ label: 'Notifications', value: '214', icon: 'fas fa-bell', color: '#f6c453', trend: -3 }),
        kpiCardHTML({ label: 'Data Used', value: '1.8 GB', icon: 'fas fa-database', color: '#38a169', trend: 9 })
    ].join('');
}

function renderUsageApps() {
    const wrap = document.getElementById('au-apps');
    if (!wrap) return;
    const max = Math.max.apply(null, AU_APPS.map(function (a) { return a.min; }));
    wrap.innerHTML = AU_APPS.map(function (a) {
        const h = Math.floor(a.min / 60);
        const m = a.min % 60;
        const label = (h ? h + 'h ' : '') + m + 'm';
        const pct = Math.round((a.min / max) * 100);
        return '<div class="usage-row">' +
            '<span class="usage-ic" style="--c:' + a.color + '"><i class="' + a.icon + '"></i></span>' +
            '<div class="usage-main"><div class="usage-top"><b>' + a.name + '</b><span>' + label + '</span></div>' +
            '<div class="usage-bar"><i style="width:' + pct + '%;background:' + a.color + '"></i></div></div>' +
        '</div>';
    }).join('');
}

function renderUsageCategories() {
    const wrap = document.getElementById('au-categories');
    if (!wrap) return;
    const cats = [
        { name: 'Social', pct: 38, color: '#E4405F' },
        { name: 'Video', pct: 27, color: '#e53e3e' },
        { name: 'Games', pct: 18, color: '#9f7aea' },
        { name: 'Productivity', pct: 9, color: '#38a169' },
        { name: 'Other', pct: 8, color: '#a0aec0' }
    ];
    wrap.innerHTML = cats.map(function (c) {
        return '<div class="cat-row">' +
            '<span class="cat-name">' + c.name + '</span>' +
            '<div class="usage-bar"><i style="width:' + c.pct + '%;background:' + c.color + '"></i></div>' +
            '<span class="cat-pct">' + c.pct + '%</span>' +
        '</div>';
    }).join('');
}

/* ================= Notification Mirror ================= */
const NTF_APPS = [
    { app: 'WhatsApp', icon: 'fab fa-whatsapp', color: '#25D366', cat: 'messages', titles: ['New message', 'Group message'], bodies: ['Hey, are you free later?', 'Check the group chat', 'Sent you a photo'] },
    { app: 'Instagram', icon: 'fab fa-instagram', color: '#E4405F', cat: 'social', titles: ['New like', 'New follower', 'New comment'], bodies: ['liked your photo', 'started following you', 'commented: nice one!'] },
    { app: 'TikTok', icon: 'fab fa-tiktok', color: '#69C9D0', cat: 'social', titles: ['Trending now', 'Someone mentioned you'], bodies: ['A video you may like', 'mentioned you in a comment'] },
    { app: 'Gmail', icon: 'fas fa-envelope', color: '#f6c453', cat: 'messages', titles: ['New email', 'Newsletter'], bodies: ['You have 1 new message', 'Your weekly digest is here'] },
    { app: 'Calendar', icon: 'fas fa-calendar-alt', color: '#4299e1', cat: 'system', titles: ['Upcoming event', 'Reminder'], bodies: ['Meeting in 15 minutes', 'Dentist at 4:00 PM'] },
    { app: 'Bank', icon: 'fas fa-university', color: '#38a169', cat: 'system', titles: ['Payment received', 'Balance alert'], bodies: ['\u00a3120.00 credited', 'Balance is below \u00a350'] },
    { app: 'Photos', icon: 'fas fa-camera', color: '#9f7aea', cat: 'system', titles: ['Memory', 'New album'], bodies: ['A year ago today', '12 new photos ready'] },
    { app: 'Telegram', icon: 'fab fa-telegram', color: '#229ED9', cat: 'messages', titles: ['New message', 'Channel update'], bodies: ['See the new update', '2 new posts in your channel'] }
];
let ntfTimer = null, ntfPaused = false, ntfFilter = 'all';

function initializeNotificationsPanel() {
    setupTabSwitching();
    seedNotifications();
    startNotificationStream();
    wireRefresh('ntf-refresh', null);

    const pauseBtn = document.getElementById('ntf-pause');
    if (pauseBtn) {
        pauseBtn.addEventListener('click', function () {
            ntfPaused = !ntfPaused;
            this.innerHTML = ntfPaused
                ? '<i class="fas fa-play"></i> Resume Stream'
                : '<i class="fas fa-pause"></i> Pause Stream';
            showNotification('Notification stream ' + (ntfPaused ? 'paused' : 'resumed'), ntfPaused ? 'warning' : 'success');
        });
    }

    document.querySelectorAll('[data-ntf-filter]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            document.querySelectorAll('[data-ntf-filter]').forEach(function (b) { b.classList.remove('active'); });
            this.classList.add('active');
            ntfFilter = this.dataset.ntfFilter;
            applyNotificationFilter();
        });
    });
}

function makeNotification() {
    const a = pick(NTF_APPS);
    const now = new Date();
    return {
        app: a.app,
        icon: a.icon,
        color: a.color,
        cat: a.cat,
        title: pick(a.titles),
        body: pick(a.bodies),
        time: now.toTimeString().slice(0, 8)
    };
}

function notificationHTML(n) {
    return '<div class="ntf-item" data-cat="' + n.cat + '">' +
        '<span class="ntf-ic" style="--c:' + n.color + '"><i class="' + n.icon + '"></i></span>' +
        '<div class="ntf-body"><div class="ntf-top"><b>' + n.app + '</b><span>' + n.time + '</span></div>' +
        '<p>' + n.title + ' \u00b7 ' + n.body + '</p></div>' +
    '</div>';
}

function seedNotifications() {
    const list = document.getElementById('ntf-list');
    if (!list) return;
    list.innerHTML = '';
    for (let i = 0; i < 6; i++) {
        list.insertAdjacentHTML('beforeend', notificationHTML(makeNotification()));
    }
    applyNotificationFilter();
}

function startNotificationStream() {
    if (ntfTimer) clearInterval(ntfTimer);
    ntfTimer = setInterval(function () {
        if (ntfPaused) return;
        const list = document.getElementById('ntf-list');
        if (!list) return;
        list.insertAdjacentHTML('afterbegin', notificationHTML(makeNotification()));
        applyNotificationFilter();
        while (list.children.length > 40) list.removeChild(list.lastChild);
    }, 3800);
}

function applyNotificationFilter() {
    const list = document.getElementById('ntf-list');
    if (!list) return;
    list.querySelectorAll('.ntf-item').forEach(function (item) {
        const show = ntfFilter === 'all' || item.dataset.cat === ntfFilter;
        item.style.display = show ? '' : 'none';
    });
}

/* ================= Camera & Gallery ================= */
function initializeGalleryPanel() {
    setupTabSwitching();
    renderGalleryStats();
    renderGalleryGrid();
    wireRefresh('gal-refresh', null);
    wireExport('gal-export', 'Media report');

    document.querySelectorAll('[data-gal-filter]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            document.querySelectorAll('[data-gal-filter]').forEach(function (b) { b.classList.remove('active'); });
            this.classList.add('active');
            applyGalleryFilter(this.dataset.galFilter);
        });
    });
}

function renderGalleryStats() {
    const grid = document.getElementById('gal-stats');
    if (!grid) return;
    grid.innerHTML = [
        kpiCardHTML({ label: 'Photos', value: '1,284', icon: 'fas fa-images', color: '#4299e1' }),
        kpiCardHTML({ label: 'Videos', value: '96', icon: 'fas fa-video', color: '#9f7aea' }),
        kpiCardHTML({ label: 'Albums', value: '14', icon: 'fas fa-folder', color: '#f6c453' }),
        kpiCardHTML({ label: 'Storage Used', value: '6.4 GB', icon: 'fas fa-hdd', color: '#38a169' })
    ].join('');
}

function renderGalleryGrid() {
    const grid = document.getElementById('gal-grid');
    if (!grid) return;
    const types = ['photo', 'video', 'screenshot'];
    const icons = { photo: 'fas fa-image', video: 'fas fa-video', screenshot: 'fas fa-mobile-alt' };
    const grads = [
        'linear-gradient(135deg,#1f2937,#374151)',
        'linear-gradient(135deg,#3b0764,#6d28d9)',
        'linear-gradient(135deg,#164e63,#0891b2)',
        'linear-gradient(135deg,#7f1d1d,#b91c1c)',
        'linear-gradient(135deg,#14532d,#15803d)',
        'linear-gradient(135deg,#78350f,#b45309)'
    ];
    let html = '<div class="gal-tile gal-cam" data-type="photo">' +
        '<div class="scanline"></div>' +
        '<span class="gi"><i class="fas fa-video"></i></span>' +
        '<span class="gal-label"><span class="live-dot"></span> Front Camera</span>' +
    '</div>';
    for (let i = 0; i < 15; i++) {
        const type = types[i % types.length];
        const g = grads[i % grads.length];
        html += '<div class="gal-tile" data-type="' + type + '" style="background:' + g + '">' +
            '<span class="gi"><i class="' + icons[type] + '"></i></span>' +
            '<span class="gal-label">' + type.charAt(0).toUpperCase() + type.slice(1) + ' \u00b7 ' +
            rnd(1, 9) + '.' + rnd(0, 9) + ' MB</span>' +
        '</div>';
    }
    grid.innerHTML = html;
}

function applyGalleryFilter(type) {
    const grid = document.getElementById('gal-grid');
    if (!grid) return;
    grid.querySelectorAll('.gal-tile').forEach(function (tile) {
        const show = type === 'all' || tile.dataset.type === type;
        tile.style.display = show ? '' : 'none';
    });
}
