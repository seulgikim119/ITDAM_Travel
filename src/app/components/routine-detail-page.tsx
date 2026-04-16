import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, BookmarkPlus, Clock3, Coins, MapPinned } from "lucide-react";
import { StatusBar } from "./phone-frame";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { cloneRoutine, isRoutineCloned } from "../clone-store";
import { getRoutineById } from "../content-data";

export function RoutineDetail() {
  const navigate = useNavigate();
  const { routineId } = useParams();
  const routine = useMemo(
    () => (routineId ? getRoutineById(routineId) : undefined),
    [routineId]
  );
  const [isCloned, setIsCloned] = useState(
    routineId ? isRoutineCloned(routineId) : false
  );

  if (!routine) {
    return (
      <div className="h-full flex flex-col bg-[#F5F6FA]">
        <StatusBar />
        <div className="px-5 py-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-[#4E5968]">
            <ArrowLeft size={18} />
            뒤로
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center px-6">
          <p className="text-[#6B7684]" style={{ fontSize: 14, fontWeight: 600 }}>
            요청한 루틴을 찾지 못했어요.
          </p>
        </div>
      </div>
    );
  }

  const handleClone = () => {
    cloneRoutine(routine);
    setIsCloned(true);
    navigate("/app/saved");
  };

  return (
    <div className="min-h-full bg-[#F5F6FA] pb-5">
      <div className="bg-white border-b border-[#EEF0F4]">
        <StatusBar />
        <div className="px-4 py-2 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-[#F2F4F6] flex items-center justify-center text-[#191F28]">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-[#191F28]" style={{ fontSize: 16, fontWeight: 800 }}>
            루틴 상세 보기
          </h1>
          <div className="w-9" />
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        <section className="bg-white rounded-3xl overflow-hidden shadow-[0_6px_20px_rgba(15,23,42,0.04)]">
          <div className="h-[200px] relative">
            <ImageWithFallback src={routine.image} alt={routine.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
            <div className="absolute left-4 bottom-4 text-white">
              <p style={{ fontSize: 20, fontWeight: 800 }}>{routine.title}</p>
              <p className="text-white/85" style={{ fontSize: 13 }}>{routine.subtitle}</p>
            </div>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-[#F8FAFC] p-3">
                <div className="flex items-center gap-1 text-[#8B95A1] mb-1" style={{ fontSize: 11, fontWeight: 700 }}>
                  <Clock3 size={12} />
                  소요
                </div>
                <p className="text-[#191F28]" style={{ fontSize: 14, fontWeight: 800 }}>{routine.duration}</p>
              </div>
              <div className="rounded-xl bg-[#F8FAFC] p-3">
                <div className="flex items-center gap-1 text-[#8B95A1] mb-1" style={{ fontSize: 11, fontWeight: 700 }}>
                  <Coins size={12} />
                  예산
                </div>
                <p className="text-[#191F28]" style={{ fontSize: 14, fontWeight: 800 }}>{routine.budget}</p>
              </div>
              <div className="rounded-xl bg-[#F8FAFC] p-3">
                <div className="flex items-center gap-1 text-[#8B95A1] mb-1" style={{ fontSize: 11, fontWeight: 700 }}>
                  <MapPinned size={12} />
                  지역
                </div>
                <p className="text-[#191F28]" style={{ fontSize: 14, fontWeight: 800 }}>{routine.region}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-3xl p-4 shadow-[0_6px_20px_rgba(15,23,42,0.04)]">
          <h2 className="text-[#191F28] mb-3" style={{ fontSize: 17, fontWeight: 800 }}>
            전체 경로
          </h2>
          <div className="space-y-2">
            {routine.stops.map((stop, index) => (
              <div key={stop.name} className="rounded-2xl border border-[#EEF0F4] p-3">
                <p className="text-[#3182F6]" style={{ fontSize: 12, fontWeight: 800 }}>
                  STOP {index + 1}
                </p>
                <p className="text-[#191F28] mt-0.5" style={{ fontSize: 15, fontWeight: 700 }}>
                  {stop.name}
                </p>
                <p className="text-[#6B7684] mt-1" style={{ fontSize: 12 }}>{stop.note}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="px-1">
          <button
            onClick={handleClone}
            className="w-full h-[52px] rounded-2xl text-white flex items-center justify-center gap-2"
            style={{ fontSize: 15, fontWeight: 800, background: "linear-gradient(135deg, #3182F6, #2F80ED)" }}
          >
            <BookmarkPlus size={16} />
            {isCloned ? "이미 잇깨비픽에 담겼어요" : "클로닝하고 잇깨비픽에 담기"}
          </button>
        </div>
      </div>
    </div>
  );
}
