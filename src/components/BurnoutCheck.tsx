import React, { useState } from "react";
import {
  Stethoscope,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  FileText,
  ShieldAlert,
  ArrowRight,
  Heart,
  Printer,
  Terminal,
  Activity,
  Zap,
} from "lucide-react";
import { BURNOUT_QUESTIONS } from "../data/counselingData";
import { BurnoutResult } from "../types";

interface BurnoutCheckProps {
  onOpenCounseling: () => void;
  onOpenSanctuary: () => void;
}

export const BurnoutCheck: React.FC<BurnoutCheckProps> = ({
  onOpenCounseling,
  onOpenSanctuary,
}) => {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [mainConcern, setMainConcern] = useState("학부모 민원 및 정서적 소진");
  const [result, setResult] = useState<BurnoutResult | null>(null);
  const [loadingPrescription, setLoadingPrescription] = useState(false);

  const handleSelectAnswer = (qId: number, value: number) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  const answeredCount = Object.keys(answers).length;
  const isComplete = answeredCount === BURNOUT_QUESTIONS.length;

  const calculateScore = () => {
    let total = 0;
    const domainMap: Record<string, number> = {
      "정서적 고갈": 0,
      "탈인격화/거리두기": 0,
      "교직 효능감 저하": 0,
      "신체화 증상": 0,
    };

    BURNOUT_QUESTIONS.forEach((q) => {
      const score = answers[q.id] || 1;
      total += score;
      domainMap[q.domain] = (domainMap[q.domain] || 0) + score;
    });

    let level: BurnoutResult["level"] = "안정";
    if (total >= 32) level = "심각 (즉각 휴식 필요)";
    else if (total >= 24) level = "경고";
    else if (total >= 16) level = "주의";
    else level = "안정";

    return { totalScore: total, domainMap, level };
  };

  const handleSubmitTest = async () => {
    const { totalScore, domainMap, level } = calculateScore();
    const tempResult: BurnoutResult = {
      score: totalScore,
      total: 40,
      level,
      domainScores: domainMap,
    };
    setResult(tempResult);
    setLoadingPrescription(true);

    try {
      const response = await fetch("/api/gemini/burnout-prescription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score: totalScore,
          total: 40,
          level,
          details: domainMap,
          mainConcern,
        }),
      });
      const data = await response.json();
      setResult((prev) => (prev ? { ...prev, prescription: data } : null));
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPrescription(false);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setResult(null);
  };

  const scaleLabels = [
    { value: 1, label: "전혀 아님" },
    { value: 2, label: "약간 그렇다" },
    { value: 3, label: "자주 그렇다" },
    { value: 4, label: "매우 자주" },
    { value: 5, label: "거의 항상" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 text-white font-mono">
      {/* Intro Header Card */}
      <div className="bg-[#141417] border border-white/10 p-5 sm:p-6 shadow-2xl">
        <div className="flex items-start gap-3.5">
          <div className="p-3 bg-[#00ff66] text-black shrink-0 font-bold">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="section-label">BURNOUT_TELEMETRY_ENGINE</div>
            <h2 className="text-lg sm:text-xl font-bold font-syne text-white mt-1">
              BURNOUT_ASSESSMENT // 교직 소진 척도 검사
            </h2>
            <p className="text-xs text-white/60 mt-1 font-sans leading-relaxed">
              교직 감정노동 척도(MBI-Educators)를 기반으로 정서적 고갈과 탈인격화 수준을 정밀 진단하고 AI 맞춤 처방을 발급합니다.
            </p>
          </div>
        </div>

        {/* Progress bar */}
        {!result && (
          <div className="mt-4 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between text-xs text-white/50 mb-1.5 font-mono">
              <span>PROGRESS: {answeredCount} / {BURNOUT_QUESTIONS.length} ITEMS</span>
              <span className="text-[#00ff66]">{Math.round((answeredCount / BURNOUT_QUESTIONS.length) * 100)}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#0c0c0e] border border-white/10 overflow-hidden">
              <div
                className="h-full bg-[#00ff66] transition-all duration-300"
                style={{ width: `${(answeredCount / BURNOUT_QUESTIONS.length) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Survey Form */}
      {!result ? (
        <div className="space-y-4">
          <div className="bg-[#141417] border border-white/10 p-5">
            <div className="section-label mb-2">SELECT_PRIMARY_STRESS_FACTOR</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {[
                "학부모 민원 & 악성 항의",
                "학생 생활지도 & 수업 방해",
                "과중한 행정업무 & 공문",
                "동료 및 관리자 관계 갈등",
              ].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setMainConcern(c)}
                  className={`p-2.5 border text-left font-mono transition-all text-xs ${
                    mainConcern === c
                      ? "bg-[#00ff66] border-[#00ff66] text-black font-bold"
                      : "bg-[#0c0c0e] border-white/10 text-white/60 hover:text-white hover:border-white/30"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {BURNOUT_QUESTIONS.map((q, idx) => {
              const currentVal = answers[q.id];
              return (
                <div
                  key={q.id}
                  className={`bg-[#141417] border p-4 sm:p-5 transition-all ${
                    currentVal ? "border-[#00ff66]/50 bg-[#00ff66]/5" : "border-white/10"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-[#00ff66] font-bold">
                        [{idx < 9 ? `0${idx + 1}` : idx + 1}]
                      </span>
                      <span className="text-[10px] font-mono text-white/70 bg-white/5 border border-white/10 px-2 py-0.5">
                        {q.domain}
                      </span>
                    </div>
                    {currentVal && (
                      <CheckCircle2 className="w-4 h-4 text-[#00ff66] shrink-0" />
                    )}
                  </div>

                  <p className="text-sm font-semibold text-white mb-1 font-sans">
                    {q.question}
                  </p>
                  <p className="text-xs text-white/50 mb-3.5 font-sans">
                    {q.description}
                  </p>

                  <div className="grid grid-cols-5 gap-1 sm:gap-2">
                    {scaleLabels.map((s) => (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => handleSelectAnswer(q.id, s.value)}
                        className={`py-2 px-1 text-xs border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                          currentVal === s.value
                            ? "bg-[#00ff66] text-black border-[#00ff66] font-bold"
                            : "bg-[#0c0c0e] border-white/10 text-white/60 hover:text-white hover:border-white/30"
                        }`}
                      >
                        <span className="text-sm font-bold font-mono">{s.value}</span>
                        <span className="text-[10px] hidden sm:inline leading-tight font-sans">{s.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="sticky bottom-4 z-20 pt-3">
            <button
              onClick={handleSubmitTest}
              disabled={!isComplete}
              className="w-full py-4 bg-[#00ff66] hover:bg-[#00e65c] text-black font-bold font-mono text-sm flex items-center justify-center gap-2 shadow-2xl disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Zap className="w-5 h-5" />
              <span>
                {isComplete
                  ? "GENERATE_BURNOUT_DIAGNOSIS // AI 맞춤 처방전 발급"
                  : `COMPLETE_ALL_ITEMS (${answeredCount}/${BURNOUT_QUESTIONS.length})`}
              </span>
            </button>
          </div>
        </div>
      ) : (
        /* Result & AI Prescription View */
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Result Score Card */}
          <div className="bg-[#141417] border border-white/10 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="section-label">DIAGNOSIS_OUTPUT</div>
                  <span
                    className={`px-2 py-0.5 text-xs font-mono font-bold ${
                      result.level === "안정"
                        ? "bg-[#00ff66] text-black"
                        : result.level === "주의"
                        ? "bg-amber-400 text-black"
                        : result.level === "경고"
                        ? "bg-orange-400 text-black"
                        : "bg-[#ff4444] text-white animate-pulse"
                    }`}
                  >
                    STATUS: {result.level}
                  </span>
                </div>
                <h3 className="text-2xl font-bold font-syne text-white mt-1">
                  TOTAL_SCORE: <span className="text-[#00ff66]">{result.score}</span> / 40
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-2 bg-[#0c0c0e] border border-white/10 hover:border-white/30 text-white/70 hover:text-white text-xs flex items-center gap-1 font-mono"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>PRINT</span>
                </button>
                <button
                  onClick={handleReset}
                  className="p-2 bg-[#0c0c0e] border border-white/10 hover:border-white/30 text-white/70 hover:text-white text-xs flex items-center gap-1 font-mono"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>RE_TEST</span>
                </button>
              </div>
            </div>

            {/* Domain breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
              {Object.entries(result.domainScores).map(([dom, sc]) => (
                <div key={dom} className="bg-[#0c0c0e] p-3 border border-white/10 font-mono">
                  <span className="text-[10px] text-white/40 block truncate">{dom}</span>
                  <span className="text-xl font-bold text-white mt-1 block">{sc} <span className="text-xs text-white/40 font-normal">/ 10</span></span>
                </div>
              ))}
            </div>

            {result.level === "심각 (즉각 휴식 필요)" && (
              <div className="bg-[#ff4444]/10 border border-[#ff4444] p-4 flex items-start gap-3 text-white">
                <AlertCircle className="w-5 h-5 text-[#ff4444] shrink-0 mt-0.5" />
                <div className="text-xs space-y-1 font-sans">
                  <p className="font-bold text-[#ff4444]">선생님, 지금은 의지로 버틸 때가 아니라 긴급 쉼이 필요한 순간입니다.</p>
                  <p className="text-white/80">
                    혼자 참지 마시고 교육활동보호 핫라인(1395)이나 교원치유지원센터의 전문 상담 및 병원 치료비 지원을 적극적으로 활용하시길 권장합니다.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* AI Prescription Card */}
          <div className="bg-[#141417] border border-[#00ff66]/40 p-6 relative">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#00ff66] text-black">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold font-syne text-white">
                    AI_PRESCRIPTION_REPORT // 맞춤 처방전
                  </h4>
                  <p className="text-xs text-white/40 font-sans">교원 심리 수퍼바이저 알고리즘 분석 결과</p>
                </div>
              </div>
              <span className="text-xs font-bold font-mono text-black bg-[#00ff66] px-2.5 py-1">
                DISPATCHED
              </span>
            </div>

            {loadingPrescription ? (
              <div className="py-12 text-center text-xs text-white/50 space-y-3 font-mono">
                <RefreshCw className="w-6 h-6 text-[#00ff66] animate-spin mx-auto" />
                <p className="text-white/70">
                  선생님의 검사 결과를 연산하여 맞춤형 처방 데이터를 생성 중입니다...
                </p>
              </div>
            ) : result.prescription ? (
              <div className="space-y-4 text-sm">
                {/* Summary */}
                <div className="bg-[#0c0c0e] border border-white/10 p-4">
                  <div className="section-label mb-1">STATE_ANALYSIS_SUMMARY</div>
                  <p className="text-xs text-white/80 leading-relaxed font-sans">
                    {result.prescription.summary}
                  </p>
                </div>

                {/* Empathy Message */}
                <div className="bg-[#0c0c0e] border border-[#00ff66]/30 p-4">
                  <div className="section-label mb-1 text-[#00ff66]">EMPATHIC_MESSAGE</div>
                  <p className="text-xs text-white leading-relaxed font-sans italic">
                    "{result.prescription.empathyMessage}"
                  </p>
                </div>

                {/* 3 Step Action Rules */}
                <div>
                  <div className="section-label mb-2">3_STEP_RECOVERY_ROUTINE</div>
                  <div className="space-y-2">
                    {result.prescription.prescriptionRules.map((r, i) => (
                      <div
                        key={i}
                        className="bg-[#0c0c0e] p-3.5 border border-white/10 flex items-start gap-3"
                      >
                        <div className="w-6 h-6 bg-[#00ff66] text-black font-bold font-mono text-xs flex items-center justify-center shrink-0 mt-0.5">
                          0{r.step || i + 1}
                        </div>
                        <div>
                          <strong className="text-xs font-bold text-white block mb-0.5 font-mono">
                            {r.title}
                          </strong>
                          <p className="text-xs text-white/70 leading-relaxed font-sans">
                            {r.action}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Teacher Motto */}
                <div className="text-center p-4 bg-[#0c0c0e] border border-white/10 text-xs leading-relaxed font-mono">
                  <span className="text-[#00ff66] block text-[10px] uppercase mb-1 font-bold">
                    [HEALING_MOTTO]
                  </span>
                  <span className="text-white font-sans text-sm">
                    "{result.prescription.teacherMotto}"
                  </span>
                </div>

                {/* Bottom Quick Action CTAs */}
                <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                  <button
                    onClick={onOpenCounseling}
                    className="w-full sm:flex-1 py-3 bg-[#00ff66] hover:bg-[#00e65c] text-black font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span>START_COUNSELING_CHAT</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={onOpenSanctuary}
                    className="w-full sm:flex-1 py-3 bg-[#0c0c0e] border border-white/10 hover:border-[#00ff66] text-white font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span>OPEN_MIND_SANCTUARY</span>
                    <Sparkles className="w-3.5 h-3.5 text-[#00ff66]" />
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

