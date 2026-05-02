// Firebase configuration is injected at runtime
// The following variables should be set in window object before service worker initialization
if (typeof self !== "undefined" && !self.FIREBASE_API_KEY) {
  console.warn(
    "Firebase config not initialized. Please set window.firebaseConfig before using service worker.",
  );
}
