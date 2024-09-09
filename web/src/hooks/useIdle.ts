import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { idleListenersState, idleState, idleTimeoutIdState } from '../recoil/atoms/idle';

const TIMEOUT = 1000 * 60 * 5; // 5 minutes

const useIdle = (onIdle: () => void) => {
  const [isIdle, setIsIdle] = useRecoilState(idleState);
  const [timeoutId, setTimeoutId] = useRecoilState(idleTimeoutIdState);
  const [areIdleListenersSet, setAreIdleListenersSet] = useRecoilState(idleListenersState);

  const resetIdleTimer = () => {
    setIsIdle(false);

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const newTimeoutId = setTimeout(() => {
      setIsIdle(true);
      onIdle();
    }, TIMEOUT);

    setTimeoutId(newTimeoutId);
  };

  useEffect(() => {
    if (areIdleListenersSet) return;

    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart'];

    events.forEach((event) => window.addEventListener(event, resetIdleTimer));
    setAreIdleListenersSet(true);

    resetIdleTimer();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach((event) => window.removeEventListener(event, resetIdleTimer));
    };
  }, [onIdle, setTimeoutId, setIsIdle]);

  return isIdle;
};

export default useIdle;
