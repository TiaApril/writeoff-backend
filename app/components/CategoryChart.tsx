"use client";

interface Category {
  name: string;
  total: number;
  count: number;
  color: string;
}

interface CategoryChartProps {
  categories: Category[];
}

const COLOR_MAP: Record<string, string> = {
  blue: "bg-blue-500",
  green: "bg-emerald-500",
  purple: "bg-purple-500",
  orange: "bg-orange-500",
  pink: "bg-pink-500",
  cyan: "bg-cyan-500",
  amber: "bg-amber-500",
  red: "bg-red-500",
  emerald: "bg-emerald-500",
  indigo: "bg-indigo-500",
};

const DOT_MAP: Record<string, string> = {
  blue: "bg-blue-500",
  green: "bg-emerald-500",
  purple: "bg-purple-500",
  orange: "bg-orange-500",
  pink: "bg-pink-500",
  cyan: "bg-cyan-500",
  amber: "bg-amber-500",
  red: "bg-red-500",
  emerald: "bg-emerald-500",
  indigo: "bg-indigo-500",
};

export default function CategoryChart({ categories }: CategoryChartProps) {
  const sorted = [...categories].sort((a, b) => Math.abs(b.total) - Math.abs(a.total));
  const maxTotal = Math.max(...sorted.map((c) => Math.abs(c.total)), 1);
  const grandTotal = sorted.reduce((sum, c) => sum + Math.abs(c.total), 0);

  return (
    <div className="rounded-xl bg-white border border-wo-border p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-wo-navy mb-5">Category Breakdown</h3>

      {/* Stacked bar */}
      <div className="flex h-4 rounded-full overflow-hidden mb-5">
        {sorted.map((cat, i) => {
          const pct = grandTotal > 0 ? (Math.abs(cat.total) / grandTotal) * 100 : 0;
          const barColor = COLOR_MAP[cat.color] || "bg-gray-400";
          return (
            <div
              key={i}
              className={`${barColor} transition-all duration-500`}
              style={{ width: `${pct}%` }}
              title={`${cat.name}: $${Math.abs(cat.total).toLocaleString()}`}
            />
          );
        })}
      </div>

      {/* Legend + bars */}
      <div className="space-y-3">
        {sorted.map((cat, i) => {
          const pct = grandTotal > 0 ? Math.round((Math.abs(cat.total) / grandTotal) * 100) : 0;
          const dotColor = DOT_MAP[cat.color] || "bg-gray-400";
          const barColor = COLOR_MAP[cat.color] || "bg-gray-400";

          return (
            <div key={i}>
              <div className="flex items-center justify-between text-sm mb-1">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${dotColor}`} />
                  <span className="text-wo-navy font-medium">{cat.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-wo-navy">${Math.abs(cat.total).toLocaleString()}</span>
                  <span className="ml-2 text-xs text-wo-gray">{pct}%</span>
                </div>
              </div>
              <div className="h-1.5 w-full rounded-full bg-wo-gray-light">
                <div
                  className={`h-1.5 rounded-full ${barColor} transition-all duration-700`}
                  style={{ width: `${(Math.abs(cat.total) / maxTotal) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
