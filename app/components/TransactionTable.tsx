"use client";

import { useState, useMemo } from "react";

interface Transaction {
  date: string;
  description: string;
  amount: number;
  category: string;
  type: "income" | "expense";
  status: "clean" | "flagged";
  flagReason?: string;
  flagQuestion?: string;
}

interface TransactionTableProps {
  transactions: Transaction[];
  onResolve: (index: number, answer: "business" | "personal") => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Income: "bg-emerald-100 text-emerald-700",
  Travel: "bg-purple-100 text-purple-700",
  "Office Supplies": "bg-blue-100 text-blue-700",
  Software: "bg-indigo-100 text-indigo-700",
  Meals: "bg-orange-100 text-orange-700",
  Utilities: "bg-cyan-100 text-cyan-700",
  Rent: "bg-amber-100 text-amber-700",
  Insurance: "bg-teal-100 text-teal-700",
  "Professional Services": "bg-violet-100 text-violet-700",
  Marketing: "bg-pink-100 text-pink-700",
  Equipment: "bg-slate-100 text-slate-700",
  Personal: "bg-red-100 text-red-700",
  Cash: "bg-yellow-100 text-yellow-700",
  Contractors: "bg-lime-100 text-lime-700",
  Other: "bg-gray-100 text-gray-700",
};

const PAGE_SIZE = 20;

export default function TransactionTable({ transactions, onResolve }: TransactionTableProps) {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [page, setPage] = useState(0);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "clean" | "flagged">("all");
  const [search, setSearch] = useState("");

  // Split into flagged and all
  const flagged = useMemo(
    () => transactions
      .map((t, i) => ({ ...t, originalIndex: i }))
      .filter((t) => t.status === "flagged"),
    [transactions],
  );

  // Get unique categories for filter
  const categories = useMemo(
    () => Array.from(new Set(transactions.map((t) => t.category))).sort(),
    [transactions],
  );

  // Filter the full list
  const filtered = useMemo(() => {
    return transactions
      .map((t, i) => ({ ...t, originalIndex: i }))
      .filter((t) => {
        if (filterCategory !== "all" && t.category !== filterCategory) return false;
        if (filterStatus !== "all" && t.status !== filterStatus) return false;
        if (search && !t.description.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      });
  }, [transactions, filterCategory, filterStatus, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const flaggedCount = flagged.length;
  const totalCount = transactions.length;

  return (
    <div className="space-y-4">
      {/* Flagged / Needs Review section */}
      {flaggedCount > 0 && (
        <div className="rounded-xl bg-white border border-amber-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 bg-amber-50 border-b border-amber-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-amber-800 flex items-center gap-2">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.168 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                Needs Review
              </h3>
              <p className="text-xs text-amber-600 mt-0.5">
                {flaggedCount} of {totalCount} transactions need your attention
              </p>
            </div>
            {/* Progress indicator */}
            <div className="flex items-center gap-2">
              <div className="h-2 w-24 rounded-full bg-amber-200">
                <div
                  className="h-2 rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${((totalCount - flaggedCount) / totalCount) * 100}%` }}
                />
              </div>
              <span className="text-xs font-medium text-amber-700">
                {totalCount - flaggedCount}/{totalCount} resolved
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-amber-100 bg-amber-50/50">
                  <th className="px-4 py-2 text-left text-xs font-medium text-wo-gray uppercase tracking-wider">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-wo-gray uppercase tracking-wider">Description</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-wo-gray uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-wo-gray uppercase tracking-wider">Category</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-wo-gray uppercase tracking-wider">Issue</th>
                </tr>
              </thead>
              <tbody>
                {flagged.map((txn) => (
                  <FlaggedRow
                    key={txn.originalIndex}
                    txn={txn}
                    isExpanded={expandedRow === txn.originalIndex}
                    onToggle={() => setExpandedRow(expandedRow === txn.originalIndex ? null : txn.originalIndex)}
                    onResolve={(answer) => onResolve(txn.originalIndex, answer)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* All Transactions section */}
      <div className="rounded-xl bg-white border border-wo-border shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-wo-border">
          <button
            onClick={() => { setShowAll(!showAll); setPage(0); }}
            className="flex items-center justify-between w-full"
          >
            <div className="text-left">
              <h3 className="text-sm font-semibold text-wo-navy">
                All Transactions
              </h3>
              <p className="text-xs text-wo-gray mt-0.5">{totalCount} total transactions</p>
            </div>
            <svg
              className={`h-5 w-5 text-wo-gray transition-transform duration-200 ${showAll ? "rotate-180" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {showAll && (
          <>
            {/* Filters */}
            <div className="px-5 py-3 border-b border-wo-border bg-wo-gray-light flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="flex-1 min-w-[180px]">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                  placeholder="Search descriptions…"
                  className="w-full rounded-lg border border-wo-border bg-white px-3 py-1.5 text-sm text-wo-navy placeholder:text-wo-gray/50 focus:outline-none focus:ring-2 focus:ring-wo-blue/30 focus:border-wo-blue"
                />
              </div>

              {/* Category filter */}
              <select
                value={filterCategory}
                onChange={(e) => { setFilterCategory(e.target.value); setPage(0); }}
                className="rounded-lg border border-wo-border bg-white px-3 py-1.5 text-sm text-wo-navy focus:outline-none focus:ring-2 focus:ring-wo-blue/30"
              >
                <option value="all">All categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              {/* Status filter */}
              <select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value as any); setPage(0); }}
                className="rounded-lg border border-wo-border bg-white px-3 py-1.5 text-sm text-wo-navy focus:outline-none focus:ring-2 focus:ring-wo-blue/30"
              >
                <option value="all">All statuses</option>
                <option value="clean">Clean</option>
                <option value="flagged">Flagged</option>
              </select>

              <span className="text-xs text-wo-gray">{filtered.length} results</span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-wo-border bg-wo-gray-light">
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-wo-gray uppercase tracking-wider">Date</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-wo-gray uppercase tracking-wider">Description</th>
                    <th className="px-4 py-2.5 text-right text-xs font-medium text-wo-gray uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-wo-gray uppercase tracking-wider">Category</th>
                    <th className="px-4 py-2.5 text-center text-xs font-medium text-wo-gray uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((txn) => (
                    <AllTransactionRow key={txn.originalIndex} txn={txn} />
                  ))}
                  {paged.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-sm text-wo-gray">
                        No transactions match your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-5 py-3 border-t border-wo-border flex items-center justify-between">
                <p className="text-xs text-wo-gray">
                  Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                    className="rounded-lg border border-wo-border px-2.5 py-1 text-xs font-medium text-wo-navy hover:bg-wo-gray-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    // Show pages around current page
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i;
                    } else if (page < 3) {
                      pageNum = i;
                    } else if (page > totalPages - 4) {
                      pageNum = totalPages - 5 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                          page === pageNum
                            ? "bg-wo-blue text-white"
                            : "border border-wo-border text-wo-navy hover:bg-wo-gray-light"
                        }`}
                      >
                        {pageNum + 1}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                    disabled={page === totalPages - 1}
                    className="rounded-lg border border-wo-border px-2.5 py-1 text-xs font-medium text-wo-navy hover:bg-wo-gray-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ---- Flagged row with expand/resolve ---- */
function FlaggedRow({
  txn,
  isExpanded,
  onToggle,
  onResolve,
}: {
  txn: Transaction & { originalIndex: number };
  isExpanded: boolean;
  onToggle: () => void;
  onResolve: (answer: "business" | "personal") => void;
}) {
  const categoryColor = CATEGORY_COLORS[txn.category] || CATEGORY_COLORS.Other;

  return (
    <>
      <tr
        className="border-b border-amber-100 hover:bg-amber-50/50 cursor-pointer transition-colors"
        onClick={onToggle}
      >
        <td className="px-4 py-3 text-xs text-wo-gray whitespace-nowrap">{txn.date}</td>
        <td className="px-4 py-3 text-sm text-wo-navy">{txn.description}</td>
        <td className={`px-4 py-3 text-sm font-medium text-right whitespace-nowrap ${
          txn.type === "income" ? "text-emerald-600" : "text-wo-navy"
        }`}>
          {txn.type === "income" ? "+" : "-"}${Math.abs(txn.amount).toLocaleString()}
        </td>
        <td className="px-4 py-3">
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${categoryColor}`}>
            {txn.category}
          </span>
        </td>
        <td className="px-4 py-3 text-xs text-amber-600">{txn.flagReason}</td>
      </tr>

      {isExpanded && (
        <tr>
          <td colSpan={5} className="bg-amber-50/60 px-5 py-4">
            <div className="flex items-center justify-between max-w-xl">
              <p className="text-sm text-wo-navy">
                {txn.flagQuestion || `This ${txn.description} charge — was this for business or personal?`}
              </p>
              <div className="flex gap-2 ml-4 shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); onResolve("business"); }}
                  className="rounded-lg bg-wo-blue px-3 py-1.5 text-xs font-semibold text-white hover:bg-wo-blue-dark transition-colors"
                >
                  Business
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onResolve("personal"); }}
                  className="rounded-lg bg-white border border-wo-border px-3 py-1.5 text-xs font-semibold text-wo-navy hover:bg-wo-gray-light transition-colors"
                >
                  Personal
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

/* ---- Clean row for the full list ---- */
function AllTransactionRow({ txn }: { txn: Transaction & { originalIndex: number } }) {
  const categoryColor = CATEGORY_COLORS[txn.category] || CATEGORY_COLORS.Other;

  return (
    <tr className="border-b border-wo-border hover:bg-wo-gray-light transition-colors">
      <td className="px-4 py-2.5 text-xs text-wo-gray whitespace-nowrap">{txn.date}</td>
      <td className="px-4 py-2.5 text-sm text-wo-navy">{txn.description}</td>
      <td className={`px-4 py-2.5 text-sm font-medium text-right whitespace-nowrap ${
        txn.type === "income" ? "text-emerald-600" : "text-wo-navy"
      }`}>
        {txn.type === "income" ? "+" : "-"}${Math.abs(txn.amount).toLocaleString()}
      </td>
      <td className="px-4 py-2.5">
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${categoryColor}`}>
          {txn.category}
        </span>
      </td>
      <td className="px-4 py-2.5 text-center">
        {txn.status === "clean" ? (
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100">
            <svg className="h-3 w-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </span>
        ) : (
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-100">
            <svg className="h-3 w-3 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.168 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </span>
        )}
      </td>
    </tr>
  );
}
