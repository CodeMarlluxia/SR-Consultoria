"use client";

import { useCallback } from "react";

const NEON_COLORS = ["#f8b4c4", "#f0e6a8", "#b8e8c8", "#a8d8f0", "#d4b8f0"];

/**
 * Returns a `fire()` callback that bursts neon confetti from the center
 * and both sides. Dynamically imports canvas-confetti so it never touches
 * the server bundle.
 */
export function useConfetti() {
  const fire = useCallback(async () => {
    const confetti = (await import("canvas-confetti")).default;

    confetti({ particleCount: 120, spread: 75, origin: { y: 0.6 }, colors: NEON_COLORS });
    setTimeout(
      () => confetti({ particleCount: 60, angle: 60, spread: 55, origin: { x: 0 }, colors: NEON_COLORS }),
      150,
    );
    setTimeout(
      () => confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1 }, colors: NEON_COLORS }),
      300,
    );
  }, []);

  return fire;
}
