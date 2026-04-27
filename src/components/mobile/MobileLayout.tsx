import { Outlet } from "react-router-dom";
import MobileHeader from "../mobile/MobileHeader";
import { MOBILE_BOTTOM_NAV_H } from "../mobile/MobileBottomNav";

/*
  ┌─────────────────────────────────────────────────────────────────┐
  │  APP SHELL — position:fixed + inset:0 + overflow:hidden         │
  │                                                                 │
  │  Why this works:                                                │
  │  • The shell is always exactly the viewport size (no larger).   │
  │  • Any wide desktop page inside (Market, Finance, Trade)        │
  │    overflows its OWN scroll container, not the document.        │
  │  • The document itself never gets horizontal scroll, which is   │
  │    what was breaking position:fixed on those pages.             │
  │  • MobileHeader (fixed, z-50) and MobileBottomNav (portal,      │
  │    z-9999) both live outside this overflow clip and remain      │
  │    pinned to the viewport correctly.                            │
  └─────────────────────────────────────────────────────────────────┘
*/
const MobileLayout = () => {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,              /* top:0 right:0 bottom:0 left:0  */
        display: "flex",
        flexDirection: "column",
        background: "#0a0a0f",
        color: "#fff",
        overflow: "hidden",    /* clips any page that overflows   */
      }}
    >
      <MobileHeader />

      {/* Scrollable content area — only this div scrolls, never the document */}
      <main
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          paddingTop: `48px`,                       /* MobileHeader height */
          paddingBottom: `${MOBILE_BOTTOM_NAV_H}px`, /* BottomNav height   */
          WebkitOverflowScrolling: "touch",          /* smooth iOS scroll  */
        }}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default MobileLayout;
