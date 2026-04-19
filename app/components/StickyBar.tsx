"use client";

interface StickyBarProps {
  complianceScore: number;
  flaggedCount: number;
  onAskWriteOff: () => void;
  onDownloadReport: () => void;
}

export default function StickyBar({
  complianceScore,
  flaggedCount,
  onAskWriteOff,
  onDownloadReport,
}: StickyBarProps) {
  const canDownload = complianceScore >= 80;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-wo-border bg-white/95 backdrop-blur-sm shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <div className="text-xs text-wo-gray">
          Compliance: <span className="font-semibold text-wo-navy">{complianceScore}%</span>
          {flaggedCount > 0 && (
            <span className="ml-2 text-amber-600">· {flaggedCount} items flagged</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onAskWriteOff}
            className="flex items-center gap-1.5 rounded-lg border border-wo-border px-4 py-2 text-sm font-medium text-wo-navy hover:bg-wo-gray-light transition-colors"
          >
            <svg className="h-4 w-4 text-wo-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Ask WriteOff
          </button>

          <button
            onClick={canDownload ? onDownloadReport : undefined}
            disabled={!canDownload}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              canDownload
                ? "bg-wo-blue text-white hover:bg-wo-blue-dark"
                : "bg-wo-gray-light text-wo-gray cursor-not-allowed"
            }`}
          >
            {canDownload
              ? "Download Accountant Report"
              : `Resolve ${flaggedCount} more to unlock report`}
          </button>
        </div>
      </div>
    </div>
  );
}
