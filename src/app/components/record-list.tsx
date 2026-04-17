import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { BookOpen, Copy, Plus, Sparkles } from "lucide-react";
import { StatusBar } from "./phone-frame";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import damggaebiImg from "../../assets/damggaebiImg.png";
import { journeyRecords } from "../journey-data";

export function RecordList() {
  const navigate = useNavigate();

  return (
    <div className="min-h-full bg-[#F7FAF7]">
      <div className="bg-white border-b border-[#E9F0EA]">
        <StatusBar />
        <div className="px-5 pt-2 pb-4 flex items-center justify-between">
          <div>
            <p className="text-[#5C9B5F]" style={{ fontSize: 14, fontWeight: 700 }}>
              DAMGGAEBI ARCHIVE
            </p>
            <h1 className="text-[#1F2C20] mt-0.5" style={{ fontSize: 22, fontWeight: 800 }}>
              담깨비의 기록 보관함
            </h1>
          </div>
          <img src={damggaebiImg} alt="담깨비" className="w-[52px] h-[52px] object-contain" />
        </div>
      </div>

      <div className="px-4 pt-4">
        <div className="rounded-2xl bg-white p-4 border border-[#E9F0EA]">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-[#5C9B5F]" />
            <p className="text-[#1F2C20]" style={{ fontSize: 14, fontWeight: 700 }}>
              새 기록을 추가해 여정을 이어보세요
            </p>
          </div>
          <button
            onClick={() => navigate("/record-input")}
            className="mt-3 h-10 px-4 rounded-xl text-white inline-flex items-center gap-1.5"
            style={{
              fontSize: 14,
              fontWeight: 700,
              background: "linear-gradient(135deg, #6BAF6E, #3E7D42)",
            }}
          >
            <Plus size={14} />
            기록 추가하기
          </button>
        </div>

        <div className="mt-4 space-y-3 pb-5">
          {journeyRecords.map((record, idx) => (
            <motion.article
              key={record.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              className="bg-white rounded-2xl border border-[#E9F0EA] overflow-hidden"
            >
              <div className="h-[138px] relative">
                <ImageWithFallback
                  src={record.image}
                  alt={record.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
                <span
                  className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-black/35 text-white"
                  style={{ fontSize: 14, fontWeight: 700 }}
                >
                  {record.date}
                </span>
                {record.cloneable && (
                  <span
                    className="absolute top-3 right-3 px-2 py-1 rounded-lg text-white flex items-center gap-1"
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      background: "linear-gradient(135deg, #6BAF6E, #3E7D42)",
                    }}
                  >
                    <Copy size={11} />
                    Cloneable
                  </span>
                )}
              </div>
              <div className="p-3.5">
                <p className="text-[#1F2C20]" style={{ fontSize: 16, fontWeight: 800 }}>
                  {record.title}
                </p>
                <p className="text-[#5E6E60] mt-1" style={{ fontSize: 14, lineHeight: 1.5 }}>
                  {record.memo}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {record.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md bg-[#EDF5ED] text-[#3E7D42]"
                      style={{ fontSize: 14, fontWeight: 600 }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>

      <div className="px-4 pb-6">
        <button
          onClick={() => navigate("/record-input")}
          className="w-full h-12 rounded-2xl text-white flex items-center justify-center gap-2"
          style={{ fontSize: 15, fontWeight: 700, background: "linear-gradient(135deg, #6BAF6E, #3E7D42)" }}
        >
          <Sparkles size={15} />
          새 여행 기록 시작하기
        </button>
      </div>
    </div>
  );
}
