import { RouterProvider } from "react-router";
import { router } from "./routes";
import webBgImage from "../assets/BG.png";
import { useWebSwipeScroll } from "./hooks/use-web-swipe-scroll";

export default function App() {
  const webSwipeScroll = useWebSwipeScroll<HTMLDivElement>();

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
        <div
          ref={webSwipeScroll.ref}
          {...webSwipeScroll.handlers}
          className="w-full h-[100dvh] bg-white relative overflow-hidden md:w-[390px] md:max-h-[844px] md:rounded-[40px] md:shadow-2xl"
        >
          <RouterProvider router={router} />
        </div>
      </div>
    </div>
  );
}
