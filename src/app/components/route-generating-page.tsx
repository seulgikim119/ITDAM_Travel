import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { motion } from "motion/react";
import { Check, Loader2 } from "lucide-react";
import { StatusBar } from "./phone-frame";
import { Itgaebi } from "./itgaebi";

type GenerationStep = {
  label: string;
  delay: number;
};

type RouteGeneratingLocationState = {
  destination?: string;
};

type StepState = "done" | "active" | "pending";

const STEPS: GenerationStep[] = [
  { label: "맛집 데이터 확인 완료", delay: 800 },
  { label: "로드맵 스냅 정보 수집 완료", delay: 1800 },
  { label: "동선 최적화 중...", delay: 2800 },
];

const DEFAULT_DESTINATION = "여행";
const REDIRECT_DELAY_MS = 4000;
const REDIRECT_PATH = "/route-result";

const HEADER_TEXT = "루트 생성 중";
const BOT_MESSAGE = "루트를 다듬는 중";
const SUBTITLE_TEXT = "장소와 동선을 최적화하고 있어요";

function getStepState(done: boolean, isLast: boolean): StepState {
  if (done && !isLast) return "done";
  if (done && isLast) return "active";
  return "pending";
}

export function RouteGenerating() {
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = location.state as RouteGeneratingLocationState | null;
  const destination = routeState?.destination ?? DEFAULT_DESTINATION;
  const [completed, setCompleted] = useState<number[]>([]);

  const completedSet = useMemo(() => new Set(completed), [completed]);

  useEffect(() => {
    const timeoutIds: number[] = [];

    STEPS.forEach((step, index) => {
      const stepTimeoutId = window.setTimeout(() => {
        setCompleted((prev) => (prev.includes(index) ? prev : [...prev, index]));
      }, step.delay);
      timeoutIds.push(stepTimeoutId);
    });

    const redirectTimeoutId = window.setTimeout(() => {
      navigate(REDIRECT_PATH);
    }, REDIRECT_DELAY_MS);
    timeoutIds.push(redirectTimeoutId);

    return () => {
      timeoutIds.forEach((id) => window.clearTimeout(id));
    };
  }, [navigate]);

  return (
    <div className="h-full flex flex-col bg-[#2C2C2A]">
      <StatusBar light />
      <div className="flex items-center justify-center px-4 py-2">
        <span className="text-white/30" style={{ fontSize: 14 }}>
          {HEADER_TEXT}
        </span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div className="mb-6">
          <Itgaebi size={112} message={BOT_MESSAGE} />
        </div>

        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="w-16 h-16 rounded-full mb-10"
          style={{ border: "4px solid rgba(255,255,255,0.1)", borderTopColor: "#F0C070" }}
        />

        <h1 className="text-white text-center mb-2" style={{ fontSize: 22, fontWeight: 700 }}>
          {destination} 루트를
          <br />
          엮어붙이고 있어요
        </h1>
        <p className="text-[#E8A830] mb-10" style={{ fontSize: 14, fontWeight: 500 }}>
          {SUBTITLE_TEXT}
        </p>

        <div className="w-full space-y-4">
          {STEPS.map((step, index) => {
            const done = completedSet.has(index);
            const isLast = index === STEPS.length - 1;
            const stepState = getStepState(done, isLast);

            return (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: step.delay / 1000 - 0.3 }}
                className="flex items-center gap-3"
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    stepState === "done"
                      ? "bg-[#5DCAA5]/20"
                      : stepState === "active"
                        ? "bg-[#E8A830]/20"
                        : "bg-white/10"
                  }`}
                >
                  {stepState === "done" ? (
                    <Check size={14} className="text-[#5DCAA5]" />
                  ) : stepState === "pending" ? (
                    <Loader2 size={14} className="text-white/30 animate-spin" />
                  ) : (
                    <Loader2 size={14} className="text-[#E8A830] animate-spin" />
                  )}
                </div>
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 500,
                    color:
                      stepState === "done"
                        ? "#FFFFFF"
                        : stepState === "active"
                          ? "#E8A830"
                          : "rgba(255,255,255,0.3)",
                  }}
                >
                  {step.label}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
