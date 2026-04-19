import { analyzeExpenses } from "@/lib/groq";
import { parseCSV } from "@/lib/csvParser";

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
    return Response.json(result);
  } catch (err: any) {
    console.error("Analysis error:", err);
    return Response.json(
      { error: err.message || "Analysis failed. Please try again." },
      { status: 502 },
    );
  }
}
