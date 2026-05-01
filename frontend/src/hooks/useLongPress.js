import { useRef } from "react";

export default function useLongPress(callback, delay = 600) {
  const timeoutRef = useRef(null);

  const start = (e) => {
    timeoutRef.current = setTimeout(() => {
      callback(e);
    }, delay);
  };

  const stop = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  return {
    onPointerDown: start,
    onPointerUp: stop,
    onPointerLeave: stop,
  };
}
