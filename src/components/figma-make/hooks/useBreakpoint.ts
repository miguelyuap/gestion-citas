import { useState, useEffect } from "react";

export type Breakpoint = "mobile" | "tablet" | "desktop";

function getBreakpoint(w: number): Breakpoint {
  if (w < 640) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

export function useBreakpoint(): Breakpoint {
  const [bp, setBp] = useState<Breakpoint>(() =>
    typeof window !== "undefined" ? getBreakpoint(window.innerWidth) : "desktop"
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = () => setBp(getBreakpoint(window.innerWidth));
    setBp(getBreakpoint(window.innerWidth));
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return bp;
}

export function useIsMobile() {
  return useBreakpoint() === "mobile";
}
