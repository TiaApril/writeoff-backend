"use client";

import { useState } from "react";

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

export default function TransactionTable({ transactions, onResolve }: TransactionTableProps) {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  return (
    <div className="rounded-xl bg-white border border-wo-border shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-wo-border">
        <h3 className="text-sm font-semibold text-wo-navy">Transactions</h3>
        <p className="text-xs text-wo-gray mt-0.5">
          {transactions.filter((t) => t.status === "flagged").length} items need your attention
        </p>
      </div>

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
            {transactions.map((txn, i) => (
              <TransactionRow
                key={i}
                txn={txn}
                index={i}
                isExpanded={expandedRow === i}
                onToggle={() => setExpandedRow(expandedRow === i ? null : i)}
                onResolve={onResolve}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TransactionRow({
  txn,
  index,
  isExpanded,
  onToggle,
  onResolve,
}: {
  txn: Transaction;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  onResolve: (index: number, answer: "business" | "personal") => void;
}) {
  const categoryColor = CATEGORY_COLORS[txn.category] || CATEGORY_COLORS.Other;
  const isFlagged = txn.status === "flagged";

  return (
    <>
      <tr
        className={`border-b border-wo-border transition-colors ${
          isFlagged
            ? "bg-amber-50/60 hover:bg-amber-50 cursor-pointer"
            : "hover:bg-wo-gray-light"
        }`}
        onClick={isFlagged ? onToggle : undefined}
      >
        <td className="px-4 py-3 text-xs text-wo-gray whitespace-nowrap">{txn.date}</td>
        <td className="px-4 py-3 text-sm text-wo-navy">
          <div className="flex items-center gap-2">
            {txn.description}
            {isFlagged && (
              <span className="text-[10px] text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded font-medium">
                {txn.flagReason}
              </span>
            )}
          </div>
        </td>
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
        <td className="px-4 py-3 text-center">
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

      {/* Expanded flag resolution */}
      {isFlagged && isExpanded && (
        <tr>
          <td colSpan={5} className="bg-amber-50/40 px-4 py-4">
            <div className="flex items-center justify-between max-w-lg">
              <p className="text-sm text-wo-navy">
                {txn.flagQuestion || `This ${txn.description} charge — was this for business or personal?`}
              </p>
              <div className="flex gap-2 ml-4 shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); onResolve(index, "business"); }}
                  className="rounded-lg bg-wo-blue px-3 py-1.5 text-xs font-semibold text-white hover:bg-wo-blue-dark transition-colors"
                >
                  Business
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onResolve(index, "personal"); }}
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
