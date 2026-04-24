export function formatMessageTime(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((new Date(date) - now) / 1000);
  
  const rtf = new Intl.RelativeTimeFormat("en-US", { numeric: "auto" });

  const absDiff = Math.abs(diffInSeconds);

  if (absDiff < 60) return "Just now";
  if (absDiff < 3600) return rtf.format(Math.floor(diffInSeconds / 60), "minute");
  if (absDiff < 86400) return rtf.format(Math.floor(diffInSeconds / 3600), "hour");
  
  const daysDiff = Math.floor(diffInSeconds / 86400);
  if (daysDiff >= -1) return rtf.format(daysDiff, "day");

  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric"
  });
}
