import React, { useState, useEffect } from "react";
import {
  BookHeart,
  Mail,
  Sparkles,
  RefreshCw,
  Trash2,
  Calendar,
  Sun,
  CloudRain,
  Cloud,
  Zap,
  Wind,
  Plus,
  Volume2,
  Terminal,
} from "lucide-react";
import { DiaryEntry } from "../types";
import { speechController } from "../utils/speech";

export const SecretDiary: React.FC = () => {
  const [entries, setEntries] = useState<DiaryEntry[]>(() => {
    const saved = localStorage.getItem("teacher_secret_diary");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: "sample-1",
        date: new Date().toISOString().split("T")[0],
        emotion: "소나기",
        title: "오늘 하루 종일 가슴이 조여왔던 날",
        content: `오늘 3교시 수업 시간에 아이들이 통제가 안 되어 소리를 질러버렸다. 교사로서 품위를 잃은 것 같아 자책감이 든다. 방과 후에는 한 학부모님께서 왜 우리 아이를 그렇게 혼내냐며 항의 전화를 주셨다. 나도 사람인데, 어디까지 참고 어디까지 버텨야 할까...`,
        aiLetter: `선생님, 오늘 일기 속에 담긴 고단함과 서러움이 마음 깊이 전해집니다.\n\n선생님이 소리를 질렀던 것은 무능해서가 아니라, 그동안 꾹꾹 참아왔던 인내의 잔이 넘칠 만큼 최선을 다해 버텼기 때문입니다. 교사도 상처받고 지치는 온전한 사람입니다.\n\n오늘 밤은 스스로를 향한 날카로운 잣대를 내려놓으세요. 선생님은 오늘도 아이들을 위해 온 힘을 다하셨고, 그 자체로 존경받아 마땅합니다. 푹 쉬시고 따뜻한 차 한 잔으로 마음을 꼭 안아주세요.`,
        tags: ["학생 지도", "학부모", "자책감"],
      },
    ];
  });

  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(entries[0] || null);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [emotion, setEmotion] = useState("소나기");
  const [selectedTags, setSelectedTags] = useState<string[]>(["학생 지도"]);
  const [loadingLetter, setLoadingLetter] = useState(false);

  useEffect(() => {
    localStorage.setItem("teacher_secret_diary", JSON.stringify(entries));
  }, [entries]);

  const emotionOptions = [
    { name: "맑음", icon: Sun },
    { name: "구름 조금", icon: Cloud },
    { name: "소나기", icon: CloudRain },
    { name: "천둥번개", icon: Zap },
    { name: "안개/혼란", icon: Wind },
  ];

  const tagOptions = ["학생 지도", "학부모 민원", "과중한 행정", "동료/관리자", "수업 고민", "퇴근 후 힐링"];

  const handleSaveDiary = async () => {
    if (!title.trim() || !content.trim()) return;

    setLoadingLetter(true);
    let aiLetterText = "";

    try {
      const response = await fetch("/api/gemini/diary-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ diaryText: `${title}\n${content}`, emotion }),
      });
      const data = await response.json();
      aiLetterText = data.letter;
    } catch (e) {
      console.error(e);
      aiLetterText = "선생님, 오늘 하루도 참으로 고생 많으셨습니다. 선생님의 수고를 마음 깊이 응원합니다.";
    } finally {
      setLoadingLetter(false);
    }

    const newEntry: DiaryEntry = {
      id: "diary-" + Date.now(),
      date: new Date().toISOString().split("T")[0],
      emotion,
      title,
      content,
      aiLetter: aiLetterText,
      tags: selectedTags,
    };

    setEntries([newEntry, ...entries]);
    setSelectedEntry(newEntry);
    setIsCreating(false);
    setTitle("");
    setContent("");
  };

  const handleDelete = (id: string) => {
    if (window.confirm("이 일기를 영구 삭제하시겠습니까?")) {
      const filtered = entries.filter((e) => e.id !== id);
      setEntries(filtered);
      if (selectedEntry?.id === id) {
        setSelectedEntry(filtered[0] || null);
      }
    }
  };

  const toggleTag = (t: string) => {
    if (selectedTags.includes(t)) {
      setSelectedTags(selectedTags.filter((tag) => tag !== t));
    } else {
      setSelectedTags([...selectedTags, t]);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6 text-white font-mono">
      {/* Intro Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#141417] border border-white/10 p-5">
        <div>
          <div className="section-label">ENCRYPTED_JOURNAL_V1.0</div>
          <h2 className="text-lg sm:text-xl font-bold font-syne text-white mt-1">
            SECRET_EMOTION_DIARY // 교사 비밀 감정 일기장
          </h2>
          <p className="text-xs text-white/50 mt-0.5 font-sans">
            누구에게도 털어놓지 못한 교실의 감정을 적으면, AI 선배 상담사가 정성 어린 위로 편지 답장을 발송합니다.
          </p>
        </div>

        <button
          onClick={() => {
            setIsCreating(true);
            setSelectedEntry(null);
          }}
          className="px-4 py-2.5 bg-[#00ff66] hover:bg-[#00e65c] text-black font-mono font-bold text-xs flex items-center gap-1.5 transition-all self-start"
        >
          <Plus className="w-4 h-4" />
          <span>NEW_JOURNAL_ENTRY</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Diary List */}
        <div className="md:col-span-1 space-y-3">
          <div className="section-label px-1">
            SAVED_LOGS ({entries.length})
          </div>

          {entries.length === 0 && !isCreating ? (
            <div className="bg-[#141417] p-6 border border-white/10 text-center text-xs text-white/40 font-mono">
              NO_ENTRIES_RECORDED
            </div>
          ) : (
            <div className="space-y-2 max-h-[540px] overflow-y-auto pr-1">
              {entries.map((entry) => {
                const isSelected = selectedEntry?.id === entry.id && !isCreating;
                return (
                  <div
                    key={entry.id}
                    onClick={() => {
                      setSelectedEntry(entry);
                      setIsCreating(false);
                    }}
                    className={`p-3.5 border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-[#0c0c0e] border-[#00ff66] shadow-lg"
                        : "bg-[#141417] border-white/10 hover:border-white/30"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-white/50 mb-1">
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3 text-[#00ff66]" />
                        {entry.date}
                      </span>
                      <span className="text-[#00ff66] bg-white/5 border border-white/10 px-1.5 py-0.5">
                        {entry.emotion}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white truncate mb-1">
                      {entry.title}
                    </h4>
                    <p className="text-[11px] text-white/50 line-clamp-2 leading-relaxed font-sans">
                      {entry.content}
                    </p>
                    {entry.aiLetter && (
                      <div className="mt-2 text-[10px] text-[#00ff66] flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        <span>[DISPATCH_ATTACHED]</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Editor or View */}
        <div className="md:col-span-2">
          {isCreating ? (
            /* Write Diary Form */
            <div className="bg-[#141417] border border-[#00ff66]/40 p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="section-label">COMPOSE_ENTRY</div>
                <span className="text-xs text-white/40">
                  {new Date().toISOString().split("T")[0]}
                </span>
              </div>

              {/* Emotion picker */}
              <div>
                <label className="block text-xs font-mono text-white/70 mb-1.5">
                  EMOTIONAL_WEATHER
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {emotionOptions.map((emo) => {
                    const Icon = emo.icon;
                    return (
                      <button
                        key={emo.name}
                        type="button"
                        onClick={() => setEmotion(emo.name)}
                        className={`p-2 border text-center transition-all flex flex-col items-center gap-1 font-mono text-xs ${
                          emotion === emo.name
                            ? "bg-[#00ff66] border-[#00ff66] text-black font-bold"
                            : "bg-[#0c0c0e] border-white/10 text-white/60 hover:text-white hover:border-white/30"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-[10px] truncate">{emo.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tag selector */}
              <div>
                <label className="block text-xs font-mono text-white/70 mb-1.5">
                  TAG_METADATA
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {tagOptions.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleTag(t)}
                      className={`px-2 py-1 text-[11px] font-mono border transition-all ${
                        selectedTags.includes(t)
                          ? "bg-white text-black border-white font-bold"
                          : "bg-[#0c0c0e] border-white/10 text-white/60 hover:border-white/30"
                      }`}
                    >
                      #{t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title & Content */}
              <div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="일기 제목을 입력하세요..."
                  className="w-full px-3.5 py-2.5 bg-[#0c0c0e] border border-white/10 focus:border-[#00ff66] text-xs text-white font-semibold font-sans focus:outline-hidden"
                />
              </div>

              <div>
                <textarea
                  rows={8}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="오늘 교실에서 일어났던 일, 억울했던 순간, 스스로를 괴롭히는 자책감을 솔직히 적어보세요..."
                  className="w-full p-3.5 bg-[#0c0c0e] border border-white/10 focus:border-[#00ff66] text-xs text-white leading-relaxed font-sans focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 text-white/50 hover:text-white text-xs font-mono"
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  onClick={handleSaveDiary}
                  disabled={loadingLetter || !title.trim() || !content.trim()}
                  className="px-6 py-2.5 bg-[#00ff66] hover:bg-[#00e65c] text-black font-mono font-bold text-xs flex items-center gap-1.5 disabled:opacity-50 transition-all"
                >
                  {loadingLetter ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>GENERATING_DISPATCH...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>SAVE & RECEIVE_LETTER</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : selectedEntry ? (
            /* View Selected Diary */
            <div className="space-y-4">
              {/* Diary Content Card */}
              <div className="bg-[#141417] border border-white/10 p-6 relative">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                  <div>
                    <span className="text-[10px] text-white/40 block mb-0.5 font-mono">
                      DATE: {selectedEntry.date} · EMOTION: {selectedEntry.emotion}
                    </span>
                    <h3 className="text-base font-bold font-syne text-white">
                      {selectedEntry.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => handleDelete(selectedEntry.id)}
                    className="p-1.5 text-white/40 hover:text-[#ff4444] border border-transparent hover:border-[#ff4444]/40"
                    title="일기 삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {selectedEntry.tags?.map((t) => (
                    <span key={t} className="text-[10px] bg-white/5 border border-white/10 text-white/70 px-2 py-0.5">
                      #{t}
                    </span>
                  ))}
                </div>

                <p className="text-xs text-white/80 whitespace-pre-wrap leading-relaxed font-sans">
                  {selectedEntry.content}
                </p>
              </div>

              {/* AI Handwritten-style Letter */}
              {selectedEntry.aiLetter && (
                <div className="bg-[#141417] border border-[#00ff66]/40 p-6 relative shadow-2xl">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-[#00ff66] text-black">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div className="section-label text-[#00ff66]">
                        SENIOR_COUNSELOR_DISPATCH // 선배 교사의 손편지
                      </div>
                    </div>
                    <button
                      onClick={() => speechController.speak(selectedEntry.aiLetter || "")}
                      className="px-2.5 py-1 bg-[#0c0c0e] border border-white/10 hover:border-[#00ff66] text-white/80 hover:text-white text-xs flex items-center gap-1 font-mono"
                      title="음성으로 편지 듣기"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-[#00ff66]" />
                      <span>TTS_PLAY</span>
                    </button>
                  </div>

                  <div className="text-xs text-white leading-relaxed font-sans whitespace-pre-wrap pl-3 border-l-2 border-[#00ff66] my-2 bg-[#0c0c0e] p-4">
                    {selectedEntry.aiLetter}
                  </div>

                  <div className="text-right text-[11px] text-[#00ff66] font-mono mt-4">
                    -- [TRANSMISSION_COMPLETE] 늘 선생님을 응원하는 토닥 선배 올림 --
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#141417] border border-white/10 p-12 text-center text-xs text-white/40 font-mono">
              SELECT_AN_ENTRY_OR_CREATE_NEW
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

