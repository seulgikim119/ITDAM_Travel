import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Sparkles, Save, Camera } from "lucide-react";
import { StatusBar } from "./phone-frame";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import damggaebiImg from "../../assets/damggaebiImg.png";

type Phase = "idle" | "analyzing" | "done";

export function RecordInput() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");

  const handleAnalyze = () => {
    setPhase("analyzing");
    window.setTimeout(() => setPhase("done"), 1200);
  };

  const canSave = title.trim().length > 0 || memo.trim().length > 0;

  return (
    <div className="h-full flex flex-col bg-[#F7FAF7]">
      <div className="bg-white border-b border-[#E9F0EA]">
        <StatusBar />
        <div className="flex items-center px-4 py-2">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-[#1F2C20]">
            <ArrowLeft size={22} />
          </button>
          <h2 className="flex-1 text-center -mr-6 text-[#1F2C20]" style={{ fontSize: 17, fontWeight: 700 }}>
            기록 입력
          </h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-5">
        <div className="rounded-2xl bg-white border border-[#E9F0EA] p-4">
          <div className="flex items-center gap-3">
            <ImageWithFallback src={damggaebiImg} alt="담깨비" className="w-10 h-10 object-contain" />
            <div>
              <p className="text-[#1F2C20]" style={{ fontSize: 14, fontWeight: 800 }}>
                담깨비 기록 가이드
              </p>
              <p className="text-[#5E6E60]" style={{ fontSize: 12 }}>
                여행의 순간을 짧게 남겨도 충분해요.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-white border border-[#E9F0EA] p-4">
          <label className="block text-[#1F2C20]" style={{ fontSize: 12, fontWeight: 700 }}>
            제목
          </label>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="예: 부산 밤바다 산책"
            className="mt-2 w-full h-11 px-3 rounded-xl border border-[#E3E8E3] outline-none"
            style={{ fontSize: 14 }}
          />

          <label className="block text-[#1F2C20] mt-4" style={{ fontSize: 12, fontWeight: 700 }}>
            메모
          </label>
          <textarea
            value={memo}
            onChange={(event) => setMemo(event.target.value)}
            placeholder="오늘 여행의 핵심 순간을 기록해보세요."
            className="mt-2 w-full h-[140px] p-3 rounded-xl border border-[#E3E8E3] outline-none resize-none"
            style={{ fontSize: 14, lineHeight: 1.5 }}
          />

          <button
            onClick={handleAnalyze}
            className="mt-3 w-full h-10 rounded-xl text-[#1F2C20] flex items-center justify-center gap-1.5"
            style={{ background: "linear-gradient(135deg, #F0C070, #E8A830)", fontSize: 13, fontWeight: 700 }}
          >
            <Sparkles size={14} />
            기록 요약 분석하기
          </button>
        </div>

        <div className="mt-4 rounded-2xl bg-white border border-[#E9F0EA] p-4">
          <button className="w-full h-12 rounded-xl border-2 border-dashed border-[#CFE1D1] text-[#5E6E60] inline-flex items-center justify-center gap-2">
            <Camera size={16} />
            사진 추가
          </button>
        </div>

        {phase !== "idle" && (
          <div className="mt-4 rounded-2xl border p-4" style={{ borderColor: "#D8EAD9", background: "#F3FAF3" }}>
            <p className="text-[#3E7D42]" style={{ fontSize: 12, fontWeight: 800 }}>
              {phase === "analyzing" ? "담깨비가 분석 중..." : "분석 완료"}
            </p>
            <p className="text-[#3D5C41] mt-1" style={{ fontSize: 13 }}>
              {phase === "analyzing"
                ? "기록 내용을 정리하고 추천 태그를 만들고 있어요."
                : "추천 태그: #야경 #도시산책 #감성루트"}
            </p>
          </div>
        )}
      </div>

      <div className="px-5 pb-[34px] pt-4">
        <button
          onClick={() => navigate("/app/record")}
          disabled={!canSave}
          className="w-full h-[52px] rounded-2xl text-white disabled:opacity-40"
          style={{
            fontSize: 16,
            fontWeight: 700,
            background: "linear-gradient(135deg, #6BAF6E, #3E7D42)",
          }}
        >
          <span className="inline-flex items-center gap-2">
            <Save size={15} />
            기록 저장하기
          </span>
        </button>
      </div>
    </div>
  );
}

