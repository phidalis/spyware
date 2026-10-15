// pwa.js - Service worker registration + install notification banner.
//
// The install notification only fires when it is actually relevant:
//   * Chrome/Edge fire "beforeinstallprompt" once the app is installable
//     and not yet installed -> we surface a notification banner.
//   * iOS Safari never fires that event, so we surface a manual banner.
// On file:// (or unsupported browsers) nothing is shown, because there is
// no installable app to offer.
(function () {
  'use strict';

  var DISMISS_KEY = 'pwaInstallDismissed';
  var standalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;
  var deferredPrompt = null;
  var banner = null;
  var bannerTimer = null;

  /* ---------------- Service worker ---------------- */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js', { scope: './' }).catch(function () {
        /* best-effort */
      });
    });
  }

  function isDismissed() {
    try { return localStorage.getItem(DISMISS_KEY) === '1'; } catch (e) { return false; }
  }
  function setDismissed() {
    try { localStorage.setItem(DISMISS_KEY, '1'); } catch (e) { /* ignore */ }
  }

  function ensureStyles() {
    if (document.getElementById('pwa-banner-styles')) return;
    var s = document.createElement('style');
    s.id = 'pwa-banner-styles';
    s.textContent =
      '.pwa-banner{position:fixed;left:50%;top:14px;z-index:6000;' +
      'width:calc(100% - 24px);max-width:460px;display:flex;align-items:center;gap:12px;' +
      'padding:12px 14px;border-radius:14px;background:rgba(26,32,44,.98);' +
      'border:1px solid rgba(66,153,225,.45);box-shadow:0 16px 40px rgba(0,0,0,.5);' +
      'color:#e2e8f0;font-family:inherit;transform:translate(-50%,-150%);opacity:0;' +
      'transition:transform .35s ease,opacity .35s ease}' +
      '.pwa-banner.show{transform:translate(-50%,0);opacity:1}' +
      '.pwa-b-icon{width:38px;height:38px;border-radius:11px;flex:none;display:flex;' +
      'align-items:center;justify-content:center;background:rgba(66,153,225,.18);' +
      'color:#63b3ed;font-size:1.1rem}' +
      '.pwa-b-text{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1}' +
      '.pwa-b-text strong{font-size:.9rem;color:#fff}' +
      '.pwa-b-text span{font-size:.76rem;color:#a0aec0;line-height:1.35}' +
      '.pwa-b-install{flex:none;padding:8px 15px;border-radius:9px;border:none;cursor:pointer;' +
      'background:#4299e1;color:#fff;font-weight:600;font-size:.82rem;font-family:inherit}' +
      '.pwa-b-install:hover{background:#3182ce}' +
      '.pwa-b-close{flex:none;background:none;border:none;color:#718096;font-size:1.25rem;' +
      'line-height:1;cursor:pointer;padding:2px 5px}' +
      '.pwa-b-close:hover{color:#fff}' +
      '@media(max-width:520px){.pwa-banner{padding:11px 12px;gap:10px}.pwa-b-text span{display:none}}';
    document.head.appendChild(s);
  }

  function buildBanner(opts) {
    if (banner) return banner;
    ensureStyles();

    banner = document.createElement('div');
    banner.className = 'pwa-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-live', 'polite');

    var icon = document.createElement('div');
    icon.className = 'pwa-b-icon';
    icon.innerHTML = '<i class="fas fa-shield-alt" aria-hidden="true"></i>';

    var text = document.createElement('div');
    text.className = 'pwa-b-text';
    var strong = document.createElement('strong');
    strong.textContent = 'Install Secure Operations Center';
    var span = document.createElement('span');
    span.textContent = opts.message;
    text.appendChild(strong);
    text.appendChild(span);

    var install = document.createElement('button');
    install.className = 'pwa-b-install';
    install.type = 'button';
    install.textContent = 'Install';
    install.addEventListener('click', onInstallClick);

    var close = document.createElement('button');
    close.className = 'pwa-b-close';
    close.type = 'button';
    close.setAttribute('aria-label', 'Dismiss');
    close.innerHTML = '&times;';
    close.addEventListener('click', function () {
      setDismissed();
      hideBanner();
    });

    banner.appendChild(icon);
    banner.appendChild(text);
    banner.appendChild(install);
    banner.appendChild(close);
    document.body.appendChild(banner);
    return banner;
  }

  function showBanner(opts) {
    if (standalone || isDismissed()) return;
    if (!document.body) {
      document.addEventListener('DOMContentLoaded', function () { showBanner(opts); });
      return;
    }
    var b = buildBanner(opts);
    if (bannerTimer) clearTimeout(bannerTimer);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { b.classList.add('show'); });
    });
  }

  function hideBanner() {
    if (!banner) return;
    banner.classList.remove('show');
    var el = banner;
    banner = null;
    setTimeout(function () {
      if (el && el.parentNode) el.parentNode.removeChild(el);
    }, 400);
  }

  function onInstallClick() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      var choice = deferredPrompt.userChoice;
      deferredPrompt = null;
      if (choice && choice.then) {
        choice.then(function () { hideBanner(); }, function () { hideBanner(); });
      } else {
        hideBanner();
      }
    } else {
      hideBanner();
    }
  }

  /* ---------------- Installability signals ---------------- */

  // Chrome / Edge (and other Chromium browsers).
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
    showBanner({ message: 'Add the console to your device for full-screen, offline access.' });
  });

  window.addEventListener('appinstalled', function () {
    deferredPrompt = null;
    setDismissed();
    hideBanner();
  });

  // iOS Safari has no install event, but "Add to Home Screen" exists.
  var ua = navigator.userAgent;
  var isIOS = /iphone|ipad|ipod/i.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var isSafari = /^((?!chrome|android|crios|fxios).)*safari/i.test(ua);
  if (isIOS && isSafari && !standalone) {
    window.addEventListener('load', function () {
      setTimeout(function () {
        showBanner({ message: 'Tap Share, then "Add to Home Screen" to install.' });
      }, 1500);
    });
  }
})();
