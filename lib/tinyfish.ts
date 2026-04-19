export interface IRSResult {
  title: string;
  snippet: string;
  url: string;
}

export async function searchIRSRule(keyword: string, raw = false): Promise<IRSResult[]> {
  const query = raw ? keyword : `IRS ${keyword} small business`;
  const apiKey = process.env.TINYFISH_API_KEY;

  const res = await fetch(
    `https://api.search.tinyfish.ai?query=${encodeURIComponent(query)}&location=US&language=en`,
    {
      headers: {
        "X-API-Key": apiKey!,
      },
    },
  );

  if (!res.ok) {
    const body = await res.text();
    console.error(`TinyFish search failed: ${res.status} ${res.statusText}`, body);
    return [];
  }

  const data = await res.json();
  return data.results.slice(0, 3).map((r: any) => ({
    title: r.title,
    snippet: r.snippet,
    url: r.url,
  }));
}

export async function fetchIRSPage(url: string): Promise<string> {
  const res = await fetch("https://api.fetch.tinyfish.ai", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": process.env.TINYFISH_API_KEY!,
    },
    body: JSON.stringify({ url }),
  });

  if (!res.ok) return "";
  const data = await res.json();
  return data.content || data.text || "";
}
