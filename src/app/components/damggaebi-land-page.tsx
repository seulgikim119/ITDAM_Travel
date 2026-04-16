import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { StatusBar } from "./phone-frame";
import {
  BadgeCheck,
  CalendarClock,
  ChevronLeft,
  Clock3,
  MapPin,
  Radar,
  Sparkles,
} from "lucide-react";
import damggaebiImg from "../../assets/damggaebiImg.png";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { getCompletedPlans, type CompletedPlan } from "../completed-plan-store";
import {
  journeyMineSpots,
  journeyRecords,
  provinceVisitSeed,
  type MineSpot,
  type ProvinceVisitSeed,
} from "../journey-data";

type ProvinceVisit = ProvinceVisitSeed;

type AutoLogItem = {
  id: string;
  place: string;
  dwellMin: number;
  source: string;
  timeLabel: string;
};

const initialProvinceVisits: ProvinceVisit[] = provinceVisitSeed;
const mineSpots: MineSpot[] = journeyMineSpots;

function makeLog(regionName: string): AutoLogItem {
  const dwellMin = 16 + Math.floor(Math.random() * 34);
  return {
    id: `${regionName}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    place: `${regionName} 방문`,
    dwellMin,
    source: "GPS + 사진 메타데이터",
    timeLabel: "방금 전",
  };
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

export function TravelSketchbook() {
  const navigate = useNavigate();

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

  const [trackingEnabled, setTrackingEnabled] = useState(true);
  const [provinceVisits, setProvinceVisits] = useState<ProvinceVisit[]>(initialProvinceVisits);
  const [autoLogs, setAutoLogs] = useState<AutoLogItem[]>(() => {
    const fromRegions = initialProvinceVisits
      .slice(0, 2)
      .reverse()
      .map((province) => makeLog(province.name));
    const fromRecords = journeyRecords
      .slice(0, 2)
      .map((record) => ({
        id: `record-${record.id}`,
        place: `${record.region} 기록`,
        dwellMin: 24 + record.id * 5,
        source: "저장된 여정 데이터",
        timeLabel: "오늘",
      }));
    return [...fromRecords, ...fromRegions];
  });
  const [minedIds, setMinedIds] = useState<string[]>([]);
  const [popupText, setPopupText] = useState<string | null>(null);
  const [completedPlans, setCompletedPlans] = useState<CompletedPlan[]>([]);

  useEffect(() => {
    if (!trackingEnabled) return;

    const timer = window.setInterval(() => {
      setProvinceVisits((prev) => {
        const idx = Math.floor(Math.random() * prev.length);
        const next = prev.map((province, i) =>
          i === idx
            ? { ...province, visitCount: province.visitCount + 1 }
            : province
        );
        setAutoLogs((logs) => [makeLog(next[idx].name), ...logs].slice(0, 6));
        return next;
      });
    }, 2200);

    return () => window.clearInterval(timer);
  }, [trackingEnabled]);

  useEffect(() => {
    if (!popupText) return;
    const timer = window.setTimeout(() => setPopupText(null), 1800);
    return () => window.clearTimeout(timer);
  }, [popupText]);

  useEffect(() => {
    setCompletedPlans(getCompletedPlans());
  }, []);

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

  const totalStayMin = useMemo(
    () => autoLogs.reduce((sum, log) => sum + log.dwellMin, 0),
    [autoLogs]
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

  return (
    <div className="min-h-full pb-8" style={{ background: G.bg }}>
      <div className="bg-white border-b" style={{ borderColor: G.line }}>
        <StatusBar />
        <div className="px-5 pt-2 pb-4 flex items-start gap-3">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 mt-1">
            <ChevronLeft size={22} style={{ color: G.text }} />
          </button>
          <div className="flex-1">
            <div
              className="inline-flex items-center px-3 h-7 rounded-full mb-2"
              style={{ background: G.pointSoft }}
            >
              <span style={{ fontSize: 11, fontWeight: 800, color: G.pointDeep }}>담깨비땅</span>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: G.text, lineHeight: 1.22 }}>
              실시간 정복 대시보드
            </h1>
            <p style={{ fontSize: 13, color: G.muted }} className="mt-1">
              전국 지도에서 자치도별 방문 횟수를 비교하며 점유 현황을 확인해요.
            </p>
          </div>
          <img src={damggaebiImg} alt="담깨비" className="w-[50px] h-[50px] object-contain mt-1" />
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        <section className="rounded-3xl p-4 border" style={{ background: G.card, borderColor: G.line }}>
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontSize: 11, fontWeight: 800, color: G.pointDeep }}>1순위 · Fog of War</p>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: G.text }} className="mt-0.5">
                실시간 영토 점유
              </h2>
            </div>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: G.pointSoft }}>
              <Radar size={16} style={{ color: G.pointDeep }} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3">
            <div className="rounded-2xl p-3" style={{ background: "#F8FAF8" }}>
              <p style={{ fontSize: 11, color: G.muted }}>정복률</p>
              <p style={{ fontSize: 18, fontWeight: 900, color: G.text }} className="mt-0.5">
                {conquestRate}%
              </p>
            </div>
            <div className="rounded-2xl p-3" style={{ background: "#F8FAF8" }}>
              <p style={{ fontSize: 11, color: G.muted }}>총 방문 횟수</p>
              <p style={{ fontSize: 18, fontWeight: 900, color: G.text }} className="mt-0.5">
                {totalVisitCount}회
              </p>
            </div>
            <div className="rounded-2xl p-3" style={{ background: "#F8FAF8" }}>
              <p style={{ fontSize: 11, color: G.muted }}>오늘 채굴</p>
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
                      style={{ fontSize: 9, fontWeight: 800, fill: "#124620" }}
                    >
                      {province.visitCount}
                    </text>
                    <text
                      x={province.x}
                      y={province.y - r - 5}
                      textAnchor="middle"
                      style={{ fontSize: 8, fontWeight: 700, fill: "#1D5D2D" }}
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
            <p style={{ fontSize: 12, color: G.muted }}>
              버블 크기 = 자치도별 방문 횟수 · 이동 {routeDistanceKm}km · 체류 {totalStayMin}분
            </p>
            <button
              onClick={() => setTrackingEnabled((prev) => !prev)}
              className="h-8 px-3 rounded-lg"
              style={{
                background: trackingEnabled ? G.pointSoft : "#F1F3F2",
                color: trackingEnabled ? G.pointDeep : "#7A8A7D",
                fontSize: 11,
                fontWeight: 800,
              }}
            >
              {trackingEnabled ? "실시간 추적 ON" : "실시간 추적 OFF"}
            </button>
          </div>
        </section>

        <section className="rounded-3xl p-4 border" style={{ background: G.card, borderColor: G.line }}>
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontSize: 11, fontWeight: 800, color: G.pointDeep }}>2순위 · Auto-Log</p>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: G.text }} className="mt-0.5">
                패시브 여정 기록
              </h2>
            </div>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: G.pointSoft }}>
              <Clock3 size={16} style={{ color: G.pointDeep }} />
            </div>
          </div>

          <p style={{ fontSize: 12, color: G.muted }} className="mt-2">
            앱을 열지 않아도 GPS와 사진 데이터 기반으로 방문 장소와 체류 시간이 자동으로 기록됩니다.
          </p>

          <div className="space-y-2 mt-3">
            {autoLogs.map((log) => (
              <article
                key={log.id}
                className="rounded-2xl p-3 border flex items-center justify-between"
                style={{ borderColor: G.line, background: "#FBFDFC" }}
              >
                <div>
                  <p style={{ fontSize: 13, fontWeight: 800, color: G.text }}>{log.place}</p>
                  <p style={{ fontSize: 11, color: G.muted }} className="mt-0.5">
                    {log.source} · 체류 {log.dwellMin}분
                  </p>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: G.pointDeep }}>{log.timeLabel}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-3xl p-4 border" style={{ background: G.card, borderColor: G.line }}>
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontSize: 11, fontWeight: 800, color: G.pointDeep }}>여행 기록</p>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: G.text }} className="mt-0.5">
                사용자 기록 보관함
              </h2>
            </div>
            <div className="h-7 px-2.5 rounded-lg inline-flex items-center" style={{ background: G.pointSoft }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: G.pointDeep }}>
                {journeyRecords.length}개
              </span>
            </div>
          </div>

          <div className="space-y-2 mt-3">
            {journeyRecords.map((record) => (
              <article
                key={record.id}
                className="rounded-2xl border overflow-hidden"
                style={{ borderColor: G.line, background: "#FBFDFC" }}
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
                    style={{ fontSize: 11, fontWeight: 700 }}
                  >
                    {record.date} · {record.region}
                  </span>
                </div>
                <div className="p-3">
                  <p style={{ fontSize: 14, fontWeight: 800, color: G.text }}>{record.title}</p>
                  <p style={{ fontSize: 12, color: G.muted }} className="mt-0.5">
                    {record.memo}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-3xl p-4 border" style={{ background: G.card, borderColor: G.line }}>
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontSize: 11, fontWeight: 800, color: G.pointDeep }}>플랜 완료건</p>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: G.text }} className="mt-0.5">
                확정 플랜 내역
              </h2>
            </div>
            <div className="h-7 px-2.5 rounded-lg inline-flex items-center" style={{ background: G.pointSoft }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: G.pointDeep }}>
                {completedPlans.length}건
              </span>
            </div>
          </div>

          {completedPlans.length === 0 ? (
            <div className="mt-3 rounded-2xl border border-dashed p-3" style={{ borderColor: G.line }}>
              <p style={{ fontSize: 12, color: G.muted }}>
                아직 확정된 플랜이 없어요. 잇깨비픽에서 여정을 확정하면 여기에 쌓입니다.
              </p>
            </div>
          ) : (
            <div className="space-y-2 mt-3">
              {completedPlans.map((plan) => (
                <article
                  key={plan.id}
                  className="rounded-2xl p-3 border flex items-center justify-between"
                  style={{ borderColor: G.line, background: "#FBFDFC" }}
                >
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 800, color: G.text }}>{plan.title}</p>
                    <p style={{ fontSize: 11, color: G.muted }} className="mt-0.5">
                      {plan.region} · {plan.totalStops}개 장소 · {formatMinutesToLabel(plan.totalMinutes)}
                    </p>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: G.pointDeep }}>
                    {formatDateLabel(plan.finalizedAt)}
                  </span>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-3xl p-4 border" style={{ background: G.card, borderColor: G.line }}>
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontSize: 11, fontWeight: 800, color: G.pointDeep }}>3순위 · Mining</p>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: G.text }} className="mt-0.5">
                조각 채굴 및 혜택 팝업
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
                    <p style={{ fontSize: 12, fontWeight: 800, color: G.text }}>{mine.brand}</p>
                    <p style={{ fontSize: 12, color: G.muted }} className="mt-0.5">
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
                      fontSize: 11,
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
            <span style={{ fontSize: 12, color: G.pointDeep, fontWeight: 800 }}>
              오늘 누적 채굴 포인트: {todayMinedPoint.toLocaleString()}P
            </span>
          </div>
        </section>

        <section className="rounded-3xl p-4 border" style={{ background: G.card, borderColor: G.line }}>
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontSize: 11, fontWeight: 800, color: G.pointDeep }}>4순위 · Conquest Stats</p>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: G.text }} className="mt-0.5">
                정복 지표 모니터링
              </h2>
            </div>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: G.pointSoft }}>
              <CalendarClock size={16} style={{ color: G.pointDeep }} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3">
            <div className="rounded-2xl p-3" style={{ background: "#F8FAF8" }}>
              <p style={{ fontSize: 11, color: G.muted }}>정복률</p>
              <p style={{ fontSize: 18, fontWeight: 900, color: G.text }} className="mt-0.5">
                {conquestRate}%
              </p>
            </div>
            <div className="rounded-2xl p-3" style={{ background: "#F8FAF8" }}>
              <p style={{ fontSize: 11, color: G.muted }}>채굴 조각</p>
              <p style={{ fontSize: 18, fontWeight: 900, color: G.text }} className="mt-0.5">
                {todayMinedCount}개
              </p>
            </div>
            <div className="rounded-2xl p-3" style={{ background: "#F8FAF8" }}>
              <p style={{ fontSize: 11, color: G.muted }}>누적 포인트</p>
              <p style={{ fontSize: 18, fontWeight: 900, color: G.text }} className="mt-0.5">
                {todayMinedPoint}P
              </p>
            </div>
          </div>
        </section>
      </div>

      {popupText && (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-[96px] z-40">
          <div
            className="px-4 py-2 rounded-xl shadow-lg"
            style={{ background: "rgba(18, 28, 19, 0.92)", color: "#E7F9EC", fontSize: 12, fontWeight: 700 }}
          >
            {popupText}
          </div>
        </div>
      )}

      <div className="px-4 pt-4">
        <button
          onClick={() => navigate("/record-input")}
          className="w-full h-12 rounded-2xl text-white inline-flex items-center justify-center gap-2"
          style={{
            fontSize: 15,
            fontWeight: 900,
            background: `linear-gradient(135deg, ${G.point}, ${G.pointDeep})`,
          }}
        >
          <MapPin size={15} />
          자동 기록 확인하고 여정 확정하기
        </button>
      </div>
    </div>
  );
}
