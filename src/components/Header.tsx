import React, { useState, useEffect } from "react";
import {
  Volume2,
  VolumeX,
  PhoneCall,
  User,
  CloudRain,
  Trees,
  Music,
  Bell,
  Activity,
  Terminal,
  Shield,
} from "lucide-react";
import { ambientSound } from "../utils/audioSynthesizer";

interface HeaderProps {
  activeTab: "counseling" | "burnout" | "sanctuary" | "diary" | "analytics";
  onTabChange: (tab: "counseling" | "burnout" | "sanctuary" | "diary" | "analytics") => void;
  onOpenHotline: () => void;
  teacherSchool: string;
  teacherRole: string;
  onUpdateRole: (school: string, role: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenHotline,
  teacherSchool,
  teacherRole,
  onUpdateRole,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [soundMode, setSoundMode] = useState<"rain" | "forest" | "piano" | "bowl">("rain");
  const [volume, setVolume] = useState(0.3);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [tempSchool, setTempSchool] = useState(teacherSchool);
  const [tempRole, setTempRole] = useState(teacherRole);

  useEffect(() => {
    setTempSchool(teacherSchool);
    setTempRole(teacherRole);
  }, [teacherSchool, teacherRole]);

  const toggleAudio = (mode?: "rain" | "forest" | "piano" | "bowl") => {
    const targetMode = mode || soundMode;
    if (isPlayingAudio && targetMode === soundMode && !mode) {
      ambientSound.stop();
      setIsPlayingAudio(false);
    } else {
      setSoundMode(targetMode);
      ambientSound.play(targetMode, volume);
      setIsPlayingAudio(true);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    ambientSound.setVolume(newVol);
  };

  const handleSaveRole = () => {
    onUpdateRole(tempSchool, tempRole);
    setShowRoleModal(false);
  };

  const navItems = [
    {
      id: "counseling" as const,
      index: "[01]",
      label: "CHAT_CORE",
      koreanLabel: "AI 상담실",
    },
    {
      id: "analytics" as const,
      index: "[02]",
      label: "STRESS_DATA",
      koreanLabel: "스트레스 분석",
    },
    {
      id: "sanctuary" as const,
      index: "[03]",
      label: "RECOVERY",
      koreanLabel: "3분 쉼터",
    },
    {
      id: "burnout" as const,
      index: "[04]",
      label: "BURNOUT_TEST",
      koreanLabel: "번아웃 진단",
    },
    {
      id: "diary" as const,
      index: "[05]",
      label: "SECRET_DIARY",
      koreanLabel: "감정 일기",
    },
  ];

  return (
    <header className="h-16 bg-[#0c0c0e] border-b border-white/10 flex items-center justify-between sticky top-0 z-40 select-none">
      {/* Left: Solid Accent Logo Area */}
      <div className="flex items-center h-full">
        <button
          onClick={() => onTabChange("counseling")}
          className="h-full px-5 bg-[#00ff66] text-black font-syne font-extrabold text-base tracking-tight flex items-center gap-2 hover:bg-[#00e65c] transition-colors shrink-0"
        >
          <span>토닥토닥 교사실</span>
          <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center h-full px-4 gap-1 lg:gap-3 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`h-full px-2.5 lg:px-3 text-xs font-mono tracking-wider transition-all flex items-center gap-1.5 border-b-2 ${
                  isActive
                    ? "text-[#00ff66] border-[#00ff66] font-semibold bg-white/[0.03]"
                    : "text-white/40 border-transparent hover:text-white hover:bg-white/[0.02]"
                }`}
              >
                <span className={isActive ? "text-[#00ff66]" : "text-white/30"}>
                  {item.index}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Right: Audio Synthesizer + Teacher Identity + Hotline */}
      <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-5 font-mono text-xs">
        {/* Ambient Sound Module */}
        <div className="hidden lg:flex items-center gap-1 bg-[#141417] border border-white/10 px-2 py-1 rounded">
          <button
            onClick={() => toggleAudio()}
            className={`px-2 py-0.5 rounded text-[11px] font-mono flex items-center gap-1 transition-all ${
              isPlayingAudio
                ? "bg-[#00ff66] text-black font-bold"
                : "text-white/50 hover:text-white"
            }`}
            title="Ambient Audio Generator"
          >
            {isPlayingAudio ? (
              <>
                <Volume2 className="w-3 h-3 animate-pulse" />
                <span>AUDIO_ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3 h-3" />
                <span>AUDIO_OFF</span>
              </>
            )}
          </button>

          {isPlayingAudio && (
            <div className="flex items-center gap-1 pl-1.5 border-l border-white/10">
              <button
                onClick={() => toggleAudio("rain")}
                className={`px-1.5 py-0.5 text-[10px] rounded ${
                  soundMode === "rain" ? "text-[#00ff66] bg-white/10 font-bold" : "text-white/40 hover:text-white"
                }`}
              >
                RAIN
              </button>
              <button
                onClick={() => toggleAudio("forest")}
                className={`px-1.5 py-0.5 text-[10px] rounded ${
                  soundMode === "forest" ? "text-[#00ff66] bg-white/10 font-bold" : "text-white/40 hover:text-white"
                }`}
              >
                WIND
              </button>
              <button
                onClick={() => toggleAudio("piano")}
                className={`px-1.5 py-0.5 text-[10px] rounded ${
                  soundMode === "piano" ? "text-[#00ff66] bg-white/10 font-bold" : "text-white/40 hover:text-white"
                }`}
              >
                PIANO
              </button>
              <button
                onClick={() => toggleAudio("bowl")}
                className={`px-1.5 py-0.5 text-[10px] rounded ${
                  soundMode === "bowl" ? "text-[#00ff66] bg-white/10 font-bold" : "text-white/40 hover:text-white"
                }`}
              >
                BOWL
              </button>
              <input
                type="range"
                min="0.05"
                max="0.8"
                step="0.05"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-12 h-1 accent-[#00ff66] bg-white/20 rounded cursor-pointer ml-1"
              />
            </div>
          )}
        </div>

        {/* Teacher ID Badge / Config Switch */}
        <button
          onClick={() => setShowRoleModal(true)}
          className="flex items-center gap-1.5 bg-[#141417] border border-white/10 hover:border-[#00ff66]/50 px-2.5 py-1 text-white/80 hover:text-[#00ff66] transition-colors rounded text-[11px]"
          title="교사 프로필 설정 변경"
        >
          <User className="w-3 h-3 text-[#00ff66]" />
          <span>ID: {teacherSchool}_{teacherRole}</span>
        </button>

        {/* Hotline Emergency */}
        <button
          onClick={onOpenHotline}
          className="hidden sm:flex items-center gap-1 border border-[#ff4444]/60 text-[#ff4444] hover:bg-[#ff4444]/10 px-2 py-1 rounded text-[11px] transition-colors"
        >
          <PhoneCall className="w-3 h-3" />
          <span>CRISIS: 1395</span>
        </button>
      </div>

      {/* Mobile Tab Bar below header */}
      <div className="md:hidden flex items-center space-x-1 overflow-x-auto no-scrollbar fixed top-16 left-0 right-0 bg-[#0c0c0e] border-b border-white/10 px-3 py-1.5 z-30">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`px-2.5 py-1 text-[11px] font-mono whitespace-nowrap rounded ${
                isActive
                  ? "bg-[#00ff66] text-black font-bold"
                  : "text-white/50 bg-[#141417] border border-white/10"
              }`}
            >
              {item.index} {item.label}
            </button>
          );
        })}
      </div>

      {/* Teacher Role Settings Modal in Terminal Dark Style */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-100">
          <div className="bg-[#141417] border border-white/20 max-w-md w-full p-6 text-white font-mono shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <span className="section-label">USER_CONFIGURATION</span>
              <span className="text-[10px] text-white/40">SYS_V3.0</span>
            </div>

            <p className="text-xs text-white/60 mb-4 leading-relaxed font-sans">
              교직 환경을 재설정하면 AI 멘토가 교급 및 역할에 특화된 분석 및 심리 방어 스크립트를 제공합니다.
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] text-[#00ff66] mb-1.5">
                  [SCHOOL_CLASSIFICATION]
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["초등학교", "중학교", "고등학교", "유치원/특수학교"].map((sch) => (
                    <button
                      key={sch}
                      type="button"
                      onClick={() => setTempSchool(sch)}
                      className={`p-2 border text-left transition-all ${
                        tempSchool === sch
                          ? "bg-[#00ff66]/10 border-[#00ff66] text-[#00ff66] font-bold"
                          : "bg-[#0c0c0e] border-white/10 text-white/60 hover:border-white/30"
                      }`}
                    >
                      {sch}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-[#00ff66] mb-1.5">
                  [TEACHER_ROLE_ASSIGNMENT]
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "담임교사",
                    "교과전담/교과교사",
                    "부장교사/보직교사",
                    "신규/저경력 교사 (1~3년차)",
                    "기간제 교사",
                    "보건/상담/영양/사서교사",
                  ].map((rol) => (
                    <button
                      key={rol}
                      type="button"
                      onClick={() => setTempRole(rol)}
                      className={`p-2 border text-left transition-all ${
                        tempRole === rol
                          ? "bg-[#00ff66]/10 border-[#00ff66] text-[#00ff66] font-bold"
                          : "bg-[#0c0c0e] border-white/10 text-white/60 hover:border-white/30"
                      }`}
                    >
                      {rol}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-6 pt-3 border-t border-white/10">
              <button
                onClick={() => setShowRoleModal(false)}
                className="px-4 py-2 border border-white/10 hover:border-white/30 text-white/50 hover:text-white text-xs"
              >
                CANCEL
              </button>
              <button
                onClick={handleSaveRole}
                className="px-5 py-2 bg-[#00ff66] hover:bg-[#00e65c] text-black text-xs font-bold"
              >
                APPLY_CHANGES
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

