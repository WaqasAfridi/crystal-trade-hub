import * as React from "react";

const MOBILE_BREAKPOINT = 768;

function detectMobile(): boolean {
  // Primary: userAgentData.mobile — triggers when Chrome DevTools device toolbar is ON
  // regardless of viewport width. This is the exact Enivex behaviour.
  if (typeof navigator !== "undefined" && (navigator as any).userAgentData) {
    return (navigator as any).userAgentData.mobile === true;
  }
  // Fallback: UA string for real devices on browsers without userAgentData
  if (typeof navigator !== "undefined") {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      return true;
    }
  }
  // Last resort: viewport width
  if (typeof window !== "undefined") {
    return window.innerWidth < MOBILE_BREAKPOINT;
  }
  return false;
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(() => detectMobile());

  React.useEffect(() => {
    // Re-check on resize (handles viewport changes and DevTools toggling)
    const onResize = () => {
      const nowMobile = detectMobile();
      setIsMobile(nowMobile);
    };

    window.addEventListener("resize", onResize);

    // Also re-detect when the tab becomes visible (DevTools open/close)
    const onVisible = () => {
      setIsMobile(detectMobile());
    };
    document.addEventListener("visibilitychange", onVisible);

    // Initial sync
    onResize();

    return () => {
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return isMobile;
}
