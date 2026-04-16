export type RoutineTheme =
  | "맛집"
  | "사진"
  | "자연"
  | "카페"
  | "야경"
  | "역사";

export type RoutineStop = {
  name: string;
  note: string;
};

export type Routine = {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  theme: RoutineTheme;
  duration: string;
  budget: string;
  region: string;
  likes: number;
  clones: number;
  image: string;
  routeSummary: string;
  stops: RoutineStop[];
};

export type RegionRanking = {
  region: string;
  heat: string;
  growth: string;
};

export type UserRanking = {
  user: string;
  region: string;
  score: number;
};

export type ThemeCuration = {
  id: string;
  title: string;
  description: string;
  badge: string;
  image: string;
  routineIds: string[];
};

export const routineThemes: RoutineTheme[] = [
  "맛집",
  "사진",
  "자연",
  "카페",
  "야경",
  "역사",
];

export const routines: Routine[] = [
  {
    id: "r-jeonju-food-01",
    title: "전주 한옥 미식 루틴",
    subtitle: "비빔밥과 골목 디저트를 하루에",
    author: "루틴러_민아",
    theme: "맛집",
    duration: "6시간",
    budget: "5.8만원",
    region: "전주",
    likes: 1240,
    clones: 349,
    image:
      "https://images.unsplash.com/photo-1544827503-673e2a2c4c00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
    routeSummary: "한옥마을 -> 경기전 -> 남부시장 야시장",
    stops: [
      { name: "전주 한옥마을", note: "10:30, 골목 산책과 사진" },
      { name: "경기전", note: "12:00, 역사 포인트" },
      { name: "남부시장 야시장", note: "18:00, 미식 클라이맥스" },
    ],
  },
  {
    id: "r-gangneung-photo-01",
    title: "강릉 감성 포토 루틴",
    subtitle: "일출부터 카페까지 색감 좋은 동선",
    author: "필름고양이",
    theme: "사진",
    duration: "1박 2일",
    budget: "14.2만원",
    region: "강릉",
    likes: 980,
    clones: 280,
    image:
      "https://images.unsplash.com/photo-1669303215070-151cc2e5887e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
    routeSummary: "경포해변 -> 안목 커피거리 -> 주문진 방파제",
    stops: [
      { name: "경포해변", note: "06:00, 일출 촬영 포인트" },
      { name: "안목 커피거리", note: "10:00, 브런치와 바다 샷" },
      { name: "주문진 방파제", note: "17:00, 노을 촬영" },
    ],
  },
  {
    id: "r-jeju-nature-01",
    title: "제주 숲길 힐링 루틴",
    subtitle: "바람과 숲 소리로 채우는 주말",
    author: "걷는하루",
    theme: "자연",
    duration: "8시간",
    budget: "7.1만원",
    region: "제주",
    likes: 1510,
    clones: 421,
    image:
      "https://images.unsplash.com/photo-1601439678777-b2b3c56fa627?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
    routeSummary: "비자림 -> 사려니숲길 -> 월정리 해변",
    stops: [
      { name: "비자림", note: "09:00, 천천히 걷기" },
      { name: "사려니숲길", note: "12:00, 피톤치드 타임" },
      { name: "월정리 해변", note: "16:30, 바다 마무리" },
    ],
  },
  {
    id: "r-busan-cafe-01",
    title: "부산 오션뷰 카페 루틴",
    subtitle: "카페 세 곳만으로 완성하는 하루",
    author: "달빛라떼",
    theme: "카페",
    duration: "5시간",
    budget: "4.5만원",
    region: "부산",
    likes: 870,
    clones: 202,
    image:
      "https://images.unsplash.com/photo-1762732470480-235ba455ecc2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
    routeSummary: "광안리 -> 해운대 달맞이길 -> 청사포",
    stops: [
      { name: "광안리 카페", note: "11:00, 브런치" },
      { name: "달맞이길 카페", note: "14:00, 디저트" },
      { name: "청사포 카페", note: "17:30, 야경 시작" },
    ],
  },
  {
    id: "r-yeosu-night-01",
    title: "여수 야경 드라이브 루틴",
    subtitle: "밤바다와 조명 명소 집중 공략",
    author: "네온나비",
    theme: "야경",
    duration: "7시간",
    budget: "9.3만원",
    region: "여수",
    likes: 1092,
    clones: 338,
    image:
      "https://images.unsplash.com/photo-1711343959718-f3f4f3289068?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
    routeSummary: "이순신광장 -> 해상케이블카 -> 낭만포차거리",
    stops: [
      { name: "이순신광장", note: "16:00, 해질녘 산책" },
      { name: "여수해상케이블카", note: "19:00, 야경 하이라이트" },
      { name: "낭만포차거리", note: "21:00, 마무리 식사" },
    ],
  },
  {
    id: "r-gyeongju-history-01",
    title: "경주 역사 집중 루틴",
    subtitle: "유적지 동선 최적화로 하루 완주",
    author: "시간여행자",
    theme: "역사",
    duration: "1박 2일",
    budget: "13.6만원",
    region: "경주",
    likes: 1335,
    clones: 390,
    image:
      "https://images.unsplash.com/photo-1702737863090-e23ff8e0d91c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
    routeSummary: "불국사 -> 대릉원 -> 동궁과 월지",
    stops: [
      { name: "불국사", note: "09:00, 오전 집중 관람" },
      { name: "대릉원", note: "13:30, 고분군 산책" },
      { name: "동궁과 월지", note: "19:00, 야간 뷰" },
    ],
  },
];

export const regionRanking: RegionRanking[] = [
  { region: "강릉", heat: "92", growth: "+18%" },
  { region: "전주", heat: "88", growth: "+15%" },
  { region: "여수", heat: "84", growth: "+13%" },
  { region: "경주", heat: "81", growth: "+11%" },
  { region: "부산", heat: "79", growth: "+9%" },
];

export const userRanking: UserRanking[] = [
  { user: "루틴러_민아", region: "전주", score: 12450 },
  { user: "필름고양이", region: "강릉", score: 11720 },
  { user: "걷는하루", region: "제주", score: 11160 },
  { user: "네온나비", region: "여수", score: 10980 },
  { user: "시간여행자", region: "경주", score: 10510 },
];

export const themeCurations: ThemeCuration[] = [
  {
    id: "c-healing-weekend",
    title: "이번 주말, 힐링하기 좋은 길",
    description: "걷기 난이도 낮은 숲길 중심 루틴만 모았어요.",
    badge: "담깨비 추천",
    image:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
    routineIds: ["r-jeju-nature-01", "r-busan-cafe-01"],
  },
  {
    id: "c-rainy-vibe",
    title: "비 오는 날 감성 루틴",
    description: "실내 비중이 높은 코스로 날씨 변수에 강해요.",
    badge: "날씨 특화",
    image:
      "https://images.unsplash.com/photo-1474314243412-cd4a79f02c6a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
    routineIds: ["r-jeonju-food-01", "r-gyeongju-history-01"],
  },
  {
    id: "c-night-drive",
    title: "퇴근 후 출발하는 야간 루트",
    description: "야경 몰입도 높은 동선으로 짧고 강렬하게.",
    badge: "퇴근 후",
    image:
      "https://images.unsplash.com/photo-1519608425089-7f3bfa6f6bb8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
    routineIds: ["r-yeosu-night-01", "r-gangneung-photo-01"],
  },
];

export function getRoutineById(id: string) {
  return routines.find((routine) => routine.id === id);
}
