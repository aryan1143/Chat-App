/**
 * Register service worker for Firebase notifications
 */
export const initServiceWorkerConfig = async () => {
  if ("serviceWorker" in navigator) {
    try {
      await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    } catch (error) {
      console.error("⚠️ Service worker registration failed:", error);
    }
  }
};
