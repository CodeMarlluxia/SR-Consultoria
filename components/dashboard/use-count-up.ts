"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Animates a number from 0 → `value` with an ease-out cubic curve.
 * Re-animates whenever `value` changes (e.g. after a date-range filter).
 */
export function useCountUp(value: number, durationMs = 1200): number {
  const [display, setDisplay] = useState(0);
  const frameRef = useRef<number>();
  const fromRef = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    const start = performance.now();

    function tick(now: number) {
      const t = Math.min((now - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = from + (value - from) * eased;
      setDisplay(current);
      if (t < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = value;
      }
    }

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [value, durationMs]);

  return display;
}
