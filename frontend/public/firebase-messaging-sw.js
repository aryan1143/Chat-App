// Import Firebase scripts (required in service worker)
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js",
);

// Firebase config - set via self.firebaseConfig or use environment defaults
let messaging;

// Initialize Firebase with config passed from main thread or environment
const initializeFirebase = () => {
  const firebaseConfig = self.firebaseConfig || {
    apiKey: self.FIREBASE_API_KEY,
    authDomain: self.FIREBASE_AUTH_DOMAIN,
    projectId: self.FIREBASE_PROJECT_ID,
    messagingSenderId: self.FIREBASE_MESSAGING_SENDER_ID,
    appId: self.FIREBASE_APP_ID,
  };

  try {
    firebase.initializeApp(firebaseConfig);
    messaging = firebase.messaging();
  } catch (error) {
    console.error("Failed to initialize Firebase:", error);
  }
};

// Initialize on service worker start
initializeFirebase();

// Listen for config messages from main thread
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "FIREBASE_CONFIG") {
    self.firebaseConfig = event.data.config;
    if (!messaging) {
      initializeFirebase();
    }
  }
});

messaging.onBackgroundMessage((payload) => {
  console.log("Background payload received:", payload);

  const title = payload.data?.title || "New Message";
  const options = {
    body: payload.data?.body || "",
    icon: "/logo-256.png",
    badge: "/badge-72.png",
    tag: "chat-notification",
  };

  // IMPORTANT: You must return this promise
  self.registration.showNotification(title, options);

  self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    const url = self.FRONTEND_URL || "http://localhost:5173";

    event.waitUntil(
      clients
        .matchAll({ type: "window", includeUncontrolled: true })
        .then((clientList) => {
          for (const client of clientList) {
            if (client.url === self.location.origin && "focus" in client) {
              return client.focus();
            }
          }

          // Otherwise open new tab
          return clients.openWindow(url);
        }),
    );
  });
});
