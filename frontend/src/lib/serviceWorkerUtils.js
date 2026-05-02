/**
 * Initialize service worker with Firebase configuration
 */
export const initServiceWorkerConfig = async () => {
  if ("serviceWorker" in navigator) {
    try {
      // Get Firebase config from environment
      const firebaseConfig = {
        apiKey: import.meta.env.VITE_API_KEY,
        authDomain: import.meta.env.VITE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_PROJECT_ID,
        messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_APP_ID,
      };

      // Wait for service worker to be ready
      const registration = await navigator.serviceWorker.ready;

      // Send Firebase config to service worker
      if (registration.active) {
        registration.active.postMessage({
          type: "FIREBASE_CONFIG",
          config: firebaseConfig,
        });
      }

      console.log("✅ Service worker initialized with Firebase config");
    } catch (error) {
      console.error("❌ Failed to initialize service worker config:", error);
    }
  }
};
