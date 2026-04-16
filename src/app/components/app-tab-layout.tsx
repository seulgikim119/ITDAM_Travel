import { Outlet, useNavigate, useLocation } from "react-router";
import { Home, Bookmark, BookOpen, User } from "lucide-react";

const tabs = [
  { path: "/app", icon: Home, label: "\uC787\uAE68\uBE44\uAE38" },
  { path: "/app/saved", icon: Bookmark, label: "\uC787\uAE68\uBE44\uD53D" },
  { path: "/app/record", icon: BookOpen, label: "\uB2F4\uAE68\uBE44\uB545" },
  { path: "/app/my", icon: User, label: "\uB2F4\uAE68\uBE44\uD568" },
];

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="h-full flex flex-col bg-[#FFF8E7]">
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
      <div className="bg-white/95 backdrop-blur-md border-t border-[#F0E6D0] px-2 pb-[28px] pt-2">
        <div className="flex justify-around">
          {tabs.map((tab) => {
            const active = location.pathname === tab.path;
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 transition-colors ${
                  active ? "text-[#E8A830]" : "text-[#8B95A1]"
                }`}
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
