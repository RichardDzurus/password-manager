import { useEffect, useState, useRef } from 'react';

const useIdle = (timeout: number, onIdle: () => void) => {
  const [isIdle, setIsIdle] = useState(false);
  const timeoutId = useRef<NodeJS.Timeout | null>(null);

  const resetIdleTimer = () => {
    setIsIdle(false);

    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }

    timeoutId.current = setTimeout(() => {
      setIsIdle(true);
      onIdle();
    }, timeout);
  };

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart'];

    events.forEach((event) => window.addEventListener(event, resetIdleTimer));

    resetIdleTimer();

    return () => {
      if (timeoutId.current) clearTimeout(timeoutId.current);
      events.forEach((event) => window.removeEventListener(event, resetIdleTimer));
    };
  }, [timeout, onIdle]);

  return isIdle;
};

export default useIdle;
