// main.js - Main JavaScript file for login and navigation

document.addEventListener('DOMContentLoaded', function() {
    // Login functionality
    const loginForm = document.getElementById('login-form');
    const quickAccessBtn = document.getElementById('quick-access');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const securityKey = document.getElementById('security-key').value;
            
            // Simple validation
            if (username && password && securityKey) {
                // Show loading effect
                const submitBtn = this.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';
                submitBtn.disabled = true;
                
                // Authentication delay
                setTimeout(() => {
                    // Redirect to dashboard
                    window.location.href = 'dashboard.html';
                }, 1500);
            } else {
                alert('Please fill in all fields.');
            }
        });
    }
    
    // Quick access button
    if (quickAccessBtn) {
        quickAccessBtn.addEventListener('click', function() {
            // Set default credentials
            document.getElementById('username').value = 'admin';
            document.getElementById('password').value = 'admin123';
            document.getElementById('security-key').value = 'SK-2023-4471';
            
            // Auto-submit form
            if (loginForm) {
                loginForm.dispatchEvent(new Event('submit'));
            }
        });
    }
    
    // Run the boot console animation on the login screen
    runBootSequence();
    
    // Set current year in footer
    const currentYear = new Date().getFullYear();
    const footer = document.querySelector('.footer');
    if (footer) {
        footer.innerHTML += `<p>© ${currentYear} Secure Operations Center · v2.4</p>`;
    }
});

// Typewriter boot sequence shown on the login screen
function runBootSequence() {
    const el = document.getElementById('boot-console');
    if (!el) return;
    
    const lines = [
        '> initialising secure channel ...',
        '> negotiating TLS 1.3 ... <span class="ok">OK</span>',
        '> loading threat signature DB ... 1,284,501 entries',
        '> mounting encrypted session ... AES-256-GCM',
        '> sensor grid: 6 nodes online',
        '> awaiting operator credentials'
    ];
    
    const lineEls = [];
    let line = 0;
    let char = 0;
    
    function tick() {
        if (line >= lines.length) return;
        
        if (char === 0) {
            const div = document.createElement('div');
            div.className = 'boot-line';
            el.appendChild(div);
            lineEls.push(div);
        }
        
        const raw = lines[line];
        // Grow by visible characters, keeping the trailing markup intact
        const plain = raw.replace(/<[^>]*>/g, '');
        const shown = raw.slice(0, charmapIndex(raw, Math.min(char, plain.length)));
        lineEls[line].innerHTML = shown;
        char++;
        
        if (char > plain.length) {
            lineEls[line].innerHTML = raw;
            line++;
            char = 0;
            setTimeout(tick, 320);
        } else {
            setTimeout(tick, 16);
        }
    }
    
    // Map a plain-text index back to an index in the raw (markup-aware) string
    function charmapIndex(raw, plainIndex) {
        let seen = 0;
        for (let i = 0; i < raw.length; i++) {
            if (raw[i] === '<') {
                const close = raw.indexOf('>', i);
                i = close;
                continue;
            }
            if (seen >= plainIndex) return i;
            seen++;
        }
        return raw.length;
    }
    
    tick();
}

// Utility functions
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    // Add styles if not already present
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 8px;
                background: rgba(30, 41, 59, 0.95);
                border: 1px solid rgba(255, 255, 255, 0.1);
                display: flex;
                align-items: center;
                gap: 10px;
                z-index: 9999;
                animation: slideIn 0.3s ease;
                max-width: 400px;
            }
            
            .notification-success {
                border-left: 4px solid #38a169;
            }
            
            .notification-info {
                border-left: 4px solid #4299e1;
            }
            
            .notification-warning {
                border-left: 4px solid #d69e2e;
            }
            
            .notification-error {
                border-left: 4px solid #e53e3e;
            }
            
            .notification-close {
                background: none;
                border: none;
                color: #a0aec0;
                font-size: 1.2rem;
                cursor: pointer;
                margin-left: auto;
            }
            
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
    
    // Close button
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
}

// Add slideOut animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(styleSheet);