import React, { useState } from "react";
import { ShieldCheck, Copy, Check, Sparkles, RefreshCw, X, AlertTriangle, MessageSquare, Phone, Terminal } from "lucide-react";
import { ParentScriptResult } from "../types";

interface ParentScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ParentScriptModal: React.FC<ParentScriptModalProps> = ({ isOpen, onClose }) => {
  const [situation, setSituation] = useState("");
  const [parentTone, setParentTone] = useState("다소 격앙되고 불만이 많으심");
  const [goal, setGoal] = useState("차분하게 규칙 안내하고 감정적 비난을 차단하며 다음 상담 약속 잡기");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ParentScriptResult | null>(null);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!situation.trim()) return;
    setLoading(true);
    try {
      const response = await fetch("/api/gemini/parent-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ situation, parentTone, goal }),
      });
      const data = await response.json();
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const presetSituations = [
    {
      title: "수업 중 학생 훈육에 대한 불만 항의",
      sit: "수업 중 다른 친구를 방해하여 주의를 주었는데, 학부모님이 '왜 우리 아이만 지적하느냐'며 편애/차별이라고 항의하는 상황",
    },
    {
      title: "학생 간 다툼/학폭 관련 일방적 요구",
      sit: "교실 내 친구와 다투어 다친 일에 대해 상대 아이를 즉시 분리하고 처벌하라며 소리치는 상황",
    },
    {
      title: "야간/주말 사적 연락 및 상담 요구",
      sit: "퇴근 후 늦은 밤이나 휴일에 개인 카카오톡이나 전화로 긴 하소연과 즉각적인 답변을 요구하는 상황",
    },
    {
      title: "성적/수행평가 결과에 대한 이의 제기",
      sit: "수행평가 점수 기준에 납득할 수 없다며 평가 기준을 바꾸거나 점수를 올려달라고 요구하는 상황",
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto font-mono text-white">
      <div className="bg-[#141417] border border-white/10 max-w-2xl w-full p-6 shadow-2xl my-8">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#00ff66] text-black font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="section-label">COMMUNICATION_DEFENSE_PROTOCOL</div>
              <h3 className="font-bold font-syne text-white text-base">
                PARENT_SCRIPT_GENERATOR // 학부모 소통 보호 스크립터
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-white/50 hover:text-white border border-transparent hover:border-white/20"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input area */}
        <div className="space-y-3.5 text-sm">
          <div>
            <label className="block text-xs font-mono text-white/70 mb-1.5">
              PRESET_SCENARIOS // 빠른 시나리오 선택
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-2">
              {presetSituations.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSituation(p.sit)}
                  className="text-left text-xs p-2 bg-[#0c0c0e] hover:border-[#00ff66] border border-white/10 text-white/80 transition-all truncate font-mono"
                >
                  &gt; {p.title}
                </button>
              ))}
            </div>
            <textarea
              rows={3}
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              placeholder="직접 겪고 계신 상황을 입력하세요..."
              className="w-full p-3 border border-white/10 focus:border-[#00ff66] text-xs bg-[#0c0c0e] text-white focus:outline-hidden font-sans"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-white/70 mb-1">
                PARENT_TONE // 학부모 태도
              </label>
              <select
                value={parentTone}
                onChange={(e) => setParentTone(e.target.value)}
                className="w-full p-2 border border-white/10 text-xs bg-[#0c0c0e] text-white focus:border-[#00ff66] font-sans"
              >
                <option value="다소 격앙되고 불만이 많으심">다소 격앙되고 불만이 많으심</option>
                <option value="공격적이고 교사의 자질을 비난함">공격적이고 교사의 자질을 비난함</option>
                <option value="불안이 높고 사소한 일도 끊임없이 질문함">불안이 높고 사소한 일도 끊임없이 질문함</option>
                <option value="냉소적이며 법적 조치 등을 언급함">냉소적이며 법적 조치 등을 언급함</option>
                <option value="야간/휴일 등 무리한 시간에 상담 요구">야간/휴일 등 무리한 시간에 상담 요구</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-white/70 mb-1">
                PRIMARY_GOAL // 핵심 목적
              </label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full p-2 border border-white/10 text-xs bg-[#0c0c0e] text-white focus:border-[#00ff66] font-sans"
              >
                <option value="차분하게 규칙 안내하고 감정적 비난을 차단하며 다음 상담 약속 잡기">
                  감정적 비난 차단 + 공식 상담 일정 조율
                </option>
                <option value="단호하게 교직원 근무시간 및 교원안심번호 안내">
                  근무시간 준수 및 안심번호 채널 안내
                </option>
                <option value="객관적 사실관계만 전달하고 관리자(교감) 동석 상담 안내">
                  객관적 사실 전달 + 관리자 동석 안내
                </option>
                <option value="학부모의 불안을 안정시키며 가정과의 협력 유도">
                  학부모 불안 경감 + 가정 연계 지도
                </option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !situation.trim()}
            className="w-full py-3 bg-[#00ff66] hover:bg-[#00e65c] text-black font-mono font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-40 transition-all"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>COMPILING_DEFENSE_SCRIPTS...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>GENERATE_COMMUNICATION_SCRIPTS</span>
              </>
            )}
          </button>
        </div>

        {/* Result Area */}
        {result && (
          <div className="mt-5 space-y-3 pt-4 border-t border-white/10 animate-in fade-in">
            {/* Core Principle */}
            <div className="bg-[#0c0c0e] border border-[#00ff66]/30 p-3">
              <div className="section-label text-[#00ff66] mb-1">PSYCHOLOGICAL_DEFENSE_PRINCIPLE</div>
              <p className="text-xs text-white/80 leading-relaxed font-sans">{result.principle}</p>
            </div>

            {/* Message Script */}
            <div className="bg-[#0c0c0e] border border-white/10 p-3.5 relative">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-white flex items-center gap-1.5 font-mono">
                  <MessageSquare className="w-3.5 h-3.5 text-[#00ff66]" />
                  TEXT_MESSAGE_TEMPLATE // 문자·알림장 서식
                </span>
                <button
                  onClick={() => handleCopy(result.messageScript, "msg")}
                  className="flex items-center gap-1 text-[10px] px-2 py-0.5 bg-[#141417] border border-white/10 text-white/80 hover:border-[#00ff66] font-mono"
                >
                  {copiedType === "msg" ? (
                    <>
                      <Check className="w-3 h-3 text-[#00ff66]" />
                      <span className="text-[#00ff66]">COPIED</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>COPY</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-white whitespace-pre-wrap font-mono leading-relaxed bg-[#141417] p-2.5 border border-white/10">
                {result.messageScript}
              </p>
            </div>

            {/* Phone Script */}
            <div className="bg-[#0c0c0e] border border-white/10 p-3.5 relative">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-white flex items-center gap-1.5 font-mono">
                  <Phone className="w-3.5 h-3.5 text-[#00ff66]" />
                  PHONE_CALL_SCRIPT // 전화 상담 멘트
                </span>
                <button
                  onClick={() => handleCopy(result.phoneScript, "phone")}
                  className="flex items-center gap-1 text-[10px] px-2 py-0.5 bg-[#141417] border border-white/10 text-white/80 hover:border-[#00ff66] font-mono"
                >
                  {copiedType === "phone" ? (
                    <>
                      <Check className="w-3 h-3 text-[#00ff66]" />
                      <span className="text-[#00ff66]">COPIED</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>COPY</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-white whitespace-pre-wrap font-mono leading-relaxed bg-[#141417] p-2.5 border border-white/10">
                {result.phoneScript}
              </p>
            </div>

            {/* Caution Tip */}
            {result.cautionTip && (
              <div className="bg-[#ff4444]/10 border border-[#ff4444] p-2.5 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-[#ff4444] shrink-0 mt-0.5" />
                <p className="text-xs text-white leading-snug font-sans">
                  <strong className="font-mono text-[#ff4444]">CAUTION_PROTOCOL: </strong>
                  {result.cautionTip}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

