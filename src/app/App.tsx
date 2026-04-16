import { RouterProvider } from "react-router";
import { router } from "./routes";

export default function App() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-[#1a1a2e]" style={{ fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <div className="w-[393px] h-[852px] bg-white relative overflow-hidden rounded-[40px] shadow-2xl">
        <RouterProvider router={router} />
      </div>
    </div>
  );
}