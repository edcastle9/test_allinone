import React from "react";
import { PhoneCall, ShieldAlert, HeartHandshake, X, ExternalLink, Shield, Building, AlertTriangle, Terminal } from "lucide-react";
import { EMERGENCY_RESOURCES } from "../data/counselingData";

interface EmergencySupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencySupportModal: React.FC<EmergencySupportModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto font-mono text-white">
      <div className="bg-[#141417] border border-white/10 max-w-2xl w-full p-6 sm:p-7 shadow-2xl my-8">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#ff4444] text-white">
              <PhoneCall className="w-6 h-6" />
            </div>
            <div>
              <div className="section-label text-[#ff4444]">EMERGENCY_SUPPORT_NETWORK</div>
              <h3 className="text-base sm:text-lg font-bold font-syne text-white">
                CRISIS_HOTLINE // 교권보호 및 긴급 심리치유 핫라인
              </h3>
              <p className="text-xs text-white/50 font-sans">
                혼자 감당하지 마세요. 국가 및 공적 전문 기관의 법률·심리 지원을 즉시 요청할 수 있습니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/40 hover:text-white border border-transparent hover:border-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Crisis Alert Box */}
        <div className="bg-[#ff4444]/10 border border-[#ff4444] p-4 mb-5 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[#ff4444] shrink-0 mt-0.5" />
          <div className="text-xs text-white leading-relaxed font-sans">
            <strong className="font-mono font-bold block text-[#ff4444] mb-0.5">
              [CRITICAL_CRISIS_PROTOCOL] 악성 민원 협박 / 극심한 공황 / 신변 위협 발생 시:
            </strong>
            <span className="text-[#00ff66] font-mono font-bold">1395 (교육부 교육활동보호 핫라인)</span>으로 즉시 전화하시면 전담 변호사와 심리전문가의 긴급 개입 및 학교 현장 지원을 요청할 수 있습니다.
          </div>
        </div>

        {/* Resources list */}
        <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
          {EMERGENCY_RESOURCES.map((res, idx) => (
            <div
              key={idx}
              className="bg-[#0c0c0e] border border-white/10 p-4 hover:border-[#00ff66] transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 ${
                      res.category === "교원전용"
                        ? "bg-[#00ff66] text-black"
                        : res.category === "24시간위기"
                        ? "bg-[#ff4444] text-white"
                        : "bg-cyan-400 text-black"
                    }`}
                  >
                    {res.category}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-white font-syne">
                    {res.name}
                  </h4>
                </div>
                <span className="text-xs font-bold text-[#00ff66] bg-black px-2.5 py-1 border border-[#00ff66]/40 shrink-0 font-mono">
                  TEL: {res.contact}
                </span>
              </div>

              <p className="text-xs text-white/70 leading-relaxed mb-2 font-sans">
                {res.desc}
              </p>

              <div className="flex items-center justify-between text-[10px] text-white/40 pt-2 border-t border-white/10 font-mono">
                <span>HOURS: {res.hours}</span>
                <div className="flex gap-1">
                  {res.tags.map((t) => (
                    <span key={t} className="bg-white/5 border border-white/10 text-white/60 px-1.5 py-0.2">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Support Info */}
        <div className="mt-5 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/50 font-mono">
          <span>* ALL_CONSULTATIONS_ENCRYPTED_AND_CONFIDENTIAL</span>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 bg-[#00ff66] hover:bg-[#00e65c] text-black font-bold font-mono text-xs"
          >
            CONFIRM_AND_CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};

