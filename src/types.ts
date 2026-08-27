export type CounselingCategory =
  | "all"
  | "parent" // 학부모 민원 & 소통
  | "student" // 학생 지도 & 교실 통제
  | "workload" // 과중한 행정 업무 & 수업 부담
  | "burnout" // 마음 소진 & 퇴근 후 분리
  | "relationship" // 동료 교사 & 관리자 관계
  | "self-worth"; // 교직 자괴감 & 효능감 회복

export type StressCategoryKey =
  | "parent_complaint" // 학부모 민원 & 소통
  | "administrative_workload" // 행정 업무 & 공문 과중
  | "student_guidance" // 수업 & 학생 생활지도
  | "school_relationships" // 동료 및 관리자 관계
  | "burnout_self_worth"; // 교직 자괴감 & 마음 소진

export interface StressCategoryStat {
  key: StressCategoryKey;
  label: string;
  count: number;
  percentage: number;
  color: string;
  description: string;
  recentKeywords: string[];
}

export interface StressTimelinePoint {
  date: string;
  parent: number;
  workload: number;
  student: number;
  relationship: number;
  burnout: number;
  totalStress: number;
}

export interface StressAnalysisReport {
  totalConversations: number;
  dominantStressCategory: {
    key: StressCategoryKey;
    label: string;
    percentage: number;
    description: string;
  };
  categoryStats: StressCategoryStat[];
  timeline: StressTimelinePoint[];
  topKeywords: Array<{ keyword: string; count: number }>;
  aiTeacherProfile: {
    stressArchetype: string; // 예: "학부모 민원 방어벽이 필요한 헌신형 교사"
    coreVulnerability: string;
    personalizedCounselingStrategy: string;
    immediatePrescription: string[];
    tailoredMotto: string;
  };
  lastAnalyzedAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: string;
  category?: CounselingCategory;
  stressCategory?: StressCategoryKey;
  stressIntensity?: number; // 1 ~ 10
}

export interface CounselingSession {
  id: string;
  title: string;
  schoolLevel: string;
  teacherRole: string;
  category: CounselingCategory;
  stressCategory?: StressCategoryKey;
  stressScore?: number;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  summary?: string;
}

export interface ComfortCardData {
  title: string;
  quote: string;
  affirmation: string;
  microMission: string;
  flowerLanguage: string;
}

export interface DiaryEntry {
  id: string;
  date: string;
  emotion: string;
  title: string;
  content: string;
  aiLetter?: string;
  tags: string[];
  stressCategory?: StressCategoryKey;
  createdAt?: string;
}

export interface BurnoutQuestion {
  id: number;
  domain: "정서적 고갈" | "탈인격화/거리두기" | "교직 효능감 저하" | "신체화 증상";
  question: string;
  description: string;
}

export interface BurnoutHistoryItem {
  id: string;
  date: string;
  score: number;
  total: number;
  level: "안정" | "주의" | "경고" | "심각 (즉각 휴식 필요)";
  domainScores: Record<string, number>;
  mainConcern: string;
  prescription?: {
    summary: string;
    empathyMessage: string;
    prescriptionRules: Array<{
      step: number;
      title: string;
      action: string;
    }>;
    teacherMotto: string;
  };
}

export interface BurnoutResult {
  score: number;
  total: number;
  level: "안정" | "주의" | "경고" | "심각 (즉각 휴식 필요)";
  domainScores: Record<string, number>;
  prescription?: {
    summary: string;
    empathyMessage: string;
    prescriptionRules: Array<{
      step: number;
      title: string;
      action: string;
    }>;
    teacherMotto: string;
  };
}

export interface ParentScriptResult {
  principle: string;
  phoneScript: string;
  messageScript: string;
  cautionTip: string;
}
