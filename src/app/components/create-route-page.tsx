import { useState } from "react";
import { useNavigate } from "react-router";
import { StatusBar } from "./phone-frame";
import { ArrowLeft, Search, MapPin, Star } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const searchDatabase: Record<string, string[]> = {
  "전": ["전주시 완산구", "전주 한옥마을", "전주대학교"],
  "거": ["거창군", "거창 수승대", "거창 창포원"],
  "강": ["강릉시", "강릉 안목해변", "강릉 경포대"],
  "경": ["경주시", "경주 불국사", "경주 동궁과 월지"],
  "부": ["부산 해운대구", "부산 감천문화마을", "부산 광안리"],
};

const recommendedPlaces = [
  {
    name: "덕천서원",
    region: "거창",
    desc: "조선시대 선비의 숨결이 깃든 서원",
    img: "https://images.unsplash.com/photo-1716329759192-2b7097ac782a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxHZW9jaGFuZyUyMERlb2tjaGVvbnNlb3dvbiUyMENvbmZ1Y2lhbiUyMGFjYWRlbXklMjBLb3JlYXxlbnwxfHx8fDE3NzU0NjczNzB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    tag: "역사",
  },
  {
    name: "수승대",
    region: "거창",
    desc: "기암절벽과 맑은 계곡의 절경",
    img: "https://images.unsplash.com/photo-1649296484856-31f4263ac54a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxTdXNldW5nZGFlJTIwcGF2aWxpb24lMjB2YWxsZXklMjBLb3JlYXxlbnwxfHx8fDE3NzU0NjczNzF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    tag: "자연",
  },
  {
    name: "창포원",
    region: "거창",
    desc: "사계절 꽃이 피어나는 생태정원",
    img: "https://images.unsplash.com/photo-1775299597763-a14f227f464f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxLb3JlYW4lMjBnYXJkZW4lMjBmbG93ZXJzJTIwc3ByaW5nJTIwcGF2aWxpb258ZW58MXx8fHwxNzc1NDY3Mzc2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    tag: "자연",
  },
];

const durations = ["당일치기", "1박 2일", "2박 3일"];
const groups = ["혼자", "2명", "3명+"];

export function CreateRoute() {
  const navigate = useNavigate();
  const [destination, setDestination] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  // Dynamic search
  const getSearchResults = (query: string) => {
    if (!query) return [];
    const firstChar = query[0];
    const results = searchDatabase[firstChar] || [];
    return results.filter((r) => r.includes(query));
  };

  const searchResults = getSearchResults(destination);
  const isGeochang = destination.includes("거창");

  return (
    <div className="h-full flex flex-col bg-[#FFF8E7]">
      <div className="bg-white rounded-b-[24px] shadow-sm">
        <StatusBar />
        <div className="flex items-center px-4 py-2">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-[#2C2C2A]">
            <ArrowLeft size={22} strokeWidth={1.8} />
          </button>
          <h2 className="flex-1 text-center text-[#2C2C2A] -mr-6" style={{ fontSize: 17, fontWeight: 600 }}>여행 잇기</h2>
        </div>
      </div>

      <div className="flex-1 px-5 pt-5 overflow-y-auto">
        <h1 className="text-[#2C2C2A] mb-6" style={{ fontSize: 22, fontWeight: 700 }}>어디를 이어볼까요?</h1>

        {/* Search input */}
        <div className="relative mb-4">
          <div className="flex items-center bg-white rounded-2xl px-4 h-[48px] shadow-sm focus-within:ring-2 focus-within:ring-[#F0C070]/20 transition-all">
            <Search size={18} className="text-[#8E8E93] mr-3" />
            <input
              value={destination}
              onChange={(e) => {
                setDestination(e.target.value);
                setShowResults(e.target.value.length > 0);
              }}
              placeholder="도시, 지역 검색"
              className="flex-1 bg-transparent outline-none text-[#2C2C2A] placeholder:text-[#C7C7CC]"
              style={{ fontSize: 15 }}
            />
          </div>

          {showResults && searchResults.length > 0 && (
            <div className="mt-2 bg-white rounded-2xl shadow-lg overflow-hidden">
              <p className="px-4 pt-3 pb-1 text-[#8E8E93]" style={{ fontSize: 12, fontWeight: 600 }}>검색 결과</p>
              {searchResults.map((r) => (
                <button
                  key={r}
                  onClick={() => { setDestination(r.split(" ")[0]); setShowResults(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#FFF8E7] transition-colors"
                >
                  <MapPin size={16} className="text-[#F0C070]" />
                  <span className="text-[#2C2C2A]" style={{ fontSize: 15 }}>{r}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Recommended places for 거창 */}
        {isGeochang && (
          <div className="mb-6 mt-2">
            <p className="text-[#8E8E93] mb-3" style={{ fontSize: 13, fontWeight: 600 }}>
              <Star size={12} className="inline text-[#E8A830] mr-1" />
              거창 추천 장소
            </p>
            <div className="flex flex-col gap-2.5">
              {recommendedPlaces.map((place) => (
                <div
                  key={place.name}
                  className="flex items-center gap-3 bg-white rounded-2xl p-3 shadow-sm border border-[#F0E6D0]/60"
                >
                  <div className="w-[56px] h-[56px] rounded-xl overflow-hidden flex-shrink-0">
                    <ImageWithFallback
                      src={place.img}
                      alt={place.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[#2C2C2A]" style={{ fontSize: 14, fontWeight: 600 }}>{place.name}</p>
                      <span
                        className={`px-2 py-0.5 rounded-full ${
                          place.tag === "역사"
                            ? "bg-[#E8A830]/12 text-[#E8A830]"
                            : "bg-[#34C759]/10 text-[#34C759]"
                        }`}
                        style={{ fontSize: 10, fontWeight: 600 }}
                      >
                        {place.tag}
                      </span>
                    </div>
                    <p className="text-[#8E8E93] mt-0.5 truncate" style={{ fontSize: 12 }}>{place.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Duration */}
        <div className="mb-6 mt-8">
          <p className="text-[#8E8E93] mb-3" style={{ fontSize: 13, fontWeight: 600 }}>여행 기간</p>
          <div className="flex gap-2">
            {durations.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDuration(d)}
                className={`px-5 h-[40px] rounded-full transition-all ${
                  selectedDuration === d
                    ? "bg-[#F0C070] text-[#2C2C2A] shadow-sm"
                    : "bg-white text-[#2C2C2A] hover:bg-[#F0E6D0]"
                }`}
                style={{ fontSize: 14, fontWeight: 500 }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Group */}
        <div className="mb-8">
          <p className="text-[#8E8E93] mb-3" style={{ fontSize: 13, fontWeight: 600 }}>인원</p>
          <div className="flex gap-2">
            {groups.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGroup(g)}
                className={`px-5 h-[40px] rounded-full transition-all ${
                  selectedGroup === g
                    ? "bg-[#F0C070] text-[#2C2C2A] shadow-sm"
                    : "bg-white text-[#2C2C2A] hover:bg-[#F0E6D0]"
                }`}
                style={{ fontSize: 14, fontWeight: 500 }}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-5 pb-[34px] pt-4">
        <button
          onClick={() => navigate("/route-generating", { state: { destination } })}
          className={`w-full h-[52px] rounded-2xl transition-all active:scale-[0.98] ${
            destination ? "text-[#2C2C2A] shadow-sm" : "bg-[#F0E6D0] text-[#C7C7CC]"
          }`}
          style={{
            fontSize: 16,
            fontWeight: 600,
            ...(destination ? { background: "linear-gradient(135deg, #F0C070, #E8A830)" } : {}),
          }}
          disabled={!destination}
        >
          루트 잇기
        </button>
      </div>
    </div>
  );
}