import { useEffect, useRef } from 'react';

export function useAutoRefresh(
  callback: () => void,
  intervalMs: number,
  enabled: boolean = true
): void {
  const callbackRef = useRef(callback);

  // Keep the ref updated so stale closures don't accumulate
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;

    const id = setInterval(() => {
      callbackRef.current();
    }, intervalMs);

    return () => clearInterval(id);
  }, [intervalMs, enabled]);
}
