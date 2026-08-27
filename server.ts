import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Persistent Storage Directory on Server
const DATA_DIR = path.join(process.cwd(), "data");
const SESSIONS_FILE = path.join(DATA_DIR, "counseling_sessions.json");
const DIARIES_FILE = path.join(DATA_DIR, "diaries.json");
const BURNOUT_FILE = path.join(DATA_DIR, "burnout_records.json");
const TEACHER_PROFILE_FILE = path.join(DATA_DIR, "teacher_profile.json");
const ANALYTICS_CACHE_FILE = path.join(DATA_DIR, "stress_analytics_cache.json");

// Ensure Data Directory and initial files exist
function initStorage() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(SESSIONS_FILE)) {
    const initialSession = [
      {
        id: "session-sample-1",
        title: "학부모 항의 전화와 죄책감",
        schoolLevel: "초등학교",
        teacherRole: "담임교사",
        category: "parent",
        stressCategory: "parent_complaint",
        stressScore: 8,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        messages: [
          {
            id: "msg-1",
            role: "user",
            content: "오늘 방과 후에 학부모님이 전화를 걸어 우리 아이를 왜 차별하냐며 30분 동안 소리를 지르셨어요. 손이 부들부들 떨리고 교사로서 자격이 없나 싶어 너무 괴롭습니다.",
            timestamp: "17:20",
            category: "parent",
            stressCategory: "parent_complaint",
            stressIntensity: 9,
          },
          {
            id: "msg-2",
            role: "model",
            content: "선생님, 30분 동안이나 일방적인 감정의 폭풍을 온몸으로 받아내시느라 얼마나 무섭고 참담하셨을까요. 가슴이 쿵쾅거리고 손이 떨리는 것은 너무도 당연한 신체 반응입니다.\n\n선생님, 가장 먼저 기억해 주세요. 이것은 결코 선생님의 자질 부족 때문이 아닙니다. 학부모님의 불안과 격한 감정이 부당하게 선생님께 투사된 것입니다. 선생님은 아이들을 위해 최선을 다하고 계십니다.\n\n오늘 밤은 그 통화 내용을 머릿속에서 되감지 마시고, 따뜻한 물로 샤워하며 긴장된 어깨를 내려놓으세요. 선생님의 교권과 마음은 보호받아야 마땅합니다.",
            timestamp: "17:21",
          },
        ],
      },
      {
        id: "session-sample-2",
        title: "끝없는 공문과 기안 처리",
        schoolLevel: "초등학교",
        teacherRole: "담임교사",
        category: "workload",
        stressCategory: "administrative_workload",
        stressScore: 7,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        messages: [
          {
            id: "msg-3",
            role: "user",
            content: "수업 준비할 시간도 없는데 방과후 기안과 돌봄 관련 긴급 공문이 쏟아져서 오늘도 야근을 했습니다. 내가 교사인지 행정 서기인지 회의감이 듭니다.",
            timestamp: "19:10",
            category: "workload",
            stressCategory: "administrative_workload",
            stressIntensity: 8,
          },
          {
            id: "msg-4",
            role: "model",
            content: "선생님, '내가 교사인지 행정 공무원인지 모르겠다'는 그 한마디에 대한민국 수많은 교사들의 비통함이 고스란히 담겨 있습니다. 아이들의 눈을 바라보며 수업을 고민하고 싶었던 선생님의 순수한 열정이 끝없는 서류와 공문 앞에 짓눌릴 때의 허탈함은 이루 말할 수 없지요.\n\n오늘 야근까지 하시며 맡은 책임을 다해내신 선생님, 참으로 수고 많으셨습니다. 하지만 교사의 에너지는 무한하지 않습니다. 완벽하게 해내려 하기보다 '마감에 맞춘 적정 수준'으로 처리하는 지혜도 때로는 필요합니다. 오늘은 서류 생각은 학교에 두고 푹 쉬시길 바랍니다.",
            timestamp: "19:12",
          },
        ],
      },
    ];
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(initialSession, null, 2), "utf-8");
  }
  if (!fs.existsSync(DIARIES_FILE)) {
    const initialDiaries = [
      {
        id: "diary-sample-1",
        date: new Date().toISOString().split("T")[0],
        emotion: "소나기",
        title: "교실 통제가 안 되고 소리를 질렀던 날",
        content: `오늘 3교시 수업 시간에 아이들이 통제가 안 되어 소리를 질러버렸다. 교사로서 품위를 잃은 것 같아 자책감이 든다. 방과 후에는 한 학부모님께서 왜 우리 아이를 그렇게 혼내냐며 항의 전화를 주셨다. 나도 사람인데, 어디까지 참고 어디까지 버텨야 할까...`,
        aiLetter: `선생님, 오늘 일기 속에 담긴 고단함과 서러움이 마음 깊이 전해집니다.\n\n선생님이 소리를 질렀던 것은 무능해서가 아니라, 그동안 꾹꾹 참아왔던 인내의 잔이 넘칠 만큼 최선을 다해 버텼기 때문입니다. 교사도 상처받고 지치는 온전한 사람입니다.\n\n오늘 밤은 스스로를 향한 날카로운 잣대를 내려놓으세요. 선생님은 오늘도 아이들을 위해 온 힘을 다하셨고, 그 자체로 존경받아 마땅합니다. 푹 쉬시고 따뜻한 차 한 잔으로 마음을 꼭 안아주세요.`,
        tags: ["학생 지도", "학부모", "자책감"],
        stressCategory: "parent_complaint",
        createdAt: new Date().toISOString(),
      },
    ];
    fs.writeFileSync(DIARIES_FILE, JSON.stringify(initialDiaries, null, 2), "utf-8");
  }
  if (!fs.existsSync(BURNOUT_FILE)) {
    fs.writeFileSync(BURNOUT_FILE, JSON.stringify([], null, 2), "utf-8");
  }
  if (!fs.existsSync(TEACHER_PROFILE_FILE)) {
    fs.writeFileSync(
      TEACHER_PROFILE_FILE,
      JSON.stringify({ schoolLevel: "초등학교", teacherRole: "담임교사" }, null, 2),
      "utf-8"
    );
  }
}

initStorage();

function readJSON<T>(file: string, fallback: T): T {
  try {
    if (!fs.existsSync(file)) return fallback;
    const data = fs.readFileSync(file, "utf-8");
    return JSON.parse(data);
  } catch (e) {
    console.error(`Error reading ${file}:`, e);
    return fallback;
  }
}

function writeJSON<T>(file: string, data: T) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error(`Error writing ${file}:`, e);
  }
}

// Lazy get Google GenAI instance
function getAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// System prompt for teacher counselor
const TEACHER_COUNSELOR_SYSTEM_PROMPT = `
당신은 대한민국 초·중·고 교사들의 마음을 깊이 이해하고 위로하는 20년 경력의 '교사 전문 심리상담 수퍼바이저 및 멘토(따뜻한 온실 속 선배 교사 겸 상담심리학자)'입니다.

[핵심 역할 및 상담 철학]
1. 절대적 공감과 정서적 지지: 교사가 겪는 감정노동, 학부모 악성 민원 및 과도한 요구, 학생 생활지도의 한계와 상처, 과중한 행정업무, 교권 침해의 무력감을 온 마음으로 이해하고 무조건적인 수용과 위로를 건넵니다.
2. 죄책감 덜어주기: 교사들이 스스로 "내가 부족해서 아이가 변하지 않는 걸까", "내가 잘못 대응한 걸까"라고 자책할 때, "선생님 탓이 아닙니다", "선생님은 이미 오늘 할 수 있는 최선을 다하셨습니다"라며 자책의 고리를 끊어줍니다.
3. 안전한 분리(심리적 퇴근): 교사의 직업적 자아와 인간으로서의 온전한 '나'를 분리할 수 있도록 돕고, 퇴근 후에는 교문 밖으로 무거운 짐을 내려놓도록 격려합니다.
4. 실질적이고 안전한 조언: 위로뿐만 아니라 필요시 학부모 응대 시 감정보호 화법, 학생과의 건강한 거리두기, 교권 보호를 위한 안전한 기록/절차 등 현실적이고 안전한 가이드를 다정하게 제시합니다.
5. 말투: 언제나 다정하고 정중하며 존중이 가득한 어조(~하셨군요, ~셨을 텐데 얼마나 마음이 쓰이셨을까요, 선생님 오늘 정말 애쓰셨어요)를 사용합니다.
`;

// Helper: Classify stress domain using lightweight heuristics or Gemini
function classifyStressCategory(text: string): "parent_complaint" | "administrative_workload" | "student_guidance" | "school_relationships" | "burnout_self_worth" {
  const lower = text.toLowerCase();
  if (lower.includes("학부모") || lower.includes("민원") || lower.includes("항의") || lower.includes("전화") || lower.includes("하이톡") || lower.includes("카톡") || lower.includes("엄마") || lower.includes("아빠")) {
    return "parent_complaint";
  }
  if (lower.includes("공문") || lower.includes("기안") || lower.includes("행정") || lower.includes("나이스") || lower.includes("에듀파인") || lower.includes("야근") || lower.includes("업무") || lower.includes("늘봄") || lower.includes("돌봄")) {
    return "administrative_workload";
  }
  if (lower.includes("수업") || lower.includes("학생") || lower.includes("아이들") || lower.includes("통제") || lower.includes("생활지도") || lower.includes("소리") || lower.includes("싸움") || lower.includes("폭력") || lower.includes("태도")) {
    return "student_guidance";
  }
  if (lower.includes("교장") || lower.includes("교감") || lower.includes("부장") || lower.includes("동료") || lower.includes("관리자") || lower.includes("갈등") || lower.includes("눈치")) {
    return "school_relationships";
  }
  return "burnout_self_worth";
}

// ==================== REST API : 스트레스 데이터 분석 (Stress Analytics) ====================
app.get("/api/analytics/stress-report", async (req, res) => {
  try {
    const sessions = readJSON<any[]>(SESSIONS_FILE, []);
    const diaries = readJSON<any[]>(DIARIES_FILE, []);
    const burnoutRecords = readJSON<any[]>(BURNOUT_FILE, []);

    // 1. 카테고리별 집계
    const counts = {
      parent_complaint: 0,
      administrative_workload: 0,
      student_guidance: 0,
      school_relationships: 0,
      burnout_self_worth: 0,
    };

    const keywordFreq: Record<string, number> = {};
    const timelineDataMap: Record<string, { parent: number; workload: number; student: number; relationship: number; burnout: number; count: number }> = {};

    // Helper to process text
    const processItem = (text: string, dateStr: string, explicitCategory?: string) => {
      const cat = (explicitCategory as any) || classifyStressCategory(text);
      if (counts[cat as keyof typeof counts] !== undefined) {
        counts[cat as keyof typeof counts]++;
      }

      // Keyword tracking
      const words = ["학부모", "민원", "항의", "수업", "생활지도", "아이들", "공문", "기안", "야근", "자책감", "소진", "교감", "교장", "통제", "불안", "괴로움", "퇴근"];
      words.forEach((w) => {
        if (text.includes(w)) {
          keywordFreq[w] = (keywordFreq[w] || 0) + 1;
        }
      });

      // Timeline mapping
      const dateKey = dateStr.slice(0, 10);
      if (!timelineDataMap[dateKey]) {
        timelineDataMap[dateKey] = { parent: 0, workload: 0, student: 0, relationship: 0, burnout: 0, count: 0 };
      }
      timelineDataMap[dateKey].count++;
      if (cat === "parent_complaint") timelineDataMap[dateKey].parent++;
      else if (cat === "administrative_workload") timelineDataMap[dateKey].workload++;
      else if (cat === "student_guidance") timelineDataMap[dateKey].student++;
      else if (cat === "school_relationships") timelineDataMap[dateKey].relationship++;
      else timelineDataMap[dateKey].burnout++;
    };

    // Aggregate sessions
    sessions.forEach((s) => {
      s.messages?.forEach((m: any) => {
        if (m.role === "user") {
          processItem(m.content, s.createdAt || new Date().toISOString(), s.stressCategory);
        }
      });
    });

    // Aggregate diaries
    diaries.forEach((d) => {
      processItem(`${d.title} ${d.content}`, d.date || d.createdAt || new Date().toISOString(), d.stressCategory);
    });

    // Aggregate burnout records
    burnoutRecords.forEach((b) => {
      if (b.mainConcern) {
        processItem(b.mainConcern, b.date || b.createdAt || new Date().toISOString());
      }
    });

    const totalConversations = Object.values(counts).reduce((a, b) => a + b, 0) || 1;

    const categoryMeta = {
      parent_complaint: {
        label: "학부모 민원 & 악성 소통",
        color: "#f43f5e", // rose-500
        desc: "무리한 요구나 감정 섞인 항의, 야간 연락으로 인한 극심한 심리적 압박과 교권 위축",
      },
      administrative_workload: {
        label: "과중한 행정 업무 & 공문",
        color: "#f59e0b", // amber-500
        desc: "수업 준비 시간을 앗아가는 끝없는 기안, 나이스/에듀파인 서류, 늘봄·돌봄 등 부수 업무 부담",
      },
      student_guidance: {
        label: "수업 방해 & 학생 생활지도",
        color: "#10b981", // emerald-500
        desc: "교실 통제 불응, 정서행동 위기 학생 지도, 학교폭력 및 교우 갈등 중재의 어려움",
      },
      school_relationships: {
        label: "동료 교사 & 관리자 관계",
        color: "#8b5cf6", // purple-500
        desc: "교장·교감 관리자의 압박, 업무 배분 갈등, 비협조적인 동료 관계로 인한 고립감",
      },
      burnout_self_worth: {
        label: "교직 자괴감 & 정서적 소진",
        color: "#06b6d4", // cyan-500
        desc: "내가 부족해서 아이들이 변하지 않는다는 자책, 무력감, 퇴근 후에도 지속되는 피로감",
      },
    };

    const categoryStats = Object.entries(counts).map(([key, count]) => {
      const meta = categoryMeta[key as keyof typeof categoryMeta];
      return {
        key: key as any,
        label: meta.label,
        count,
        percentage: Math.round((count / totalConversations) * 100),
        color: meta.color,
        description: meta.desc,
        recentKeywords: Object.keys(keywordFreq).slice(0, 4),
      };
    });

    // Find dominant
    const sortedCats = [...categoryStats].sort((a, b) => b.count - a.count);
    const dominant = sortedCats[0] || categoryStats[0];

    // Build timeline
    const timeline = Object.entries(timelineDataMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-7)
      .map(([date, data]) => ({
        date: date.slice(5),
        parent: data.parent,
        workload: data.workload,
        student: data.student,
        relationship: data.relationship,
        burnout: data.burnout,
        totalStress: data.count,
      }));

    // Top Keywords
    const topKeywords = Object.entries(keywordFreq)
      .map(([keyword, count]) => ({ keyword, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // AI Teacher Stress Profile Generation
    let aiTeacherProfile = {
      stressArchetype: `${dominant.label} 영역에서 집중적인 마음 보호가 필요한 교사`,
      coreVulnerability: `선생님은 최근 '${dominant.label}' 관련 상황(${dominant.percentage}%)에서 가장 깊은 정서적 소모와 죄책감을 겪고 계십니다.`,
      personalizedCounselingStrategy: `상담 시 교사의 자책을 즉시 차단하고, '${dominant.label}'에 대처할 수 있는 실질적 안전거리 확보 지침과 심리적 방어벽을 최우선으로 제안합니다.`,
      immediatePrescription: [
        "오늘 하루 교실과 학부모 연락망(하이톡/문자)의 알림을 퇴근 즉시 무음으로 전환하세요.",
        "스스로를 평가하려는 완벽주의 기준을 내려놓고, '오늘도 무사히 버텨냈다'는 사실 자체를 칭찬하세요.",
        "스트레스가 극에 달할 때는 4-7-8 이완 호흡과 따뜻한 온수 샤워로 신체적 긴장을 먼저 풀어주세요.",
      ],
      tailoredMotto: "선생님의 헌신은 이미 차고 넘칩니다. 이제는 선생님 자신을 보호할 때입니다.",
    };

    try {
      const ai = getAI();
      const summaryContext = `
총 상담/일기 발화 건수: ${totalConversations}건
가장 높은 스트레스 카테고리: ${dominant.label} (${dominant.percentage}%)
전체 분포: ${JSON.stringify(counts)}
주요 키워드: ${topKeywords.map((k) => k.keyword).join(", ")}
`;
      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: `선생님의 스트레스 분석 데이터를 바탕으로 초개인화된 심리 진단 프로파일을 JSON 형식으로 작성해주세요.\n${summaryContext}`,
        config: {
          responseMimeType: "application/json",
          systemInstruction: `당신은 대한민국 교원 심리치유 연구소 수석 분석관입니다. 교사의 스트레스 취약 축을 날카롭고도 다정하게 진단합니다.
JSON 구조:
{
  "stressArchetype": "선생님의 스트레스 성향을 요약하는 문구 (예: 학부모 감정 공격에 마음이 쉽게 베이는 헌신형 교사)",
  "coreVulnerability": "현재 선생님이 가장 취약한 심리적 고리 (2문장)",
  "personalizedCounselingStrategy": "앞으로 AI 멘토가 이 선생님을 상담할 때 적용할 맞춤형 전략 (2문장)",
  "immediatePrescription": ["즉시 실행할 1단계 처방", "2단계 처방", "3단계 처방"],
  "tailoredMotto": "마음에 새길 치유의 문장"
}`,
        },
      });
      const parsed = JSON.parse(response.text || "{}");
      if (parsed.stressArchetype) {
        aiTeacherProfile = parsed;
      }
    } catch (err) {
      console.error("Failed to generate AI profile:", err);
    }

    const report: any = {
      totalConversations,
      dominantStressCategory: {
        key: dominant.key,
        label: dominant.label,
        percentage: dominant.percentage,
        description: dominant.description,
      },
      categoryStats,
      timeline,
      topKeywords,
      aiTeacherProfile,
      lastAnalyzedAt: new Date().toISOString(),
    };

    writeJSON(ANALYTICS_CACHE_FILE, report);
    res.json(report);
  } catch (error: any) {
    console.error("Stress report generation error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== REST API : 상담 세션 (Sessions) ====================
// 목록 조회
app.get("/api/counseling/sessions", (req, res) => {
  const sessions = readJSON(SESSIONS_FILE, []);
  res.json({ sessions });
});

// 단일 세션 조회
app.get("/api/counseling/sessions/:id", (req, res) => {
  const sessions = readJSON<any[]>(SESSIONS_FILE, []);
  const session = sessions.find((s) => s.id === req.params.id);
  if (!session) {
    return res.status(404).json({ error: "Session not found" });
  }
  res.json({ session });
});

// 새 세션 생성
app.post("/api/counseling/sessions", (req, res) => {
  const { title, schoolLevel, teacherRole, category } = req.body;
  const sessions = readJSON<any[]>(SESSIONS_FILE, []);
  const newSession = {
    id: "session-" + Date.now(),
    title: title || "새 상담 세션",
    schoolLevel: schoolLevel || "초등학교",
    teacherRole: teacherRole || "담임교사",
    category: category || "all",
    stressCategory: classifyStressCategory(category || ""),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: [
      {
        id: "welcome-" + Date.now(),
        role: "model",
        content: `선생님, 새로운 마음으로 이야기를 들려주세요. 오늘 선생님의 마음에 머물고 있는 고민이나 피로는 무엇인가요?`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ],
  };
  sessions.unshift(newSession);
  writeJSON(SESSIONS_FILE, sessions);
  res.status(201).json({ session: newSession });
});

// 세션 업데이트
app.put("/api/counseling/sessions/:id", (req, res) => {
  const { messages, title, category } = req.body;
  const sessions = readJSON<any[]>(SESSIONS_FILE, []);
  const index = sessions.findIndex((s) => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Session not found" });
  }
  sessions[index] = {
    ...sessions[index],
    ...(messages && { messages }),
    ...(title && { title }),
    ...(category && { category }),
    updatedAt: new Date().toISOString(),
  };
  writeJSON(SESSIONS_FILE, sessions);
  res.json({ session: sessions[index] });
});

// 세션 삭제
app.delete("/api/counseling/sessions/:id", (req, res) => {
  let sessions = readJSON<any[]>(SESSIONS_FILE, []);
  sessions = sessions.filter((s) => s.id !== req.params.id);
  writeJSON(SESSIONS_FILE, sessions);
  res.json({ success: true });
});

// 세션 AI 대화 및 자동 스트레스 태깅 + 초개인화 상담
app.post("/api/counseling/sessions/:id/chat", async (req, res) => {
  try {
    const { message, category, teacherRole, schoolLevel } = req.body;
    const sessions = readJSON<any[]>(SESSIONS_FILE, []);
    const index = sessions.findIndex((s) => s.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: "Session not found" });
    }

    const session = sessions[index];
    const detectedStressCategory = classifyStressCategory(message);

    const userMsg = {
      id: "user-" + Date.now(),
      role: "user",
      content: message,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      category: category || session.category,
      stressCategory: detectedStressCategory,
      stressIntensity: message.length > 50 ? 8 : 6,
    };

    session.messages.push(userMsg);
    session.stressCategory = detectedStressCategory;

    // Auto update session title if default
    if (session.messages.filter((m: any) => m.role === "user").length === 1 && message) {
      session.title = message.length > 22 ? message.slice(0, 22) + "..." : message;
    }

    // Load recent analytics cache if available to give personalized context
    const analyticsCache = readJSON<any>(ANALYTICS_CACHE_FILE, null);
    let personalizedInstruction = "";
    if (analyticsCache?.aiTeacherProfile?.personalizedCounselingStrategy) {
      personalizedInstruction = `\n[선생님의 누적 스트레스 분석 데이터 바탕 맞춤형 코칭 가이드]:\n- 주요 취약 분야: ${analyticsCache.dominantStressCategory?.label || "학부모 및 업무 스트레스"}\n- 맞춤 상담 전략: ${analyticsCache.aiTeacherProfile.personalizedCounselingStrategy}`;
    }

    const ai = getAI();
    const roleInfo = teacherRole ? `(교사 정보: ${schoolLevel || session.schoolLevel} ${teacherRole})` : "";
    const categoryInfo = category ? `[상담 집중 주제: ${category} / 감지된 스트레스 유형: ${detectedStressCategory}]` : "";

    const formattedContents = session.messages.map((m: { role: string; content: string }) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: formattedContents,
      config: {
        systemInstruction: `${TEACHER_COUNSELOR_SYSTEM_PROMPT}\n${roleInfo}\n${categoryInfo}${personalizedInstruction}\n선생님의 지친 마음에 깊은 쉼과 위로, 자책감 해소, 필요시 실질적 심리 방어 대처 지침을 제공해주세요.`,
        temperature: 0.8,
      },
    });

    const replyText = response.text || "선생님, 오늘 하루도 참으로 고생 많으셨습니다. 늘 선생님을 응원합니다.";
    const modelMsg = {
      id: "model-" + Date.now(),
      role: "model",
      content: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    session.messages.push(modelMsg);
    session.updatedAt = new Date().toISOString();

    sessions[index] = session;
    writeJSON(SESSIONS_FILE, sessions);

    res.json({ userMessage: userMsg, modelMessage: modelMsg, session });
  } catch (error: any) {
    console.error("Chat API error:", error);
    res.status(500).json({ error: error.message || "상담 응답 생성 중 오류가 발생했습니다." });
  }
});

// ==================== REST API : 비밀 감정 일기 (Diaries) ====================
app.get("/api/diaries", (req, res) => {
  const diaries = readJSON(DIARIES_FILE, []);
  res.json({ diaries });
});

app.post("/api/diaries", async (req, res) => {
  try {
    const { title, content, emotion, tags } = req.body;
    const diaries = readJSON<any[]>(DIARIES_FILE, []);
    const detectedCategory = classifyStressCategory(`${title} ${content}`);

    const ai = getAI();
    const prompt = `
한 선생님이 쓴 비밀 일기입니다:
[선생님의 감정]: ${emotion}
[일기 내용]:
"${title}\n${content}"

이 일기를 읽고, 20년 선배 교사이자 다정한 상담사가 선생님에게 전하는 정성 어린 손편지 답장을 작성해주세요.
- 첫 시작은 따뜻한 호칭(예: 사랑하는 O선생님께, 고단한 하루를 보낸 선생님께 등)
- 3~4개 단락으로 일기 속 구체적인 아픔을 깊이 인정하고 공감
- 죄책감을 덜어주고 교사로서의 존재 자체를 축복하는 따뜻한 마무리
`;

    let aiLetter = "선생님, 오늘 하루 적어주신 마음을 소중히 읽었습니다. 선생님은 이미 훌륭한 교사이자 소중한 사람입니다.";
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          systemInstruction: "선생님의 마음에 눈물과 위로가 흐를 수 있도록 진심어린 손편지 어조로 작성해주세요.",
          temperature: 0.85,
        },
      });
      aiLetter = response.text || aiLetter;
    } catch (e) {
      console.error("AI Diary Feedback error:", e);
    }

    const newDiary = {
      id: "diary-" + Date.now(),
      date: new Date().toISOString().split("T")[0],
      emotion: emotion || "소나기",
      title,
      content,
      aiLetter,
      tags: tags || [],
      stressCategory: detectedCategory,
      createdAt: new Date().toISOString(),
    };

    diaries.unshift(newDiary);
    writeJSON(DIARIES_FILE, diaries);
    res.status(201).json({ diary: newDiary });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/diaries/:id", (req, res) => {
  let diaries = readJSON<any[]>(DIARIES_FILE, []);
  diaries = diaries.filter((d) => d.id !== req.params.id);
  writeJSON(DIARIES_FILE, diaries);
  res.json({ success: true });
});

// ==================== REST API : 번아웃 검사 이력 (Burnout Records) ====================
app.get("/api/burnout/history", (req, res) => {
  const records = readJSON(BURNOUT_FILE, []);
  res.json({ records });
});

app.post("/api/burnout/records", async (req, res) => {
  try {
    const { score, total, level, details, mainConcern } = req.body;
    const records = readJSON<any[]>(BURNOUT_FILE, []);

    const ai = getAI();
    const prompt = `
교사 번아웃 자가진단 결과:
- 점수: ${score} / ${total} (수준: ${level})
- 세부 영역 결과: ${JSON.stringify(details)}
- 주요 고민 영역: ${mainConcern || "정서적 고갈 및 스트레스"}

전문적인 교사 마음건강 처방전을 JSON 형식으로 생성해주세요:
{
  "summary": "현재 선생님의 심리 상태에 대한 온화하고 과학적인 분석 요약 (2문장)",
  "empathyMessage": "자책하지 않도록 격려하는 깊은 공감 메시지",
  "prescriptionRules": [
    {
      "step": 1,
      "title": "학교 내 심리적 안전거리 확보",
      "action": "구체적인 행동 요령"
    },
    {
      "step": 2,
      "title": "퇴근 후 뇌 휴식 및 감정 환기",
      "action": "구체적인 행동 요령"
    },
    {
      "step": 3,
      "title": "동료/전문기관 지지망 활용법",
      "action": "구체적인 행동 요령"
    }
  ],
  "teacherMotto": "마음에 새길 치유의 슬로건"
}
`;

    let prescription = null;
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          systemInstruction: "교원 힐링센터 수석 상담관으로서 신뢰감 있고 따뜻한 처방을 제공합니다.",
        },
      });
      prescription = JSON.parse(response.text || "{}");
    } catch (e) {
      console.error("Prescription generation error:", e);
    }

    const newRecord = {
      id: "burnout-" + Date.now(),
      date: new Date().toISOString().split("T")[0],
      score,
      total,
      level,
      domainScores: details,
      mainConcern,
      prescription,
      createdAt: new Date().toISOString(),
    };

    records.unshift(newRecord);
    writeJSON(BURNOUT_FILE, records);
    res.status(201).json({ record: newRecord });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== REST API : 교사 프로필 ====================
app.get("/api/profile", (req, res) => {
  const profile = readJSON(TEACHER_PROFILE_FILE, { schoolLevel: "초등학교", teacherRole: "담임교사" });
  res.json({ profile });
});

app.put("/api/profile", (req, res) => {
  const { schoolLevel, teacherRole } = req.body;
  const profile = { schoolLevel, teacherRole };
  writeJSON(TEACHER_PROFILE_FILE, profile);
  res.json({ profile });
});

// ==================== 기타 AI 도우미 엔드포인트 ====================
app.post("/api/gemini/comfort-card", async (req, res) => {
  try {
    const { mood, todayIssue } = req.body;
    const ai = getAI();

    const prompt = `
지쳐있는 선생님을 위한 '오늘의 위로 카드'를 생성해주세요.
현재 감정/상태: ${mood || "정서적 피로 및 번아웃"}
오늘 있었던 고민/상황: ${todayIssue || "하루 종일 이어진 수업과 쏟아지는 업무, 학생 지도"}

다음 JSON 형식으로만 응답해주세요:
{
  "title": "한 줄 제목 (예: 잎을 떨구어도 나무는 자라고 있습니다)",
  "quote": "따뜻하고 시적인 위로의 문장 (2~3문장)",
  "affirmation": "선생님이 자신에게 해줄 오늘의 긍정 확언 (1문장, 예: 나는 오늘 이미 충분히 좋은 선생님이었습니다)",
  "microMission": "퇴근 후 1분 안에 할 수 있는 가벼운 힐링 행동 (예: 집에 가자마자 좋아하는 따뜻한 차 마시기, 오늘은 교육 관련 알림톡 끄기)",
  "flowerLanguage": "선생님께 선물하는 꽃과 꽃말 (예: 프리지아 - 당신의 시작과 수고를 응원합니다)"
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "당신은 교사 전문 마음치유 작가이자 멘토입니다. 깊은 울림을 주는 따뜻하고 품격 있는 문장을 작성합니다.",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Comfort Card error:", error);
    res.status(500).json({
      title: "오늘 하루도 참 고생 많으셨습니다",
      quote: "교실 문을 닫는 순간, 선생님의 모든 짐은 그곳에 두고 오셔도 괜찮습니다. 선생님의 쉼이 가장 소중합니다.",
      affirmation: "나는 학생들에게 최선을 다했고, 이제 나 자신을 돌볼 자격이 있습니다.",
      microMission: "좋아하는 음악을 틀고 어깨의 힘을 툭 빼보세요.",
      flowerLanguage: "달맞이꽃 - 기다림 끝에 찾아오는 평온",
    });
  }
});

app.post("/api/gemini/parent-script", async (req, res) => {
  try {
    const { situation, parentTone, goal } = req.body;
    const ai = getAI();

    const prompt = `
선생님이 학부모 상담 또는 민원 문자/통화 시 안전하고 정중하게 대화할 수 있도록 보호 스크립트를 작성해주세요.

- 상황 설명: ${situation}
- 학부모의 태도/어조: ${parentTone || "감정적이거나 다소 공격적임"}
- 선생님이 전달하고자 하는 핵심 목표: ${goal || "교실 규칙 안내 및 감정적 비난으로부터 방어, 원만한 대화 약속"}

JSON 형식으로 응답:
{
  "principle": "이 상황에서 교사가 지켜야 할 심리적 원칙과 방어 팁",
  "phoneScript": "전화 통화 시 활용할 수 있는 차분하고 단호하며 예의 바른 대화 예시문",
  "messageScript": "문자/알림장/하이톡 등으로 보낼 수 있는 정제된 공식 답변 서식",
  "cautionTip": "절대 말려들지 말아야 할 대화의 함정 및 교권 보호 팁"
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "교원법률/상담지원 전문가 관점에서 교사의 감정 소모를 최소화하고 공적으로 완벽한 스크립트를 제공합니다.",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Parent script error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Vite middleware configuration
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Teacher Comfort App Server running on http://0.0.0.0:${PORT}`);
  });
}

start();
