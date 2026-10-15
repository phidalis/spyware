// pwa.js - Registers the service worker so the console works offline / installable.
(function () {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', function () {
    navigator.serviceWorker
      .register('sw.js', { scope: './' })
      .catch(function () {
        /* registration is best-effort */
      });
  });
})();
