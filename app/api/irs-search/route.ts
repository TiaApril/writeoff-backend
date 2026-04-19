import { searchIRSRule } from "@/lib/tinyfish";

export async function POST(request: Request) {
  if (!process.env.TINYFISH_API_KEY) {
    return Response.json(
      { error: "TinyFish API key not configured" },
      { status: 500 },
    );
  }

  let body: { query?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Query is required" }, { status: 400 });
  }

  if (!body.query || typeof body.query !== "string" || !body.query.trim()) {
    return Response.json({ error: "Query is required" }, { status: 400 });
  }

  try {
    const results = await searchIRSRule(body.query.trim(), true);
    return Response.json({ results });
  } catch (err) {
    console.error("IRS search error:", err);
    return Response.json({ error: "Search failed" }, { status: 502 });
  }
}
