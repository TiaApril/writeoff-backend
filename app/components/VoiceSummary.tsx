"use client";

import { useState, useRef } from "react";

interface VoiceSummaryProps {
  totalIncome: number;
  totalExpenses: number;
  potentialDeductions: number;
  complianceScore: number;
  flaggedCount: number;
  totalTransactions: number;
  insights: { text: string }[];
}

export default function VoiceSummary({
  totalIncome,
  totalExpenses,
  potentialDeductions,
  complianceScore,
  flaggedCount,
  totalTransactions,
  insights,
}: VoiceSummaryProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  function buildSummaryText(): string {
    const parts: string[] = [];

    parts.push(`Here's your WriteOff analysis summary.`);
    parts.push(`Your total income is $${totalIncome.toLocaleString()}, and total expenses are $${totalExpenses.toLocaleString()}.`);
    parts.push(`I found $${potentialDeductions.toLocaleString()} in potential tax deductions.`);

    if (flaggedCount > 0) {
      parts.push(`${flaggedCount} out of ${totalTransactions} transactions need your review.`);
    } else {
      parts.push(`All ${totalTransactions} transactions look clean.`);
    }

    parts.push(`Your compliance score is ${complianceScore}%.`);

    if (complianceScore >= 80) {
      parts.push(`Your books are looking accountant-ready.`);
    } else if (complianceScore >= 60) {
      parts.push(`A few items need attention before handing this to your accountant.`);
    } else {
      parts.push(`There are several items that need to be resolved before filing.`);
    }

    // Add top insight
    if (insights.length > 0) {
      parts.push(`Here's my top insight: ${insights[0].text}`);
    }

    return parts.join(" ");
  }

  async function handlePlay() {
    // If already playing, stop
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
      return;
    }

    setIsLoading(true);

    try {
      const text = buildSummaryText();
      const res = await fetch("/api/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        console.error("Speech failed:", res.status);
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);

      audioRef.current = audio;
      setIsPlaying(true);

      audio.play();
      audio.onended = () => {
        setIsPlaying(false);
        audioRef.current = null;
        URL.revokeObjectURL(url);
      };
    } catch (err) {
      console.error("Speech error:", err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      onClick={handlePlay}
      disabled={isLoading}
      className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors shadow-sm ${
        isPlaying
          ? "bg-red-50 border border-red-200 text-red-700 hover:bg-red-100"
          : "bg-wo-blue-light border border-wo-blue/20 text-wo-blue hover:bg-wo-blue hover:text-white"
      } ${isLoading ? "opacity-60 cursor-wait" : ""}`}
    >
      {isLoading ? (
        <>
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Generating audio…
        </>
      ) : isPlaying ? (
        <>
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          Stop
        </>
      ) : (
        <>
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" />
          </svg>
          Listen to summary
        </>
      )}
    </button>
  );
}
