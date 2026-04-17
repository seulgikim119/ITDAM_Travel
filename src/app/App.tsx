import { RouterProvider } from "react-router";
import { router } from "./routes";

export default function App() {
  return (
    <div
      className="flex justify-center items-center min-h-screen bg-[#1a1a2e]"
      style={{ fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif" }}
    >
      <div className="relative">
        <div className="w-full h-[100dvh] bg-white relative overflow-hidden md:w-[393px] md:h-[852px] md:rounded-[40px] md:shadow-2xl">
          <RouterProvider router={router} />
        </div>

        <div className="hidden md:flex absolute -right-[154px] top-1/2 -translate-y-1/2 items-center">
          <span className="text-white/90" style={{ fontSize: 14, fontWeight: 700 }}>
            스크롤로 탐색하깨비!
          </span>
        </div>
      </div>
    </div>
  );
}
