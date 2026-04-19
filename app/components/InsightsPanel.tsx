"use client";

import { useState } from "react";

interface Insight {
  text: string;
  type: "deduction" | "warning" | "tip" | "info";
}

interface IRSResult {
  title: string;
  snippet: string;
  url: string;
}

interface InsightsPanelProps {
  insights: Insight[];
  irsReferences?: Record<string, IRSResult[]>;
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

export default function InsightsPanel({ insights, irsReferences }: InsightsPanelProps) {
  return (
    <div className="rounded-xl bg-white border border-wo-border p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-wo-navy mb-4">AI Insights</h3>
      <div className="space-y-3">
        {insights.map((insight, i) => (
          <InsightCard
            key={i}
            insight={insight}
            irsReferences={irsReferences}
          />
        ))}
      </div>
    </div>
  );
}

function InsightCard({
  insight,
  irsReferences,
}: {
  insight: Insight;
  irsReferences?: Record<string, IRSResult[]>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [irsResults, setIrsResults] = useState<IRSResult[] | null>(null);
  const [loading, setLoading] = useState(false);

  const style = ICON_MAP[insight.type] || ICON_MAP.info;

  // Try to find pre-loaded IRS references that match this insight
  const preloaded = irsReferences
    ? Object.entries(irsReferences).find(([key]) =>
        insight.text.toLowerCase().includes(key.toLowerCase())
      )
    : null;

  async function handleLearnMore() {
    if (expanded) {
      setExpanded(false);
      return;
    }

    if (preloaded) {
      setIrsResults(preloaded[1]);
      setExpanded(true);
      return;
    }

    // Already fetched before
    if (irsResults !== null) {
      setExpanded(true);
      return;
    }

    setLoading(true);
    setExpanded(true);

    // Use the insight text directly but trim it to a reasonable search query
    // Remove dollar amounts and percentages, keep the core topic
    const cleaned = insight.text
      .replace(/\$[\d,]+/g, "")
      .replace(/\d+%/g, "")
      .replace(/[""]/g, "")
      .trim();

    // Take first ~60 chars to keep the query focused
    const searchQuery = cleaned.length > 60
      ? cleaned.substring(0, 60).replace(/\s+\S*$/, "")
      : cleaned;

    try {
      const res = await fetch("/api/irs-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (res.ok) {
        const data = await res.json();
        setIrsResults(data.results || []);
      } else {
        setIrsResults([]);
      }
    } catch {
      setIrsResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg bg-wo-gray-light overflow-hidden">
      <div className="flex items-start gap-3 p-3.5">
        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${style.bg}`}>
          <svg className={`h-4 w-4 ${style.icon}`} fill="currentColor" viewBox="0 0 20 20">
            {style.svg}
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-wo-navy leading-relaxed">{insight.text}</p>
          <button
            onClick={handleLearnMore}
            className="mt-2 flex items-center gap-1 text-xs font-medium text-wo-blue hover:text-wo-blue-dark transition-colors"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            {expanded ? "Hide IRS rules" : "See IRS rules"}
          </button>
        </div>
      </div>

      {/* IRS references panel */}
      {expanded && (
        <div className="border-t border-wo-border bg-white px-3.5 py-3">
          {loading && (
            <div className="flex items-center gap-2 py-2 text-xs text-wo-gray">
              <svg className="h-3.5 w-3.5 animate-spin text-wo-blue" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Searching IRS rules via TinyFish…
            </div>
          )}

          {!loading && irsResults && irsResults.length === 0 && (
            <p className="text-xs text-wo-gray py-1">No IRS rules found for this topic.</p>
          )}

          {!loading && irsResults && irsResults.length > 0 && (
            <div className="space-y-2">
              {irsResults.map((result, i) => (
                <a
                  key={i}
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded border border-wo-border p-2.5 hover:border-wo-blue/30 hover:bg-wo-blue-50 transition-colors"
                >
                  <p className="text-xs font-medium text-wo-navy line-clamp-1">{result.title}</p>
                  <p className="text-[11px] text-wo-gray mt-0.5 line-clamp-2">{result.snippet}</p>
                </a>
              ))}
              <p className="text-[10px] text-wo-gray/60 pt-0.5">
                Powered by <span className="font-medium">TinyFish</span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
