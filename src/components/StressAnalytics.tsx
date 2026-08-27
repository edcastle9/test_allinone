import React, { useState, useEffect } from "react";
import {
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  Terminal,
  Activity,
  Zap,
  ArrowRight,
  Info,
  Clock,
  Flame,
  FileText,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { StressAnalysisReport } from "../types";

interface StressAnalyticsProps {
  onOpenCounseling: () => void;
  onOpenSanctuary: () => void;
}

export const StressAnalytics: React.FC<StressAnalyticsProps> = ({
  onOpenCounseling,
  onOpenSanctuary,
}) => {
  const [report, setReport] = useState<StressAnalysisReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/analytics/stress-report");
      const data = await res.json();
      setReport(data);
    } catch (e) {
      console.error("Failed to load stress report:", e);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchReport();
  };

  if (loading && !report) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center font-mono">
        <RefreshCw className="w-8 h-8 text-[#00ff66] animate-spin mx-auto mb-3" />
        <div className="section-label justify-center">SYS_ANALYZING_TELEMETRY</div>
        <h3 className="text-base font-bold text-white mt-2">
          교직 스트레스 데이터베이스 연산 중...
        </h3>
        <p className="text-xs text-white/50 mt-1 font-sans">
          민원, 업무, 수업, 관계 등 5대 스트레스 영역의 가중치를 분류하고 있습니다.
        </p>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  // Define terminal-specific color palette for pie chart
  const TERMINAL_COLORS = ["#00ff66", "#38bdf8", "#fbbf24", "#f472b6", "#a78bfa"];

  const pieData = report.categoryStats.map((c, i) => ({
    name: c.label,
    value: c.count || 0.1,
    color: TERMINAL_COLORS[i % TERMINAL_COLORS.length],
    percentage: c.percentage,
  }));

  const keywordData = report.topKeywords.map((k) => ({
    keyword: k.keyword,
    count: k.count,
  }));

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6 text-white font-mono">
      {/* Top Banner Header */}
      <div className="bg-[#141417] border border-white/10 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="section-label">TELEMETRY_ANALYTICS_V3.0</div>
          <h2 className="text-lg sm:text-xl font-bold font-syne text-white mt-1">
            STRESS_DATA_CLASSIFIER // 교직 스트레스 분석 보고서
          </h2>
          <p className="text-xs text-white/60 mt-1 font-sans leading-relaxed">
            나눈 모든 대화와 일기를 정밀 분류하여 1순위 취약 영역을 진단하고, 맞춤 상담 알고리즘에 실시간 반영합니다.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 bg-[#0c0c0e] border border-white/10 hover:border-[#00ff66] text-white/80 hover:text-white text-xs px-3.5 py-2 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#00ff66]" : "text-white/40"}`} />
            <span>RE_CALCULATE</span>
          </button>
          <button
            onClick={onOpenCounseling}
            className="flex items-center gap-1.5 bg-[#00ff66] hover:bg-[#00e65c] text-black font-bold text-xs px-4 py-2 transition-all"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>RESUME_CHAT</span>
          </button>
        </div>
      </div>

      {/* Dominant Stress Highlight Banner */}
      <div className="bg-[#141417] border-l-4 border-l-[#00ff66] border-y border-r border-white/10 p-6 shadow-2xl relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/30 text-[10px] font-bold px-2 py-0.5">
                PRIMARY_STRESS_VECTOR (1순위)
              </span>
              <span className="text-xs text-white/50">
                DISTRIBUTION: {report.dominantStressCategory.percentage}%
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-white font-syne tracking-tight">
              "{report.dominantStressCategory.label}"
            </h3>

            <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-sans">
              {report.aiTeacherProfile.coreVulnerability}
            </p>

            <div className="bg-[#0c0c0e] p-3.5 border border-white/10 mt-3 text-xs space-y-1">
              <span className="text-[#00ff66] font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                [AI_CUSTOM_COUNSELING_STRATEGY]
              </span>
              <p className="text-white/80 text-[11px] font-sans leading-relaxed">
                {report.aiTeacherProfile.personalizedCounselingStrategy}
              </p>
            </div>
          </div>

          {/* Metrics Box */}
          <div className="bg-[#0c0c0e] border border-white/10 p-5 flex flex-col justify-center items-center text-center shrink-0 min-w-[200px]">
            <span className="text-[10px] text-white/40">TOTAL_ANALYZED_LOGS</span>
            <strong className="text-3xl font-bold font-syne text-[#00ff66] my-1">
              {report.totalConversations}
            </strong>
            <span className="text-[10px] text-white/40 bg-white/5 px-2 py-0.5 border border-white/10 mt-1">
              STATUS: SYNCED
            </span>
          </div>
        </div>
      </div>

      {/* 5대 스트레스 분류 현황 카드 그리드 */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="section-label">5_STRESS_DOMAINS_TELEMETRY</div>
          <span className="text-[10px] text-white/40">CATEGORIES: 5</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {report.categoryStats.map((stat, i) => (
            <div
              key={stat.key}
              className="bg-[#141417] border border-white/10 p-4 hover:border-[#00ff66]/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: TERMINAL_COLORS[i % TERMINAL_COLORS.length] }}
                  />
                  <span className="text-xs font-bold text-[#00ff66]">
                    {stat.percentage}%
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white mb-1">
                  {stat.label}
                </h4>
                <p className="text-[11px] text-white/50 line-clamp-3 leading-relaxed mb-3 font-sans">
                  {stat.description}
                </p>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-white/40">
                <span>LOG_COUNT</span>
                <span className="font-bold text-white">{stat.count}건</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Section: Pie Chart & Keyword Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Stress Distribution Donut */}
        <div className="bg-[#141417] border border-white/10 p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="section-label">DOMAIN_DISTRIBUTION_CHART</div>
              <span className="text-[10px] text-white/40">RATIO (%)</span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#0c0c0e" strokeWidth={2} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value: any, name: any) => [`${value}건`, name]}
                    contentStyle={{
                      backgroundColor: "#141417",
                      borderRadius: "0px",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      color: "#ffffff",
                      fontSize: "11px",
                      fontFamily: "Geist Mono, monospace",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-3 border-t border-white/10">
            {report.categoryStats.map((stat, i) => (
              <div key={stat.key} className="flex items-center gap-1.5 text-xs text-white/70">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: TERMINAL_COLORS[i % TERMINAL_COLORS.length] }}
                />
                <span className="truncate text-[10px]">{stat.label}: <strong>{stat.percentage}%</strong></span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Top Keywords Bar Chart */}
        <div className="bg-[#141417] border border-white/10 p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="section-label">FREQUENT_DISTRESS_KEYWORDS</div>
              <span className="text-[10px] text-white/40">FREQUENCY</span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={keywordData}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "#888888" }} stroke="#333333" />
                  <YAxis
                    dataKey="keyword"
                    type="category"
                    tick={{ fontSize: 11, fill: "#ffffff" }}
                    width={70}
                    stroke="#333333"
                  />
                  <RechartsTooltip
                    formatter={(val: any) => [`${val}회 감지`, "빈도"]}
                    contentStyle={{
                      backgroundColor: "#141417",
                      borderRadius: "0px",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      color: "#ffffff",
                      fontSize: "11px",
                      fontFamily: "Geist Mono, monospace",
                    }}
                  />
                  <Bar dataKey="count" fill="#00ff66" radius={[0, 2, 2, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <p className="text-[10px] text-white/40 pt-3 border-t border-white/10 font-sans">
            자주 감지된 고통 키워드는 챗봇과의 상담 시 우선적 보호 방어 문맥으로 자동 바인딩됩니다.
          </p>
        </div>
      </div>

      {/* AI Teacher Profile & Immediate Action Steps */}
      <div className="bg-[#141417] border border-white/10 p-6 sm:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#00ff66] text-black">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white font-syne">
                  AI_CLINICAL_PRESCRIPTION // 3단계 처방 지침
                </h4>
                <p className="text-xs text-white/40 font-sans">
                  교원 심리치유 알고리즘 기반 초개인화 행동 규칙
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-black bg-[#00ff66] px-3 py-1">
              ARCHETYPE: {report.aiTeacherProfile.stressArchetype}
            </span>
          </div>

          {/* 3 Step Action Rules */}
          <div>
            <h5 className="text-xs font-bold text-white mb-3 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[#00ff66]" />
              주 스트레스({report.dominantStressCategory.label}) 완화를 위한 3단계 즉각 조치 프로토콜
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {report.aiTeacherProfile.immediatePrescription.map((pres, idx) => (
                <div
                  key={idx}
                  className="bg-[#0c0c0e] p-4 border border-white/10 flex flex-col justify-between"
                >
                  <div>
                    <span className="w-5 h-5 bg-[#00ff66] text-black font-bold text-[10px] flex items-center justify-center mb-2">
                      0{idx + 1}
                    </span>
                    <p className="text-xs text-white/80 leading-relaxed font-sans">
                      {pres}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Healing Motto */}
          <div className="p-4 bg-[#0c0c0e] border border-white/10 text-center font-mono text-xs leading-relaxed">
            <span className="text-[#00ff66] block text-[10px] uppercase mb-1 font-bold">
              [AFFIRMATION_CODE]
            </span>
            <span className="text-white font-sans font-medium text-sm">
              "{report.aiTeacherProfile.tailoredMotto}"
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

