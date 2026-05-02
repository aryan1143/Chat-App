// Import Firebase scripts (required in service worker)
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js",
);

let messaging = null;
let isInitialized = false;

// Initialize Firebase with config passed from main thread
const initializeFirebase = (config) => {
  if (isInitialized || !config || !config.projectId) {
    return;
  }

  try {
    firebase.initializeApp(config);
    messaging = firebase.messaging();
    isInitialized = true;
    console.log("✅ Firebase initialized in service worker");

    // Set up background message handler
    setupBackgroundMessageHandler();
  } catch (error) {
    console.error("❌ Failed to initialize Firebase:", error);
    messaging = null;
  }
};

// Setup background message handler
const setupBackgroundMessageHandler = () => {
  if (!messaging) return;

  messaging.onBackgroundMessage((payload) => {
    console.log("📨 Background message received:", payload);

    const title = payload.data?.title || "New Message";
    const options = {
      body: payload.data?.body || "",
      icon: "/logo-256.png",
      badge: "/badge-72.png",
      tag: "chat-notification",
    };

    self.registration.showNotification(title, options);
  });
};

// Listen for config messages from main thread
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "FIREBASE_CONFIG") {
    console.log("📩 Received Firebase config in service worker");
    initializeFirebase(event.data.config);
  }
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === self.location.origin && "focus" in client) {
            return client.focus();
          }
        }
        return clients.openWindow("/");
      }),
  );
});
