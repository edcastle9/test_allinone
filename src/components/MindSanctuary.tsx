import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Wind,
  Trash2,
  Volume2,
  RefreshCw,
  Flower2,
  CheckCircle,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Terminal,
  Activity,
  Heart,
  Cpu,
} from "lucide-react";
import confetti from "canvas-confetti";
import { ComfortCardData } from "../types";
import { INITIAL_COMFORT_CARDS } from "../data/counselingData";
import { speechController } from "../utils/speech";

export const MindSanctuary: React.FC = () => {
  const [subTab, setSubTab] = useState<"breathing" | "vent" | "cards">("breathing");

  // 1. 4-7-8 Breathing States
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [breathTimer, setBreathTimer] = useState(4);
  const [cycleCount, setCycleCount] = useState(0);

  useEffect(() => {
    let interval: any = null;
    if (breathingActive) {
      interval = setInterval(() => {
        setBreathTimer((prev) => {
          if (prev <= 1) {
            if (breathPhase === "inhale") {
              setBreathPhase("hold");
              return 7;
            } else if (breathPhase === "hold") {
              setBreathPhase("exhale");
              return 8;
            } else {
              setBreathPhase("inhale");
              setCycleCount((c) => c + 1);
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [breathingActive, breathPhase]);

  const handleToggleBreathing = () => {
    if (breathingActive) {
      setBreathingActive(false);
    } else {
      setBreathingActive(true);
      setBreathPhase("inhale");
      setBreathTimer(4);
    }
  };

  const handleResetBreathing = () => {
    setBreathingActive(false);
    setBreathPhase("inhale");
    setBreathTimer(4);
    setCycleCount(0);
  };

  // 2. Vent & Release States
  const [ventText, setVentText] = useState("");
  const [isReleasing, setIsReleasing] = useState(false);
  const [releaseSuccess, setReleaseSuccess] = useState(false);

  const handleReleaseWorry = (type: "stars" | "shred") => {
    if (!ventText.trim()) return;
    setIsReleasing(true);

    if (type === "stars") {
      confetti({
        particleCount: 100,
        spread: 90,
        origin: { y: 0.6 },
        colors: ["#00ff66", "#38bdf8", "#fbbf24", "#ffffff"],
      });
    }

    setTimeout(() => {
      setIsReleasing(false);
      setVentText("");
      setReleaseSuccess(true);
      setTimeout(() => setReleaseSuccess(false), 4000);
    }, 1200);
  };

  // 3. Comfort Cards States
  const [cards, setCards] = useState<ComfortCardData[]>(INITIAL_COMFORT_CARDS);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isGeneratingCard, setIsGeneratingCard] = useState(false);
  const [userMoodInput, setUserMoodInput] = useState("");

  const handleGenerateCustomCard = async () => {
    setIsGeneratingCard(true);
    try {
      const response = await fetch("/api/gemini/comfort-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mood: userMoodInput || "오늘 하루 지친 교사의 피로와 자책감",
          todayIssue: "교실에서의 크고 작은 긴장과 피로",
        }),
      });
      const newCard = await response.json();
      setCards((prev) => [newCard, ...prev]);
      setActiveCardIndex(0);
      setUserMoodInput("");
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingCard(false);
    }
  };

  const currentCard = cards[activeCardIndex] || cards[0];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 text-white font-mono">
      {/* Sub-tabs Header */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => setSubTab("breathing")}
          className={`px-4 py-2 text-xs font-mono transition-all border ${
            subTab === "breathing"
              ? "bg-[#00ff66] text-black font-bold border-[#00ff66]"
              : "bg-[#141417] text-white/50 border-white/10 hover:text-white hover:border-white/30"
          }`}
        >
          [01] 4-7-8_BREATHE_CYCLE
        </button>
        <button
          onClick={() => setSubTab("vent")}
          className={`px-4 py-2 text-xs font-mono transition-all border ${
            subTab === "vent"
              ? "bg-[#00ff66] text-black font-bold border-[#00ff66]"
              : "bg-[#141417] text-white/50 border-white/10 hover:text-white hover:border-white/30"
          }`}
        >
          [02] MEMORY_PURGE_SHREDDER
        </button>
        <button
          onClick={() => setSubTab("cards")}
          className={`px-4 py-2 text-xs font-mono transition-all border ${
            subTab === "cards"
              ? "bg-[#00ff66] text-black font-bold border-[#00ff66]"
              : "bg-[#141417] text-white/50 border-white/10 hover:text-white hover:border-white/30"
          }`}
        >
          [03] AFFIRMATION_CARDS
        </button>
      </div>

      {/* 1. 4-7-8 Breathing Guide */}
      {subTab === "breathing" && (
        <div className="bg-[#141417] border border-white/10 p-6 sm:p-10 text-center relative overflow-hidden">
          <div className="max-w-md mx-auto space-y-6">
            <div>
              <div className="section-label justify-center">NEURO_RESPIRATORY_CALIBRATION</div>
              <h3 className="text-xl font-bold font-syne mt-2">
                교문 밖 심리 스위치 OFF 이완 호흡
              </h3>
              <p className="text-xs text-white/50 mt-1 font-sans">
                4초 들이마시고, 7초 머금고, 8초 동안 길게 내쉬며 교직 긴장을 풉니다.
              </p>
            </div>

            {/* Visual Animated Orb */}
            <div className="relative w-64 h-64 mx-auto flex items-center justify-center my-6">
              {/* Outer pulsing ring */}
              <div
                className={`absolute inset-0 rounded-full transition-all duration-1000 ease-in-out border-2 ${
                  breathingActive
                    ? breathPhase === "inhale"
                      ? "scale-110 border-[#00ff66] bg-[#00ff66]/10"
                      : breathPhase === "hold"
                      ? "scale-110 border-amber-400 bg-amber-400/10"
                      : "scale-90 border-cyan-400 bg-cyan-400/10"
                    : "scale-95 border-white/10"
                }`}
              />

              {/* Inner Circle with Status */}
              <div className="w-48 h-48 rounded-full bg-[#0c0c0e] flex flex-col items-center justify-center border border-white/20 shadow-2xl z-10">
                <span className="text-4xl font-mono font-bold text-[#00ff66]">
                  {breathingActive ? breathTimer : "--"}
                </span>
                <span className="text-[11px] font-mono mt-1 text-white/70">
                  {breathingActive
                    ? breathPhase === "inhale"
                      ? "INHALE (4s)"
                      : breathPhase === "hold"
                      ? "HOLD (7s)"
                      : "EXHALE (8s)"
                    : "PRESS_START"}
                </span>
              </div>
            </div>

            {/* Cycle Counter */}
            <div className="text-xs text-white/50">
              <span>COMPLETED_CYCLES: </span>
              <strong className="text-[#00ff66] font-bold">{cycleCount}</strong>
              <p className="mt-1 text-[11px] text-white/40 font-sans">
                "어깨의 힘을 툭 빼고, 오늘 교실에서 마주친 모든 무거운 에너지를 밖으로 비워냅니다."
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={handleToggleBreathing}
                className="px-6 py-3 bg-[#00ff66] hover:bg-[#00e65c] text-black font-mono font-bold text-xs flex items-center gap-2 transition-all"
              >
                {breathingActive ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>PAUSE_LOOP</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>START_RESPIRATION</span>
                  </>
                )}
              </button>
              <button
                onClick={handleResetBreathing}
                className="p-3 bg-[#0c0c0e] border border-white/10 hover:border-white/30 text-white/70 hover:text-white transition-colors"
                title="처음부터 다시"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Vent & Release */}
      {subTab === "vent" && (
        <div className="bg-[#141417] border border-white/10 p-6 sm:p-8">
          <div className="max-w-xl mx-auto space-y-5">
            <div className="text-center">
              <div className="section-label justify-center">MEMORY_PURGE_PROTOCOL</div>
              <h3 className="text-lg font-bold font-syne text-white mt-1">
                오늘의 상처와 억울함 소거 (Vent & Purge)
              </h3>
              <p className="text-xs text-white/50 mt-1 font-sans leading-relaxed">
                오늘 학부모에게 들었던 날카로운 말, 교실의 자괴감, 억울함을 적어보세요. 적힌 텍스트는 영구히 파쇄되며 어디에도 기록되지 않습니다.
              </p>
            </div>

            <div>
              <textarea
                rows={5}
                value={ventText}
                onChange={(e) => setVentText(e.target.value)}
                placeholder="예: 오늘 학부모가 교실 상황도 모르면서 쏘아붙인 메시지에 가슴이 철렁했습니다..."
                className="w-full p-4 bg-[#0c0c0e] border border-white/10 focus:border-[#00ff66] text-xs text-white leading-relaxed font-sans focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => handleReleaseWorry("stars")}
                disabled={isReleasing || !ventText.trim()}
                className="py-3 bg-[#141417] hover:bg-white/5 border border-[#00ff66]/50 text-[#00ff66] font-mono font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-30 transition-all"
              >
                <Sparkles className="w-4 h-4 text-[#00ff66]" />
                <span>[PURGE_TO_STARS]</span>
              </button>
              <button
                onClick={() => handleReleaseWorry("shred")}
                disabled={isReleasing || !ventText.trim()}
                className="py-3 bg-[#141417] hover:bg-white/5 border border-[#ff4444]/50 text-[#ff4444] font-mono font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-30 transition-all"
              >
                <Trash2 className="w-4 h-4 text-[#ff4444]" />
                <span>[SHRED_MEMORY_DATA]</span>
              </button>
            </div>

            {releaseSuccess && (
              <div className="p-4 bg-[#0c0c0e] border border-[#00ff66] text-white text-center text-xs space-y-1">
                <p className="font-bold text-[#00ff66] flex items-center justify-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  MEMORY_PURGE_SUCCESSFUL
                </p>
                <p className="text-white/70 font-sans">
                  교문 밖을 나선 선생님의 오늘 밤은 온전히 평온하고 따뜻할 자격이 있습니다.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Daily Comfort Cards */}
      {subTab === "cards" && (
        <div className="space-y-6">
          <div className="bg-[#141417] border border-[#00ff66]/40 p-6 sm:p-8 relative">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <div className="section-label">AFFIRMATION_TELEMETRY</div>
              <button
                onClick={() => speechController.speak(`${currentCard.title}. ${currentCard.quote}. 오늘의 확언. ${currentCard.affirmation}`)}
                className="px-2.5 py-1 bg-[#0c0c0e] border border-white/10 hover:border-[#00ff66] text-white/80 hover:text-white text-xs flex items-center gap-1 font-mono"
              >
                <Volume2 className="w-3.5 h-3.5 text-[#00ff66]" />
                <span>TTS_PLAY</span>
              </button>
            </div>

            <div className="space-y-4 my-2">
              <h3 className="text-xl sm:text-2xl font-bold font-syne text-white leading-snug">
                "{currentCard.title}"
              </h3>
              <p className="text-sm sm:text-base text-white/80 font-sans leading-relaxed italic">
                {currentCard.quote}
              </p>

              <div className="bg-[#0c0c0e] p-4 border border-white/10 space-y-2 mt-4 font-mono">
                <div>
                  <span className="text-[10px] text-[#00ff66] block">[TODAYS_AFFIRMATION]</span>
                  <p className="text-xs font-bold text-white font-sans mt-0.5">{currentCard.affirmation}</p>
                </div>

                <div className="pt-2 border-t border-white/10">
                  <span className="text-[10px] text-white/40 block">[1MIN_MICRO_MISSION]</span>
                  <p className="text-xs text-white/70 font-sans mt-0.5">{currentCard.microMission}</p>
                </div>

                {currentCard.flowerLanguage && (
                  <div className="pt-2 border-t border-white/10 text-[11px] text-[#00ff66] flex items-center gap-1.5">
                    <Flower2 className="w-3.5 h-3.5" />
                    <span>BOTANICAL_SYMBOL: {currentCard.flowerLanguage}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Carousel Navigation */}
            <div className="flex items-center justify-center gap-2 pt-4">
              {cards.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveCardIndex(idx)}
                  className={`h-1.5 transition-all ${
                    activeCardIndex === idx ? "w-6 bg-[#00ff66]" : "w-2 bg-white/20"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* AI Custom Card Generator */}
          <div className="bg-[#141417] border border-white/10 p-5">
            <div className="section-label mb-2">DYNAMIC_CARD_GENERATOR</div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={userMoodInput}
                onChange={(e) => setUserMoodInput(e.target.value)}
                placeholder="예: 학부모 민원 때문에 손이 떨려요, 수업 통제가 안 되어 자책 중이에요..."
                className="flex-1 px-4 py-2.5 bg-[#0c0c0e] border border-white/10 focus:border-[#00ff66] text-xs text-white font-sans focus:outline-hidden"
              />
              <button
                onClick={handleGenerateCustomCard}
                disabled={isGeneratingCard}
                className="px-5 py-2.5 bg-[#00ff66] hover:bg-[#00e65c] text-black font-mono font-bold text-xs flex items-center justify-center gap-1.5 disabled:opacity-50 transition-all shrink-0"
              >
                {isGeneratingCard ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>COMPUTING...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>GENERATE_CARD</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

