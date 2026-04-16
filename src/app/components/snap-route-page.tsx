import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { StatusBar } from "./phone-frame";
import { ArrowLeft, Link2, Camera, Clock, Navigation, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Itgaebi } from "./itgaebi";

type AnalysisState = "idle" | "analyzing" | "done";

export function SnapRoute() {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [analysisState, setAnalysisState] = useState<AnalysisState>("idle");
  const [progress, setProgress] = useState(0);

  const handlePaste = () => {
    setUrl("https://naver.me/xR3kAb2c");
    startAnalysis();
  };

  const startAnalysis = () => {
    setAnalysisState("analyzing");
    setProgress(0);
  };

  useEffect(() => {
    if (analysisState !== "analyzing") return;
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setAnalysisState("done");
          return 100;
        }
        return p + 4;
      });
    }, 80);
    return () => clearInterval(interval);
  }, [analysisState]);

  return (
    <div className="h-full flex flex-col bg-[#FFF8E7]">
      <div className="bg-white">
        <StatusBar />
        <div className="flex items-center px-4 py-2">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-[#2C2C2A]">
            <ArrowLeft size={22} strokeWidth={1.8} />
          </button>
          <h2 className="flex-1 text-center text-[#2C2C2A] -mr-6" style={{ fontSize: 17, fontWeight: 600 }}>
            스냅 루트
          </h2>
        </div>
      </div>

      <div className="flex-1 px-5 pt-5 overflow-y-auto">
        <h1 className="text-[#2C2C2A] mb-1" style={{ fontSize: 22, fontWeight: 700 }}>
          링크 하나로
          <br />
          루트를 뽑아드려요
        </h1>
        <p className="text-[#8E8E93] mb-6" style={{ fontSize: 14 }}>
          URL이나 스크린샷으로 장소를 자동 추출해요
        </p>

        <div className="bg-white rounded-2xl p-4 shadow-sm mb-3">
          <div className="flex items-center gap-3 bg-[#FFF8E7] rounded-xl px-4 h-[48px] border border-transparent focus-within:border-[#F0C070]/30 transition-colors">
            <Link2 size={18} className="text-[#8E8E93]" />
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="인스타/네이버 지도 URL 붙여넣기"
              className="flex-1 bg-transparent outline-none text-[#2C2C2A] placeholder:text-[#C7C7CC]"
              style={{ fontSize: 14 }}
            />
          </div>
          <button
            onClick={handlePaste}
            className="w-full mt-3 h-[44px] rounded-xl bg-[#F0C070] text-[#2C2C2A] flex items-center justify-center gap-2 active:scale-[0.97] transition-transform"
            style={{ fontSize: 14, fontWeight: 600 }}
          >
            <Link2 size={15} />
            URL 분석하기
          </button>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm mb-5">
          <button className="w-full h-[64px] rounded-xl border-2 border-dashed border-[#F0E6D0] flex items-center justify-center gap-3 text-[#8E8E93] hover:border-[#F0C070]/50 hover:text-[#E8A830] transition-colors">
            <Camera size={20} />
            <span style={{ fontSize: 14, fontWeight: 500 }}>스크린샷 업로드</span>
          </button>
        </div>

        <AnimatePresence mode="wait">
          {analysisState === "analyzing" && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-2xl p-5 shadow-sm mb-4"
            >
              <div className="flex items-center gap-3 mb-4">
                <Itgaebi size={72} />
                <div>
                  <p className="text-[#2C2C2A]" style={{ fontSize: 15, fontWeight: 600 }}>
                    잇깨비가 분석 중...
                  </p>
                  <p className="text-[#8E8E93]" style={{ fontSize: 12 }}>
                    링크에서 장소와 동선을 추출하고 있어요
                  </p>
                </div>
              </div>
              <div className="h-[6px] bg-[#FFF8E7] rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, #F0C070, #E8A830)" }}
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              <p className="text-[#8E8E93] text-right mt-1" style={{ fontSize: 11 }}>
                {progress}%
              </p>
            </motion.div>
          )}

          {analysisState === "done" && (
            <motion.div key="done" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              <div className="bg-[#5DCAA5]/10 rounded-2xl p-4 border border-[#5DCAA5]/20">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 size={18} className="text-[#5DCAA5]" />
                  <span className="text-[#5DCAA5]" style={{ fontSize: 14, fontWeight: 600 }}>
                    분석 완료
                  </span>
                </div>
                <p className="text-[#2C2C2A]" style={{ fontSize: 13 }}>
                  3개의 장소가 자동으로 추출됐어요
                </p>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Clock size={14} className="text-[#E8A830]" />
                  <span className="text-[#E8A830]" style={{ fontSize: 13, fontWeight: 600 }}>
                    기획 시간 70분 절감
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <Navigation size={14} className="text-[#F0C070]" />
                  <span className="text-[#2C2C2A]" style={{ fontSize: 13, fontWeight: 600 }}>
                    최적 경로: 한옥마을 → 경기전 → 남부시장
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {["한옥마을", "경기전", "남부시장"].map((place, i) => (
                    <div key={place} className="flex items-center gap-1">
                      <div className="px-3 py-1.5 rounded-lg bg-[#FFF8E7]">
                        <span className="text-[#2C2C2A]" style={{ fontSize: 12, fontWeight: 500 }}>
                          {place}
                        </span>
                      </div>
                      {i < 2 && (
                        <div className="w-4 h-[2px] rounded-full" style={{ background: "linear-gradient(90deg, #F0C070, #E8A830)" }} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => navigate("/route-result")}
                className="w-full h-[48px] rounded-2xl text-[#2C2C2A] flex items-center justify-center gap-2 active:scale-[0.97] transition-transform"
                style={{ fontSize: 15, fontWeight: 600, background: "linear-gradient(135deg, #F0C070, #E8A830)" }}
              >
                내 루트로 가져오기
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
