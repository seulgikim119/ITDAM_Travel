import { RouterProvider } from "react-router";
import { router } from "./routes";
import webBgImage from "../assets/BG.png";

export default function App() {
  return (
    <div
      className="relative flex justify-center items-center min-h-screen overflow-hidden"
      style={{
        fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
        backgroundColor: "#11182B",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: "min(100vw, 1920px)",
          height: "min(100vh, 1080px)",
          backgroundImage: `url(${webBgImage})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center",
          backgroundSize: "cover",
        }}
      />

      <div className="relative z-10">
        <div className="w-full h-[100dvh] bg-white relative overflow-hidden md:w-[390px] md:max-h-[844px] md:rounded-[40px] md:shadow-2xl">
          <RouterProvider router={router} />
        </div>

        <div className="hidden md:flex absolute -top-12 left-1/2 -translate-x-1/2 items-center w-max">
          <span className="text-white/90 whitespace-nowrap" style={{ fontSize: 24, fontWeight: 600 }}>
            스크롤로 탐색할수잇깨비!
          </span>
        </div>
      </div>
    </div>
  );
}
