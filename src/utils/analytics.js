/**
 * Google Analytics 4 integration.
 * Only active when VITE_GA_MEASUREMENT_ID is set.
 */

const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || '';

export function initGA() {
  if (!MEASUREMENT_ID) return;

  // Load GA4 script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  gtag('js', new Date());
  gtag('config', MEASUREMENT_ID, {
    send_page_view: false, // We handle page views manually via HashRouter
  });
  window.gtag = gtag;
}

export function trackPageView(path) {
  if (!window.gtag || !MEASUREMENT_ID) return;
  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: document.title,
  });
}

export function trackEvent(eventName, params = {}) {
  if (!window.gtag || !MEASUREMENT_ID) return;
  window.gtag('event', eventName, params);
}

// Predefined event helpers
export const track = {
  conversion: (count) => trackEvent('conversion', { count }),
  download: (type) => trackEvent('download', { type }),
  upgrade_click: (tier) => trackEvent('upgrade_click', { tier }),
  auth_action: (action) => trackEvent('auth_action', { action }),
  feature_locked: (feature) => trackEvent('feature_locked', { feature }),
};
