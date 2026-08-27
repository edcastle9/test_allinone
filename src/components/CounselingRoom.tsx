import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Volume2,
  VolumeX,
  RefreshCw,
  Copy,
  Check,
  ShieldAlert,
  Trash2,
  ArrowRight,
  Plus,
  BarChart3,
  Terminal,
  Activity,
  Sparkles,
  ShieldCheck,
  Clock,
  ChevronRight,
  Zap,
} from "lucide-react";
import { CounselingCategory, CounselingSession } from "../types";
import { COUNSELING_CATEGORIES } from "../data/counselingData";
import { speechController } from "../utils/speech";
import { ParentScriptModal } from "./ParentScriptModal";

interface CounselingRoomProps {
  teacherSchool: string;
  teacherRole: string;
  onOpenSanctuary: () => void;
  onOpenAnalytics: () => void;
}

export const CounselingRoom: React.FC<CounselingRoomProps> = ({
  teacherSchool,
  teacherRole,
  onOpenSanctuary,
  onOpenAnalytics,
}) => {
  const [sessions, setSessions] = useState<CounselingSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>("");
  const [loadingSessions, setLoadingSessions] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState<CounselingCategory>("all");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showScriptModal, setShowScriptModal] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // 1. Fetch sessions from Backend Server on mount
  const loadSessions = async () => {
    try {
      setLoadingSessions(true);
      const res = await fetch("/api/counseling/sessions");
      const data = await res.json();
      if (data.sessions && data.sessions.length > 0) {
        setSessions(data.sessions);
        setCurrentSessionId(data.sessions[0].id);
        setSelectedCategory(data.sessions[0].category || "all");
      }
    } catch (e) {
      console.error("Failed to load sessions from server:", e);
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const currentSession = sessions.find((s) => s.id === currentSessionId) || sessions[0];

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentSession?.messages, loading]);

  useEffect(() => {
    speechController.setCallback((isSpeaking) => {
      if (!isSpeaking) setSpeakingMessageId(null);
    });
    return () => {
      speechController.stop();
    };
  }, []);

  // 2. Create a new counseling session on the server
  const handleCreateNewSession = async () => {
    try {
      const res = await fetch("/api/counseling/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "새 상담 스레드",
          schoolLevel: teacherSchool,
          teacherRole,
          category: selectedCategory,
        }),
      });
      const data = await res.json();
      if (data.session) {
        setSessions((prev) => [data.session, ...prev]);
        setCurrentSessionId(data.session.id);
      }
    } catch (e) {
      console.error("Failed to create new session:", e);
    }
  };

  // 3. Delete session from server
  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("이 상담 기록을 완전히 삭제하시겠습니까?")) {
      try {
        await fetch(`/api/counseling/sessions/${sessionId}`, { method: "DELETE" });
        const remaining = sessions.filter((s) => s.id !== sessionId);
        setSessions(remaining);
        if (currentSessionId === sessionId && remaining.length > 0) {
          setCurrentSessionId(remaining[0].id);
        } else if (remaining.length === 0) {
          handleCreateNewSession();
        }
      } catch (err) {
        console.error("Failed to delete session:", err);
      }
    }
  };

  // 4. Send Message via Backend Server API
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading || !currentSession) return;

    setInput("");
    setLoading(true);

    try {
      const response = await fetch(`/api/counseling/sessions/${currentSession.id}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          category: selectedCategory,
          teacherRole,
          schoolLevel: teacherSchool,
        }),
      });

      const data = await response.json();
      if (data.session) {
        setSessions((prev) =>
          prev.map((s) => (s.id === data.session.id ? data.session : s))
        );
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeech = (id: string, text: string) => {
    if (speakingMessageId === id) {
      speechController.stop();
      setSpeakingMessageId(null);
    } else {
      speechController.speak(text);
      setSpeakingMessageId(id);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const currentCategoryInfo =
    COUNSELING_CATEGORIES.find((c) => c.id === selectedCategory) ||
    COUNSELING_CATEGORIES[0];

  return (
    <div className="w-full h-[calc(100vh-64px)] flex flex-col lg:flex-row overflow-hidden bg-[#0c0c0e] text-white">
      {/* 1. Left Pane: Archive Sessions & Category Filters */}
      <aside className="w-full lg:w-72 shrink-0 bg-[#0c0c0e] border-r border-white/10 flex flex-col h-auto lg:h-full select-none">
        {/* Pane Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <div className="section-label">ARCHIVE_THREADS</div>
            <div className="text-[10px] text-white/40 font-mono mt-0.5">
              DB_LOGS: {sessions.length} THREADS
            </div>
          </div>
          <button
            onClick={handleCreateNewSession}
            className="px-2.5 py-1 bg-[#00ff66] hover:bg-[#00e65c] text-black font-mono font-bold text-[11px] flex items-center gap-1 transition-all rounded-xs"
            title="새 상담 스레드 생성"
          >
            <Plus className="w-3 h-3 stroke-[3]" />
            <span>NEW</span>
          </button>
        </div>

        {/* Category Quick Tags */}
        <div className="p-3 border-b border-white/10 bg-[#141417]/50">
          <div className="text-[10px] font-mono text-white/40 mb-1.5 flex items-center justify-between">
            <span>[STRESS_DOMAINS]</span>
            <span className="text-[#00ff66]">{selectedCategory.toUpperCase()}</span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {COUNSELING_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-1.5 py-1 rounded-xs text-[10px] font-mono truncate transition-all text-center ${
                  selectedCategory === cat.id
                    ? "bg-[#00ff66] text-black font-bold"
                    : "bg-[#141417] text-white/60 border border-white/5 hover:border-white/20 hover:text-white"
                }`}
              >
                {cat.name.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sessions.map((sess) => {
            const isSelected = sess.id === currentSession?.id;
            return (
              <div
                key={sess.id}
                onClick={() => setCurrentSessionId(sess.id)}
                className={`p-2.5 rounded-xs border text-left cursor-pointer transition-all flex items-center justify-between group font-mono ${
                  isSelected
                    ? "bg-[#141417] border-[#00ff66] text-white"
                    : "bg-[#0c0c0e] border-white/5 text-white/60 hover:bg-[#141417] hover:border-white/20 hover:text-white"
                }`}
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSelected ? "bg-[#00ff66] animate-pulse" : "bg-white/20"
                      }`}
                    />
                    <p className="text-xs truncate font-medium">
                      {sess.title || "상담 스레드"}
                    </p>
                  </div>
                  <div className="text-[10px] text-white/40 flex items-center gap-2 mt-1 pl-3 font-mono">
                    <span>
                      {new Date(sess.updatedAt || sess.createdAt).toLocaleDateString("ko-KR", {
                        month: "2-digit",
                        day: "2-digit",
                      })}
                    </span>
                    <span>//</span>
                    <span>{sess.messages.length} MSGS</span>
                  </div>
                </div>

                {sessions.length > 1 && (
                  <button
                    onClick={(e) => handleDeleteSession(sess.id, e)}
                    className="p-1 text-white/20 hover:text-[#ff4444] opacity-0 group-hover:opacity-100 transition-opacity"
                    title="스레드 삭제"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer System Status */}
        <div className="p-3 border-t border-white/10 bg-[#141417] font-mono text-[10px] text-white/40 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00ff66]" />
            <span>NODE: LOCAL_EXPRESS</span>
          </div>
          <span>ENCRYPT: AES-256</span>
        </div>
      </aside>

      {/* 2. Center Pane: Terminal Chat Screen */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#0c0c0e] terminal-grid relative">
        {/* Top Chat Status Header */}
        <div className="h-12 bg-[#141417] border-b border-white/10 px-4 flex items-center justify-between shrink-0 font-mono text-xs select-none">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-4 h-4 text-[#00ff66]" />
            <span className="text-white/80 font-bold truncate max-w-xs sm:max-w-md">
              THREAD: {currentSession?.id?.slice(0, 16) || "SYS_SESSION"}
            </span>
            <span className="hidden sm:inline-block px-1.5 py-0.5 bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/30 text-[10px] font-mono rounded-xs">
              ROLE: {teacherSchool}_{teacherRole}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAnalytics}
              className="hidden sm:flex items-center gap-1 text-[11px] text-[#00ff66] hover:underline"
            >
              <BarChart3 className="w-3 h-3" />
              <span>STRESS_TELEMETRY</span>
            </button>
          </div>
        </div>

        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {currentSession?.messages.map((m) => {
            const isUser = m.role === "user";
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
              >
                {/* Meta Header */}
                <div className="flex items-center gap-2 text-[10px] font-mono text-white/40 mb-1 px-1">
                  <span className={isUser ? "text-white/60" : "text-[#00ff66]"}>
                    {isUser ? `[USER // ${teacherRole}]` : `[AI_COUNSELOR // TODAK_V3]`}
                  </span>
                  <span>//</span>
                  <span>{m.timestamp}</span>
                </div>

                {/* Message Box */}
                <div
                  className={`max-w-[92%] sm:max-w-[85%] p-4 rounded-xs text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans transition-all ${
                    isUser
                      ? "bg-[#141417] border border-[#00ff66]/30 text-white font-normal shadow-lg"
                      : "bg-[#141417] border-l-2 border-l-[#00ff66] border-y border-r border-white/10 text-white/90 shadow-2xl"
                  }`}
                >
                  {m.content}

                  {!isUser && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10 font-mono text-[11px]">
                      <button
                        onClick={() => handleSpeech(m.id, m.content)}
                        className={`flex items-center gap-1 px-2 py-1 rounded-xs border transition-all ${
                          speakingMessageId === m.id
                            ? "bg-[#00ff66] text-black font-bold border-[#00ff66]"
                            : "bg-[#0c0c0e] border-white/10 text-white/60 hover:text-white hover:border-white/30"
                        }`}
                      >
                        {speakingMessageId === m.id ? (
                          <>
                            <VolumeX className="w-3 h-3" />
                            <span>TTS_STOP</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3" />
                            <span>TTS_PLAY</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleCopy(m.id, m.content)}
                        className="flex items-center gap-1 px-2 py-1 rounded-xs bg-[#0c0c0e] border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-all"
                      >
                        {copiedId === m.id ? (
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
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex flex-col items-start space-y-1">
              <div className="text-[10px] font-mono text-[#00ff66] px-1 animate-pulse">
                [AI_COUNSELOR // COMPUTING_DIAGNOSTICS]
              </div>
              <div className="bg-[#141417] border-l-2 border-[#00ff66] border-y border-r border-white/10 p-4 rounded-xs text-xs text-white/60 flex items-center gap-3">
                <RefreshCw className="w-4 h-4 text-[#00ff66] animate-spin" />
                <span className="font-mono">
                  선생님의 교직 스트레스 벡터를 분석하고 맞춤 위로·대응책을 생성 중입니다...
                </span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-[#0c0c0e]/90 border-t border-white/10">
          <div className="text-[10px] font-mono text-white/40 mb-1 flex items-center gap-1">
            <Zap className="w-3 h-3 text-[#00ff66]" />
            <span>QUICK_DIAGNOSTIC_PROMPTS:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {currentCategoryInfo.samplePrompts.slice(0, 2).map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                disabled={loading}
                className="text-left text-xs bg-[#141417] hover:bg-white/5 border border-white/10 hover:border-[#00ff66]/50 p-2 text-white/70 hover:text-white transition-all flex items-center justify-between group rounded-xs font-mono truncate"
              >
                <span className="truncate pr-2">"{prompt}"</span>
                <ChevronRight className="w-3 h-3 text-white/30 group-hover:text-[#00ff66] shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Terminal Input Bar */}
        <div className="p-3 sm:p-4 bg-[#141417] border-t border-white/10 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-[#00ff66] text-sm pointer-events-none">
                &gt;
              </span>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="오늘 하루 교실과 교무실에서 선생님을 소진시킨 일들을 적어보세요..."
                disabled={loading}
                className="w-full pl-8 pr-4 py-2.5 bg-[#0c0c0e] border border-white/10 focus:border-[#00ff66] rounded-xs text-xs sm:text-sm text-white focus:outline-hidden font-sans placeholder:text-white/30"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-5 py-2.5 bg-[#00ff66] hover:bg-[#00e65c] text-black font-mono font-bold text-xs sm:text-sm flex items-center gap-1.5 rounded-xs disabled:opacity-30 transition-all shrink-0"
            >
              <span>EXECUTE</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </main>

      {/* 3. Right Pane: Diagnostic Telemetry & Rapid Coping Tools */}
      <aside className="hidden xl:flex w-72 shrink-0 bg-[#0c0c0e] border-l border-white/10 flex-col h-full select-none">
        <div className="p-4 border-b border-white/10">
          <div className="section-label">TELEMETRY_DIAGNOSTICS</div>
          <div className="text-[10px] text-white/40 font-mono mt-0.5">
            REALTIME STRESS CLASSIFIER
          </div>
        </div>

        <div className="p-4 space-y-4 flex-1 overflow-y-auto font-mono text-xs">
          {/* Active Profile */}
          <div className="bg-[#141417] border border-white/10 p-3 rounded-xs space-y-2">
            <div className="text-[10px] text-white/40">[ASSIGNED_PROFILE]</div>
            <div className="text-sm font-bold text-[#00ff66]">
              {teacherSchool} // {teacherRole}
            </div>
            <div className="text-[11px] text-white/60 leading-relaxed font-sans">
              교권 및 행정 압박으로부터 교사의 심리 안전지대를 형성합니다.
            </div>
          </div>

          {/* Quick Script Generator */}
          <div className="bg-[#141417] border border-white/10 p-3 rounded-xs space-y-2">
            <div className="text-[10px] text-[#ff4444] font-mono flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" />
              <span>[CRISIS_SHIELD]</span>
            </div>
            <div className="text-xs font-semibold text-white">학부모 민원 방어 스크립트</div>
            <p className="text-[11px] text-white/60 font-sans leading-normal">
              무리한 요구 및 악성 민원에 대해 법률적·교육적 근거를 바탕으로 정중하고 단호하게 거절하는 표준 문안을 제공합니다.
            </p>
            <button
              onClick={() => setShowScriptModal(true)}
              className="w-full mt-2 py-2 bg-[#141417] hover:bg-white/5 border border-white/20 hover:border-[#00ff66] text-[#00ff66] text-xs font-mono font-bold flex items-center justify-center gap-1 transition-all rounded-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>GENERATE_SCRIPT</span>
            </button>
          </div>

          {/* Quick Shortcut: 3min Sanctuary */}
          <div className="bg-[#141417] border border-white/10 p-3 rounded-xs space-y-2">
            <div className="text-[10px] text-[#00ff66] font-mono flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>[RECOVERY_MODULE]</span>
            </div>
            <div className="text-xs font-semibold text-white">퇴근 후 3분 감정 리셋</div>
            <p className="text-[11px] text-white/60 font-sans leading-normal">
              4-7-8 이완 호흡 사이클 및 교실 스트레스 메모리 소거(Shredder) 세션
            </p>
            <button
              onClick={onOpenSanctuary}
              className="w-full mt-2 py-2 bg-[#00ff66] hover:bg-[#00e65c] text-black text-xs font-mono font-bold flex items-center justify-center gap-1 transition-all rounded-xs"
            >
              <span>RUN_SANCTUARY</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/10 bg-[#141417] text-[10px] font-mono text-white/40 flex items-center justify-between">
          <span>AI_ENGINE: GEMINI_3.7_FLASH</span>
          <span className="text-[#00ff66]">ACTIVE</span>
        </div>
      </aside>

      {/* Script Generator Modal */}
      <ParentScriptModal
        isOpen={showScriptModal}
        onClose={() => setShowScriptModal(false)}
      />
    </div>
  );
};

