import { useCallback, useEffect, useMemo, useState } from "react";
import { StatusBar } from "./phone-frame";
import {
  BadgeCheck,
  BatteryLow,
  ChevronRight,
  MapPinned,
  Navigation,
  PackageCheck,
  Radar,
  Route,
  Share2,
  Sparkles,
  Trash2,
} from "lucide-react";
import damggaebiImg from "../../assets/damggaebiImg.png";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { getClonedRoutines } from "../clone-store";
import type { Routine } from "../content-data";
import { getCompletedPlans, removeCompletedPlan, type CompletedPlan } from "../completed-plan-store";
import {
  journeyMineSpots,
  journeyRecords,
  type JourneyRecord,
  provinceVisitSeed,
  type MineSpot,
  type ProvinceVisitSeed,
} from "../journey-data";
type ProvinceVisit = ProvinceVisitSeed;
type MapBridgeService = "kakao" | "naver" | "google";

type PocketSyncPlace = {
  id: string;
  order: number;
  name: string;
  lat: number;
  lng: number;
  moveTip: string;
  expectedMoveMinutes: number;
  benefit: boolean;
};

type PocketSyncCoupon = {
  id: string;
  title: string;
  code: string;
  barcodeBase64: string;
};

type PocketSyncPackage = {
  planId: string;
  title: string;
  region: string;
  travelDate: string;
  savedAt: string;
  places: PocketSyncPlace[];
  coupons: PocketSyncCoupon[];
};

type PocketSyncPackageMap = Record<string, PocketSyncPackage>;

const initialProvinceVisits: ProvinceVisit[] = provinceVisitSeed;
const mineSpots: MineSpot[] = journeyMineSpots;
const POCKET_SYNC_STORAGE_KEY = "itdam_pocket_sync_pack_v1";
const POWER_SAVER_STORAGE_KEY = "itdam_power_saver_mode_v1";
const DEFAULT_REGION_ANCHOR = { lat: 37.5665, lng: 126.978 };

const REGION_ANCHORS: Array<{ keyword: string; lat: number; lng: number }> = [
  { keyword: "전주", lat: 35.8242, lng: 127.148 },
  { keyword: "강릉", lat: 37.7519, lng: 128.8761 },
  { keyword: "제주", lat: 33.4996, lng: 126.5312 },
  { keyword: "부산", lat: 35.1796, lng: 129.0756 },
  { keyword: "여수", lat: 34.7604, lng: 127.6622 },
  { keyword: "경주", lat: 35.8562, lng: 129.2247 },
  { keyword: "거창", lat: 35.6866, lng: 127.9095 },
  { keyword: "서울", lat: 37.5665, lng: 126.978 },
];

const OFFLINE_MOVE_TIPS = [
  "신호 많은 구간은 한 블록 우회하면 이동이 빨라요.",
  "점심 피크 시간 전 이동하면 대기 시간을 줄일 수 있어요.",
  "주차장은 목적지 150m 전부터 미리 확인하면 좋아요.",
  "도보 구간은 횡단보도 밀집 코스를 우선으로 잡아주세요.",
];

const JOURNEY_RECORD_ROUTE_STOPS: Record<number, string[]> = {
  1: ["광안리 해변", "민락수변공원", "해운대 블루라인파크"],
  2: ["전주 한옥마을", "경기전", "남부시장 야시장"],
  3: ["대릉원", "동궁과 월지", "첨성대"],
};

function readPocketSyncPackages(): PocketSyncPackageMap {
  if (typeof window === "undefined") return {};
  const raw = window.localStorage.getItem(POCKET_SYNC_STORAGE_KEY);
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw) as PocketSyncPackageMap;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed;
  } catch {
    return {};
  }
}

function writePocketSyncPackages(next: PocketSyncPackageMap) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(POCKET_SYNC_STORAGE_KEY, JSON.stringify(next));
}

function readPowerSaverMode() {
  if (typeof window === "undefined") return true;
  const raw = window.localStorage.getItem(POWER_SAVER_STORAGE_KEY);
  if (raw === null) return true;
  return raw === "1";
}

function writePowerSaverMode(enabled: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(POWER_SAVER_STORAGE_KEY, enabled ? "1" : "0");
}

function safeBase64(value: string) {
  if (typeof window === "undefined") return "";
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return window.btoa(binary);
}

function toBarcodeBase64(code: string) {
  let x = 10;
  const bars: string[] = [];
  code.split("").forEach((char) => {
    const barCount = (char.charCodeAt(0) % 4) + 2;
    for (let i = 0; i < barCount; i += 1) {
      bars.push(`<rect x="${x}" y="8" width="2" height="26" rx="1" fill="#1F2A20" />`);
      x += 3;
    }
    x += 2;
  });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="56" viewBox="0 0 200 56"><rect width="200" height="56" fill="#FFFFFF"/><rect x="6" y="6" width="188" height="34" rx="4" fill="#F4F8F4" stroke="#D5E2D7"/>${bars.join("")}<text x="100" y="50" text-anchor="middle" font-size="10" font-family="Arial" fill="#334336">${code}</text></svg>`;
  return `data:image/svg+xml;base64,${safeBase64(svg)}`;
}

function resolveRegionAnchor(region: string) {
  return REGION_ANCHORS.find((item) => region.includes(item.keyword)) ?? DEFAULT_REGION_ANCHOR;
}

function stableSeed(value: string) {
  return value.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function resolvePlanStopNames(plan: CompletedPlan, clonedRoutines: Routine[]) {
  const fromPlan = (plan.plannedStops ?? [])
    .map((stop) => stop.name?.trim())
    .filter((name): name is string => Boolean(name));
  if (fromPlan.length > 0) {
    return fromPlan;
  }

  const fromCloned = clonedRoutines.find((routine) => routine.id === plan.sourceRoutineId);
  const baseNames = fromCloned?.stops.map((stop) => stop.name) ?? [];
  const requiredCount = Math.max(plan.totalStops, 2);

  if (baseNames.length >= requiredCount) {
    return baseNames.slice(0, requiredCount);
  }

  const next = [...baseNames];
  while (next.length < requiredCount) {
    next.push(`${plan.region} 여정 조각 ${next.length + 1}`);
  }
  return next;
}

function buildPocketSyncPackage(plan: CompletedPlan, clonedRoutines: Routine[]): PocketSyncPackage {
  const stopNames = resolvePlanStopNames(plan, clonedRoutines);
  const anchor = resolveRegionAnchor(plan.region);
  const seed = stableSeed(plan.id);
  const edgeCount = Math.max(stopNames.length - 1, 1);
  const movePerEdge = Math.max(8, Math.round((plan.totalMinutes * 0.35) / edgeCount));

  const places: PocketSyncPlace[] = stopNames.map((name, index) => {
    const angle = (Math.PI * 2 * (index + 1)) / (stopNames.length + 1);
    const jitter = ((seed + index * 17) % 7) * 0.0012;
    const lat = Number((anchor.lat + Math.cos(angle) * 0.018 + jitter).toFixed(6));
    const lng = Number((anchor.lng + Math.sin(angle) * 0.018 - jitter).toFixed(6));
    return {
      id: `${plan.id}-place-${index + 1}`,
      order: index + 1,
      name,
      lat,
      lng,
      moveTip: OFFLINE_MOVE_TIPS[index % OFFLINE_MOVE_TIPS.length],
      expectedMoveMinutes: index < stopNames.length - 1 ? movePerEdge : 0,
      benefit: index % 2 === 1,
    };
  });

  const coupons = places
    .filter((place) => place.benefit)
    .slice(0, 2)
    .map((place, index) => {
      const code = `ITDAM-${plan.id.slice(-4).toUpperCase()}-${index + 1}`;
      return {
        id: `${plan.id}-coupon-${index + 1}`,
        title: `${place.name} 제휴 쿠폰`,
        code,
        barcodeBase64: toBarcodeBase64(code),
      };
    });

  return {
    planId: plan.id,
    title: plan.title,
    region: plan.region,
    travelDate: plan.travelStartDate ?? plan.travelDate ?? plan.finalizedAt.slice(0, 10),
    savedAt: new Date().toISOString(),
    places,
    coupons,
  };
}

function buildMapBridgeUrl(service: MapBridgeService, pack: PocketSyncPackage, powerSaverMode: boolean) {
  const routeLabel = pack.places.map((place) => place.name).join(" > ");
  const start = pack.places[0];
  const end = pack.places[pack.places.length - 1];
  const waypoints = pack.places.slice(1, -1);
  const travelMode = powerSaverMode ? "walking" : "driving";

  if (service === "google") {
    const waypointQuery = waypoints.map((place) => `${place.lat},${place.lng}`).join("|");
    const base = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(`${start.lat},${start.lng}`)}&destination=${encodeURIComponent(`${end.lat},${end.lng}`)}&travelmode=${travelMode}`;
    return waypointQuery ? `${base}&waypoints=${encodeURIComponent(waypointQuery)}` : base;
  }

  if (service === "kakao") {
    return `https://map.kakao.com/?q=${encodeURIComponent(routeLabel)}`;
  }

  return `https://map.naver.com/v5/search/${encodeURIComponent(routeLabel)}`;
}

function bubbleRadius(count: number, maxCount: number) {
  if (maxCount <= 0) return 7;
  return 7 + (count / maxCount) * 12;
}

function formatMinutesToLabel(totalMinute: number) {
  const hour = Math.floor(totalMinute / 60);
  const minute = totalMinute % 60;
  if (hour === 0) return `${minute}분`;
  if (minute === 0) return `${hour}시간`;
  return `${hour}시간 ${minute}분`;
}

function formatDateLabel(isoDate: string) {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return parsed.toLocaleDateString("ko-KR");
}

function formatPlanDateRange(plan: CompletedPlan) {
  const start = plan.travelStartDate ?? plan.travelDate ?? plan.finalizedAt;
  const end = plan.travelEndDate ?? plan.travelDate ?? plan.finalizedAt;
  const startLabel = formatDateLabel(start);
  const endLabel = formatDateLabel(end);
  if (startLabel === endLabel) return startLabel;
  return `${startLabel} ~ ${endLabel}`;
}

function getJourneyRecordRouteStops(record: JourneyRecord) {
  return JOURNEY_RECORD_ROUTE_STOPS[record.id] ?? [];
}

function summarizeJourneyRecordRoute(record: JourneyRecord) {
  const stops = getJourneyRecordRouteStops(record);
  if (stops.length > 0) {
    return stops.join(" → ");
  }

  const highlights = record.tags.slice(0, 3);
  if (highlights.length === 0) {
    return `${record.region} 중심 동선`;
  }
  return `${record.region} · ${highlights.join(" · ")}`;
}

export function TravelSketchbook() {
  const G = {
    bg: "#F4F8F4",
    card: "#FFFFFF",
    text: "#1E2A1F",
    muted: "#6F7D70",
    line: "#E2ECE3",
    point: "#34C759",
    pointDeep: "#1FA84A",
    pointSoft: "#E7F9EC",
    fog: "rgba(18, 28, 19, 0.78)",
  };

  const [provinceVisits] = useState<ProvinceVisit[]>(initialProvinceVisits);
  const [minedIds, setMinedIds] = useState<string[]>([]);
  const [popupText, setPopupText] = useState<string | null>(null);
  const [completedPlans, setCompletedPlans] = useState<CompletedPlan[]>([]);
  const [pocketSyncPackages, setPocketSyncPackages] = useState<PocketSyncPackageMap>({});
  const [syncingPlanId, setSyncingPlanId] = useState<string | null>(null);
  const [successFlowPlanId, setSuccessFlowPlanId] = useState<string | null>(null);
  const [mapBridgePlanId, setMapBridgePlanId] = useState<string | null>(null);
  const [ticketPlanId, setTicketPlanId] = useState<string | null>(null);
  const [recordDetailId, setRecordDetailId] = useState<number | null>(null);
  const [openPlanAccordionId, setOpenPlanAccordionId] = useState<string | null>(null);
  const [powerSaverMode, setPowerSaverMode] = useState<boolean>(() => readPowerSaverMode());
  const [autoSyncedPlanIds, setAutoSyncedPlanIds] = useState<string[]>([]);
  const clonedRoutines = useMemo(() => getClonedRoutines(), [completedPlans.length]);

  useEffect(() => {
    if (!popupText) return;
    const timer = window.setTimeout(() => setPopupText(null), 1800);
    return () => window.clearTimeout(timer);
  }, [popupText]);

  useEffect(() => {
    setCompletedPlans(getCompletedPlans());
    setPocketSyncPackages(readPocketSyncPackages());
  }, []);

  useEffect(() => {
    writePowerSaverMode(powerSaverMode);
  }, [powerSaverMode]);

  const createPocketSyncPack = useCallback(
    (
      plan: CompletedPlan,
      options?: {
        showFlow?: boolean;
        onDone?: () => void;
      }
    ) => {
      if (syncingPlanId) return;
      setSyncingPlanId(plan.id);
      window.setTimeout(() => {
        const pack = buildPocketSyncPackage(plan, clonedRoutines);
        setPocketSyncPackages((prev) => {
          const next = { ...prev, [plan.id]: pack };
          writePocketSyncPackages(next);
          return next;
        });
        setSyncingPlanId(null);
        setPopupText("잇깨비가 여정 정보를 보따리에 꾹꾹 눌러 담았깨비! 인터넷이 없어도 꺼내 볼 수 있깨비!");
        if (options?.showFlow) {
          setSuccessFlowPlanId(plan.id);
        }
        options?.onDone?.();
      }, 360);
    },
    [clonedRoutines, syncingPlanId]
  );

  useEffect(() => {
    const newestPlan = completedPlans[0];
    if (!newestPlan) return;
    if (pocketSyncPackages[newestPlan.id]) return;
    if (autoSyncedPlanIds.includes(newestPlan.id)) return;
    const isRecent = Date.now() - new Date(newestPlan.finalizedAt).getTime() < 1000 * 60 * 8;
    if (!isRecent) return;
    setAutoSyncedPlanIds((prev) => [...prev, newestPlan.id]);
    createPocketSyncPack(newestPlan, { showFlow: true });
  }, [completedPlans, pocketSyncPackages, autoSyncedPlanIds, createPocketSyncPack]);

  const handleOpenMapBridge = (plan: CompletedPlan) => {
    if (pocketSyncPackages[plan.id]) {
      setMapBridgePlanId(plan.id);
      return;
    }
    createPocketSyncPack(plan, {
      showFlow: false,
      onDone: () => setMapBridgePlanId(plan.id),
    });
  };

  const activeMapBridgePack = mapBridgePlanId ? pocketSyncPackages[mapBridgePlanId] ?? null : null;
  const activeTicketPlan = ticketPlanId ? completedPlans.find((plan) => plan.id === ticketPlanId) ?? null : null;
  const activeTicketPack = ticketPlanId ? pocketSyncPackages[ticketPlanId] ?? null : null;
  const activeJourneyRecord: JourneyRecord | null = useMemo(
    () => journeyRecords.find((record) => record.id === recordDetailId) ?? null,
    [recordDetailId]
  );
  const activeJourneyRouteStops = useMemo(
    () => (activeJourneyRecord ? getJourneyRecordRouteStops(activeJourneyRecord) : []),
    [activeJourneyRecord]
  );
  const successFlowPlan = successFlowPlanId
    ? completedPlans.find((plan) => plan.id === successFlowPlanId) ?? null
    : null;

  const launchMapBridge = (service: MapBridgeService) => {
    if (!activeMapBridgePack) return;
    const targetUrl = buildMapBridgeUrl(service, activeMapBridgePack, powerSaverMode);
    window.open(targetUrl, "_blank", "noopener,noreferrer");
    setPopupText("길찾기가 막막할 땐 내가 길을 터주겠깨비!");
    setMapBridgePlanId(null);
  };

  const handleOpenFinalTicket = (plan: CompletedPlan) => {
    if (pocketSyncPackages[plan.id]) {
      setTicketPlanId(plan.id);
      return;
    }
    createPocketSyncPack(plan, {
      showFlow: false,
      onDone: () => setTicketPlanId(plan.id),
    });
  };

  const buildSharePayload = (plan: CompletedPlan) => {
    const pack = pocketSyncPackages[plan.id];
    const stopNames =
      pack?.places.length && pack.places.length > 0
        ? pack.places.map((place) => place.name)
        : resolvePlanStopNames(plan, clonedRoutines);
    const routeText = stopNames.slice(0, 6).join(" → ");
    const summary = `${plan.region} · ${plan.totalStops}개 장소 · ${formatMinutesToLabel(plan.totalMinutes)}`;
    const shareTitle = `${plan.title} | 잇담 여정`;
    const shareText = `${summary}\n루트: ${routeText}\n#잇담 #여정지도그리기`;
    const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/app/record` : "";
    const payloadText = `${shareTitle}\n${shareText}\n${shareUrl}`.trim();
    return { shareTitle, shareText, shareUrl, payloadText };
  };

  const handleSharePlan = async (plan: CompletedPlan) => {
    const { shareTitle, shareText, shareUrl, payloadText } = buildSharePayload(plan);

    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl || undefined,
        });
        setPopupText("여정을 공유했깨비! 친구에게도 루트를 보여줘요.");
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }

    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(payloadText);
        setPopupText("공유 문구를 복사했깨비! 원하는 곳에 붙여넣어 공유하세요.");
        return;
      } catch {
        // fall through to legacy copy
      }
    }

    if (typeof document !== "undefined") {
      const textarea = document.createElement("textarea");
      textarea.value = payloadText;
      textarea.setAttribute("readonly", "true");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
        setPopupText("공유 문구를 복사했깨비! 원하는 곳에 붙여넣어 공유하세요.");
      } catch {
        setPopupText("공유를 지원하지 않는 환경이에요. 잠시 후 다시 시도해주세요.");
      } finally {
        document.body.removeChild(textarea);
      }
      return;
    }

    setPopupText("공유를 지원하지 않는 환경이에요. 잠시 후 다시 시도해주세요.");
  };

  const visitedProvinceCount = useMemo(
    () => provinceVisits.filter((province) => province.visitCount > 0).length,
    [provinceVisits]
  );

  const conquestRate = useMemo(
    () => Math.round((visitedProvinceCount / provinceVisits.length) * 100),
    [visitedProvinceCount, provinceVisits.length]
  );

  const totalVisitCount = useMemo(
    () => provinceVisits.reduce((sum, province) => sum + province.visitCount, 0),
    [provinceVisits]
  );

  const maxVisitCount = useMemo(
    () => Math.max(...provinceVisits.map((province) => province.visitCount), 1),
    [provinceVisits]
  );

  const todayMinedCount = minedIds.length;
  const todayMinedPoint = minedIds.reduce((sum, id) => {
    const mine = mineSpots.find((spot) => spot.id === id);
    return sum + (mine?.point ?? 0);
  }, 0);

  const availableMines = useMemo(
    () =>
      mineSpots.filter((spot) => totalVisitCount >= spot.triggerVisitTotal),
    [totalVisitCount]
  );

  const routeDistanceKm = useMemo(
    () => Number((totalVisitCount * 0.37).toFixed(1)),
    [totalVisitCount]
  );

  const fogOpacity = useMemo(() => {
    const value = 0.68 - conquestRate * 0.005;
    return Math.max(0.18, Number(value.toFixed(2)));
  }, [conquestRate]);

  const handleMineClaim = (mine: MineSpot) => {
    if (minedIds.includes(mine.id)) return;
    setMinedIds((prev) => [...prev, mine.id]);
    setPopupText(`${mine.brand}: ${mine.reward}`);
  };

  const handleRemoveCompletedPlan = (planId: string) => {
    const next = removeCompletedPlan(planId);
    setCompletedPlans(next);
    setOpenPlanAccordionId((prev) => (prev === planId ? null : prev));
    setPocketSyncPackages((prev) => {
      const nextPack = { ...prev };
      delete nextPack[planId];
      writePocketSyncPackages(nextPack);
      return nextPack;
    });
  };

  return (
    <div className="min-h-full pb-8" style={{ background: G.bg }}>
      <div className="bg-[#2C2C2A] rounded-b-[30px] pb-5 shadow-[0_6px_20px_rgba(0,0,0,0.25)]">
        <StatusBar light />
        <div className="px-5 pt-1 flex items-start gap-3">
          <div className="flex-1">
            <h1 className="text-white" style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.2 }}>
              담깨비 <span style={{ color: "#34C759" }}>LAND</span>
            </h1>
            <p className="mt-1" style={{ fontSize: 14, fontWeight: 600, color: "#A6F1B7" }}>
              점유율과 기록을 한눈에 보는 정복 대시보드
            </p>
          </div>
          <img src={damggaebiImg} alt="담깨비" className="w-[50px] h-[50px] object-contain mt-1" />
        </div>

        <div className="px-4 mt-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-2xl border border-white/20 bg-white/8 backdrop-blur-sm px-3 py-2.5">
              <p className="text-white/60" style={{ fontSize: 14, fontWeight: 600 }}>
                정복률
              </p>
              <p className="text-white mt-1" style={{ fontSize: 24, fontWeight: 800 }}>
                {conquestRate}%
              </p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/8 backdrop-blur-sm px-3 py-2.5">
              <p className="text-white/60" style={{ fontSize: 14, fontWeight: 600 }}>
                총 방문
              </p>
              <p className="text-white mt-1" style={{ fontSize: 24, fontWeight: 800 }}>
                {totalVisitCount}
              </p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/8 backdrop-blur-sm px-3 py-2.5">
              <p className="text-white/60" style={{ fontSize: 14, fontWeight: 600 }}>
                오늘 채굴
              </p>
              <p className="text-white mt-1" style={{ fontSize: 24, fontWeight: 800 }}>
                {todayMinedCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        <section className="rounded-3xl p-4 border" style={{ background: G.card, borderColor: G.line }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: G.text }} className="mt-0.5">
                정복 일지
              </h2>
            </div>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: G.pointSoft }}>
              <Radar size={16} style={{ color: G.pointDeep }} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3">
            <div className="rounded-2xl p-3" style={{ background: "#F8FAF8" }}>
              <p style={{ fontSize: 14, color: G.muted }}>정복률</p>
              <p style={{ fontSize: 18, fontWeight: 900, color: G.text }} className="mt-0.5">
                {conquestRate}%
              </p>
            </div>
            <div className="rounded-2xl p-3" style={{ background: "#F8FAF8" }}>
              <p style={{ fontSize: 14, color: G.muted }}>총 방문 횟수</p>
              <p style={{ fontSize: 18, fontWeight: 900, color: G.text }} className="mt-0.5">
                {totalVisitCount}회
              </p>
            </div>
            <div className="rounded-2xl p-3" style={{ background: "#F8FAF8" }}>
              <p style={{ fontSize: 14, color: G.muted }}>오늘 채굴</p>
              <p style={{ fontSize: 18, fontWeight: 900, color: G.text }} className="mt-0.5">
                {todayMinedCount}개
              </p>
            </div>
          </div>

          <div className="mt-3 rounded-2xl border overflow-hidden" style={{ borderColor: G.line }}>
            <svg viewBox="0 0 320 240" className="w-full h-[214px] bg-[#F0F9F2]">
              <defs>
                <linearGradient id="heatFill" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7DEB95" />
                  <stop offset="100%" stopColor="#34C759" />
                </linearGradient>
              </defs>

              <rect x="0" y="0" width="320" height="240" fill="#E8F6EA" />

              <path
                d="M156 14 C127 27 106 53 100 80 C95 102 86 118 74 135 C66 147 64 160 69 176 C75 193 89 205 108 214 C126 222 145 227 161 229 C179 227 197 222 214 213 C233 202 247 188 252 171 C258 154 250 140 239 126 C229 113 223 100 217 81 C212 57 193 31 164 15 Z"
                fill="#D5EFD9"
                stroke="#B7DDBE"
                strokeWidth="1.2"
              />
              <ellipse
                cx="152"
                cy="220"
                rx="20"
                ry="7"
                fill="#D5EFD9"
                stroke="#B7DDBE"
                strokeWidth="1"
              />

              <path d="M118 92 Q160 84 206 100" fill="none" stroke="#C1E5C8" strokeWidth="1" />
              <path d="M108 128 Q156 120 214 138" fill="none" stroke="#C1E5C8" strokeWidth="1" />
              <path d="M104 164 Q154 152 210 172" fill="none" stroke="#C1E5C8" strokeWidth="1" />

              <rect x="0" y="0" width="320" height="240" fill={G.fog} opacity={fogOpacity} />

              {provinceVisits.map((province) => {
                const r = bubbleRadius(province.visitCount, maxVisitCount);
                const intensity = province.visitCount / maxVisitCount;
                return (
                  <g key={province.id}>
                    <circle
                      cx={province.x}
                      cy={province.y}
                      r={r}
                      fill="url(#heatFill)"
                      opacity={0.38 + intensity * 0.35}
                    />
                    <circle
                      cx={province.x}
                      cy={province.y}
                      r={r}
                      fill="none"
                      stroke="#1FA84A"
                      strokeWidth="1.4"
                      opacity={0.9}
                    />
                    <text
                      x={province.x}
                      y={province.y + 3}
                      textAnchor="middle"
                      style={{ fontSize: 14, fontWeight: 800, fill: "#124620" }}
                    >
                      {province.visitCount}
                    </text>
                    <text
                      x={province.x}
                      y={province.y - r - 5}
                      textAnchor="middle"
                      style={{ fontSize: 14, fontWeight: 700, fill: "#1D5D2D" }}
                    >
                      {province.name}
                    </text>
                  </g>
                );
              })}

              {availableMines.map((mine) => {
                const claimed = minedIds.includes(mine.id);
                return (
                  <g
                    key={mine.id}
                    style={{ cursor: claimed ? "default" : "pointer" }}
                    onClick={() => handleMineClaim(mine)}
                  >
                    <polygon
                      points={`${mine.x},${mine.y - 9} ${mine.x + 8},${mine.y} ${mine.x},${mine.y + 9} ${mine.x - 8},${mine.y}`}
                      fill={claimed ? "#B7C0B9" : "#F5C84B"}
                      stroke={claimed ? "#97A29A" : "#D89A00"}
                      strokeWidth="1.4"
                    />
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="flex items-center justify-between mt-3">
            <p style={{ fontSize: 14, color: G.muted }}>
              버블 크기 = 자치도별 방문 횟수 · 이동 {routeDistanceKm}km
            </p>
          </div>
        </section>

        <section className="rounded-3xl p-4 border" style={{ background: G.card, borderColor: G.line }}>
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontSize: 14, fontWeight: 800, color: G.pointDeep }}>플랜 완료건</p>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: G.text }} className="mt-0.5">
                여정 지도 그리기
              </h2>
            </div>
            <div className="h-7 px-2.5 rounded-lg inline-flex items-center" style={{ background: G.pointSoft }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: G.pointDeep }}>
                {completedPlans.length}건
              </span>
            </div>
          </div>

          {completedPlans.length === 0 ? (
            <div className="mt-3 rounded-2xl border border-dashed p-3" style={{ borderColor: G.line }}>
              <p style={{ fontSize: 14, color: G.muted }}>
                아직 확정된 플랜이 없어요. 잇깨비픽에서 여정을 확정하면 여기에 쌓입니다.
              </p>
            </div>
          ) : (
            <div className="space-y-2 mt-3">
              {completedPlans.map((plan) => {
                const pack = pocketSyncPackages[plan.id];
                const syncing = syncingPlanId === plan.id;
                const isOpen = openPlanAccordionId === plan.id;
                return (
                  <article
                    key={plan.id}
                    className="rounded-2xl border"
                    style={{ borderColor: G.line, background: "#FBFDFC" }}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setOpenPlanAccordionId((prev) => (prev === plan.id ? null : plan.id))
                      }
                      className="w-full px-3 py-3 flex items-center justify-between gap-2 text-left"
                    >
                      <p style={{ fontSize: 14, fontWeight: 800, color: G.text }} className="truncate">
                        {plan.title}
                      </p>
                      <ChevronRight
                        size={16}
                        className={`text-[#7C8B80] transition-transform shrink-0 ${isOpen ? "rotate-90" : ""}`}
                      />
                    </button>

                    {isOpen && (
                      <div className="px-3 pb-3 border-t" style={{ borderColor: G.line }}>
                        <div className="flex items-start justify-between gap-2 mt-2">
                          <div>
                            <p style={{ fontSize: 14, color: G.muted }}>
                              {plan.region} · {plan.totalStops}개 장소 · {formatMinutesToLabel(plan.totalMinutes)}
                            </p>
                            <p style={{ fontSize: 13, color: G.pointDeep, fontWeight: 700 }} className="mt-1">
                              {formatDateLabel(plan.finalizedAt)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveCompletedPlan(plan.id)}
                            className="h-7 w-7 rounded-lg inline-flex items-center justify-center"
                            style={{ background: "#F1F3F2", color: "#738078" }}
                            aria-label="확정 플랜 삭제"
                            title="삭제"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleOpenFinalTicket(plan)}
                          className="w-full mt-2 rounded-xl border px-3 py-2 text-left"
                          style={{ borderColor: "#D8EBDD", background: "#F4FAF6" }}
                        >
                          <p style={{ fontSize: 13, fontWeight: 800, color: G.pointDeep }}>
                            {plan.region} {Math.max(plan.tripDays ?? 1, 1)}일 여정 완성!
                          </p>
                          <p style={{ fontSize: 12, color: G.muted }} className="mt-0.5">
                            장소 순서 · 이동 수단 · 예상 혜택을 티켓으로 확인해보세요.
                          </p>
                          <p style={{ fontSize: 12, color: "#2D5FAF", fontWeight: 800 }} className="mt-1">
                            티켓 열어보기
                          </p>
                        </button>

                        {pack && (
                          <div className="mt-2 rounded-xl border p-2.5" style={{ borderColor: "#D8EBDD", background: "#F4FAF6" }}>
                            <p style={{ fontSize: 13, fontWeight: 800, color: G.pointDeep }}>
                              내 주머니 속 여정(Pocket Sync) 저장 완료
                            </p>
                            <p style={{ fontSize: 13, color: G.muted }} className="mt-1">
                              장소 {pack.places.length}곳 · 쿠폰 바코드 {pack.coupons.length}종 오프라인 보관
                            </p>
                            <div className="mt-1.5 flex items-center gap-1">
                              {pack.places.slice(0, 4).map((place, index) => (
                                <div key={place.id} className="flex items-center">
                                  <span
                                    className="w-5 h-5 rounded-full inline-flex items-center justify-center"
                                    style={{ background: "#DFF5E5", color: G.pointDeep, fontSize: 11, fontWeight: 900 }}
                                  >
                                    {index + 1}
                                  </span>
                                  {index < Math.min(pack.places.length, 4) - 1 && (
                                    <span className="w-3 h-[2px] mx-1 rounded-full" style={{ background: "#8ED7A0" }} />
                                  )}
                                </div>
                              ))}
                            </div>
                            <div className="mt-1.5 space-y-1">
                              {pack.places.slice(0, 2).map((place) => (
                                <p key={place.id} style={{ fontSize: 12, color: "#4E5F51", fontWeight: 700 }}>
                                  {place.order}. {place.name} · {place.moveTip}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <button
                            type="button"
                            disabled={syncing}
                            onClick={() => createPocketSyncPack(plan, { showFlow: true })}
                            className="h-9 rounded-xl inline-flex items-center justify-center gap-1.5 disabled:opacity-60"
                            style={{ background: "#E7F9EC", color: G.pointDeep, fontSize: 13, fontWeight: 800 }}
                          >
                            <PackageCheck size={14} />
                            {syncing ? "보따리 저장 중..." : "오프라인 저장"}
                          </button>
                          <button
                            type="button"
                            disabled
                            className="h-9 rounded-xl inline-flex items-center justify-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-70"
                            style={{ background: "#EEF3EF", color: "#7A8A7D", fontSize: 13, fontWeight: 800 }}
                          >
                            <MapPinned size={14} />
                            길안내 준비중
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            void handleSharePlan(plan);
                          }}
                          className="w-full mt-2 h-9 rounded-xl inline-flex items-center justify-center gap-1.5"
                          style={{ background: "#EAF1FF", color: "#2D5FAF", fontSize: 13, fontWeight: 800 }}
                        >
                          <Share2 size={14} />
                          여정 공유하기
                        </button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="rounded-3xl p-4 border" style={{ background: G.card, borderColor: G.line }}>
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontSize: 14, fontWeight: 800, color: G.pointDeep }}>여행 기록</p>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: G.text }} className="mt-0.5">
                보따리 담기
              </h2>
            </div>
            <div className="h-7 px-2.5 rounded-lg inline-flex items-center" style={{ background: G.pointSoft }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: G.pointDeep }}>
                {journeyRecords.length}개
              </span>
            </div>
          </div>

          <div className="space-y-2 mt-3">
            {journeyRecords.map((record) => (
              <button
                type="button"
                key={record.id}
                className="w-full rounded-2xl border overflow-hidden text-left"
                style={{ borderColor: G.line, background: "#FBFDFC" }}
                onClick={() => setRecordDetailId(record.id)}
              >
                <div className="h-[110px] relative">
                  <ImageWithFallback
                    src={record.image}
                    alt={record.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
                  <span
                    className="absolute top-2.5 left-2.5 px-2 py-1 rounded-lg bg-black/35 text-white"
                    style={{ fontSize: 14, fontWeight: 700 }}
                  >
                    {record.date} · {record.region}
                  </span>
                </div>
                <div className="p-3">
                  <p style={{ fontSize: 14, fontWeight: 800, color: G.text }}>{record.title}</p>
                  <p style={{ fontSize: 14, color: G.muted }} className="mt-0.5">
                    {record.memo}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-3xl p-4 border" style={{ background: G.card, borderColor: G.line }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: G.text }} className="mt-0.5">
                보물 찾기
              </h2>
            </div>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: G.pointSoft }}>
              <Sparkles size={16} style={{ color: G.pointDeep }} />
            </div>
          </div>

          <div className="space-y-2 mt-3">
            {availableMines.map((mine) => {
              const claimed = minedIds.includes(mine.id);
              return (
                <article
                  key={mine.id}
                  className="rounded-2xl p-3 border flex items-center justify-between"
                  style={{ borderColor: claimed ? "#C8D8CB" : G.line, background: claimed ? "#F0F4F1" : "#FBFDFC" }}
                >
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 800, color: G.text }}>{mine.brand}</p>
                    <p style={{ fontSize: 14, color: G.muted }} className="mt-0.5">
                      {mine.reward}
                    </p>
                  </div>
                  <button
                    disabled={claimed}
                    onClick={() => handleMineClaim(mine)}
                    className="h-8 px-3 rounded-lg disabled:opacity-55"
                    style={{
                      background: claimed ? "#DFE7E1" : G.pointSoft,
                      color: claimed ? "#7A8A7D" : G.pointDeep,
                      fontSize: 14,
                      fontWeight: 800,
                    }}
                  >
                    {claimed ? "수령 완료" : `채굴 +${mine.point}P`}
                  </button>
                </article>
              );
            })}
          </div>

          <div className="mt-3 h-9 px-3 rounded-xl inline-flex items-center gap-2" style={{ background: G.pointSoft }}>
            <BadgeCheck size={13} style={{ color: G.pointDeep }} />
            <span style={{ fontSize: 14, color: G.pointDeep, fontWeight: 800 }}>
              오늘 누적 채굴 포인트: {todayMinedPoint.toLocaleString()}P
            </span>
          </div>
        </section>
        
      </div>

      {successFlowPlan && (
        <div className="fixed inset-0 z-40 flex items-center justify-center px-3">
          <div className="relative w-full md:w-[92vw] md:max-w-[390px] h-[100dvh] md:h-[94dvh] md:max-h-[844px]">
            <div className="absolute inset-0 bg-black/35" />
            <div className="absolute inset-0 px-6 flex items-center justify-center">
              <div className="w-full max-w-[340px] rounded-2xl p-4 border" style={{ background: "#FFFFFF", borderColor: G.line }}>
                <p style={{ fontSize: 14, fontWeight: 900, color: G.text }}>
                  여정이 안전하게 저장됐깨비! 이제 밖으로 나가볼까요?
                </p>
                <p style={{ fontSize: 13, color: G.muted }} className="mt-1">
                  {successFlowPlan.title} 정보를 현장용 데이터 팩으로 저장했습니다.
                </p>
                <p style={{ fontSize: 13, color: G.pointDeep, fontWeight: 700 }} className="mt-2">
                  잇깨비가 여정 정보를 보따리에 꾹꾹 눌러 담았깨비! 인터넷이 없어도 꺼내 볼 수 있깨비!
                </p>

                <div className="grid gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => setSuccessFlowPlanId(null)}
                    className="h-10 rounded-xl inline-flex items-center justify-center gap-1.5"
                    style={{ background: "#E7F9EC", color: "#1A7C38", fontSize: 13, fontWeight: 800 }}
                  >
                    <Route size={14} />
                    바로 담깨비땅으로 가기
                  </button>
                  <button
                    type="button"
                    disabled
                    className="h-10 rounded-xl inline-flex items-center justify-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-70"
                    style={{ background: "#EEF3EF", color: "#7A8A7D", fontSize: 13, fontWeight: 800 }}
                  >
                    <Navigation size={14} />
                    네비게이션으로 실행 (준비중)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeMapBridgePack && (
        <div className="fixed inset-0 z-40 flex items-center justify-center px-3">
          <div className="relative w-full md:w-[92vw] md:max-w-[390px] h-[100dvh] md:h-[94dvh] md:max-h-[844px]">
            <div className="absolute inset-0 bg-black/35" />
            <div className="absolute inset-0 px-6 flex items-center justify-center">
              <div className="w-full max-w-[348px] rounded-2xl p-4 border" style={{ background: "#FFFFFF", borderColor: G.line }}>
                <p style={{ fontSize: 14, fontWeight: 900, color: G.text }}>
                  길찾기가 막막할 땐 내가 길을 터주겠깨비!
                </p>
                <p style={{ fontSize: 13, color: G.muted }} className="mt-1">
                  출발지부터 경유지, 도착지까지 포함한 경로를 원하는 맵으로 보낼 수 있어요.
                </p>
                <p style={{ fontSize: 13, color: G.pointDeep, fontWeight: 700 }} className="mt-2">
                  {activeMapBridgePack.places.map((place) => place.name).join(" → ")}
                </p>

                <div className="grid grid-cols-3 gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => launchMapBridge("kakao")}
                    className="h-9 rounded-xl border"
                    style={{ borderColor: "#F4D48A", background: "#FFF4C9", color: "#704A00", fontSize: 12, fontWeight: 900 }}
                  >
                    카카오맵
                  </button>
                  <button
                    type="button"
                    onClick={() => launchMapBridge("naver")}
                    className="h-9 rounded-xl border"
                    style={{ borderColor: "#BEEBC9", background: "#E7F9EC", color: "#1A7C38", fontSize: 12, fontWeight: 900 }}
                  >
                    네이버맵
                  </button>
                  <button
                    type="button"
                    onClick={() => launchMapBridge("google")}
                    className="h-9 rounded-xl border"
                    style={{ borderColor: "#CFE1FF", background: "#EAF1FF", color: "#2D5FAF", fontSize: 12, fontWeight: 900 }}
                  >
                    구글 지도
                  </button>
                </div>

                <div className="mt-3 rounded-xl border p-2.5" style={{ borderColor: "#E3ECE5", background: "#F8FBF9" }}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <BatteryLow size={13} color="#5D6E60" />
                      <p style={{ fontSize: 12, color: "#5D6E60", fontWeight: 700 }}>
                        외부 맵 사용 시 배터리 절약 모드
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPowerSaverMode((prev) => !prev)}
                      className="h-7 px-2 rounded-lg"
                      style={{
                        background: powerSaverMode ? "#DFF5E5" : "#E9EEF0",
                        color: powerSaverMode ? "#1A7C38" : "#607076",
                        fontSize: 12,
                        fontWeight: 800,
                      }}
                    >
                      {powerSaverMode ? "절전 ON" : "절전 OFF"}
                    </button>
                  </div>
                  <p style={{ fontSize: 12, color: G.muted }} className="mt-1">
                    트래킹 모드를 절전 중심으로 유지해 배터리 소모를 줄입니다.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setMapBridgePlanId(null)}
                  className="w-full mt-3 h-9 rounded-xl"
                  style={{ background: "#EEF3EF", color: "#4B5A4D", fontSize: 13, fontWeight: 800 }}
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTicketPlan && activeTicketPack && (
        <div className="fixed inset-0 z-40 flex items-center justify-center px-3">
          <div className="relative w-full md:w-[92vw] md:max-w-[390px] h-[100dvh] md:h-[94dvh] md:max-h-[844px]">
            <div className="absolute inset-0 bg-black/35" onClick={() => setTicketPlanId(null)} />
            <div
              className="absolute inset-x-0 bottom-0 rounded-t-[22px] border-t p-4 pb-6"
              style={{ background: "#FFFFFF", borderColor: G.line }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="w-12 h-1.5 rounded-full mx-auto" style={{ background: "#DDE6DF" }} />
              <div className="mt-3 rounded-2xl border px-3 py-3 relative overflow-hidden" style={{ borderColor: "#D8EBDD", background: "#F7FCF8" }}>
                <div
                  className="absolute left-0 right-0 bottom-0 h-2"
                  style={{
                    background:
                      "conic-gradient(from 135deg at 8px 0, transparent 90deg, rgba(205,233,214,0.95) 0) 0 0/16px 100%",
                  }}
                />

                <p style={{ fontSize: 14, fontWeight: 900, color: G.text }}>여정 확인 티켓</p>
                <p style={{ fontSize: 12, color: G.muted }} className="mt-0.5">
                  {activeTicketPlan.title} · {formatPlanDateRange(activeTicketPlan)}
                </p>

                <div className="mt-3 space-y-2">
                  {activeTicketPack.places.map((place, index) => (
                    <div key={place.id}>
                      <div className="rounded-xl border px-2.5 py-2" style={{ borderColor: "#E2ECE3", background: "#FFFFFF" }}>
                        <div className="flex items-center justify-between gap-2">
                          <p style={{ fontSize: 13, fontWeight: 800, color: G.text }}>
                            {place.order}. {place.name}
                          </p>
                          {place.benefit && (
                            <span
                              className="h-5 px-2 rounded-full inline-flex items-center"
                              style={{ background: "#E7F9EC", color: G.pointDeep, fontSize: 11, fontWeight: 900 }}
                            >
                              +120P
                            </span>
                          )}
                        </div>
                      </div>
                      {index < activeTicketPack.places.length - 1 && (
                        <div className="flex items-center gap-1.5 ml-2 mt-1.5">
                          <Navigation size={12} color="#1FA84A" />
                          <span style={{ fontSize: 12, color: G.muted, fontWeight: 700 }}>
                            이동 {place.expectedMoveMinutes}분
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-3 rounded-xl border px-2.5 py-2" style={{ borderColor: "#E2ECE3", background: "#FFFFFF" }}>
                  <p style={{ fontSize: 12, color: G.muted, fontWeight: 700 }}>
                    예상 혜택: 쿠폰 {activeTicketPack.coupons.length}종 · 포인트 +
                    {(activeTicketPack.places.filter((place) => place.benefit).length * 120).toLocaleString()}P
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setTicketPlanId(null)}
                className="w-full mt-3 h-10 rounded-xl"
                style={{ background: "#EEF3EF", color: "#4B5A4D", fontSize: 13, fontWeight: 800 }}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {activeJourneyRecord && (
        <div className="fixed inset-0 z-40 flex items-center justify-center px-3">
          <div className="relative w-full md:w-[92vw] md:max-w-[390px] h-[100dvh] md:h-[94dvh] md:max-h-[844px]">
            <div className="absolute inset-0 bg-black/35" onClick={() => setRecordDetailId(null)} />
            <div
              className="absolute inset-x-0 bottom-0 rounded-t-[22px] border-t p-4 pb-6"
              style={{ background: "#FFFFFF", borderColor: G.line }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="w-12 h-1.5 rounded-full mx-auto" style={{ background: "#DDE6DF" }} />

              <div className="mt-3 rounded-2xl border overflow-hidden" style={{ borderColor: "#D8EBDD", background: "#F7FCF8" }}>
                <div className="h-[132px] relative">
                  <ImageWithFallback
                    src={activeJourneyRecord.image}
                    alt={activeJourneyRecord.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <span
                    className="absolute top-2.5 left-2.5 px-2 py-1 rounded-lg bg-black/35 text-white"
                    style={{ fontSize: 12, fontWeight: 700 }}
                  >
                    {activeJourneyRecord.date} · {activeJourneyRecord.region}
                  </span>
                </div>

                <div className="p-3">
                  <p style={{ fontSize: 15, fontWeight: 900, color: G.text }}>{activeJourneyRecord.title}</p>
                  <p style={{ fontSize: 14, color: G.muted }} className="mt-1">
                    {activeJourneyRecord.memo}
                  </p>
                  <div className="mt-2 rounded-xl border px-2.5 py-2" style={{ borderColor: "#DCEDE2", background: "#FFFFFF" }}>
                    <div className="flex items-center gap-1.5">
                      <Route size={13} color={G.pointDeep} />
                      <p style={{ fontSize: 12, fontWeight: 800, color: G.pointDeep }}>루트 요약</p>
                    </div>
                    <p style={{ fontSize: 12, color: "#4E5F51", fontWeight: 700, lineHeight: 1.5 }} className="mt-1 break-words">
                      {summarizeJourneyRecordRoute(activeJourneyRecord)}
                    </p>
                    {activeJourneyRouteStops.length > 0 && (
                      <p style={{ fontSize: 11, color: G.muted, fontWeight: 700 }} className="mt-1">
                        방문지 {activeJourneyRouteStops.length}곳
                      </p>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {activeJourneyRecord.tags.map((tag) => (
                      <span
                        key={`${activeJourneyRecord.id}-${tag}`}
                        className="h-6 px-2 rounded-full inline-flex items-center"
                        style={{ background: "#E7F9EC", color: G.pointDeep, fontSize: 12, fontWeight: 800 }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setRecordDetailId(null)}
                className="w-full mt-3 h-10 rounded-xl"
                style={{ background: "#EEF3EF", color: "#4B5A4D", fontSize: 13, fontWeight: 800 }}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {popupText && (
        <div className="fixed inset-0 z-40 flex items-center justify-center px-3 pointer-events-none">
          <div className="relative w-full md:w-[92vw] md:max-w-[390px] h-[100dvh] md:h-[94dvh] md:max-h-[844px]">
            <div className="absolute left-1/2 -translate-x-1/2 bottom-[96px]">
              <div
                className="px-4 py-2 rounded-xl shadow-lg"
                style={{ background: "rgba(18, 28, 19, 0.92)", color: "#E7F9EC", fontSize: 14, fontWeight: 700 }}
              >
                {popupText}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
