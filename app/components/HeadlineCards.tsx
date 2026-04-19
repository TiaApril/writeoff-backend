"use client";

interface HeadlineCardsProps {
  totalIncome: number;
  totalExpenses: number;
  potentialDeductions: number;
  complianceScore: number;
}

export default function HeadlineCards({
  totalIncome,
  totalExpenses,
  potentialDeductions,
  complianceScore,
}: HeadlineCardsProps) {
  // Compliance score ring
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (complianceScore / 100) * circumference;

  const scoreColor =
    complianceScore >= 80 ? "text-emerald-600 stroke-emerald-500" :
    complianceScore >= 60 ? "text-amber-600 stroke-amber-500" :
    "text-red-600 stroke-red-500";

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Income */}
      <div className="rounded-xl bg-white border border-wo-border p-5 shadow-sm">
        <p className="text-xs font-medium text-wo-gray uppercase tracking-wider">Total Income</p>
        <p className="mt-2 text-2xl font-bold text-emerald-600">
          ${totalIncome.toLocaleString()}
        </p>
      </div>

      {/* Total Expenses */}
      <div className="rounded-xl bg-white border border-wo-border p-5 shadow-sm">
        <p className="text-xs font-medium text-wo-gray uppercase tracking-wider">Total Expenses</p>
        <p className="mt-2 text-2xl font-bold text-red-600">
          ${totalExpenses.toLocaleString()}
        </p>
      </div>

      {/* Potential Deductions */}
      <div className="rounded-xl bg-white border border-wo-border p-5 shadow-sm">
        <p className="text-xs font-medium text-wo-gray uppercase tracking-wider">Deductions Found</p>
        <p className="mt-2 text-2xl font-bold text-wo-blue">
          ${potentialDeductions.toLocaleString()}
        </p>
        <p className="mt-1 text-[11px] text-wo-gray">potential write-offs</p>
      </div>

      {/* Compliance Score */}
      <div className="rounded-xl bg-white border border-wo-border p-5 shadow-sm flex items-center gap-4">
        <div className="relative h-20 w-20 shrink-0">
          <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="6" />
            <circle
              cx="40" cy="40" r={radius} fill="none"
              className={scoreColor.split(" ")[1]}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 1s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-lg font-bold ${scoreColor.split(" ")[0]}`}>{complianceScore}%</span>
          </div>
        </div>
        <div>
          <p className="text-xs font-medium text-wo-gray uppercase tracking-wider">Compliance</p>
          <p className="text-sm font-semibold text-wo-navy mt-0.5">
            {complianceScore >= 80 ? "Accountant-ready" : complianceScore >= 60 ? "Needs attention" : "Action required"}
          </p>
        </div>
      </div>
    </div>
  );
}
