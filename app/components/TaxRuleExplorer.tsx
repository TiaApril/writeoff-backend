"use client";

import { useState, FormEvent } from "react";

interface IRSResult {
  title: string;
  snippet: string;
  url: string;
}

export default function TaxRuleExplorer() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<IRSResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    setHasSearched(true);

    try {
      const res = await fetch("/api/irs-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      });

      if (!res.ok) {
        setResults([]);
        return;
      }

      const data = await res.json();
      setResults(data.results || []);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="rounded-xl bg-white border border-wo-border p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-wo-blue-light">
          <svg className="h-4 w-4 text-wo-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-wo-navy">Tax Rule Explorer</h3>
          <p className="text-[11px] text-wo-gray">Search IRS rules and deduction guidelines — powered by TinyFish</p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. home office deduction, meal expenses, mileage rate…"
          className="flex-1 rounded-lg border border-wo-border bg-wo-gray-light px-3 py-2 text-sm text-wo-navy placeholder:text-wo-gray/50 focus:outline-none focus:ring-2 focus:ring-wo-blue/30 focus:border-wo-blue"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="rounded-lg bg-wo-blue px-4 py-2 text-sm font-semibold text-white hover:bg-wo-blue-dark disabled:opacity-40 transition-colors"
        >
          {isLoading ? "Searching…" : "Search"}
        </button>
      </form>

      {/* Quick search tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {["Home office deduction", "Business meals 50%", "Vehicle mileage rate", "W-8BEN foreign contractors", "Section 179 equipment"].map((tag) => (
          <button
            key={tag}
            onClick={() => { setQuery(tag); }}
            className="rounded-full border border-wo-border px-2.5 py-1 text-[11px] text-wo-gray hover:bg-wo-gray-light hover:text-wo-navy transition-colors"
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Results */}
      {isLoading && (
        <div className="flex items-center gap-2 py-6 justify-center text-sm text-wo-gray">
          <svg className="h-4 w-4 animate-spin text-wo-blue" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Searching IRS rules…
        </div>
      )}

      {!isLoading && hasSearched && results.length === 0 && (
        <p className="text-sm text-wo-gray text-center py-4">No results found. Try a different search term.</p>
      )}

      {!isLoading && results.length > 0 && (
        <div className="space-y-3">
          {results.map((result, i) => (
            <a
              key={i}
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg border border-wo-border p-3.5 hover:border-wo-blue/30 hover:bg-wo-blue-50 transition-colors group"
            >
              <div className="flex items-start gap-2">
                <svg className="h-4 w-4 mt-0.5 shrink-0 text-wo-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-wo-navy group-hover:text-wo-blue line-clamp-1">
                    {result.title}
                  </p>
                  <p className="text-xs text-wo-gray mt-1 line-clamp-2 leading-relaxed">
                    {result.snippet}
                  </p>
                  <p className="text-[10px] text-wo-blue/60 mt-1 truncate">{result.url}</p>
                </div>
              </div>
            </a>
          ))}
          <p className="text-[10px] text-wo-gray text-center pt-1">
            Search results powered by <span className="font-medium">TinyFish</span>
          </p>
        </div>
      )}
    </div>
  );
}
