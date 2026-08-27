import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { CounselingRoom } from "./components/CounselingRoom";
import { MindSanctuary } from "./components/MindSanctuary";
import { BurnoutCheck } from "./components/BurnoutCheck";
import { SecretDiary } from "./components/SecretDiary";
import { StressAnalytics } from "./components/StressAnalytics";
import { EmergencySupportModal } from "./components/EmergencySupportModal";
import { Coffee, PhoneCall } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"counseling" | "burnout" | "sanctuary" | "diary" | "analytics">("counseling");
  const [showHotlineModal, setShowHotlineModal] = useState(false);
  const [teacherSchool, setTeacherSchool] = useState("초등학교");
  const [teacherRole, setTeacherRole] = useState("담임교사");

  // Load teacher profile from backend server
  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.profile) {
          setTeacherSchool(data.profile.schoolLevel || "초등학교");
          setTeacherRole(data.profile.teacherRole || "담임교사");
        }
      })
      .catch((e) => console.error("Error fetching profile from server:", e));
  }, []);

  const handleUpdateRole = async (school: string, role: string) => {
    setTeacherSchool(school);
    setTeacherRole(role);
    try {
      await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schoolLevel: school, teacherRole: role }),
      });
    } catch (e) {
      console.error("Error updating profile to server:", e);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0c0e] text-white flex flex-col font-mono selection:bg-[#00ff66] selection:text-black">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenHotline={() => setShowHotlineModal(true)}
        teacherSchool={teacherSchool}
        teacherRole={teacherRole}
        onUpdateRole={handleUpdateRole}
      />

      {/* Main Tab Content */}
      <main className="flex-1 pb-16">
        {activeTab === "counseling" && (
          <CounselingRoom
            teacherSchool={teacherSchool}
            teacherRole={teacherRole}
            onOpenSanctuary={() => setActiveTab("sanctuary")}
            onOpenAnalytics={() => setActiveTab("analytics")}
          />
        )}
        {activeTab === "analytics" && (
          <StressAnalytics
            onOpenCounseling={() => setActiveTab("counseling")}
            onOpenSanctuary={() => setActiveTab("sanctuary")}
          />
        )}
        {activeTab === "sanctuary" && <MindSanctuary />}
        {activeTab === "burnout" && (
          <BurnoutCheck
            onOpenCounseling={() => setActiveTab("counseling")}
            onOpenSanctuary={() => setActiveTab("sanctuary")}
          />
        )}
        {activeTab === "diary" && <SecretDiary />}
      </main>

      {/* Footer */}
      <footer className="bg-[#141417] text-white py-8 px-4 border-t border-white/10 mt-auto font-mono">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 font-syne text-sm font-bold text-white">
              <Coffee className="w-4 h-4 text-[#00ff66]" />
              <span>TODAK_FACULTY_ROOM // 토닥토닥 교사실 v2.4</span>
            </div>
            <p className="text-white/50 text-[11px] font-sans">
              교실 문을 닫는 순간, 선생님의 모든 짐은 교문 밖으로 내려놓으셔도 괜찮습니다.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHotlineModal(true)}
              className="flex items-center gap-1.5 bg-[#0c0c0e] hover:border-[#00ff66] text-white px-3 py-1.5 border border-white/10 transition-colors text-xs font-mono"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[#ff4444]" />
              <span>HOTLINE_1395</span>
            </button>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-4 pt-4 border-t border-white/5 text-center text-[10px] text-white/30 font-mono">
          * ENCRYPTED_STORAGE: 모든 상담 대화, 비밀 일기, 번아웃 진단 기록은 백엔드 서버에 안전하게 영구 보관 및 데이터 분석됩니다.
        </div>
      </footer>

      {/* Emergency Hotline Modal */}
      <EmergencySupportModal
        isOpen={showHotlineModal}
        onClose={() => setShowHotlineModal(false)}
      />
    </div>
  );
}
