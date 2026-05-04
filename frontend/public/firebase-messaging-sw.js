// Import Firebase scripts (required in service worker)
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js",
);

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDcAA6DHJTjXViSMt62q4ZJ5RvUU9gkiEs",
  authDomain: "yappynow-8384c.firebaseapp.com",
  projectId: "yappynow-8384c",
  storageBucket: "yappynow-8384c.firebasestorage.app",
  messagingSenderId: "1041335230862",
  appId: "1:1041335230862:web:fccf9e59b8377ea64e04df",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  const title = payload.data?.title || "New Message";
  const options = {
    body: payload.data?.body || "",
    icon: "/logo-256.png",
    badge: "/badge-72.png",
    tag: "chat-notification",
  };

  self.registration.showNotification(title, options);
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
