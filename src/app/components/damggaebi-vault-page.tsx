import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  CalendarClock,
  ChevronRight,
  Coins,
  Download,
  Gem,
  HelpCircle,
  ImageUp,
  LogIn,
  LogOut,
  Settings,
  Star,
  TicketPercent,
} from "lucide-react";
import { StatusBar } from "./phone-frame";
import { Itgaebi } from "./itgaebi";
import { getAuthState, logout, subscribeAuth, type AuthState } from "../auth-store";

type TreasureType = "coupon" | "point" | "item";

type TreasureAsset = {
  id: string;
  type: TreasureType;
  title: string;
  desc: string;
  valueWon: number;
  expiresAt?: string;
  usable?: boolean;
};

const TREASURE_ASSETS: TreasureAsset[] = [
  {
    id: "coupon-1",
    type: "coupon",
    title: "카페 쉬유 1+1 쿠폰",
    desc: "아메리카노 1잔 추가 제공",
    valueWon: 4800,
    expiresAt: "2026-04-19",
    usable: true,
  },
  {
    id: "coupon-2",
    type: "coupon",
    title: "로컬 밥집 20% 할인",
    desc: "최대 6,000원 할인",
    valueWon: 6000,
    expiresAt: "2026-04-28",
    usable: true,
  },
  {
    id: "point-1",
    type: "point",
    title: "채굴 포인트 적립",
    desc: "누적 3,200P",
    valueWon: 3200,
  },
  {
    id: "item-1",
    type: "item",
    title: "전주 한옥 뱃지",
    desc: "지역 한정 수집 아이템",
    valueWon: 2500,
  },
  {
    id: "item-2",
    type: "item",
    title: "서울 정복 스탬프",
    desc: "서울 지역 정복 리워드",
    valueWon: 1800,
  },
];

function diffDaysFromToday(isoDate: string) {
  const now = new Date();
  const target = new Date(isoDate);
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const end = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
}

function formatWon(value: number) {
  return `${value.toLocaleString()}원`;
}

function typeBadge(type: TreasureType) {
  if (type === "coupon") return { label: "쿠폰", bg: "#E8F8EC", text: "#1FA84A", icon: TicketPercent };
  if (type === "point") return { label: "포인트", bg: "#EAF2FF", text: "#326CB3", icon: Coins };
  return { label: "수집템", bg: "#F3ECFF", text: "#7A50A8", icon: Gem };
}

export function MyPage() {
  const navigate = useNavigate();
  const [auth, setAuth] = useState<AuthState>(() => getAuthState());
  const [assetProofCount, setAssetProofCount] = useState(0);
  const [isAssetExportOpen, setIsAssetExportOpen] = useState(false);
  const [isTreasureDetailOpen, setIsTreasureDetailOpen] = useState(false);
  const [openAssetSections, setOpenAssetSections] = useState<Record<TreasureType, boolean>>({
    coupon: false,
    point: false,
    item: false,
  });

  useEffect(() => subscribeAuth(() => setAuth(getAuthState())), []);

  const menuItems = useMemo(
    () => [
      {
        icon: Star,
        label: "취향 루트 추천 받기",
        action: () =>
          auth.isLoggedIn ? navigate("/recommendation") : navigate("/login", { state: { from: "/app/my" } }),
      },
      {
        icon: Settings,
        label: "설정",
        action: () =>
          auth.isLoggedIn ? undefined : navigate("/login", { state: { from: "/app/my" } }),
      },
      {
        icon: HelpCircle,
        label: "고객센터",
        action: () =>
          auth.isLoggedIn ? undefined : navigate("/login", { state: { from: "/app/my" } }),
      },
    ],
    [auth.isLoggedIn, navigate]
  );

  const stats = auth.isLoggedIn
    ? [
      { num: "3", label: "완료한 기록", color: "#000" },
      { num: "1", label: "완료한 루트", color: "#000" },
      { num: "4", label: "저장한 장소", color: "#000" },
    ]
    : [
      { num: "-", label: "여행 기록", color: "#000" },
      { num: "-", label: "루트", color: "#000" },
      { num: "-", label: "장소", color: "#000" },
    ];

  const treasureAssets = useMemo(() => (auth.isLoggedIn ? TREASURE_ASSETS : []), [auth.isLoggedIn]);

  const couponAssets = useMemo(
    () => treasureAssets.filter((asset) => asset.type === "coupon" && asset.usable),
    [treasureAssets]
  );

  const pointAssets = useMemo(
    () => treasureAssets.filter((asset) => asset.type === "point"),
    [treasureAssets]
  );

  const itemAssets = useMemo(
    () => treasureAssets.filter((asset) => asset.type === "item"),
    [treasureAssets]
  );

  const expiringCoupons = useMemo(
    () =>
      couponAssets
        .map((asset) => ({
          ...asset,
          dDay: asset.expiresAt ? diffDaysFromToday(asset.expiresAt) : 999,
        }))
        .filter((asset) => asset.dDay >= 0 && asset.dDay <= 7)
        .sort((a, b) => a.dDay - b.dDay),
    [couponAssets]
  );

  const totalEconomicBenefit = useMemo(
    () => treasureAssets.reduce((sum, asset) => sum + asset.valueWon, 0),
    [treasureAssets]
  );

  const seoulConquestRate = 15;
  const storyCaption = `나는 서울의 ${seoulConquestRate}%를 정복했어!`;

  return (
    <div className="min-h-full bg-[#F3FBF5]">
      <div className="bg-[#2C2C2A] rounded-b-[30px] pb-5 shadow-[0_6px_20px_rgba(0,0,0,0.25)]">
        <StatusBar light />
        <div className="px-5 pt-1">
          <h1 className="text-white" style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.2 }}>
            담깨비 <span className="text-[#34C759]">VAULT</span>
          </h1>
          <p className="mt-1 text-[#A6F1B7]" style={{ fontSize: 14, fontWeight: 600 }}>
            내 자산과 기록을 한눈에 보는 페이지
          </p>
        </div>

        <div className="px-5 mt-4">
          <div className="bg-[#F1FAF3] rounded-2xl p-4">
            {auth.isLoggedIn && auth.user ? (
              <div className="flex items-center gap-4">
                <Itgaebi size={84} />
                <div className="flex-1">
                  <p className="text-[#2C2C2A]" style={{ fontSize: 18, fontWeight: 700 }}>
                    {auth.user.name}
                  </p>
                  <p className="text-[#8E8E93]" style={{ fontSize: 14 }}>
                    {auth.user.email}
                  </p>
                </div>
                <button
                  onClick={() => logout()}
                  className="h-9 px-3 rounded-xl border border-[#D6EEDC] text-[#3F6E4D] flex items-center gap-1.5"
                  style={{ fontSize: 14, fontWeight: 400 }}
                >
                  <LogOut size={8} />
                  로그아웃
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <p className="text-[#8E8E93]" style={{ fontSize: 14 }}>
                    로그인하면 취향, 기록, 루트를 내 계정에 저장할 수 있어요.
                  </p>
                </div>
                <button
                  onClick={() => navigate("/login", { state: { from: "/app/my" } })}
                  className="h-9 px-3 rounded-xl text-[#2C2C2A] flex items-center gap-1.5"
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    background: "linear-gradient(135deg, #57D476, #34C759)",
                  }}
                >
                  <LogIn size={10} />
                  로그인
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
              <p style={{ fontSize: 18, fontWeight: 500, color: auth.isLoggedIn ? s.color : "#C7C7CC" }}>{s.num}</p>
              <p className="text-[#8E8E93] mt-0.5" style={{ fontSize: 14 }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 mt-4">
        <section className="bg-white rounded-2xl p-4 shadow-sm border border-[#E6F3EA]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#5C8B67]" style={{ fontSize: 14, fontWeight: 800 }}>
                조각 창고
              </p>
              <h2 className="text-[#1E2B22] mt-0.5" style={{ fontSize: 20, fontWeight: 800 }}>
                담아온 보물들
              </h2>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#E8F8EC] text-[#1FA84A] inline-flex items-center justify-center">
              <Gem size={16} />
            </div>
          </div>

          {auth.isLoggedIn ? (
            <>
              <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="rounded-xl p-3 bg-[#F7FBF8]">
                  <p style={{ fontSize: 13, color: "#6B7785" }}>사용 가능 쿠폰</p>
                  <p style={{ fontSize: 16, fontWeight: 700, color: "#1E2B22" }} className="mt-0.5">
                    {couponAssets.length}장
                  </p>
                </div>
                <div className="rounded-xl p-3 bg-[#F7FBF8]">
                  <p style={{ fontSize: 14, color: "#6B7785" }}>만료 임박</p>
                  <p style={{ fontSize: 16, fontWeight: 700, color: "#1E2B22" }} className="mt-0.5">
                    {expiringCoupons.length}건
                  </p>
                </div>
                <div className="rounded-xl p-3 bg-[#F7FBF8]">
                  <p style={{ fontSize: 14, color: "#6B7785" }}>총 경제 이득</p>
                  <p style={{ fontSize: 16, fontWeight: 700, color: "#1FA84A" }} className="mt-0.5">
                    {formatWon(totalEconomicBenefit)}
                  </p>
                </div>
              </div>

              <div className="mt-3 rounded-xl border border-[#DCEDE2] bg-[#F8FCF9]">
                <button
                  onClick={() => setIsTreasureDetailOpen((prev) => !prev)}
                  className="w-full px-3 py-3 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 text-left">
                    <p style={{ fontSize: 14, fontWeight: 800, color: "#1E2B22" }}>보물 상세 보기</p>
                    <p className="mt-0.5 text-[#6B7785]" style={{ fontSize: 13 }}>
                      클릭해서 담아온 보물 내역을 확인해요
                    </p>
                  </div>
                  <ChevronRight
                    size={16}
                    className={`text-[#8AA294] transition-transform ${isTreasureDetailOpen ? "rotate-90" : ""}`}
                  />
                </button>

                {isTreasureDetailOpen && (
                  <div className="px-3 pb-3">
                    {expiringCoupons.length > 0 && (
                      <div className="rounded-xl border border-[#D8EFDE] bg-[#F2FBF5] p-3">
                        <div className="flex items-center gap-1.5">
                          <CalendarClock size={14} className="text-[#1FA84A]" />
                          <p style={{ fontSize: 14, fontWeight: 800, color: "#1FA84A" }}>
                            유효기간 임박 쿠폰 알림
                          </p>
                        </div>
                        <div className="mt-1.5 space-y-1">
                          {expiringCoupons.map((coupon) => (
                            <p key={coupon.id} style={{ fontSize: 14, color: "#2F3A33" }}>
                              {coupon.title} · {coupon.dDay === 0 ? "오늘 만료" : `${coupon.dDay}일 남음`}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2 mt-2">
                      {[
                        {
                          key: "coupon" as TreasureType,
                          title: "쿠폰 보관함",
                          hint: "클릭해서 사용 가능한 쿠폰을 확인해요",
                          emptyText: "사용 가능한 쿠폰이 없어요.",
                          unit: "장",
                          assets: couponAssets,
                        },
                        {
                          key: "point" as TreasureType,
                          title: "포인트 보관함",
                          hint: "클릭해서 적립한 포인트를 확인해요",
                          emptyText: "적립된 포인트가 없어요.",
                          unit: "개",
                          assets: pointAssets,
                        },
                        {
                          key: "item" as TreasureType,
                          title: "수집템 보관함",
                          hint: "클릭해서 모은 수집템을 확인해요",
                          emptyText: "수집한 아이템이 없어요.",
                          unit: "개",
                          assets: itemAssets,
                        },
                      ].map((section) => {
                        const isOpen = openAssetSections[section.key];
                        const badge = typeBadge(section.key);
                        return (
                          <div key={section.key} className="rounded-xl border border-[#DCEDE2] bg-[#F8FCF9]">
                            <button
                              onClick={() =>
                                setOpenAssetSections((prev) => ({
                                  ...prev,
                                  [section.key]: !prev[section.key],
                                }))
                              }
                              className="w-full px-3 py-3 flex items-center justify-between gap-3"
                            >
                              <div className="min-w-0 text-left">
                                <p style={{ fontSize: 14, fontWeight: 800, color: "#1E2B22" }}>{section.title}</p>
                                <p className="mt-0.5 text-[#6B7785]" style={{ fontSize: 13 }}>
                                  {section.hint}
                                </p>
                              </div>
                              <div className="inline-flex items-center gap-2">
                                <span
                                  className="h-6 px-2 rounded-full inline-flex items-center"
                                  style={{ background: badge.bg, color: badge.text, fontSize: 13, fontWeight: 800 }}
                                >
                                  {section.assets.length}
                                  {section.unit}
                                </span>
                                <ChevronRight
                                  size={16}
                                  className={`text-[#8AA294] transition-transform ${isOpen ? "rotate-90" : ""}`}
                                />
                              </div>
                            </button>

                            {isOpen && (
                              <div className="px-3 pb-3 space-y-2">
                                {section.assets.length > 0 ? (
                                  section.assets.map((asset) => {
                                    const rowBadge = typeBadge(asset.type);
                                    const RowIcon = rowBadge.icon;
                                    const daysLeft = asset.expiresAt ? diffDaysFromToday(asset.expiresAt) : null;
                                    return (
                                      <article
                                        key={asset.id}
                                        className="rounded-xl border border-[#EAF4ED] bg-white p-3 flex items-center justify-between gap-3"
                                      >
                                        <div className="min-w-0">
                                          <div className="flex items-center gap-2">
                                            <span
                                              className="h-6 px-2 rounded-full inline-flex items-center gap-1"
                                              style={{
                                                background: rowBadge.bg,
                                                color: rowBadge.text,
                                                fontSize: 14,
                                                fontWeight: 800,
                                              }}
                                            >
                                              <RowIcon size={11} />
                                              {rowBadge.label}
                                            </span>
                                            <p
                                              className="truncate"
                                              style={{ fontSize: 14, fontWeight: 800, color: "#1E2B22" }}
                                            >
                                              {asset.title}
                                            </p>
                                          </div>
                                          <p className="mt-0.5" style={{ fontSize: 13, color: "#6B7785" }}>
                                            {asset.desc}
                                          </p>
                                          {daysLeft !== null && (
                                            <p className="mt-1" style={{ fontSize: 13, color: "#1FA84A", fontWeight: 700 }}>
                                              {daysLeft < 0
                                                ? "사용 기한이 지난 쿠폰"
                                                : daysLeft === 0
                                                  ? "오늘 만료"
                                                  : `${daysLeft}일 남음`}
                                            </p>
                                          )}
                                        </div>
                                        <p style={{ fontSize: 14, fontWeight: 800, color: "#1FA84A", whiteSpace: "nowrap" }}>
                                          +{formatWon(asset.valueWon)}
                                        </p>
                                      </article>
                                    );
                                  })
                                ) : (
                                  <p className="rounded-lg bg-white px-3 py-2.5" style={{ fontSize: 14, color: "#6B7785" }}>
                                    {section.emptyText}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="mt-3 rounded-xl border border-dashed border-[#D9E6DE] bg-[#FAFCFB] p-3">
              <p style={{ fontSize: 14, color: "#6B7785" }}>
                로그인 후 쿠폰, 포인트, 수집 아이템을 확인할 수 있어요.
              </p>
            </div>
          )}
        </section>
      </div>

      <div className="px-5 mt-4">
        <section className="bg-white rounded-2xl p-4 shadow-sm border border-[#E6F3EA]">
          <button
            onClick={() => setIsAssetExportOpen((prev) => !prev)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <h2 className="text-[#1E2B22] mt-0.5" style={{ fontSize: 20, fontWeight: 800 }}>
                자산 내보내기
              </h2>
              <div className="w-8 h-8 rounded-xl bg-[#E8F8EC] text-[#1FA84A] inline-flex items-center justify-center">
                <ImageUp size={15} />
              </div>
            </div>
            <ChevronRight
              size={18}
              className={`text-[#8AA294] transition-transform ${isAssetExportOpen ? "rotate-90" : ""}`}
            />
          </button>

          {isAssetExportOpen && (
            <>
              <div className="mt-3 rounded-2xl overflow-hidden border border-[#DBEDE1]">
                <div
                  className="aspect-[9/16] p-4 flex flex-col justify-between"
                  style={{
                    background:
                      "radial-gradient(circle at 25% 20%, rgba(52,199,89,0.45), transparent 45%), radial-gradient(circle at 70% 68%, rgba(31,168,74,0.42), transparent 38%), linear-gradient(160deg, #102318 0%, #173021 45%, #1C3C2A 100%)",
                  }}
                >
                  <p style={{ fontSize: 14, color: "#A7F2B7", fontWeight: 700 }}>ITDAM ASSET PROOF</p>
                  <div>
                    <p className="text-white" style={{ fontSize: 24, lineHeight: 1.25, fontWeight: 800 }}>
                      {storyCaption}
                    </p>
                    <p style={{ fontSize: 14, color: "#C8F7D2" }} className="mt-2">
                      감성 히트맵 스토리 레이아웃으로 생성
                    </p>
                  </div>
                  <p style={{ fontSize: 14, color: "#90DEA2", fontWeight: 700 }}>
                    #{auth.isLoggedIn ? auth.user?.name ?? "잇담유저" : "게스트"} #{assetProofCount + 1}번째 증명
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3">
                <button
                  onClick={() => setAssetProofCount((prev) => prev + 1)}
                  className="h-10 rounded-xl text-[#1C2A20] inline-flex items-center justify-center gap-1.5"
                  style={{ fontSize: 14, fontWeight: 800, background: "linear-gradient(135deg, #57D476, #34C759)" }}
                >
                  <ImageUp size={14} />
                  스토리 레이아웃 생성
                </button>
                <button
                  className="h-10 rounded-xl border border-[#D6EEDC] text-[#3F6E4D] inline-flex items-center justify-center gap-1.5"
                  style={{ fontSize: 14, fontWeight: 800, background: "#F3FBF5" }}
                >
                  <Download size={14} />
                  이미지 저장
                </button>
              </div>
            </>
          )}
        </section>
      </div>

      <div className="px-5 mt-4">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {menuItems.map((item, i) => (
            <button
              key={item.label}
              onClick={item.action}
              className={`w-full flex items-center gap-3 px-4 py-4 ${i < menuItems.length - 1 ? "border-b border-[#EAF7EE]" : ""
                }`}
            >
              <item.icon size={20} className="text-[#34C759]" />
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
