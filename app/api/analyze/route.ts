import { analyzeExpenses } from "@/lib/llm";
import { parseCSV } from "@/lib/csvParser";
import { searchIRSRule } from "@/lib/tinyfish";

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "A CSV file is required" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return Response.json({ error: "A CSV file is required" }, { status: 400 });
  }

  const csvContent = await file.text();

  let records;
  try {
    records = parseCSV(csvContent);
  } catch {
    return Response.json({ error: "Invalid CSV format" }, { status: 400 });
  }

  if (records.length === 0) {
    return Response.json({ error: "CSV file contains no data" }, { status: 400 });
  }

  try {
    const result = await analyzeExpenses(records);

    // Enrich insights with TinyFish IRS references (if API key is set)
    let irsReferences: Record<string, { title: string; snippet: string; url: string }[]> = {};
    if (process.env.TINYFISH_API_KEY) {
      // Search for IRS rules related to each unique flagged category
      const flaggedCategories = Array.from(
        new Set(
          result.transactions
            .filter((t) => t.status === "flagged")
            .map((t) => t.category)
        )
      );

      // Also search for top insight topics
      const insightKeywords = result.insights
        .slice(0, 3)
        .map((ins) => {
          // Extract a short keyword from the insight text
          const match = ins.text.match(/\$[\d,]+\s+(?:on|in|for)\s+(\w+(?:\s+\w+)?)/i);
          return match ? match[1] : ins.type;
        });

      const searchTerms = [...flaggedCategories, ...insightKeywords].slice(0, 5);

      const searchResults = await Promise.all(
        searchTerms.map(async (term) => {
          const results = await searchIRSRule(term);
          return { term, results };
        })
      );

      for (const { term, results } of searchResults) {
        if (results.length > 0) {
          irsReferences[term] = results;
        }
      }
    }

    return Response.json({
      ...result,
      irsReferences,
      tinyfishEnabled: !!process.env.TINYFISH_API_KEY,
    });
  } catch (err: any) {
    console.error("Analysis error:", err);
    return Response.json(
      { error: err.message || "Analysis failed. Please try again." },
      { status: 502 },
    );
  }
}
