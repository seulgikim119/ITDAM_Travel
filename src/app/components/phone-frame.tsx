import { ReactNode } from "react";

export function StatusBar({ light = false }: { light?: boolean }) {
  const color = light ? "text-white" : "text-[#2C2C2A]";
  return (
    <div className={`flex justify-between items-center px-8 pt-[14px] pb-[6px] ${color}`} style={{ minHeight: 54 }}>
      <span className="text-[14px] tracking-tight" style={{ fontWeight: 600 }}>9:41</span>
      <div className="absolute left-1/2 -translate-x-1/2 top-[12px] w-[126px] h-[34px] bg-black rounded-full" />
      <div className="flex items-center gap-1.5">
        <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor"><rect x="0" y="3" width="3" height="9" rx="1" opacity="0.3"/><rect x="4.5" y="2" width="3" height="10" rx="1" opacity="0.5"/><rect x="9" y="1" width="3" height="11" rx="1" opacity="0.7"/><rect x="13.5" y="0" width="3" height="12" rx="1"/></svg>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor"><path d="M8 2.4C5.6 2.4 3.4 3.4 1.8 5L0 3.2C2.2 1.2 5 0 8 0s5.8 1.2 8 3.2L14.2 5C12.6 3.4 10.4 2.4 8 2.4zM8 7.2c-1.6 0-3 .6-4 1.6L2.2 7C3.6 5.6 5.7 4.8 8 4.8s4.4.8 5.8 2.2L12 8.8c-1-1-2.4-1.6-4-1.6zM8 12l-2.2-2.2c.6-.6 1.4-1 2.2-1 .8 0 1.6.4 2.2 1L8 12z"/></svg>
        <svg width="27" height="13" viewBox="0 0 27 13" fill="currentColor"><rect x="0" y="1" width="22" height="11" rx="2" stroke="currentColor" strokeWidth="1" fill="none"/><rect x="1.5" y="2.5" width="16" height="8" rx="1" fill="currentColor"/><rect x="23" y="4" width="2.5" height="5" rx="1"/></svg>
      </div>
    </div>
  );
}

export function PhoneScreen({ children }: { children: ReactNode }) {
  return <div className="h-full flex flex-col">{children}</div>;
}