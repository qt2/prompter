import { useCallback, useEffect, useRef } from "react";

export function displayTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = String(Math.floor(seconds) % 60).padStart(2, "0");
  return `${m}:${s}`;
}

export function clamp(x: number, a: number, b: number): number {
  return Math.min(Math.max(x, a), b);
}

export function useAnimationFrame(
  callback = () => {},
  isRunning: boolean = true
) {
  const reqIdRef = useRef<number>();
  const loop = useCallback(() => {
    if (isRunning) {
      // isRunning が true の時だけループ
      reqIdRef.current = requestAnimationFrame(loop);
      callback();
    }
    // isRunning も依存配列に追加
  }, [isRunning, callback]);

  useEffect(() => {
    reqIdRef.current = requestAnimationFrame(loop);
    return () => {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
    };
  }, [loop]);
}
