//function to formate the time for the message timeing on the chat
export function formatMessageTime(date) {
  if (!date) return;
  const now = new Date();
  const diffInSeconds = Math.floor((new Date(date) - now) / 1000);

  const rtf = new Intl.RelativeTimeFormat("en-US", { numeric: "auto" });

  const absDiff = Math.abs(diffInSeconds);

  if (absDiff < 60) return "Just now";
  if (absDiff < 3600)
    return rtf.format(Math.floor(diffInSeconds / 60), "minute");
  if (absDiff < 86400)
    return rtf.format(Math.floor(diffInSeconds / 3600), "hour");

  const daysDiff = Math.floor(diffInSeconds / 86400);
  if (daysDiff >= -1) return rtf.format(daysDiff, "day");

  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function formatMessageTimeForBubble(date) {
  if (!date) return;
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

//function for debouncing for api calls
export function debounce(func, delay) {
  let timeoutId;

  return function (...args) {
    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

//function for trottle api calls
export function throttle(func, delay) {
  let lastCall = 0;

  return function (...args) {
    const now = Date.now();

    if (now - lastCall >= delay) {
      lastCall = now;
      func.apply(this, args);
    }
  };
}
