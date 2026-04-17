import { motion } from "motion/react";
import damggaebiImg from "../../assets/itggaebiImg.png";

export function Itgaebi({ size = 48, message }: { size?: number; message?: string }) {
  return (
    <div className="flex flex-col items-center">
      <img src={damggaebiImg} alt="damggaebi" width={size} height={size} className="object-contain" />
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 px-3 py-1 rounded-full bg-[#F0C070]/15"
        >
          <span style={{ fontSize: 14, fontWeight: 500 }} className="text-[#E8A830]">
            {message}
          </span>
        </motion.div>
      )}
    </div>
  );
}
