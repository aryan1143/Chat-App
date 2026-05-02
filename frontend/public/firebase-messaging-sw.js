// Import Firebase scripts (required in service worker)
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js",
);

// Initialize Firebase
firebase.initializeApp({
  apiKey: "AIzaSyDcAA6DHJTjXViSMt62q4ZJ5RvUU9gkiEs",
  authDomain: "yappynow-8384c.firebaseapp.com",
  projectId: "yappynow-8384c",
  messagingSenderId: "1041335230862",
  appId: "1:1041335230862:web:fccf9e59b8377ea64e04df",
});

// Initialize messaging
const messaging = firebase.messaging();

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

    const url = "http://localhost:5173";

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
