import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { Home, Bookmark, BookOpen, User } from "lucide-react";
import { getAuthState, subscribeAuth } from "../auth-store";

const RESTRICTED_TAB_PATHS = new Set(["/app/saved", "/app/record"]);
const BLOCK_OVERLAY_DURATION_MS = 1500;

const tabs = [
  { path: "/app", icon: Home, label: "잇깨비길" },
  { path: "/app/saved", icon: Bookmark, label: "잇깨비픽" },
  { path: "/app/record", icon: BookOpen, label: "담깨비땅" },
  { path: "/app/my", icon: User, label: "담깨비함" },
];

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(() => getAuthState().isLoggedIn);
  const [showBlockedOverlay, setShowBlockedOverlay] = useState(false);

  useEffect(() => subscribeAuth(() => setIsLoggedIn(getAuthState().isLoggedIn)), []);

  useEffect(() => {
    if (!showBlockedOverlay) return;
    const timer = window.setTimeout(() => setShowBlockedOverlay(false), BLOCK_OVERLAY_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [showBlockedOverlay]);

  useEffect(() => {
    if (isLoggedIn) return;
    if (!RESTRICTED_TAB_PATHS.has(location.pathname)) return;
    navigate("/app", { replace: true });
    setShowBlockedOverlay(true);
  }, [isLoggedIn, location.pathname, navigate]);

  const handleTabClick = (path: string) => {
    const blockedForGuest = !isLoggedIn && RESTRICTED_TAB_PATHS.has(path);
    if (blockedForGuest) {
      setShowBlockedOverlay(true);
      return;
    }
    navigate(path);
  };

  return (
    <div className="h-full flex flex-col bg-[#FFF8E7]">
      <div className="relative flex-1 overflow-y-auto">
        <Outlet />
        {showBlockedOverlay && (
          <div className="absolute inset-0 z-30 bg-black/20 backdrop-blur-[2px] flex items-center justify-center">
            <p
              className="px-4 py-2 rounded-xl bg-black/70 text-white text-center"
              style={{ fontSize: 14, fontWeight: 700 }}
            >
              로그인 후 사용 가능해요
            </p>
          </div>
        )}
      </div>

      <div className="bg-white/95 backdrop-blur-md border-t border-[#F0E6D0] px-2 pb-[28px] pt-2">
        <div className="flex justify-around">
          {tabs.map((tab) => {
            const active = location.pathname === tab.path;
            const disabledForGuest = !isLoggedIn && RESTRICTED_TAB_PATHS.has(tab.path);

            return (
              <button
                key={tab.path}
                onClick={() => handleTabClick(tab.path)}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 transition-colors ${
                  active ? "text-[#E8A830]" : "text-[#8B95A1]"
                } ${disabledForGuest ? "opacity-60" : ""}`}
                aria-disabled={disabledForGuest}
              >
                <tab.icon size={22} strokeWidth={active ? 2.2 : 1.7} />
                <span style={{ fontSize: 10, fontWeight: active ? 700 : 500 }}>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
