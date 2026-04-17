import { useEffect, useMemo, useState, type ComponentType } from "react";
import { useNavigate } from "react-router";
import { StatusBar } from "./phone-frame";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import {
  BookmarkPlus,
  ChevronRight,
  Compass,
  Flame,
  Layers3,
  MapPin,
  Sparkles,
  Zap,
} from "lucide-react";
import {
  regionRanking,
  routineThemes,
  routines,
  themeCurations,
  userRanking,
  type RoutineTheme,
} from "../content-data";
import { cloneRoutine, isRoutineCloned } from "../clone-store";
import { getAuthState, subscribeAuth } from "../auth-store";
import { getUserTasteProfile, tasteOptions } from "../taste-store";
import { useMouseDragScroll } from "../hooks/use-mouse-drag-scroll";

type RankingTab = "region" | "user";

const GUEST_LOGIN_NOTICE = "로그인 후 사용 가능해요";
const LOGIN_BUTTON_TEXT = "로그인";

const topStats = [
  { id: "distance", value: "1,245", unit: "km", label: "누적 연결", icon: Zap },
  { id: "saved", value: "15", unit: "개", label: "여행 조각", icon: MapPin },
  { id: "rate", value: "12", unit: "%", label: "전국 탐험률", icon: Compass },
];

type SectionHeaderProps = {
  no: string;
  title: string;
  desc: string;
  icon: ComponentType<{ size?: number; className?: string }>;
};

function SectionHeader({ no, title, desc, icon: Icon }: SectionHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-3">
      <div>
        <p className="text-[#8B95A1]" style={{ fontSize: 14, fontWeight: 700 }}>
          {no}
        </p>
        <h2 className="text-[#191F28] mt-0.5" style={{ fontSize: 19, fontWeight: 800 }}>
          {title}
        </h2>
        <p className="text-[#8B95A1] mt-0.5" style={{ fontSize: 14 }}>
          {desc}
        </p>
      </div>
      <div className="w-8 h-8 rounded-full bg-[#FFF5DF] text-[#E8A830] flex items-center justify-center">
        <Icon size={16} />
      </div>
    </div>
  );
}

export function Home() {
  const navigate = useNavigate();
  const themeTabsDrag = useMouseDragScroll<HTMLDivElement>();
  const curationsDrag = useMouseDragScroll<HTMLDivElement>();
  const [isLoggedIn, setIsLoggedIn] = useState(() => getAuthState().isLoggedIn);
  const tasteProfile = useMemo(() => getUserTasteProfile(), []);
  const [selectedTheme, setSelectedTheme] = useState<RoutineTheme>(
    () => tasteProfile?.dominantTheme ?? "맛집"
  );
  const [rankingTab, setRankingTab] = useState<RankingTab>("region");
  const preferredTasteTags = useMemo(() => {
    if (!tasteProfile) return [];
    const map = new Map(tasteOptions.map((option) => [option.id, option]));
    return tasteProfile.preferenceIds
      .map((id) => map.get(id))
      .filter((item): item is (typeof tasteOptions)[number] => Boolean(item))
      .slice(0, 4);
  }, [tasteProfile]);
  const orderedRoutineThemes = useMemo(() => {
    if (!tasteProfile?.dominantTheme) return routineThemes;
    return [
      tasteProfile.dominantTheme,
      ...routineThemes.filter((theme) => theme !== tasteProfile.dominantTheme),
    ];
  }, [tasteProfile]);

  const feedRoutines = useMemo(
    () => routines.filter((routine) => routine.theme === selectedTheme),
    [selectedTheme]
  );

  useEffect(() => subscribeAuth(() => setIsLoggedIn(getAuthState().isLoggedIn)), []);

  const handleClone = (routineId: string) => {
    const target = routines.find((routine) => routine.id === routineId);
    if (!target) return;
    cloneRoutine(target);
    navigate("/app/saved");
  };

  return (
    <div className={isLoggedIn ? "min-h-full bg-[#FFF8E7] pb-6" : "h-full bg-[#FFF8E7] overflow-hidden flex flex-col"}>
      <div className="bg-[#2C2C2A] rounded-b-[30px] pb-5 shadow-[0_6px_20px_rgba(0,0,0,0.25)]">
        <StatusBar light />
        <div className="px-5 pt-1">
          <h1 className="text-white" style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.2 }}>
            잇담 <span className="text-[#F0C070]">ITDAM</span>
          </h1>
          <p className="text-[#E8A830] mt-1" style={{ fontSize: 14, fontWeight: 600 }}>
            장소는 잇고, 추억은 담고, 인생은 더 넓은 여행
          </p>

          <div className="mt-3">
            <div className="grid grid-cols-3 gap-2">
              {topStats.map((stat) => (
                <div
                  key={stat.id}
                  className="rounded-2xl border border-white/20 bg-white/8 backdrop-blur-sm px-3 py-2.5"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <stat.icon size={12} className="text-[#F0C070]" />
                    <span className="text-white/60" style={{ fontSize: 14, fontWeight: 600 }}>
                      {stat.label}
                    </span>
                  </div>
                  <div className="flex items-end gap-0.5">
                    <span className="text-white" style={{ fontSize: 20, fontWeight: 800 }}>
                      {stat.value}
                    </span>
                    <span className="text-white/50 mb-[2px]" style={{ fontSize: 14, fontWeight: 600 }}>
                      {stat.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {preferredTasteTags.length > 0 && (
            <div className="mt-3 rounded-2xl border border-[#F0C070]/35 bg-[#F0C070]/10 px-3 py-2.5">
              <p className="text-[#F0C070]" style={{ fontSize: 14, fontWeight: 800 }}>
                맞춤 취향 반영 완료
              </p>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {preferredTasteTags.map((tag) => (
                  <span
                    key={tag.id}
                    className="h-7 px-2.5 rounded-full bg-white/12 border border-white/10 text-white/90 flex items-center gap-1"
                    style={{ fontSize: 14, fontWeight: 700 }}
                  >
                    <span>{tag.emoji}</span>
                    <span>{tag.label}</span>
                  </span>
                ))}
              </div>

            </div>
          )}
        </div>

      </div>

      <div className={isLoggedIn ? "px-4 mt-3 flex gap-2" : "hidden"}>
        <button
          onClick={() => navigate("/create-route")}
          className="flex-1 h-[44px] rounded-2xl bg-[#F2F4F6] border border-[#E7E7E7] text-[#4E5968] flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform"
          style={{ fontSize: 16, fontWeight: 700, }}
        >
          <Zap size={15} className="text-[#E8A830]" />
          여행 잇기
        </button>
        <button
          onClick={() => navigate("/snap-route")}
          className="flex-1 h-[44px] rounded-2xl bg-[#F2F4F6] border border-[#E7E7E7] text-[#4E5968] flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform"
          style={{ fontSize: 16, fontWeight: 700 }}
        >
          <MapPin size={15} className="text-[#E8A830]" />
          스냅 루트
        </button>
      </div>

      <div className={isLoggedIn ? "px-4 pt-4 space-y-4" : "hidden"}>
        <section className="bg-white rounded-3xl p-4 border border-[#F0E6D0]">
          <SectionHeader
            title="여정탐색"
            desc="테마별 베스트 루틴을 바로 확인하세요"
            icon={Layers3}
          />

          <div
            ref={themeTabsDrag.ref}
            {...themeTabsDrag.handlers}
            className="flex gap-2 overflow-x-auto pb-1 cursor-grab select-none"
          >
            {orderedRoutineThemes.map((theme) => (
              <button
                key={theme}
                onClick={() => setSelectedTheme(theme)}
                className={`h-9 px-4 rounded-full whitespace-nowrap ${selectedTheme === theme ? "text-white" : "bg-[#F2F4F6] text-[#4E5968]"
                  }`}
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  background:
                    selectedTheme === theme
                      ? "linear-gradient(135deg, #F0C070, #E8A830)"
                      : undefined,
                }}
              >
                {theme}
              </button>
            ))}
          </div>

          <div className="mt-3 relative">
            <div className={`space-y-3 ${isLoggedIn ? "" : "max-h-[520px] overflow-hidden"}`}>
              {feedRoutines.map((routine) => (
                <article key={routine.id} className="rounded-2xl border border-[#F0E6D0] overflow-hidden">
                  <div className="h-[132px] relative">
                    <ImageWithFallback
                      src={routine.image}
                      alt={routine.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
                    <div className="absolute left-3 top-3 px-2.5 py-1 rounded-lg bg-black/45 text-white" style={{ fontSize: 14, fontWeight: 700 }}>
                      {routine.region} · {routine.theme}
                    </div>
                    <div className="absolute left-3 bottom-3 text-white">
                      <p style={{ fontSize: 17, fontWeight: 800 }}>{routine.title}</p>
                    </div>
                  </div>

                  <div className="p-3.5">
                    <p className="text-[#4E5968] mb-2" style={{ fontSize: 14 }}>
                      {routine.subtitle}
                    </p>
                    <p className="text-[#191F28] mb-3 truncate" style={{ fontSize: 14, fontWeight: 700 }}>
                      경로: {routine.routeSummary}
                    </p>

                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2.5 py-1 rounded-lg bg-[#F2F4F6] text-[#4E5968]" style={{ fontSize: 14, fontWeight: 700 }}>
                        {routine.duration}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-[#F2F4F6] text-[#4E5968]" style={{ fontSize: 14, fontWeight: 700 }}>
                        예산 {routine.budget}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-[#F2F4F6] text-[#4E5968]" style={{ fontSize: 14, fontWeight: 700 }}>
                        클론 {routine.clones.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/routine/${routine.id}`)}
                        className="flex-1 h-10 rounded-xl bg-[#F2F4F6] text-[#191F28]"
                        style={{ fontSize: 14, fontWeight: 700 }}
                      >
                        상세 보기
                      </button>
                      <button
                        onClick={() => handleClone(routine.id)}
                        className="flex-1 h-10 rounded-xl text-white flex items-center justify-center gap-1.5"
                        style={{ fontSize: 14, fontWeight: 700, background: "linear-gradient(135deg, #F0C070, #E8A830)" }}
                      >
                        <BookmarkPlus size={14} />
                        {isRoutineCloned(routine.id) ? "담김" : "클로닝"}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {!isLoggedIn && (
              <>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 top-[170px] rounded-b-2xl bg-gradient-to-b from-[rgba(255,248,231,0)] via-[rgba(255,248,231,0.64)] to-[rgba(255,248,231,0.96)] backdrop-blur-[5px]" />
                <div className="absolute inset-x-0 top-[210px] px-3 flex justify-center">
                  <div className="w-full max-w-[296px] rounded-2xl border border-[#F0C070]/45 bg-white/88 backdrop-blur-[8px] px-4 py-3 shadow-[0_10px_26px_rgba(44,44,42,0.16)]">
                    <p className="text-[#2C2C2A]" style={{ fontSize: 14, fontWeight: 800 }}>
                      {GUEST_LOGIN_NOTICE}
                    </p>
                    <p className="text-[#6B7684] mt-1" style={{ fontSize: 14 }}>
                      Login to unlock the full route feed.
                    </p>
                    <button
                      onClick={() => navigate("/login", { state: { from: "/app" } })}
                      className="w-full mt-3 h-9 rounded-xl bg-[#F0C070] text-[#2C2C2A] active:scale-[0.98] transition-transform"
                      style={{ fontSize: 14, fontWeight: 800 }}
                    >
                      {LOGIN_BUTTON_TEXT}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

        <section className="bg-white rounded-3xl p-4 border border-[#F0E6D0]">
          <SectionHeader
            title="영토 랭킹"
            desc="가장 열기가 높은 지역과 유저를 확인하세요"
            icon={Flame}
          />

          <div className="inline-flex p-1 rounded-xl bg-[#F2F4F6] mb-3">
            <button
              onClick={() => setRankingTab("region")}
              className={`h-8 px-4 rounded-lg ${rankingTab === "region" ? "bg-white text-[#191F28]" : "text-[#6B7684]"}`}
              style={{ fontSize: 14, fontWeight: 700 }}
            >
              지역
            </button>
            <button
              onClick={() => setRankingTab("user")}
              className={`h-8 px-4 rounded-lg ${rankingTab === "user" ? "bg-white text-[#191F28]" : "text-[#6B7684]"}`}
              style={{ fontSize: 14, fontWeight: 700 }}
            >
              유저
            </button>
          </div>

          <div className="space-y-2">
            {rankingTab === "region" &&
              regionRanking.map((item, idx) => (
                <div key={item.region} className="flex items-center justify-between h-12 px-3 rounded-xl bg-[#FFF9EE]">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#FDF0D6] text-[#E8A830] flex items-center justify-center" style={{ fontSize: 14, fontWeight: 800 }}>
                      {idx + 1}
                    </span>
                    <p className="text-[#191F28]" style={{ fontSize: 14, fontWeight: 700 }}>{item.region}</p>
                  </div>
                  <p className="text-[#4E5968]" style={{ fontSize: 14, fontWeight: 700 }}>
                    열기 {item.heat} · {item.growth}
                  </p>
                </div>
              ))}

            {rankingTab === "user" &&
              userRanking.map((item, idx) => (
                <div key={item.user} className="flex items-center justify-between h-12 px-3 rounded-xl bg-[#FFF9EE]">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#FDF0D6] text-[#E8A830] flex items-center justify-center" style={{ fontSize: 14, fontWeight: 800 }}>
                      {idx + 1}
                    </span>
                    <p className="text-[#191F28]" style={{ fontSize: 14, fontWeight: 700 }}>{item.user}</p>
                  </div>
                  <p className="text-[#4E5968]" style={{ fontSize: 14, fontWeight: 700 }}>
                    {item.region} · {item.score.toLocaleString()}점
                  </p>
                </div>
              ))}
          </div>
        </section>

        <section className="bg-white rounded-3xl p-4 border border-[#F0E6D0]">
          <SectionHeader
            title="테마 큐레이션"
            desc="잇깨비 추천 테마를 카드로 빠르게 확인하세요"
            icon={Sparkles}
          />

          <div
            ref={curationsDrag.ref}
            {...curationsDrag.handlers}
            className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 cursor-grab select-none"
          >
            {themeCurations.map((curation) => (
              <button
                key={curation.id}
                onClick={() => navigate(`/routine/${curation.routineIds[0]}`)}
                className="min-w-[255px] w-[255px] rounded-2xl overflow-hidden border border-[#F0E6D0] text-left"
              >
                <div className="h-[120px] relative">
                  <ImageWithFallback
                    src={curation.image}
                    alt={curation.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-white/90 text-[#E8A830]" style={{ fontSize: 14, fontWeight: 800 }}>
                    {curation.badge}
                  </span>
                </div>
                <div className="p-3">
                  <p className="text-[#191F28]" style={{ fontSize: 15, fontWeight: 800 }}>{curation.title}</p>
                  <p className="text-[#6B7684] mt-1" style={{ fontSize: 14, lineHeight: 1.45 }}>{curation.description}</p>
                  <div className="mt-2 flex items-center text-[#E8A830]" style={{ fontSize: 14, fontWeight: 700 }}>
                    테마 상세 보기
                    <ChevronRight size={14} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>

      {!isLoggedIn && (
        <div className="px-4 mt-3 pb-4 flex-1">
          <div className="relative h-full min-h-[420px] rounded-3xl overflow-hidden border border-[#F0E6D0]">
            <div className="absolute inset-0 bg-gradient-to-b from-[rgba(255,255,255,0.35)] via-[rgba(255,248,231,0.72)] to-[rgba(255,248,231,0.96)] backdrop-blur-[10px]" />
            <div className="absolute -top-8 -left-8 w-40 h-40 rounded-full bg-[#F0C070]/28 blur-2xl" />
            <div className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full bg-[#E8A830]/22 blur-2xl" />

            <div className="absolute inset-0 flex items-center justify-center px-4">
              <div className="w-full max-w-[296px] rounded-2xl border border-[#F0C070]/45 bg-white/88 backdrop-blur-[8px] px-4 py-3 shadow-[0_10px_26px_rgba(44,44,42,0.16)]">
                <p className="text-[#2C2C2A]" style={{ fontSize: 14, fontWeight: 800 }}>
                  {GUEST_LOGIN_NOTICE}
                </p>
                <p className="text-[#6B7684] mt-1" style={{ fontSize: 14 }}>
                  로그인하면 추천 여정과 탐색 피드를 이어서 볼 수 있어요.
                </p>
                <button
                  onClick={() => navigate("/login", { state: { from: "/app" } })}
                  className="w-full mt-3 h-9 rounded-xl bg-[#F0C070] text-[#2C2C2A] active:scale-[0.98] transition-transform"
                  style={{ fontSize: 14, fontWeight: 800 }}
                >
                  {LOGIN_BUTTON_TEXT}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
