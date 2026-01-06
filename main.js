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
            
            // Simple validation for simulation
            if (username && password && securityKey) {
                // Show loading effect
                const submitBtn = this.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';
                submitBtn.disabled = true;
                
                // Simulate authentication process
                setTimeout(() => {
                    // Redirect to dashboard
                    window.location.href = 'dashboard.html';
                }, 1500);
            } else {
                alert('Please fill in all fields. For demo, use any values.');
            }
        });
    }
    
    // Quick access button
    if (quickAccessBtn) {
        quickAccessBtn.addEventListener('click', function() {
            // Set demo credentials
            document.getElementById('username').value = 'admin';
            document.getElementById('password').value = 'admin123';
            document.getElementById('security-key').value = 'demo-key-2023';
            
            // Auto-submit form
            if (loginForm) {
                loginForm.dispatchEvent(new Event('submit'));
            }
        });
    }
    
    // Set current year in footer
    const currentYear = new Date().getFullYear();
    const footer = document.querySelector('.footer');
    if (footer) {
        footer.innerHTML += `<p>© ${currentYear} Cybersecurity Education Simulation</p>`;
    }
});

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