import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Search, Link2, Sparkles, Check } from "lucide-react";
import { StatusBar } from "./phone-frame";
import damggaebiImg from "../../assets/damggaebiImg.png";
import itggaebiImg from "../../assets/itggaebiImg.png";
import {
  clearUserTasteProfile,
  saveUserTasteProfile,
  tasteOptions,
  type TastePreferenceId,
} from "../taste-store";

type Slide = {
  title: string;
  description: string;
};

const slides: Slide[] = [
  {
    title: "잇담에 오신 걸 환영해요",
    description: "장소와 여행을, 여행과 기록을\n이어주고 담아주는 여행 파트너",

  },
  {
    title: "여행의 점들이\n선으로 이어져요",
    description: "저장한 장소를 루트로 잇고 기록이\n쌓이면 취향까지 이어드려요",
  },
  {
    title: "여행이 나만의\n영토가 되어 담겨요",
    description: "다녀온 길을 자동으로 그려드릴게요.\n당신의 영토를 넓혀 나가보세요",
  },
];

const preferences = tasteOptions;

export function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selectedPrefs, setSelectedPrefs] = useState<TastePreferenceId[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [dotIndex, setDotIndex] = useState(0);
  const isPreferenceStep = step === slides.length;
  const selectedPreferenceItems = preferences
    .filter((pref) => selectedPrefs.includes(pref.id))
    .slice(0, 4);

  useEffect(() => {
    if (!isAnalyzing) return;

    const progressTimer = window.setInterval(() => {
      setAnalysisProgress((prev) => Math.min(100, prev + 5));
    }, 90);
    const dotTimer = window.setInterval(() => {
      setDotIndex((prev) => (prev + 1) % 3);
    }, 420);
    const finishTimer = window.setTimeout(() => {
      navigate("/app");
    }, 2300);

    return () => {
      window.clearInterval(progressTimer);
      window.clearInterval(dotTimer);
      window.clearTimeout(finishTimer);
    };
  }, [isAnalyzing, navigate]);

  const handleNext = () => {
    if (step < slides.length - 1) {
      setStep((prev) => prev + 1);
      return;
    }

    if (step === slides.length - 1) {
      setStep(slides.length);
      return;
    }

    navigate("/app");
  };

const MAX_PREFERENCES = 3;

const togglePreference = (id: TastePreferenceId) => {
  setSelectedPrefs((prev) => {
    if (prev.includes(id)) {
      return prev.filter((item) => item !== id);
    }
    if (prev.length >= MAX_PREFERENCES) {
      return prev; // 3개면 추가 막기
    }
    return [...prev, id];
  });
};


  const handleAnalyzeTaste = () => {
    if (selectedPrefs.length === 0) return;
    saveUserTasteProfile(selectedPrefs);
    setAnalysisProgress(12);
    setDotIndex(0);
    setIsAnalyzing(true);
  };

  const handleSkipPreference = () => {
    clearUserTasteProfile();
    navigate("/app");
  };

  const renderVisual = () => {
    if (step === 0) {
      return (
        <div className="flex items-end justify-center mb-8">
          <img src={itggaebiImg} alt="잇깨비" className="w-[110px] h-[118px] object-contain" />
          <img src={damggaebiImg} alt="담깨비" className="w-[110px] h-[112px] object-contain" />
        </div>
      );
    }

    if (step === 1) {
      return (
        <div className="w-full max-w-[310px] mb-8">
          <div className="h-[42px] rounded-xl bg-white/90 px-4 flex items-center gap-2 text-[#B5B5B5]">
            <Search size={10} />
            <span style={{ fontSize: 12, fontWeight: 500 }}>도시, 지역 검색</span>
          </div>

          <div className="flex justify-center mt-3">
            <img src={itggaebiImg} alt="잇깨비" className="w-[132px] h-[132px] object-contain" />
          </div>

          <div className="h-[38px] rounded-lg bg-[#F7F2E6] px-3 flex items-center gap-2 text-[#C1B6A1] mt-3">
            <Link2 size={10} />
            <span style={{ fontSize: 11, fontWeight: 500 }}>인스타/네이버 지도 URL 붙여넣기</span>
          </div>
        </div>
      );
    }

    return (
      <div className="flex justify-center mb-8">
        <img src={damggaebiImg} alt="담깨비" className="w-[130px] h-[130px] object-contain" />
      </div>
    );
  };

  if (isAnalyzing) {
    return (
      <div className="h-full flex flex-col bg-[#2C2C2A]">
        <StatusBar light />
        <div className="flex-1 px-6 flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-[290px] flex flex-col items-center"
          >
            <img src={itggaebiImg} alt="잇깨비" className="w-[100px] h-[100px] object-contain" />

            <div className="mt-4 px-4 h-8 rounded-full bg-[#F0C070]/16 border border-[#F0C070]/25 text-[#F0C070] flex items-center">
              <span style={{ fontSize: 12, fontWeight: 700 }}>맞춤 루트를 이어붙이는 중</span>
            </div>

            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {selectedPreferenceItems.map((pref) => (
                <div
                  key={pref.id}
                  className="h-9 px-3 rounded-full bg-[#F4E4C2]/14 border border-[#F0C070]/20 text-[#EAC582] flex items-center gap-1.5"
                >
                  <span style={{ fontSize: 13 }}>{pref.emoji}</span>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>{pref.label}</span>
                </div>
              ))}
            </div>

            <div className="w-full mt-8">
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${analysisProgress}%`,
                    background: "linear-gradient(90deg, #F0C070, #E8A830)",
                    transition: "width 180ms linear",
                  }}
                />
              </div>
              <p className="text-white/35 text-center mt-3" style={{ fontSize: 13, fontWeight: 600 }}>
                취향을 분석하고 있어요
              </p>
              <div className="flex justify-center gap-2 mt-4">
                {[0, 1, 2].map((idx) => (
                  <div
                    key={idx}
                    className={`rounded-full transition-all duration-200 ${
                      idx === dotIndex ? "w-2.5 h-2.5 bg-[#F0C070]" : "w-2 h-2 bg-white/25"
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (isPreferenceStep) {
    return (
      <div className="h-full flex flex-col bg-[#2C2C2A]">
        <StatusBar light />

        <div className="flex-1 px-6 pt-4 overflow-y-auto">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} className="text-[#F0C070]" />
            <span className="text-[#F0C070]" style={{ fontSize: 12, fontWeight: 700 }}>
              취향 선택
            </span>
          </div>

          <h1
            className="text-white whitespace-pre-line"
            style={{ fontSize: 24, fontWeight: 800, lineHeight: 1.35 }}
          >
            어떤 여행을
            {"\n"}
            좋아하세요?
          </h1>
          <p className="text-white/45 mt-2" style={{ fontSize: 14, lineHeight: 1.55 }}>
            취향을 최대 3개까지 선택하여 추천 루트를 받아보세요!
          </p>

          <div className="grid grid-cols-2 gap-2.5 mt-6">
            {preferences.map((pref) => {
              const selected = selectedPrefs.includes(pref.id);
              return (
                <button
                  key={pref.id}
                  onClick={() => togglePreference(pref.id)}
                  className={`h-[56px] rounded-2xl px-3 flex items-center gap-2.5 transition-all ${
                    selected
                      ? "bg-[#F0C070]/15 border border-[#F0C070]/50"
                      : "bg-white/5 border border-white/10"
                  }`}
                >
                  <span style={{ fontSize: 18 }}>{pref.emoji}</span>
                  <span
                    className={`flex-1 text-left ${selected ? "text-[#F0C070]" : "text-white/75"}`}
                    style={{ fontSize: 13, fontWeight: 600 }}
                  >
                    {pref.label}
                  </span>
                  {selected && (
                    <span className="w-4 h-4 rounded-full bg-[#F0C070] flex items-center justify-center">
                      <Check size={10} className="text-[#2C2C2A]" strokeWidth={3} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-6 pb-[34px] pt-4">
          <div className="flex justify-center gap-2 mb-4">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className={`rounded-full transition-all duration-300 ${
                  idx === 3 ? "w-6 h-2 bg-[#F0C070]" : "w-2 h-2 bg-white/20"
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleAnalyzeTaste}
            disabled={selectedPrefs.length === 0}
            className={`w-full h-[52px] rounded-2xl active:scale-[0.98] transition-all ${
              selectedPrefs.length > 0
                ? "text-[#2C2C2A]"
                : "bg-white/10 text-white/25"
            }`}
            style={{
              fontSize: 16,
              fontWeight: 700,
              ...(selectedPrefs.length > 0
                ? { background: "linear-gradient(135deg, #F0C070, #E8A830)" }
                : {}),
            }}
          >
            {selectedPrefs.length >= 3
              ? "선택 완료하고 시작하기"
              : selectedPrefs.length > 0
              ? `${3 - selectedPrefs.length}개 더 선택하면 좋아요`
              : "취향을 선택해주세요"}
          </button>
          <button
            onClick={handleSkipPreference}
            className="w-full mt-3 text-white/25 text-center"
            style={{ fontSize: 14, fontWeight: 600 }}
          >
            취향 없이 시작하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#2C2C2A]">
      <StatusBar light />

      <div className="flex-1 px-6 flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.25 }}
              className="w-full flex flex-col items-center text-center"
            >
              {renderVisual()}

              <h1
                className="text-white whitespace-pre-line"
                style={{ fontSize: 24, fontWeight: 800, lineHeight: 1.35 }}
              >
                {slides[step].title}
              </h1>

              <p
                className="text-white/40 whitespace-pre-line mt-4"
                style={{ fontSize: 14, lineHeight: 1.6, fontWeight: 500 }}
              >
                {slides[step].description}
              </p>

              <div className="flex justify-center gap-2 mt-8">
                {slides.map((_, idx) => (
                  <div
                    key={idx}
                    className={`rounded-full transition-all duration-300 ${
                      idx === step ? "w-6 h-2 bg-[#F0C070]" : "w-2 h-2 bg-white/20"
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="pb-[34px]">
          <button
            onClick={handleNext}
            className="w-full h-[52px] rounded-2xl text-[#2C2C2A] active:scale-[0.98] transition-transform"
            style={{
              fontSize: 16,
              fontWeight: 700,
              background: "linear-gradient(135deg, #F0C070, #E8A830)",
            }}
          >
            {step === 0 ? "시작하기" : "다음"}
          </button>
          <button
            onClick={() => navigate("/login", { state: { from: "/app/my" } })}
            className="w-full mt-3 h-[48px] rounded-2xl border border-[#F0C070]/45 text-[#F0C070]"
            style={{ fontSize: 14, fontWeight: 700 }}
          >
            로그인하고 시작하기
          </button>
          <button
            onClick={() => navigate("/app")}
            className="w-full mt-3 text-white/20 text-center"
            style={{ fontSize: 14, fontWeight: 600 }}
          >
            비로그인으로 시작하기
          </button>
        </div>
      </div>
    </div>
  );
}
