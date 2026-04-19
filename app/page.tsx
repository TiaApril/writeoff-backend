"use client";

import { useState, useRef } from "react";
import FileUpload from "./components/FileUpload";
import HeadlineCards from "./components/HeadlineCards";
import TransactionTable from "./components/TransactionTable";
import CategoryChart from "./components/CategoryChart";
import InsightsPanel from "./components/InsightsPanel";
import ChatPanel from "./components/ChatPanel";
import StickyBar from "./components/StickyBar";

import TaxRuleExplorer from "./components/TaxRuleExplorer";

interface AnalyzedTransaction {
  date: string;
  description: string;
  amount: number;
  category: string;
  type: "income" | "expense";
  status: "clean" | "flagged";
  flagReason?: string;
  flagQuestion?: string;
}

interface AnalysisResult {
  totalIncome: number;
  totalExpenses: number;
  potentialDeductions: number;
  complianceScore: number;
  transactions: AnalyzedTransaction[];
  categories: { name: string; total: number; count: number; color: string }[];
  insights: { text: string; type: "deduction" | "warning" | "tip" | "info" }[];
  irsReferences?: Record<string, { title: string; snippet: string; url: string }[]>;
  tinyfishEnabled?: boolean;
}

export default function Home() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [expenseData, setExpenseData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  function handleFileSelected(file: File) {
    setSelectedFile(file);
    setError(null);
  }

  async function handleAnalyze() {
    if (!selectedFile) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      setResult(data);

      const text = await selectedFile.text();
      const lines = text.trim().split("\n");
      const parsed = lines.slice(1).map((line) => {
        const cols = line.split(",");
        return { date: cols[0], description: cols[1] || cols[2], amount: cols[2] || cols[3] };
      });
      setExpenseData(parsed);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  function handleResolve(index: number, answer: "business" | "personal") {
    if (!result) return;

    const updated = { ...result };
    const txn = { ...updated.transactions[index] };

    if (answer === "personal") {
      txn.category = "Personal";
      txn.status = "clean";
      txn.flagReason = undefined;
      txn.flagQuestion = undefined;
    } else {
      txn.status = "clean";
      txn.flagReason = undefined;
      txn.flagQuestion = undefined;
    }

    updated.transactions = [...updated.transactions];
    updated.transactions[index] = txn;

    // Recalculate compliance score
    const cleanCount = updated.transactions.filter((t) => t.status === "clean").length;
    updated.complianceScore = Math.round((cleanCount / updated.transactions.length) * 100);

    setResult(updated);
  }

  function handleAskWriteOff() {
    setShowChat(true);
    setTimeout(() => {
      chatRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }

  function handleDownloadReport() {
    if (!result) return;

    const lines = [
      "WriteOff — Accountant Report",
      `Generated: ${new Date().toLocaleDateString()}`,
      `Compliance Score: ${result.complianceScore}%`,
      "",
      `Total Income: $${result.totalIncome.toLocaleString()}`,
      `Total Expenses: $${result.totalExpenses.toLocaleString()}`,
      `Potential Deductions: $${result.potentialDeductions.toLocaleString()}`,
      "",
      "--- TRANSACTIONS ---",
      "Date, Description, Amount, Category, Status",
      ...result.transactions.map(
        (t) => `${t.date}, ${t.description}, $${Math.abs(t.amount)}, ${t.category}, ${t.status}`
      ),
      "",
      "--- INSIGHTS ---",
      ...result.insights.map((ins) => `[${ins.type.toUpperCase()}] ${ins.text}`),
      "",
      "Disclaimer: AI analysis for informational purposes only. Verify with a licensed CPA before filing.",
    ];

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "writeoff-report.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  const flaggedCount = result?.transactions.filter((t) => t.status === "flagged").length ?? 0;

  return (
    <div className={`min-h-screen bg-white ${result ? "pb-20" : ""}`}>
      {/* Header */}
      <header className="border-b border-wo-border">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-wo-blue">
                <span className="text-xs font-bold text-white">WO</span>
              </div>
              <span className="text-base font-bold text-wo-navy">WriteOff</span>
            </div>
            <nav className="hidden sm:flex items-center gap-6 text-sm text-wo-gray">
              <span className="cursor-default hover:text-wo-navy transition-colors">Features</span>
              <span className="cursor-default hover:text-wo-navy transition-colors">Pricing</span>
              <span className="cursor-default hover:text-wo-navy transition-colors">Help</span>
            </nav>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Landing / Upload */}
        {!result && (
          <section className="pt-16 pb-10 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-wo-navy leading-tight">
              Find every write-off{" "}
              <span className="text-wo-blue">before your<br />accountant does</span>
            </h1>

            <p className="mt-5 text-base text-wo-gray max-w-lg mx-auto leading-relaxed">
              AI-powered compliance copilot for US small business owners.<br />
              Know your IRS risks in 30 seconds — no accountant needed.
            </p>

            <div className="mt-10 grid grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="rounded-xl border border-wo-border py-5 px-4 text-center">
                <p className="text-2xl font-bold text-wo-blue">33M</p>
                <p className="mt-1 text-xs text-wo-gray">small businesses underserved</p>
              </div>
              <div className="rounded-xl border border-wo-border py-5 px-4 text-center">
                <p className="text-2xl font-bold text-wo-blue">42%</p>
                <p className="mt-1 text-xs text-wo-gray">started with no financial training</p>
              </div>
              <div className="rounded-xl border border-wo-border py-5 px-4 text-center">
                <p className="text-2xl font-bold text-wo-blue">15%</p>
                <p className="mt-1 text-xs text-wo-gray">use an accountant</p>
              </div>
            </div>

            <div className="mt-10 max-w-2xl mx-auto">
              <FileUpload
                onFileSelected={handleFileSelected}
                selectedFile={selectedFile}
                isLoading={isLoading}
                onAnalyze={handleAnalyze}
              />
            </div>

            {error && (
              <div className="mt-4 max-w-2xl mx-auto rounded-xl bg-red-50 border border-red-200 px-5 py-4 text-sm text-red-700 flex items-center gap-2">
                <svg className="h-5 w-5 shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}
          </section>
        )}

        {/* Results Dashboard */}
        {result && (
          <div className="py-8 space-y-6">
            {/* Back */}
            <button
              onClick={() => { setResult(null); setError(null); setSelectedFile(null); setShowChat(false); }}
              className="flex items-center gap-1.5 text-sm text-wo-blue hover:text-wo-blue-dark transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              New analysis
            </button>

            {/* Top — Headline numbers */}
            <HeadlineCards
              totalIncome={result.totalIncome}
              totalExpenses={result.totalExpenses}
              potentialDeductions={result.potentialDeductions}
              complianceScore={result.complianceScore}
            />

            {/* Middle — Transaction table */}
            <TransactionTable
              transactions={result.transactions}
              onResolve={handleResolve}
            />

            {/* Category breakdown + Insights side by side */}
            <div className="grid gap-6 lg:grid-cols-2">
              <CategoryChart categories={result.categories} />
              <InsightsPanel insights={result.insights} irsReferences={result.irsReferences} />
            </div>

            {/* Tax Rule Explorer */}
            <TaxRuleExplorer />

            {/* Chat (toggled by sticky bar) */}
            {showChat && (
              <div ref={chatRef}>
                <ChatPanel expenseData={expenseData} />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer (only on landing) */}
      {!result && (
        <footer className="mt-16 border-t border-wo-border py-6">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-xs text-wo-gray">
              WriteOff &copy; {new Date().getFullYear()} &middot; AI analysis for informational purposes only. Consult a licensed CPA before filing.
            </p>
          </div>
        </footer>
      )}

      {/* Sticky bottom bar (only on results) */}
      {result && (
        <StickyBar
          complianceScore={result.complianceScore}
          flaggedCount={flaggedCount}
          onAskWriteOff={handleAskWriteOff}
          onDownloadReport={handleDownloadReport}
        />
      )}
    </div>
  );
}
