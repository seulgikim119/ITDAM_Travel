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
    subtitle: "비빔밥과 골목 디저트를 잇는 하루 동선",
    author: "루틴러_민아",
    theme: "맛집",
    duration: "6시간",
    budget: "5.8만원",
    region: "전주",
    likes: 1240,
    clones: 349,
    image:
      "https://images.unsplash.com/photo-1544827503-673e2a2c4c00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
    routeSummary: "전주 한옥마을 -> 경기전 -> 남부시장 야시장",
    stops: [
      { name: "전주 한옥마을", note: "10:30, 골목 산책과 사진" },
      { name: "경기전", note: "12:00, 역사 포인트" },
      { name: "남부시장 야시장", note: "18:00, 미식 하이라이트" },
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
      { name: "안목 커피거리", note: "10:00, 브런치와 바다 뷰" },
      { name: "주문진 방파제", note: "17:00, 노을 촬영" },
    ],
  },
  {
    id: "r-jeju-nature-01",
    title: "제주 숲길 힐링 루틴",
    subtitle: "바람과 파도 소리로 채우는 주말",
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
      { name: "사려니숲길", note: "12:00, 피톤치드 충전" },
      { name: "월정리 해변", note: "16:30, 바다 마무리" },
    ],
  },
  {
    id: "r-busan-cafe-01",
    title: "부산 오션뷰 카페 루틴",
    subtitle: "카페 세 곳만으로 완성하는 하루",
    author: "라떼시인",
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
    subtitle: "바닷가 조명 명소 집중 공략",
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
      { name: "이순신광장", note: "16:00, 바다 뷰 산책" },
      { name: "여수해상케이블카", note: "19:00, 야경 하이라이트" },
      { name: "낭만포차거리", note: "21:00, 마무리 야식" },
    ],
  },
  {
    id: "r-gyeongju-history-01",
    title: "경주 역사 집중 루틴",
    subtitle: "유적지 동선 최적화로 하루 완성",
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
  {
    id: "r-seoul-food-02",
    title: "서울 로컬 미식 1박 2일",
    subtitle: "시장, 골목, 바까지 이어지는 도시 미식 여정",
    author: "푸드헌터J",
    theme: "맛집",
    duration: "1박 2일",
    budget: "16.8만원",
    region: "서울",
    likes: 1162,
    clones: 341,
    image:
      "https://images.unsplash.com/photo-1617093727343-374698b1b08d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
    routeSummary: "광장시장 -> 을지로 -> 망원시장 -> 연남동",
    stops: [
      { name: "광장시장", note: "12:00, 대표 메뉴 투어" },
      { name: "을지로 골목", note: "16:00, 카페와 바 탐색" },
      { name: "망원시장", note: "10:30, 로컬 푸드 스폿" },
      { name: "연남동 거리", note: "14:00, 브런치와 디저트" },
    ],
  },
  {
    id: "r-jeju-nature-02",
    title: "제주 동서 횡단 2박 3일",
    subtitle: "오름, 숲, 해변을 균형 있게 담는 장기 루트",
    author: "걷는하루",
    theme: "자연",
    duration: "2박 3일",
    budget: "29.5만원",
    region: "제주",
    likes: 1688,
    clones: 502,
    image:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
    routeSummary: "성산일출봉 -> 사려니숲길 -> 협재해변 -> 송악산",
    stops: [
      { name: "성산일출봉", note: "1일차 06:00, 일출 트레킹" },
      { name: "사려니숲길", note: "1일차 14:00, 숲길 힐링" },
      { name: "협재해변", note: "2일차 11:00, 바다 휴식" },
      { name: "한림공원", note: "2일차 16:00, 정원 산책" },
      { name: "송악산 둘레길", note: "3일차 09:00, 절경 코스" },
      { name: "용머리해안", note: "3일차 12:30, 해안 지형 탐방" },
    ],
  },
  {
    id: "r-gangwon-photo-02",
    title: "강원 시네마틱 포토 2박 3일",
    subtitle: "호수와 바다, 산 능선을 모두 담는 촬영 여정",
    author: "필름고양이",
    theme: "사진",
    duration: "2박 3일",
    budget: "24.4만원",
    region: "강원",
    likes: 1324,
    clones: 387,
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
    routeSummary: "강릉 해변 -> 정동진 -> 대관령 -> 춘천 의암호",
    stops: [
      { name: "강릉 안목해변", note: "1일차 07:00, 모닝 스냅" },
      { name: "정동진 레일바이크", note: "1일차 15:00, 해안 촬영" },
      { name: "대관령 양떼목장", note: "2일차 10:00, 초원 풍경" },
      { name: "삼양목장", note: "2일차 16:00, 석양 포인트" },
      { name: "춘천 의암호", note: "3일차 09:30, 호수 리플렉션" },
      { name: "소양강 스카이워크", note: "3일차 13:00, 전망 마무리" },
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
    description: "걷기 난이도가 낮은 코스로 편안한 루트를 모았어요.",
    badge: "잇깨비 추천",
    image:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
    routineIds: ["r-jeju-nature-01", "r-busan-cafe-01"],
  },
  {
    id: "c-rainy-vibe",
    title: "비 오는 날 감성 루틴",
    description: "실내 비중이 높은 코스로 날씨 변화에도 강해요.",
    badge: "날씨 특화",
    image:
      "https://images.unsplash.com/photo-1474314243412-cd4a79f02c6a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
    routineIds: ["r-jeonju-food-01", "r-gyeongju-history-01"],
  },
  {
    id: "c-night-drive",
    title: "해질 때 출발하는 야간 루트",
    description: "야경 몰입도 높은 동선으로 짧고 강렬하게.",
    badge: "야간 픽",
    image:
      "https://images.unsplash.com/photo-1519608425089-7f3bfa6f6bb8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
    routineIds: ["r-yeosu-night-01", "r-gangneung-photo-01"],
  },
];

export function getRoutineById(id: string) {
  return routines.find((routine) => routine.id === id);
}

