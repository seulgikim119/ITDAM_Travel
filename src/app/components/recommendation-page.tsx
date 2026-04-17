import { useNavigate } from "react-router";
import { StatusBar } from "./phone-frame";
import { ArrowLeft, Star } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { motion } from "motion/react";

export function Recommendation() {
  const navigate = useNavigate();

  return (
    <div className="h-full flex flex-col bg-[#FFF8E7]">
      <div className="bg-white rounded-b-[24px] shadow-sm">
        <StatusBar />
        <div className="flex items-center justify-between px-4 py-2">
          <button onClick={() => navigate(-1)} className="p-2 text-[#2C2C2A]">
            <ArrowLeft size={22} strokeWidth={1.8} />
          </button>
          <h2 className="text-[#2C2C2A]" style={{ fontSize: 17, fontWeight: 600 }}>다음 여행 잇기</h2>
          <div className="p-2"><Star size={20} className="text-[#E8A830] fill-[#E8A830]" /></div>
        </div>
      </div>

      <div className="flex-1 px-5 pt-5 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-4 mb-5"
          style={{ background: "linear-gradient(135deg, rgba(240,192,112,0.12), rgba(232,168,48,0.12))" }}
        >
          <p className="text-[#E8A830]" style={{ fontSize: 14, fontWeight: 700 }}>기록 3회 달성!</p>
          <p className="text-[#2C2C2A] mt-1" style={{ fontSize: 18, fontWeight: 700 }}>취향이 이어졌어요</p>
        </motion.div>

        {/* Preference */}
        <div className="mb-5">
          <span className="text-[#E8A830] bg-[#F0C070]/15 px-3 py-1.5 rounded-full" style={{ fontSize: 14, fontWeight: 600 }}>
            바다 + 맛집 중심 취향
          </span>
        </div>

        {/* Recommendation card */}
        <div className="rounded-2xl bg-white overflow-hidden mb-4 shadow-sm" style={{ boxShadow: "0 2px 16px rgba(240, 192, 112, 0.1)" }}>
          <div className="h-[140px] bg-[#F0E6D0] overflow-hidden relative">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1702737863090-e23ff8e0d91c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxHeWVvbmdqdSUyMHRlbXBsZSUyMGF1dHVtbiUyMEtvcmVhfGVufDF8fHx8MTc3NTQ2MjQ3Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="경주"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>
          <div className="p-4">
            <p className="text-[#2C2C2A]" style={{ fontSize: 18, fontWeight: 700 }}>경주 반나절 코스</p>
            <p className="text-[#8E8E93] mt-1" style={{ fontSize: 14 }}>이전 여행과 비슷한 스타일</p>
            <button
              onClick={() => navigate("/create-route")}
              className="mt-3 h-[38px] px-5 rounded-xl text-[#2C2C2A]"
              style={{ fontSize: 14, fontWeight: 600, background: "linear-gradient(135deg, #F0C070, #E8A830)" }}
            >
              바로 잇기
            </button>
          </div>
        </div>

        {/* Discovery */}
        <div className="mb-4">
          <p className="text-[#E8A830] mb-3" style={{ fontSize: 14, fontWeight: 600 }}>새로운 발견</p>
          <div className="rounded-2xl bg-white overflow-hidden shadow-sm">
            <div className="h-[100px] overflow-hidden relative">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1669303215070-151cc2e5887e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxHYW5nbmV1bmclMjBiZWFjaCUyMHN1bnJpc2UlMjBLb3JlYXxlbnwxfHx8fDE3NzU0NjI0NzJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="강릉"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
            <div className="p-4">
              <p className="text-[#2C2C2A]" style={{ fontSize: 16, fontWeight: 700 }}>통영 당일치기</p>
              <p className="text-[#8E8E93] mt-0.5" style={{ fontSize: 14 }}>아직 안 가본 남해 스타일</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
