import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowUpDown,
  Bike,
  CarFront,
  Check,
  ClipboardList,
  Footprints,
  Gift,
  GripVertical,
  Link2,
  MapPin,
  Navigation,
  Sparkles,
  TrainFront,
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
  kind: "base" | "suggested";
  sourceKey?: string;
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

type FlyingSuggestion = {
  id: number;
  label: string;
  category: SuggestionCategory;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  width: number;
  height: number;
  flying: boolean;
};

type TransportTheme = "균형" | "도보 중심" | "빠른 이동";
type TransportModeId = "walk" | "bike" | "transit" | "taxi";

type TransportOption = {
  id: TransportModeId;
  label: string;
  hint: string;
  score: number;
};

type SuggestionBenefitBadge = {
  label: string;
  strong?: boolean;
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
    kind: "base",
  },
  {
    id: "fallback-2",
    name: "추천 장소 2",
    duration: 70,
    tip: "주차가 혼잡해지기 전, 오전 시간대 방문을 추천해요.",
    memo: "이동 동선 연결",
    kind: "base",
  },
  {
    id: "fallback-3",
    name: "추천 장소 3",
    duration: 60,
    tip: "마감 1시간 전에는 입장 제한이 있을 수 있어요.",
    memo: "휴식 시간 체크",
    kind: "base",
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

const suggestionCategoryLabel: Record<SuggestionCategory, string> = {
  밥집: "밥집",
  카페: "카페",
  체험: "체험",
};

const suggestionBenefitBadgeMap: Partial<Record<RouteSuggestionTemplate["id"], SuggestionBenefitBadge>> = {
  "food-local": { label: "혜택있담! 💰" },
  "food-noodle": { label: "쿠폰있깨비! 🎫", strong: true },
  "cafe-break": { label: "1+1 ☕" },
  "cafe-dessert": { label: "쿠폰있깨비! 🎫", strong: true },
};

const transportThemeOptions: TransportTheme[] = ["균형", "도보 중심", "빠른 이동"];

function buildTransportOptions(distance: number, theme: TransportTheme): TransportOption[] {
  const baseScore: Record<TransportModeId, number> =
    distance < 3
      ? { walk: 95, bike: 72, transit: 58, taxi: 42 }
      : distance < 8
        ? { walk: 46, bike: 92, transit: 78, taxi: 66 }
        : { walk: 22, bike: 48, transit: 93, taxi: 88 };

  const themeWeight: Record<TransportTheme, Record<TransportModeId, number>> = {
    균형: { walk: 0, bike: 0, transit: 0, taxi: 0 },
    "도보 중심": { walk: 20, bike: 10, transit: -8, taxi: -12 },
    "빠른 이동": { walk: -15, bike: -6, transit: 16, taxi: 18 },
  };

  const modeMeta: Record<TransportModeId, { label: string; hint: string }> = {
    walk: { label: "도보", hint: "짧은 거리에서 유리해요" },
    bike: { label: "자전거", hint: "중거리 이동에 좋아요" },
    transit: { label: "대중교통", hint: "장거리/도심 구간에 적합해요" },
    taxi: { label: "택시/차량", hint: "시간 절약이 필요할 때 좋아요" },
  };

  return (Object.keys(modeMeta) as TransportModeId[])
    .map((modeId) => {
      const weightedScore = Math.min(99, Math.max(1, baseScore[modeId] + themeWeight[theme][modeId]));
      return {
        id: modeId,
        label: modeMeta[modeId].label,
        hint: modeMeta[modeId].hint,
        score: weightedScore,
      };
    })
    .sort((a, b) => b.score - a.score);
}

function getTransportMoveMultiplier(modeId: TransportModeId, distance: number) {
  if (modeId === "walk") {
    if (distance < 3) return 1;
    if (distance < 8) return 1.3;
    return 1.6;
  }
  if (modeId === "bike") {
    if (distance < 3) return 0.85;
    if (distance < 8) return 0.9;
    return 1.05;
  }
  if (modeId === "transit") {
    if (distance < 3) return 1.15;
    if (distance < 8) return 0.85;
    return 0.78;
  }
  if (distance < 3) return 1.08;
  if (distance < 8) return 0.8;
  return 0.68;
}

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
    kind: "base",
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

function toClockText(totalMinute: number) {
  const safe = Math.max(totalMinute, 0);
  const hour = Math.floor(safe / 60) % 24;
  const minute = safe % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
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
  const timelineDropAnchorRef = useRef<HTMLDivElement | null>(null);
  const [savedRoutines, setSavedRoutines] = useState<Routine[]>([]);
  const [activeRoutineId, setActiveRoutineId] = useState<string | null>(null);
  const [draftStops, setDraftStops] = useState<DraftStop[]>(fallbackStops);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(fallbackStops[0].id);
  const [reservedBenefitIds, setReservedBenefitIds] = useState<string[]>([]);
  const [addedSuggestionKeys, setAddedSuggestionKeys] = useState<string[]>([]);
  const [flyingSuggestion, setFlyingSuggestion] = useState<FlyingSuggestion | null>(null);
  const [travelDate, setTravelDate] = useState<string>(getTodayISODate());
  const [selectedTransportTheme, setSelectedTransportTheme] = useState<TransportTheme>("균형");
  const [selectedTransportModeId, setSelectedTransportModeId] = useState<TransportModeId | null>(null);

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
    setAddedSuggestionKeys([]);
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

  const savedMinutes = useMemo(() => {
    const routeOptimizeBonus = addedSuggestionKeys.length * 7;
    const timelineBonus = Math.max(0, draftStops.length - 3) * 2;
    return routeOptimizeBonus + timelineBonus;
  }, [addedSuggestionKeys.length, draftStops.length]);

  const transportOptions = useMemo(
    () => buildTransportOptions(estimatedDistance, selectedTransportTheme),
    [estimatedDistance, selectedTransportTheme]
  );

  useEffect(() => {
    if (transportOptions.length === 0) {
      setSelectedTransportModeId(null);
      return;
    }
    setSelectedTransportModeId((prev) =>
      prev && transportOptions.some((option) => option.id === prev) ? prev : transportOptions[0].id
    );
  }, [transportOptions]);

  const selectedTransportOption = useMemo(
    () => transportOptions.find((option) => option.id === selectedTransportModeId) ?? transportOptions[0] ?? null,
    [transportOptions, selectedTransportModeId]
  );

  const estimatedMoveMinutes = useMemo(() => {
    const edges = Math.max(draftStops.length - 1, 0);
    const baseMoveMinutes = edges * 18 + estimatedDistance * 4;
    const fallbackModeId: TransportModeId =
      estimatedDistance < 3 ? "walk" : estimatedDistance < 8 ? "bike" : "transit";
    const modeId = selectedTransportOption?.id ?? fallbackModeId;
    const multiplier = getTransportMoveMultiplier(modeId, estimatedDistance);
    return Math.max(Math.round(baseMoveMinutes * multiplier), edges * 8);
  }, [draftStops, estimatedDistance, selectedTransportOption?.id]);

  const estimatedTotalMinutes = totalStayMinutes + estimatedMoveMinutes;

  const ticketMoveMinutesByEdge = useMemo(() => {
    const edgeCount = Math.max(draftStops.length - 1, 0);
    if (edgeCount === 0) return [];
    const base = Math.floor(estimatedMoveMinutes / edgeCount);
    const remainder = estimatedMoveMinutes - base * edgeCount;
    return Array.from({ length: edgeCount }, (_, index) => base + (index < remainder ? 1 : 0));
  }, [draftStops.length, estimatedMoveMinutes]);

  const ticketTimelineRows = useMemo(() => {
    const dayStartMinute = 9 * 60;
    let cursor = dayStartMinute;
    return draftStops.map((stop, index) => {
      const arrivalMinute = cursor;
      cursor += stop.duration;
      const moveMinuteToNext = ticketMoveMinutesByEdge[index] ?? 0;
      cursor += moveMinuteToNext;
      return {
        stop,
        index,
        arrivalMinute,
        moveMinuteToNext,
        hasNext: index < draftStops.length - 1,
      };
    });
  }, [draftStops, ticketMoveMinutesByEdge]);

  const ticketMapStops = useMemo(() => draftStops.slice(0, 5), [draftStops]);

  const selectedTransportMeta = useMemo(() => {
    if (selectedTransportOption?.id === "walk") return { label: "도보", Icon: Footprints };
    if (selectedTransportOption?.id === "bike") return { label: "자전거", Icon: Bike };
    if (selectedTransportOption?.id === "transit") return { label: "대중교통", Icon: TrainFront };
    return { label: "택시/차량", Icon: CarFront };
  }, [selectedTransportOption?.id]);

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
    const baseStopsWithIndex = draftStops
      .map((stop, index) => ({ stop, index }))
      .filter(({ stop }) => stop.kind === "base");
    if (baseStopsWithIndex.length < 2) return [];

    return baseStopsWithIndex.slice(0, -1).map(({ stop: from }, index) => {
      const { stop: to, index: insertAt } = baseStopsWithIndex[index + 1];
      const segmentId = `${from.id}->${to.id}`;
      const picked = [0, 1, 2].map(
        (offset) => routeSuggestionTemplates[(index + offset) % routeSuggestionTemplates.length]
      );
      const suggestions = picked.map((template) => ({
        ...template,
        id: template.id,
      }));
      const selectedKeys = addedSuggestionKeys.filter((key) => key.startsWith(`${segmentId}:`));
      const selectedKey = selectedKeys[0] ?? null;
      return { segmentId, from, to, insertAt, suggestions, selectedKey, selectedKeys };
    });
  }, [draftStops, addedSuggestionKeys]);

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

  const maxSelectablePerSegment = 3;

  const handleAddSuggestionStop = (
    insertAt: number,
    segmentId: string,
    suggestion: RouteSuggestionTemplate,
    sourceElement?: HTMLElement | null
  ) => {
    const addKey = `${segmentId}:${suggestion.id}`;

    if (addedSuggestionKeys.includes(addKey)) {
      const removedStop = draftStops.find((stop) => stop.kind === "suggested" && stop.sourceKey === addKey);
      setDraftStops((prev) => prev.filter((stop) => !(stop.kind === "suggested" && stop.sourceKey === addKey)));
      setAddedSuggestionKeys((prev) => prev.filter((key) => key !== addKey));
      if (removedStop && selectedStopId === removedStop.id) {
        setSelectedStopId(null);
      }
      return;
    }

    const selectedCountInSegment = addedSuggestionKeys.filter((key) =>
      key.startsWith(`${segmentId}:`)
    ).length;
    if (selectedCountInSegment >= maxSelectablePerSegment) {
      return;
    }

    const fromRect = sourceElement?.getBoundingClientRect();
    const toRect = timelineDropAnchorRef.current?.getBoundingClientRect();
    if (fromRect && toRect) {
      const nextFlying: FlyingSuggestion = {
        id: Date.now(),
        label: suggestion.name,
        category: suggestion.category,
        fromX: fromRect.left,
        fromY: fromRect.top,
        toX: toRect.left + toRect.width / 2 - fromRect.width / 2,
        toY: toRect.top + toRect.height / 2 - fromRect.height / 2,
        width: fromRect.width,
        height: fromRect.height,
        flying: false,
      };
      setFlyingSuggestion(nextFlying);
      requestAnimationFrame(() => {
        setFlyingSuggestion((prev) => (prev ? { ...prev, flying: true } : prev));
      });
      window.setTimeout(() => {
        setFlyingSuggestion((prev) => (prev?.id === nextFlying.id ? null : prev));
      }, 540);
    }

    const insertedId = `suggest-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const insertedStop: DraftStop = {
      id: insertedId,
      name: `${suggestion.name}`,
      duration: suggestion.duration,
      tip: suggestion.tip,
      memo: suggestion.memo,
      kind: "suggested",
      sourceKey: addKey,
    };

    setDraftStops((prev) => {
      const next = [...prev];
      const safeInsertAt = Math.min(Math.max(insertAt, 0), next.length);
      next.splice(safeInsertAt, 0, insertedStop);
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
      plannedStops: draftStops.map((stop) => ({
        id: stop.id,
        name: stop.name,
        duration: stop.duration,
        memo: stop.memo,
        kind: stop.kind,
      })),
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

      <div className="px-4 pt-4 flex flex-col gap-4">
        <section className="rounded-3xl p-4 border order-1" style={{ background: Y.card, borderColor: Y.line }}>
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

        <section className="relative rounded-3xl p-4 border order-1" style={{ background: Y.card, borderColor: Y.line }}>
          <div
            ref={timelineDropAnchorRef}
            className="pointer-events-none absolute left-1/2 top-[86px] h-2 w-2 -translate-x-1/2"
          />
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontSize: 14, fontWeight: 800, color: Y.pointText }}>여정 다듬기</p>
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
              const suggestedStop = stop.kind === "suggested";
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
                    borderColor: active ? Y.pointDeep : suggestedStop ? "#EFD6A1" : "#E6E0D3",
                    background: active ? "#FFF4CF" : suggestedStop ? "#FFF7DF" : "#FFFDF2",
                    boxShadow: "0 8px 16px rgba(18,18,18,0.06)",
                    transform: `rotate(${idx % 2 === 0 ? "-0.45deg" : "0.45deg"})`,
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
                    {suggestedStop && (
                      <span
                        className="mt-1 h-5 px-2 rounded-full inline-flex items-center"
                        style={{ background: "#FFE8A7", color: "#8A5B00", fontSize: 12, fontWeight: 800 }}
                      >
                        PICK
                      </span>
                    )}
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

        <section className="rounded-3xl p-4 border order-2" style={{ background: Y.card, borderColor: Y.line }}>
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontSize: 14, fontWeight: 800, color: Y.pointText }}>잇깨비의 틈새 추천</p>
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
          <p style={{ fontSize: 14, color: Y.pointText, fontWeight: 700 }} className="mt-1">
            카드를 누르면 즉시 타임라인에 합쳐지고 스탬프 피드백이 표시돼요.
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
                      const added = segment.selectedKeys.includes(addKey);
                      const segmentLocked =
                        !added && segment.selectedKeys.length >= maxSelectablePerSegment;
                      const stampLabel = segmentIndex % 2 === 0 ? "PICK!" : "잇기 완료!";
                      const benefitBadge = suggestionBenefitBadgeMap[suggestion.id];
                      const strongBenefit = Boolean(benefitBadge?.strong);
                      return (
                        <div
                          key={suggestion.id}
                          role="button"
                          tabIndex={0}
                          onClick={(event) => {
                            if (segmentLocked) return;
                            handleAddSuggestionStop(
                              segment.insertAt,
                              segment.segmentId,
                              suggestion,
                              event.currentTarget
                            );
                          }}
                          onKeyDown={(event) => {
                            if (event.key !== "Enter" && event.key !== " ") return;
                            event.preventDefault();
                            if (segmentLocked) return;
                            handleAddSuggestionStop(
                              segment.insertAt,
                              segment.segmentId,
                              suggestion,
                              event.currentTarget as HTMLElement
                            );
                          }}
                          className="relative overflow-hidden rounded-xl border px-3 py-2.5 cursor-pointer transition-all"
                          style={{
                            borderColor: added
                              ? Y.pointDeep
                              : strongBenefit
                                ? "#E0BE72"
                                : segmentLocked
                                  ? "#DADDE2"
                                  : Y.line,
                            background: added
                              ? "#FFF7D8"
                              : strongBenefit
                                ? "linear-gradient(135deg, #FFFDF6 0%, #FFF6DB 72%, #FFF2CF 100%)"
                                : segmentLocked
                                  ? "#F4F6F8"
                                  : "#FFFFFF",
                            boxShadow: added
                              ? "0 0 0 1px rgba(232,168,48,0.4), 0 8px 20px rgba(240,192,112,0.2)"
                              : strongBenefit
                                ? "0 0 0 1px rgba(224,190,114,0.35), inset 0 0 0 1px rgba(255,247,214,0.62)"
                              : "none",
                            opacity: segmentLocked ? 0.56 : 1,
                          }}
                        >
                          {strongBenefit && (
                            <div
                              className="pointer-events-none absolute inset-0"
                              style={{
                                background:
                                  "linear-gradient(110deg, rgba(255,255,255,0.18) 0%, rgba(255,240,194,0.35) 36%, rgba(255,255,255,0.14) 72%)",
                              }}
                            />
                          )}
                          {benefitBadge && (
                            <div className="pointer-events-none absolute right-2 top-2 z-[2]">
                              <span
                                className="h-6 px-2 rounded-full inline-flex items-center gap-1 border"
                                style={{
                                  borderColor: strongBenefit ? "#E8B85A" : "#E8C374",
                                  background: strongBenefit ? "#FFE7A9" : "#FFFFFF",
                                  color: strongBenefit ? "#8A5B00" : "#9A6A16",
                                  fontSize: 11,
                                  fontWeight: 900,
                                }}
                              >
                                {strongBenefit && <Sparkles size={11} color="#8A5B00" />}
                                {benefitBadge.label}
                              </span>
                            </div>
                          )}
                          <div className="relative z-[1] flex items-center justify-between gap-2">
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
                                  {suggestionCategoryLabel[suggestion.category]}
                                </span>
                                <p style={{ fontSize: 14, fontWeight: 800, color: Y.text }} className="truncate">
                                  {suggestion.name}
                                </p>
                              </div>
                              <p style={{ fontSize: 14, color: Y.muted }} className="truncate mt-0.5">
                                {suggestion.desc} · {suggestion.duration}분
                              </p>
                            </div>

                            <div className="flex flex-col items-end justify-between gap-2">
                              <MapPin
                                size={16}
                                color={added ? Y.pointText : segmentLocked ? "#B4BAC2" : "#9AA0A6"}
                                fill={added ? Y.pointDeep : "transparent"}
                              />
                              <span
                                className="h-7 px-2 rounded-lg inline-flex items-center border"
                                style={{
                                  borderColor: added ? Y.pointDeep : segmentLocked ? "#DADDE2" : Y.line,
                                  background: added ? "#FFF1C7" : segmentLocked ? "#ECEFF2" : "#FFF8E9",
                                  color: added ? Y.pointText : segmentLocked ? "#8D949E" : "#916825",
                                  fontSize: 13,
                                  fontWeight: 800,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {added ? "합류 완료" : segmentLocked ? "선택 완료" : "탭해서 추가"}
                              </span>
                            </div>
                          </div>

                          {added && (
                            <>
                              <div
                                className="pointer-events-none absolute inset-0"
                                style={{
                                  background:
                                    "linear-gradient(115deg, rgba(255,247,214,0.2) 0%, rgba(240,192,112,0.18) 100%)",
                                }}
                              />
                              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                <span
                                  className="px-3 py-1 rounded-full border-2"
                                  style={{
                                    borderColor: "rgba(184,121,20,0.45)",
                                    color: "rgba(184,121,20,0.82)",
                                    background: "rgba(255,244,205,0.76)",
                                    transform: "rotate(-11deg)",
                                    fontSize: 13,
                                    fontWeight: 900,
                                    letterSpacing: 0.4,
                                    boxShadow: "0 0 22px rgba(232,168,48,0.32)",
                                  }}
                                >
                                  {stampLabel}
                                </span>
                              </div>
                            </>
                          )}
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

          <div className="mt-2 rounded-2xl border p-3" style={{ borderColor: Y.line, background: "#FAFAFB" }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: Y.text }}>이동 수단 테마</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {transportThemeOptions.map((theme) => {
                const active = theme === selectedTransportTheme;
                return (
                  <button
                    key={theme}
                    type="button"
                    onClick={() => setSelectedTransportTheme(theme)}
                    className="h-9 rounded-xl border transition-colors"
                    style={{
                      borderColor: active ? Y.pointDeep : Y.line,
                      background: active ? "#FFF1C7" : "#FFFFFF",
                      color: active ? Y.pointText : Y.text,
                      fontSize: 13,
                      fontWeight: 800,
                    }}
                  >
                    {theme}
                  </button>
                );
              })}
            </div>

            <div className="mt-2 space-y-2">
              {transportOptions.map((option) => {
                const active = option.id === selectedTransportOption?.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSelectedTransportModeId(option.id)}
                    className="w-full rounded-xl border px-3 py-2 text-left transition-colors"
                    style={{
                      borderColor: active ? Y.pointDeep : Y.line,
                      background: active ? "#FFF7D8" : "#FFFFFF",
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p style={{ fontSize: 14, fontWeight: 800, color: Y.text }}>{option.label}</p>
                      <span
                        className="h-6 px-2 rounded-lg inline-flex items-center"
                        style={{
                          background: active ? Y.pointSoft : "#F3F4F6",
                          color: active ? Y.pointText : Y.muted,
                          fontSize: 12,
                          fontWeight: 800,
                        }}
                      >
                        추천도 {option.score}%
                      </span>
                    </div>
                    <p style={{ fontSize: 13, color: Y.muted }} className="mt-0.5">
                      {option.hint}
                    </p>
                  </button>
                );
              })}
            </div>

            <div
              className="mt-2 h-9 px-3 rounded-xl inline-flex items-center gap-2"
              style={{ background: Y.pointSoft }}
            >
              <MapPin size={13} color={Y.pointText} />
              <span style={{ fontSize: 14, color: Y.pointText, fontWeight: 800 }}>
                이동 수단 추천: {selectedTransportOption?.label ?? "-"}
              </span>
            </div>
          </div>
        </section>

        <section
          className="rounded-3xl p-4 border order-3"
          style={{ background: Y.card, borderColor: Y.line, order: 7 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontSize: 14, fontWeight: 800, color: Y.pointText }}>오늘의 여정 티켓</p>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: Y.text }} className="mt-0.5">
                현재까지 완성된 길
              </h2>
            </div>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: Y.point }}>
              <ClipboardList size={16} color={Y.text} />
            </div>
          </div>

          <div
            className="mt-3 rounded-2xl border px-4 pt-4 pb-5 relative overflow-hidden"
            style={{
              borderColor: "#EEDAA6",
              background: "linear-gradient(180deg, #FFF8E8 0%, #FFF3D0 58%, #FFE9B8 100%)",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.4)",
            }}
          >
            <div
              className="absolute left-0 right-0 top-0 h-2 opacity-40"
              style={{
                background:
                  "repeating-linear-gradient(90deg, rgba(226,176,75,0.5) 0 10px, rgba(255,250,236,0.35) 10px 20px)",
              }}
            />
            <div
              className="absolute left-0 right-0 bottom-0 h-3"
              style={{
                background:
                  "conic-gradient(from 135deg at 8px 0, transparent 90deg, rgba(245,208,132,0.95) 0) 0 0/16px 100%",
              }}
            />

            <p style={{ fontSize: 17, fontWeight: 900, color: "#7B4D07" }} className="mt-1">
              기획은 끝, 이제 즐길 시간!
            </p>
            <p style={{ fontSize: 13, color: "#8A6B36", fontWeight: 700 }} className="mt-1">
              단 하나의 티켓으로 오늘 여정을 최종 확인해요.
            </p>

            <div className="mt-3 rounded-xl border px-3 py-3" style={{ borderColor: "#E8D3A1", background: "#FFFBEF" }}>
              <p style={{ fontSize: 13, fontWeight: 800, color: "#8A5B00" }}>전체 루트 미니맵</p>
              <div className="mt-2 flex items-start gap-1">
                {ticketMapStops.map((stop, index) => (
                  <div key={stop.id} className="flex items-center flex-1 min-w-0">
                    <div className="flex flex-col items-center min-w-0">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center border"
                        style={{ borderColor: "#D6A24A", background: "#FFE9B9" }}
                      >
                        <span style={{ fontSize: 12, fontWeight: 900, color: "#7B4D07" }}>{index + 1}</span>
                      </div>
                      <p
                        className="mt-1 truncate text-center max-w-[64px]"
                        style={{ fontSize: 11, color: "#8A6B36", fontWeight: 700 }}
                        title={stop.name}
                      >
                        {stop.name}
                      </p>
                    </div>
                    {index < ticketMapStops.length - 1 && (
                      <div className="flex-1 h-[3px] rounded-full mx-1 mt-3" style={{ background: "#F0C070" }} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 rounded-xl border px-3 py-3" style={{ borderColor: "#E8D3A1", background: "#FFFCF3" }}>
              <p style={{ fontSize: 13, fontWeight: 800, color: "#8A5B00" }}>장소 조각 Final Check-list</p>
              <div className="mt-2 space-y-2">
                {ticketTimelineRows.map((row, index) => {
                  const rewardLabel = index % 2 === 0 ? "SAVE" : "+120P";
                  const TransportIcon = selectedTransportMeta.Icon;
                  return (
                    <div key={row.stop.id}>
                      <div className="rounded-lg border px-2.5 py-2" style={{ borderColor: "#EFDEBA", background: "#FFFFFF" }}>
                        <div className="flex items-center justify-between gap-2">
                          <p style={{ fontSize: 13, fontWeight: 800, color: "#433315" }}>{row.stop.name}</p>
                          <span style={{ fontSize: 12, fontWeight: 800, color: "#8A6B36" }}>
                            {toClockText(row.arrivalMinute)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2 mt-1">
                          <p style={{ fontSize: 12, color: "#8A6B36", fontWeight: 700 }}>
                            체류 {row.stop.duration}분
                          </p>
                          {row.stop.kind === "suggested" && (
                            <span
                              className="h-5 px-2 rounded-full inline-flex items-center"
                              style={{ background: "#FFE8A7", color: "#8A5B00", fontSize: 11, fontWeight: 900 }}
                            >
                              {rewardLabel}
                            </span>
                          )}
                        </div>
                      </div>

                      {row.hasNext && (
                        <div className="flex items-center gap-1.5 ml-2 mt-1.5">
                          <TransportIcon size={12} color="#A06B15" />
                          <span style={{ fontSize: 11, color: "#8A6B36", fontWeight: 700 }}>
                            {selectedTransportMeta.label} · 약 {toHourMinute(row.moveMinuteToNext)}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-3 rounded-xl border px-3 py-3" style={{ borderColor: "#E8D3A1", background: "#FFFBEF" }}>
              <p style={{ fontSize: 13, fontWeight: 800, color: "#8A5B00" }}>자산 예측 리포트</p>
              <p style={{ fontSize: 12, color: "#8A6B36", fontWeight: 700 }} className="mt-1">
                예상 자산: 총 {expectedPoint.toLocaleString()}P 및 쿠폰 {reservedBenefits.length}종 채굴 예정
              </p>
              <p style={{ fontSize: 12, color: "#8A6B36", fontWeight: 700 }} className="mt-1">
                예상 정복률: {activeRoutine?.region ?? "선택 지역"} 영토 {expectedConquestRate}% 정복 예정
              </p>
              <p style={{ fontSize: 12, color: "#8A6B36", fontWeight: 700 }} className="mt-1">
                세이브 시간: 잇깨비 동선으로 총 {savedMinutes}분 절약!
              </p>
            </div>
          </div>
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
            type="button"
            onClick={handleFinalizePlan}
            className="w-full mt-3 h-11 rounded-2xl inline-flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            style={{ background: Y.point }}
          >
            <Navigation size={15} color={Y.text} />
            <span style={{ fontSize: 15, fontWeight: 900, color: Y.text }}>지도에 그리기</span>
          </button>
        </section>

        <section className="rounded-3xl p-4 border order-5" style={{ background: Y.card, borderColor: Y.line }}>
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
      </div>

      {flyingSuggestion && (
        <div
          className="pointer-events-none fixed z-[70] rounded-xl border px-3 py-2.5 flex items-center justify-between gap-2"
          style={{
            left: flyingSuggestion.fromX,
            top: flyingSuggestion.fromY,
            width: flyingSuggestion.width,
            minHeight: flyingSuggestion.height,
            borderColor: Y.pointDeep,
            background: "#FFF7D8",
            boxShadow: "0 10px 24px rgba(0,0,0,0.16)",
            transform: flyingSuggestion.flying
              ? `translate(${flyingSuggestion.toX - flyingSuggestion.fromX}px, ${
                  flyingSuggestion.toY - flyingSuggestion.fromY
                }px) scale(0.72)`
              : "translate(0, 0) scale(1)",
            opacity: flyingSuggestion.flying ? 0.15 : 1,
            transition: "transform 540ms cubic-bezier(0.16, 1, 0.3, 1), opacity 540ms ease",
          }}
        >
          <span
            className="h-5 px-2 rounded-full inline-flex items-center"
            style={{
              background: suggestionTone[flyingSuggestion.category].bg,
              color: suggestionTone[flyingSuggestion.category].text,
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            {suggestionCategoryLabel[flyingSuggestion.category]}
          </span>
          <span style={{ fontSize: 13, color: Y.text, fontWeight: 800 }} className="truncate">
            {flyingSuggestion.label}
          </span>
        </div>
      )}
    </div>
  );
}


