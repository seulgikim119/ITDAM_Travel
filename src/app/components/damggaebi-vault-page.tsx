import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  ChevronRight,
  Star,
  Settings,
  HelpCircle,
  LogIn,
  LogOut,
} from "lucide-react";
import { StatusBar } from "./phone-frame";
import { Itgaebi } from "./itgaebi";
import { getAuthState, logout, subscribeAuth, type AuthState } from "../auth-store";

export function MyPage() {
  const navigate = useNavigate();
  const [auth, setAuth] = useState<AuthState>(() => getAuthState());

  useEffect(() => subscribeAuth(() => setAuth(getAuthState())), []);

  const menuItems = useMemo(
    () => [
      {
        icon: Star,
        label: "\uCDE8\uD5A5 \uB8E8\uD2B8 \uCD94\uCC9C \uBC1B\uAE30",
        action: () => navigate("/recommendation"),
      },
      { icon: Settings, label: "\uC124\uC815", action: () => {} },
      { icon: HelpCircle, label: "\uACE0\uAC1D\uC13C\uD130", action: () => {} },
    ],
    [navigate]
  );

  const stats = auth.isLoggedIn
    ? [
        { num: "3", label: "\uC644\uB8CC\uD55C \uC5EC\uD589 \uAE30\uB85D", color: "#F0C070" },
        { num: "1", label: "\uC644\uB8CC\uD55C \uB8E8\uD2B8", color: "#E8A830" },
        { num: "4", label: "\uC800\uC7A5\uD55C \uC7A5\uC18C", color: "#F0C070" },
      ]
    : [
        { num: "-", label: "\uC5EC\uD589 \uAE30\uB85D", color: "#C7C7CC" },
        { num: "-", label: "\uB8E8\uD2B8", color: "#C7C7CC" },
        { num: "-", label: "\uC7A5\uC18C", color: "#C7C7CC" },
      ];

  return (
    <div className="min-h-full bg-[#FFF8E7]">
      <div className="bg-white pb-5 rounded-b-[24px] shadow-sm">
        <StatusBar />
        <div className="px-6 pt-2 pb-2">
          <h1 className="text-[#2C2C2A]" style={{ fontSize: 22, fontWeight: 700 }}>
            {"\uB2F4\uAE68\uBE44\uD568"}
          </h1>
        </div>

        <div className="px-5">
          <div className="bg-[#FFF8E7] rounded-2xl p-4">
            {auth.isLoggedIn && auth.user ? (
              <div className="flex items-center gap-4">
                <Itgaebi size={84} />
                <div className="flex-1">
                  <p className="text-[#2C2C2A]" style={{ fontSize: 18, fontWeight: 700 }}>
                    {auth.user.name}
                  </p>
                  <p className="text-[#8E8E93]" style={{ fontSize: 13 }}>
                    {auth.user.email}
                  </p>
                </div>
                <button
                  onClick={() => logout()}
                  className="h-9 px-3 rounded-xl border border-[#E6DAC2] text-[#7A6B54] flex items-center gap-1.5"
                  style={{ fontSize: 12, fontWeight: 700 }}
                >
                  <LogOut size={14} />
                  {"\uB85C\uADF8\uC544\uC6C3"}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Itgaebi size={84} message={"\uBE44\uB85C\uADF8\uC778 \uB458\uB7EC\uBCF4\uAE30 \uC911"} />
                <div className="flex-1">
                  <p className="text-[#2C2C2A]" style={{ fontSize: 17, fontWeight: 700 }}>
                    {"\uC9C0\uAE08\uC740 \uBE44\uB85C\uADF8\uC778 \uC0C1\uD0DC\uC608\uC694"}
                  </p>
                  <p className="text-[#8E8E93] mt-1" style={{ fontSize: 13 }}>
                    {"\uB85C\uADF8\uC778\uD558\uBA74 \uCDE8\uD5A5, \uAE30\uB85D, \uB8E8\uD2B8\uB97C \uB0B4 \uACC4\uC815\uC5D0 \uC800\uC7A5\uD560 \uC218 \uC788\uC5B4\uC694."}
                  </p>
                </div>
                <button
                  onClick={() => navigate("/login", { state: { from: "/app/my" } })}
                  className="h-9 px-3 rounded-xl text-[#2C2C2A] flex items-center gap-1.5"
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    background: "linear-gradient(135deg, #F0C070, #E8A830)",
                  }}
                >
                  <LogIn size={14} />
                  {"\uB85C\uADF8\uC778"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-5 mt-4">
        <div className="grid grid-cols-3 gap-2">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-4 text-center shadow-sm">
              <p style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.num}</p>
              <p className="text-[#8E8E93] mt-0.5" style={{ fontSize: 11 }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 mt-4">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {menuItems.map((item, i) => (
            <button
              key={item.label}
              onClick={item.action}
              className={`w-full flex items-center gap-3 px-4 py-4 ${
                i < menuItems.length - 1 ? "border-b border-[#FFF8E7]" : ""
              }`}
            >
              <item.icon size={20} className="text-[#F0C070]" />
              <span className="flex-1 text-left text-[#2C2C2A]" style={{ fontSize: 15, fontWeight: 500 }}>
                {item.label}
              </span>
              <ChevronRight size={18} className="text-[#C7C7CC]" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
