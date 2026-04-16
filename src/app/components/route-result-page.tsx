import { useNavigate } from "react-router";
import { StatusBar } from "./phone-frame";
import { ArrowLeft, Share2 } from "lucide-react";

const spots = [
  { name: "덕천서원", time: "09:00", move: "이동 0분", tag: "역사", color: "#E8A830" },
  { name: "수승대", time: "11:00", move: "차량 15분", tag: "자연", color: "#34C759" },
  { name: "창포원", time: "13:30", move: "차량 10분", tag: "자연", color: "#34C759" },
  { name: "거창 전통시장", time: "15:30", move: "차량 12분", tag: "맛집", color: "#FF3B30" },
];

const tagColors: Record<string, string> = {
  역사: "bg-[#E8A830]/15 text-[#E8A830]",
  자연: "bg-[#34C759]/10 text-[#34C759]",
  맛집: "bg-[#FF3B30]/10 text-[#FF3B30]",
};

export function RouteResult() {
  const navigate = useNavigate();

  return (
    <div className="h-full flex flex-col bg-[#FFF8E7]">
      <div className="bg-white rounded-b-[24px] shadow-sm">
        <StatusBar />
        <div className="flex items-center justify-between px-4 py-2">
          <button onClick={() => navigate("/app")} className="p-2 text-[#2C2C2A]">
            <ArrowLeft size={22} strokeWidth={1.8} />
          </button>
          <h2 className="text-[#2C2C2A]" style={{ fontSize: 17, fontWeight: 600 }}>내 루트</h2>
          <button className="p-2 text-[#E8A830]" style={{ fontSize: 14, fontWeight: 500 }}>수정</button>
        </div>
      </div>

      <div className="flex-1 px-5 pt-5 overflow-y-auto">
        <h1 className="text-[#2C2C2A] mb-6" style={{ fontSize: 20, fontWeight: 700 }}>
          거창 당일치기 · 4곳
        </h1>

        {/* Timeline */}
        <div className="relative">
          {spots.map((spot, i) => (
            <div key={i} className="flex gap-4 mb-1">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full mt-1.5" style={{ backgroundColor: spot.color }} />
                {i < spots.length - 1 && (
                  <div className="w-[2px] flex-1 my-1" style={{ background: `linear-gradient(${spot.color}, ${spots[i+1].color})`, opacity: 0.3 }} />
                )}
              </div>

              <div className="flex-1 pb-6">
                <div className="bg-white rounded-2xl p-3.5 shadow-sm">
                  <p className="text-[#2C2C2A]" style={{ fontSize: 16, fontWeight: 600 }}>{spot.name}</p>
                  <p className="text-[#8E8E93] mt-0.5" style={{ fontSize: 13 }}>
                    {spot.time} · {spot.move}
                  </p>
                  <span
                    className={`inline-block mt-2 px-3 py-0.5 rounded-full ${tagColors[spot.tag]}`}
                    style={{ fontSize: 12, fontWeight: 600 }}
                  >
                    {spot.tag}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 pb-[34px] pt-4 space-y-3">
        <button
          onClick={() => navigate("/app")}
          className="w-full h-[52px] rounded-2xl text-[#2C2C2A] active:scale-[0.98] transition-transform"
          style={{ fontSize: 16, fontWeight: 600, background: "linear-gradient(135deg, #F0C070, #E8A830)" }}
        >
          이 루트로 잇기
        </button>
        <button
          className="w-full h-[44px] rounded-2xl bg-white text-[#8E8E93] flex items-center justify-center gap-2 shadow-sm"
          style={{ fontSize: 14, fontWeight: 500 }}
        >
          <Share2 size={16} />
          함께 잇기 (공유)
        </button>
      </div>
    </div>
  );
}