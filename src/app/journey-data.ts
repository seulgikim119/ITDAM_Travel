export type JourneyRecord = {
  id: number;
  date: string;
  title: string;
  memo: string;
  cloneable: boolean;
  image: string;
  tags: string[];
  region: string;
};

export type ProvinceVisitSeed = {
  id: string;
  name: string;
  x: number;
  y: number;
  visitCount: number;
};

export type MineSpot = {
  id: string;
  brand: string;
  reward: string;
  point: number;
  x: number;
  y: number;
  triggerVisitTotal: number;
};

export const journeyRecords: JourneyRecord[] = [
  {
    id: 1,
    date: "2026.03.15",
    title: "부산 야경 루트",
    memo: "광안리에서 시작해 해운대까지 이어지는 밤 산책 코스.",
    cloneable: true,
    region: "부산",
    image:
      "https://images.unsplash.com/photo-1762732470480-235ba455ecc2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    tags: ["#야경", "#도시산책"],
  },
  {
    id: 2,
    date: "2026.02.22",
    title: "전주 한옥 감성",
    memo: "한옥마을 골목과 시장 동선을 짧게 묶은 당일 코스.",
    cloneable: true,
    region: "전북",
    image:
      "https://images.unsplash.com/photo-1544827503-673e2a2c4c00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    tags: ["#맛집", "#전통"],
  },
  {
    id: 3,
    date: "2026.01.10",
    title: "경주 역사 산책",
    memo: "불국사, 대릉원, 동궁과 월지를 이어본 기록.",
    cloneable: false,
    region: "경북",
    image:
      "https://images.unsplash.com/photo-1702737863090-e23ff8e0d91c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    tags: ["#역사", "#사진"],
  },
];

export const provinceVisitSeed: ProvinceVisitSeed[] = [
  { id: "seoul", name: "서울", x: 146, y: 56, visitCount: 6 },
  { id: "gyeonggi", name: "경기", x: 122, y: 76, visitCount: 4 },
  { id: "gangwon", name: "강원자치도", x: 204, y: 70, visitCount: 2 },
  { id: "chungbuk", name: "충북", x: 164, y: 106, visitCount: 3 },
  { id: "chungnam", name: "충남", x: 108, y: 116, visitCount: 2 },
  { id: "jeonbuk", name: "전북자치도", x: 126, y: 152, visitCount: 2 },
  { id: "jeonnam", name: "전남", x: 96, y: 186, visitCount: 1 },
  { id: "gyeongbuk", name: "경북", x: 204, y: 132, visitCount: 3 },
  { id: "gyeongnam", name: "경남", x: 186, y: 176, visitCount: 4 },
  { id: "jeju", name: "제주자치도", x: 150, y: 214, visitCount: 2 },
];

export const journeyMineSpots: MineSpot[] = [
  {
    id: "m1",
    brand: "그린카페 제휴",
    reward: "아메리카노 1+1 쿠폰 활성화",
    point: 120,
    x: 168,
    y: 94,
    triggerVisitTotal: 26,
  },
  {
    id: "m2",
    brand: "모빌리티 파트너",
    reward: "자전거 30분 무료권",
    point: 90,
    x: 208,
    y: 164,
    triggerVisitTotal: 31,
  },
  {
    id: "m3",
    brand: "포토미션 캠페인",
    reward: "포인트 보너스 지급",
    point: 180,
    x: 114,
    y: 182,
    triggerVisitTotal: 36,
  },
];

