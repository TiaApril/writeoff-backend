"use client";

interface Insight {
  text: string;
  type: "deduction" | "warning" | "tip" | "info";
}

interface InsightsPanelProps {
  insights: Insight[];
}

const ICON_MAP = {
  deduction: {
    bg: "bg-emerald-100",
    icon: "text-emerald-600",
    svg: (
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
    ),
  },
  warning: {
    bg: "bg-amber-100",
    icon: "text-amber-600",
    svg: (
      <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.168 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
    ),
  },
  tip: {
    bg: "bg-blue-100",
    icon: "text-blue-600",
    svg: (
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
    ),
  },
  info: {
    bg: "bg-slate-100",
    icon: "text-slate-600",
    svg: (
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
    ),
  },
};

export default function InsightsPanel({ insights }: InsightsPanelProps) {
  return (
    <div className="rounded-xl bg-white border border-wo-border p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-wo-navy mb-4">AI Insights</h3>
      <div className="space-y-3">
        {insights.map((insight, i) => {
          const style = ICON_MAP[insight.type] || ICON_MAP.info;
          return (
            <div key={i} className="flex items-start gap-3 rounded-lg bg-wo-gray-light p-3.5">
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${style.bg}`}>
                <svg className={`h-4 w-4 ${style.icon}`} fill="currentColor" viewBox="0 0 20 20">
                  {style.svg}
                </svg>
              </div>
              <p className="text-sm text-wo-navy leading-relaxed">{insight.text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
