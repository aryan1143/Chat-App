import { useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";

export default function useTypingStatus(receiverId, senderId) {
  const socket = useAuthStore((state) => state.socket);

  const timeoutRef = useRef(null);
  const isTypingRef = useRef(false);
  const lastEmitRef = useRef(0);

  const delayOfTyping = 1200;
  const timeoutDelay = 1000;

  const handleTyping = () => {
    const now = Date.now();

    if (now - lastEmitRef.current > delayOfTyping) {
      if (!isTypingRef.current) {
        socket.emit("typing", { from: senderId, to: receiverId });
      }

      isTypingRef.current = true;
      lastEmitRef.current = now;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (isTypingRef.current) {
        if (isTypingRef.current) {
          socket.emit("stopTyping", { from: senderId, to: receiverId });
          isTypingRef.current = false;
        }
      }
    }, timeoutDelay);
  };

  return handleTyping;
}
