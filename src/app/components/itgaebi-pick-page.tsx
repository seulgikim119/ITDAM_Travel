import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowUpDown,
  Check,
  ClipboardList,
  Gift,
  GripVertical,
  Link2,
  MapPin,
  Navigation,
  Sparkles,
  Trash2,
  WandSparkles,
} from "lucide-react";
import { StatusBar } from "./phone-frame";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { getClonedRoutines, removeClonedRoutine } from "../clone-store";
import { saveCompletedPlan } from "../completed-plan-store";
import type { Routine } from "../content-data";
import { useMouseDragScroll } from "../hooks/use-mouse-drag-scroll";

type DraftStop = {
  id: string;
  name: string;
  duration: number;
  tip: string;
  memo: string;
};

type BenefitItem = {
  id: string;
  brand: string;
  title: string;
  desc: string;
  rewardPoint: number;
};

type SuggestionCategory = "밥집" | "카페" | "체험";

type RouteSuggestionTemplate = {
  id: string;
  category: SuggestionCategory;
  name: string;
  desc: string;
  duration: number;
  memo: string;
  tip: string;
};

const Y = {
  bg: "#F5F5F7",
  card: "#FFFFFF",
  text: "#121212",
  muted: "#70757E",
  line: "#EBEDF0",
  point: "#F0C070",
  pointDeep: "#E8A830",
  pointSoft: "#FFF5DF",
  pointText: "#B87914",
  danger: "#FF5A5F",
};

const fallbackStops: DraftStop[] = [
  {
    id: "fallback-1",
    name: "추천 장소 1",
    duration: 80,
    tip: "오픈 시간 30분 이내에 도착하면 대기 없이 입장하기 좋아요.",
    memo: "브런치 먼저 방문",
  },
  {
    id: "fallback-2",
    name: "추천 장소 2",
    duration: 70,
    tip: "주차가 혼잡해지기 전, 오전 시간대 방문을 추천해요.",
    memo: "이동 동선 연결",
  },
  {
    id: "fallback-3",
    name: "추천 장소 3",
    duration: 60,
    tip: "마감 1시간 전에는 입장 제한이 있을 수 있어요.",
    memo: "휴식 시간 체크",
  },
];

const benefitCatalog: BenefitItem[] = [
  {
    id: "benefit-1",
    brand: "카페 쉬유",
    title: "아메리카노 1+1 쿠폰",
    desc: "인접 루트 제휴 매장에서 즉시 사용 가능",
    rewardPoint: 120,
  },
  {
    id: "benefit-2",
    brand: "모카리티",
    title: "자전거 30분 무료",
    desc: "2~3km 구간 이동 시 추천 혜택",
    rewardPoint: 90,
  },
  {
    id: "benefit-3",
    brand: "미션 이벤트",
    title: "포토 미션 보너스",
    desc: "지정 스팟 2곳 인증 시 추가 포인트 지급",
    rewardPoint: 180,
  },
];

const routeSuggestionTemplates: RouteSuggestionTemplate[] = [
  {
    id: "food-local",
    category: "밥집",
    name: "로컬 밥집",
    desc: "이동 중 한 끼 해결하기 좋은 식당",
    duration: 55,
    memo: "점심/저녁 식사",
    tip: "웨이팅이 길어지기 전에 도착하면 좋아요.",
  },
  {
    id: "cafe-break",
    category: "카페",
    name: "뷰 카페",
    desc: "잠깐 쉬어가기 좋은 카페 스팟",
    duration: 40,
    memo: "카페 휴식",
    tip: "피크 시간대 이전 방문을 추천해요.",
  },
  {
    id: "activity-short",
    category: "체험",
    name: "짧은 체험활동",
    desc: "30~60분 내로 가능한 체험 코스",
    duration: 45,
    memo: "중간 체험",
    tip: "현장 예약 가능 여부를 먼저 확인하세요.",
  },
  {
    id: "food-noodle",
    category: "밥집",
    name: "면 요리 맛집",
    desc: "빠르게 먹고 이동하기 좋은 메뉴",
    duration: 50,
    memo: "간편 식사",
    tip: "대표 메뉴 1개는 미리 정해두면 주문이 빨라요.",
  },
  {
    id: "cafe-dessert",
    category: "카페",
    name: "디저트 카페",
    desc: "포토 스팟이 많은 디저트 전문점",
    duration: 35,
    memo: "디저트 타임",
    tip: "인기 메뉴 품절 시간을 체크해 보세요.",
  },
  {
    id: "activity-photo",
    category: "체험",
    name: "포토 체험 스팟",
    desc: "사진 남기기 좋은 짧은 체험형 공간",
    duration: 50,
    memo: "포토 체험",
    tip: "햇빛 방향이 좋은 시간대를 맞추면 사진이 더 예뻐요.",
  },
];

const suggestionTone: Record<SuggestionCategory, { bg: string; text: string }> = {
  밥집: { bg: "#FFEFD9", text: "#AA6B13" },
  카페: { bg: "#E9F3FF", text: "#2E6FAE" },
  체험: { bg: "#EAF9EC", text: "#2A8D49" },
};

function toDraftStops(routine: Routine | null): DraftStop[] {
  if (!routine || routine.stops.length === 0) {
    return fallbackStops;
  }

  return routine.stops.map((stop, index) => ({
    id: `${routine.id}-${index}`,
    name: stop.name,
    duration: 60 + index * 10,
    tip:
      index % 2 === 0
        ? "오픈 직후 방문하면 사진 촬영과 동선 확보가 쉬워요."
        : "이동 전 주차와 편의시설 위치를 먼저 확인해 두세요.",
    memo: stop.note,
  }));
}

function reorderStops(stops: DraftStop[], dragId: string, dropId: string) {
  const from = stops.findIndex((stop) => stop.id === dragId);
  const to = stops.findIndex((stop) => stop.id === dropId);
  if (from < 0 || to < 0 || from === to) return stops;

  const next = [...stops];
  const [picked] = next.splice(from, 1);
  next.splice(to, 0, picked);
  return next;
}

function toHourMinute(totalMinute: number) {
  const hour = Math.floor(totalMinute / 60);
  const minute = totalMinute % 60;
  if (hour === 0) return `${minute}분`;
  if (minute === 0) return `${hour}시간`;
  return `${hour}시간 ${minute}분`;
}

function getTodayISODate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function SavedPlaces() {
  const navigate = useNavigate();
  const savedRoutinesDrag = useMouseDragScroll<HTMLDivElement>();
  const [savedRoutines, setSavedRoutines] = useState<Routine[]>([]);
  const [activeRoutineId, setActiveRoutineId] = useState<string | null>(null);
  const [draftStops, setDraftStops] = useState<DraftStop[]>(fallbackStops);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(fallbackStops[0].id);
  const [reservedBenefitIds, setReservedBenefitIds] = useState<string[]>([]);
  const [addedSuggestionKeys, setAddedSuggestionKeys] = useState<string[]>([]);
  const [travelDate, setTravelDate] = useState<string>(getTodayISODate());

  useEffect(() => {
    const loaded = getClonedRoutines();
    setSavedRoutines(loaded);
    setActiveRoutineId(loaded[0]?.id ?? null);
  }, []);

  const activeRoutine = useMemo(
    () => savedRoutines.find((routine) => routine.id === activeRoutineId) ?? null,
    [savedRoutines, activeRoutineId]
  );

  useEffect(() => {
    const nextStops = toDraftStops(activeRoutine);
    setDraftStops(nextStops);
    setSelectedStopId(nextStops[0]?.id ?? null);
  }, [activeRoutine]);

  const selectedStop = useMemo(
    () => draftStops.find((stop) => stop.id === selectedStopId) ?? null,
    [draftStops, selectedStopId]
  );

  const totalStayMinutes = useMemo(
    () => draftStops.reduce((sum, stop) => sum + stop.duration, 0),
    [draftStops]
  );

  const estimatedDistance = useMemo(() => {
    const edges = Math.max(draftStops.length - 1, 0);
    const base = edges * 2.8;
    const complexity = draftStops.length >= 4 ? 1.6 : 0.7;
    return Number((base + complexity).toFixed(1));
  }, [draftStops]);

  const estimatedMoveMinutes = useMemo(() => {
    const edges = Math.max(draftStops.length - 1, 0);
    return Math.round(edges * 18 + estimatedDistance * 4);
  }, [draftStops, estimatedDistance]);

  const estimatedTotalMinutes = totalStayMinutes + estimatedMoveMinutes;

  const transportSuggestion = useMemo(() => {
    if (estimatedDistance < 3) return "도보 + 지하철 연계 이동";
    if (estimatedDistance < 8) return "자전거 + 도보";
    return "대중교통 + 도보";
  }, [estimatedDistance]);

  const reservedBenefits = useMemo(
    () => benefitCatalog.filter((benefit) => reservedBenefitIds.includes(benefit.id)),
    [reservedBenefitIds]
  );

  const expectedPoint = useMemo(() => {
    const basePoint = draftStops.length * 55;
    const benefitPoint = reservedBenefits.reduce((sum, benefit) => sum + benefit.rewardPoint, 0);
    return basePoint + benefitPoint;
  }, [draftStops.length, reservedBenefits]);

  const expectedConquestRate = useMemo(() => {
    const base = Math.min(92, 11 + draftStops.length * 8);
    const bonus = Math.min(10, reservedBenefits.length * 2);
    return Math.min(100, base + bonus);
  }, [draftStops.length, reservedBenefits.length]);

  const segmentSuggestions = useMemo(() => {
    if (draftStops.length < 2) return [];

    return draftStops.slice(0, -1).map((from, index) => {
      const to = draftStops[index + 1];
      const segmentId = `${from.id}->${to.id}`;
      const picked = [0, 1, 2].map(
        (offset) => routeSuggestionTemplates[(index + offset) % routeSuggestionTemplates.length]
      );
      const suggestions = picked.map((template, order) => ({
        ...template,
        id: `${template.id}-${index}-${order}`,
      }));
      return { segmentId, from, to, suggestions };
    });
  }, [draftStops]);

  const toggleBenefit = (benefitId: string) => {
    setReservedBenefitIds((prev) =>
      prev.includes(benefitId) ? prev.filter((id) => id !== benefitId) : [...prev, benefitId]
    );
  };

  const handleRemoveRoutine = (routineId: string) => {
    const next = removeClonedRoutine(routineId);
    setSavedRoutines(next);
    if (activeRoutineId === routineId) {
      setActiveRoutineId(next[0]?.id ?? null);
    }
  };

  const updateSelectedStopDuration = (duration: number) => {
    if (!selectedStopId) return;
    const safeDuration = Number.isFinite(duration) ? Math.max(10, duration) : 10;
    setDraftStops((prev) =>
      prev.map((stop) => (stop.id === selectedStopId ? { ...stop, duration: safeDuration } : stop))
    );
  };

  const updateSelectedStopMemo = (memo: string) => {
    if (!selectedStopId) return;
    setDraftStops((prev) =>
      prev.map((stop) => (stop.id === selectedStopId ? { ...stop, memo } : stop))
    );
  };

  const handleAddSuggestionStop = (
    segmentIndex: number,
    segmentId: string,
    suggestion: RouteSuggestionTemplate
  ) => {
    const addKey = `${segmentId}:${suggestion.id}`;
    if (addedSuggestionKeys.includes(addKey)) return;

    const insertedId = `suggest-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const insertedStop: DraftStop = {
      id: insertedId,
      name: `${suggestion.name}`,
      duration: suggestion.duration,
      tip: suggestion.tip,
      memo: suggestion.memo,
    };

    setDraftStops((prev) => {
      const next = [...prev];
      const insertAt = Math.min(segmentIndex + 1, next.length);
      next.splice(insertAt, 0, insertedStop);
      return next;
    });
    setAddedSuggestionKeys((prev) => [...prev, addKey]);
    setSelectedStopId(insertedId);
  };

  const handleFinalizePlan = () => {
    saveCompletedPlan({
      sourceRoutineId: activeRoutine?.id ?? null,
      title: activeRoutine?.title ?? "오늘의 확정 플랜",
      region: activeRoutine?.region ?? "미지정",
      travelDate,
      totalStops: draftStops.length,
      totalMinutes: estimatedTotalMinutes,
    });
    navigate("/app/record");
  };

  return (
    <div className="min-h-full pb-8" style={{ background: Y.bg }}>
      <div className="bg-[#2C2C2A] rounded-b-[30px] pb-5 shadow-[0_6px_20px_rgba(0,0,0,0.25)]">
        <StatusBar light />
        <div className="px-5 pt-1">
          <h1 className="text-white" style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.2 }}>
            잇깨비 <span className="text-[#F0C070]">PICK</span>
          </h1>
          <p className="text-[#E8A830] mt-1" style={{ fontSize: 14, fontWeight: 600 }}>
            클로닝, 스냅, 편집까지 한 번에 연결되는 여행 편집함
          </p>
        </div>

        <div className="px-4 mt-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-2xl border border-white/20 bg-white/8 backdrop-blur-sm px-3 py-2.5">
              <p className="text-white/60" style={{ fontSize: 14, fontWeight: 600 }}>
                저장 루틴
              </p>
              <p className="text-white mt-1" style={{ fontSize: 24, fontWeight: 800 }}>
                {savedRoutines.length}
              </p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/8 backdrop-blur-sm px-3 py-2.5">
              <p className="text-white/60" style={{ fontSize: 14, fontWeight: 600 }}>
                편집 스톱
              </p>
              <p className="text-white mt-1" style={{ fontSize: 24, fontWeight: 800 }}>
                {draftStops.length}
              </p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/8 backdrop-blur-sm px-3 py-2.5">
              <p className="text-white/60" style={{ fontSize: 14, fontWeight: 600 }}>
                예약 혜택
              </p>
              <p className="text-white mt-1" style={{ fontSize: 24, fontWeight: 800 }}>
                {reservedBenefitIds.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        <section className="rounded-3xl p-4 border" style={{ background: Y.card, borderColor: Y.line }}>
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontSize: 14, fontWeight: 800, color: Y.pointText }}>Input & Clone</p>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: Y.text }} className="mt-0.5">
                여정 가져오기
              </h2>
            </div>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: Y.point }}>
              <Link2 size={17} color={Y.text} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3">
            <button
              onClick={() => navigate("/app")}
              className="h-12 rounded-2xl px-3 text-left transition-transform border"
              style={{ background: "#FFFDF2", borderColor: Y.pointDeep }}
            >
              <p style={{ fontSize: 14, fontWeight: 900, color: Y.text }}>원클릭 클로닝</p>
            </button>
            <button
              onClick={() => navigate("/snap-route")}
              className="h-12 rounded-2xl px-3 text-left active:scale-[0.98] transition-transform border"
              style={{ background: "#FFFDF2", borderColor: Y.pointDeep }}
            >
              <p style={{ fontSize: 14, fontWeight: 900, color: Y.text }}>AI 스냅 루트</p>
            </button>
          </div>

          {savedRoutines.length === 0 ? (
            <div className="mt-3 rounded-2xl p-4 border border-dashed" style={{ borderColor: Y.pointDeep }}>
              <p style={{ fontSize: 14, fontWeight: 800, color: Y.text }}>클로닝된 루틴이 아직 없어요.</p>
              <p style={{ fontSize: 14, color: Y.muted }} className="mt-1">
                잇깨비길에서 루틴을 클론하면 바로 여기 편집창으로 가져올 수 있어요.
              </p>
            </div>
          ) : (
            <div
              ref={savedRoutinesDrag.ref}
              {...savedRoutinesDrag.handlers}
              className="mt-3 flex gap-2 overflow-x-auto pb-1 cursor-grab select-none"
            >
              {savedRoutines.map((routine) => {
                const active = routine.id === activeRoutineId;
                return (
                  <article
                    key={routine.id}
                    className="min-w-[210px] w-[210px] rounded-2xl border overflow-hidden"
                    style={{
                      background: "#FFF",
                      borderColor: active ? Y.pointDeep : Y.line,
                      boxShadow: active ? "0 0 0 2px rgba(232,168,48,0.35)" : "none",
                    }}
                  >
                    <button className="w-full text-left" onClick={() => setActiveRoutineId(routine.id)}>
                      <div className="h-[92px] relative">
                        <ImageWithFallback
                          src={routine.image}
                          alt={routine.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
                        {active && (
                          <span
                            className="absolute left-2 top-2 h-6 px-2 rounded-full inline-flex items-center"
                            style={{ background: Y.point }}
                          >
                            <span style={{ fontSize: 14, fontWeight: 900, color: Y.text }}>편집 중</span>
                          </span>
                        )}
                      </div>
                      <div className="px-3 py-2">
                        <p style={{ fontSize: 14, fontWeight: 800, color: Y.text }} className="truncate">
                          {routine.title}
                        </p>
                        <p style={{ fontSize: 14, color: Y.muted }} className="truncate">
                          {routine.region} · {routine.duration}
                        </p>
                      </div>
                    </button>
                    <div className="px-3 pb-3">
                      <button
                        onClick={() => handleRemoveRoutine(routine.id)}
                        className="h-8 px-2 rounded-lg inline-flex items-center gap-1 border"
                        style={{ borderColor: "#FFD2D4", color: Y.danger, background: "#FFF5F5" }}
                      >
                        <Trash2 size={12} />
                        <span style={{ fontSize: 14, fontWeight: 700 }}>정리</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="rounded-3xl p-4 border" style={{ background: Y.card, borderColor: Y.line }}>
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontSize: 14, fontWeight: 800, color: Y.pointText }}>Smart Editing</p>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: Y.text }} className="mt-0.5">
                지능형 타임라인 편집
              </h2>
            </div>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: Y.point }}>
              <ArrowUpDown size={16} color={Y.text} />
            </div>
          </div>

          <p style={{ fontSize: 14, color: Y.muted }} className="mt-2">
            카드를 길게 눌러 순서를 바꾸면 동선과 시간이 실시간으로 다시 계산돼요.
          </p>

          <div className="mt-3 space-y-2">
            {draftStops.map((stop, idx) => {
              const active = stop.id === selectedStopId;
              return (
                <article
                  key={stop.id}
                  draggable
                  onDragStart={() => setDraggingId(stop.id)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => {
                    if (!draggingId) return;
                    setDraftStops((prev) => reorderStops(prev, draggingId, stop.id));
                    setDraggingId(null);
                  }}
                  onDragEnd={() => setDraggingId(null)}
                  onClick={() => setSelectedStopId(stop.id)}
                  className="rounded-2xl border p-3 flex items-center gap-3 cursor-move transition-colors"
                  style={{
                    borderColor: active ? Y.pointDeep : Y.line,
                    background: active ? "#FFFDF2" : "#FFFFFF",
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: active ? Y.point : "#F3F4F6" }}
                  >
                    <span style={{ fontSize: 14, fontWeight: 900, color: Y.text }}>{idx + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: 14, fontWeight: 800, color: Y.text }} className="truncate">
                      {stop.name}
                    </p>
                    <p style={{ fontSize: 14, color: Y.muted }} className="truncate">
                      체류 {stop.duration}분 · {stop.memo}
                    </p>
                  </div>
                  <GripVertical size={16} color="#9AA0A6" />
                </article>
              );
            })}
          </div>

          {selectedStop && (
            <div className="mt-3 rounded-2xl border p-3" style={{ borderColor: Y.line, background: "#FAFAFB" }}>
              <div className="flex items-center gap-2">
                <ClipboardList size={14} color="#7A7F87" />
                <p style={{ fontSize: 14, fontWeight: 800, color: Y.text }}>{selectedStop.name} 커스텀</p>
              </div>
              <div className="grid grid-cols-[1fr_auto] gap-2 mt-2">
                <input
                  type="number"
                  min={10}
                  value={selectedStop.duration}
                  onChange={(event) => updateSelectedStopDuration(Number(event.target.value))}
                  className="h-9 px-3 rounded-xl border outline-none"
                  style={{ borderColor: Y.line, fontSize: 14, color: Y.text, background: "#FFFFFF" }}
                />
                <span className="self-center" style={{ fontSize: 14, color: Y.muted }}>
                  분
                </span>
              </div>
              <textarea
                value={selectedStop.memo}
                onChange={(event) => updateSelectedStopMemo(event.target.value)}
                className="w-full mt-2 h-[74px] px-3 py-2 rounded-xl border resize-none outline-none"
                style={{ borderColor: Y.line, fontSize: 14, color: Y.text, background: "#FFFFFF" }}
              />
              <div className="mt-2 h-8 px-2.5 rounded-lg inline-flex items-center" style={{ background: Y.pointSoft }}>
                <span style={{ fontSize: 14, color: Y.pointText, fontWeight: 700 }}>
                  방문 꿀팁: {selectedStop.tip}
                </span>
              </div>
            </div>
          )}
        </section>

        <section className="rounded-3xl p-4 border" style={{ background: Y.card, borderColor: Y.line }}>
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontSize: 14, fontWeight: 800, color: Y.pointText }}>Route Assist</p>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: Y.text }} className="mt-0.5">
                가는 길 추천 일정 추가
              </h2>
            </div>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: Y.point }}>
              <Navigation size={16} color={Y.text} />
            </div>
          </div>

          <p style={{ fontSize: 14, color: Y.muted }} className="mt-2">
            동선 사이사이에 들를 만한 밥집, 카페, 체험활동을 추천해드려요. 마음에 들면 바로 일정에 넣을 수 있어요.
          </p>

          {segmentSuggestions.length === 0 ? (
            <div className="mt-3 rounded-2xl border border-dashed p-3" style={{ borderColor: Y.line }}>
              <p style={{ fontSize: 14, color: Y.muted }}>
                두 개 이상의 장소가 있어야 중간 추천 일정을 보여줄 수 있어요.
              </p>
            </div>
          ) : (
            <div className="space-y-3 mt-3">
              {segmentSuggestions.map((segment, segmentIndex) => (
                <article
                  key={segment.segmentId}
                  className="rounded-2xl border p-3"
                  style={{ borderColor: Y.line, background: "#FFFEFA" }}
                >
                  <p style={{ fontSize: 14, fontWeight: 800, color: Y.text }}>
                    {segment.from.name} → {segment.to.name}
                  </p>
                  <p style={{ fontSize: 14, color: Y.muted }} className="mt-0.5">
                    이런 건 어떠세요?
                  </p>

                  <div className="space-y-2 mt-2">
                    {segment.suggestions.map((suggestion) => {
                      const addKey = `${segment.segmentId}:${suggestion.id}`;
                      const added = addedSuggestionKeys.includes(addKey);
                      return (
                        <div
                          key={suggestion.id}
                          className="rounded-xl border px-3 py-2.5 flex items-center justify-between gap-2"
                          style={{ borderColor: Y.line, background: "#FFFFFF" }}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span
                                className="h-5 px-2 rounded-full inline-flex items-center"
                                style={{
                                  background: suggestionTone[suggestion.category].bg,
                                  color: suggestionTone[suggestion.category].text,
                                  fontSize: 14,
                                  fontWeight: 800,
                                }}
                              >
                                {suggestion.category}
                              </span>
                              <p style={{ fontSize: 14, fontWeight: 800, color: Y.text }} className="truncate">
                                {suggestion.name}
                              </p>
                            </div>
                            <p style={{ fontSize: 14, color: Y.muted }} className="truncate mt-0.5">
                              {suggestion.desc} · {suggestion.duration}분
                            </p>
                          </div>

                          <button
                            type="button"
                            disabled={added}
                            onClick={() => handleAddSuggestionStop(segmentIndex, segment.segmentId, suggestion)}
                            className="h-8 px-2.5 rounded-lg border disabled:opacity-55"
                            style={{
                              borderColor: added ? "#D4D8DE" : Y.pointDeep,
                              background: added ? "#F3F5F7" : "#FFF8E9",
                              color: added ? "#8C929A" : Y.pointText,
                              fontSize: 14,
                              fontWeight: 800,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {added ? "추가됨" : "일정에 추가"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="grid grid-cols-3 gap-2 mt-3">
            <div className="rounded-2xl p-3" style={{ background: "#FAFAFB" }}>
              <p style={{ fontSize: 14, color: Y.muted }}>예상 거리</p>
              <p style={{ fontSize: 15, fontWeight: 900, color: Y.text }} className="mt-0.5">
                {estimatedDistance}km
              </p>
            </div>
            <div className="rounded-2xl p-3" style={{ background: "#FAFAFB" }}>
              <p style={{ fontSize: 14, color: Y.muted }}>이동 시간</p>
              <p style={{ fontSize: 15, fontWeight: 900, color: Y.text }} className="mt-0.5">
                {toHourMinute(estimatedMoveMinutes)}
              </p>
            </div>
            <div className="rounded-2xl p-3" style={{ background: "#FAFAFB" }}>
              <p style={{ fontSize: 14, color: Y.muted }}>총 소요</p>
              <p style={{ fontSize: 15, fontWeight: 900, color: Y.text }} className="mt-0.5">
                {toHourMinute(estimatedTotalMinutes)}
              </p>
            </div>
          </div>

          <div className="mt-2 h-9 px-3 rounded-xl inline-flex items-center gap-2" style={{ background: Y.pointSoft }}>
            <MapPin size={13} color={Y.pointText} />
            <span style={{ fontSize: 14, color: Y.pointText, fontWeight: 800 }}>
              이동 수단 추천: {transportSuggestion}
            </span>
          </div>
        </section>

        <section className="rounded-3xl p-4 border" style={{ background: Y.card, borderColor: Y.line }}>
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontSize: 14, fontWeight: 800, color: Y.pointText }}>Benefit Booking</p>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: Y.text }} className="mt-0.5">
                맥락 혜택 및 미션 예약
              </h2>
            </div>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: Y.point }}>
              <Gift size={16} color={Y.text} />
            </div>
          </div>

          <div className="space-y-2 mt-3">
            {benefitCatalog.map((benefit) => {
              const selected = reservedBenefitIds.includes(benefit.id);
              return (
                <article
                  key={benefit.id}
                  className="rounded-2xl p-3 border flex items-start gap-3"
                  style={{ borderColor: selected ? Y.pointDeep : Y.line, background: selected ? "#FFFDF2" : "#FFF" }}
                >
                  <button
                    onClick={() => toggleBenefit(benefit.id)}
                    className="mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center"
                    style={{ borderColor: selected ? Y.pointDeep : "#C9CDD2", background: selected ? Y.point : "#FFF" }}
                  >
                    {selected && <Check size={12} color={Y.text} strokeWidth={3} />}
                  </button>
                  <div className="flex-1">
                    <p style={{ fontSize: 14, color: Y.pointText, fontWeight: 800 }}>{benefit.brand}</p>
                    <p style={{ fontSize: 14, fontWeight: 800, color: Y.text }} className="mt-0.5">
                      {benefit.title}
                    </p>
                    <p style={{ fontSize: 14, color: Y.muted }} className="mt-0.5">
                      {benefit.desc}
                    </p>
                  </div>
                  <span
                    className="h-7 px-2 rounded-lg inline-flex items-center"
                    style={{ background: Y.pointSoft, color: Y.pointText, fontSize: 14, fontWeight: 900 }}
                  >
                    +{benefit.rewardPoint}P
                  </span>
                </article>
              );
            })}
          </div>

          <div className="mt-3 rounded-2xl p-3 border" style={{ borderColor: Y.line, background: "#FAFAFB" }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: Y.text }}>예상 자산 리포트</p>
            <div className="flex items-end justify-between mt-2">
              <div>
                <p style={{ fontSize: 14, color: Y.muted }}>예상 포인트</p>
                <p style={{ fontSize: 18, color: Y.text, fontWeight: 900 }}>{expectedPoint.toLocaleString()}P</p>
              </div>
              <div className="text-right">
                <p style={{ fontSize: 14, color: Y.muted }}>예상 정복률</p>
                <p style={{ fontSize: 18, color: Y.text, fontWeight: 900 }}>{expectedConquestRate}%</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl p-4 border" style={{ background: Y.card, borderColor: Y.line }}>
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontSize: 14, fontWeight: 800, color: Y.pointText }}>Finalize</p>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: Y.text }} className="mt-0.5">
                여정 확정 및 전송
              </h2>
            </div>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: Y.point }}>
              <WandSparkles size={16} color={Y.text} />
            </div>
          </div>

          <p style={{ fontSize: 14, color: Y.muted }} className="mt-2">
            현재 편집 루틴을 저장하고 담깨비땅 실행 모드로 바로 넘길 수 있어요.
          </p>

          <div className="mt-3 rounded-2xl border p-3" style={{ borderColor: Y.line, background: "#FAFAFB" }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: Y.text }}>여행 날짜 지정</p>
            <input
              type="date"
              value={travelDate}
              onChange={(event) => setTravelDate(event.target.value)}
              className="w-full mt-2 h-10 px-3 rounded-xl border outline-none"
              style={{ borderColor: Y.line, fontSize: 14, color: Y.text, background: "#FFFFFF" }}
            />
          </div>

          <button
            onClick={handleFinalizePlan}
            className="w-full mt-3 h-12 rounded-2xl inline-flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            style={{ background: Y.point }}
          >
            <Sparkles size={15} color={Y.text} />
            <span style={{ fontSize: 15, fontWeight: 900, color: Y.text }}>여정 확정하기</span>
          </button>
        </section>
      </div>
    </div>
  );
}
