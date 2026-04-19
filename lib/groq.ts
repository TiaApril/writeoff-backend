import Groq from "groq-sdk";

const MODEL = "llama-3.3-70b-versatile";

const FOREIGN_CONTRACTOR_DISCLAIMER =
  "IMPORTANT: If any expenses involve payments to foreign contractors, " +
  "you MUST include this exact text in your response: " +
  "'Payments to foreign contractors may require W-8BEN forms and Form 1042-S filing. " +
  "Thresholds and treaty exemptions vary — consult a tax professional for your specific situation.'";

export interface ExpenseRecord {
  date: string;
  description: string;
  amount: number;
}

export interface AnalyzedTransaction {
  date: string;
  description: string;
  amount: number;
  category: string;
  type: "income" | "expense";
  status: "clean" | "flagged";
  flagReason?: string;
  flagQuestion?: string;
}

export interface CategoryBreakdown {
  name: string;
  total: number;
  count: number;
  color: string;
}

export interface Insight {
  text: string;
  type: "deduction" | "warning" | "tip" | "info";
}

export interface AnalysisResult {
  totalIncome: number;
  totalExpenses: number;
  potentialDeductions: number;
  complianceScore: number;
  transactions: AnalyzedTransaction[];
  categories: CategoryBreakdown[];
  insights: Insight[];
}

function getClient(): Groq {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not set in environment variables");
  }
  return new Groq({ apiKey });
}

export async function analyzeExpenses(
  expenseData: ExpenseRecord[],
): Promise<AnalysisResult> {
  const client = getClient();

  const system = `You are a financial compliance assistant for US small businesses.
Analyze each transaction and return ONLY raw JSON (no markdown, no code blocks).

Use this exact structure:
{
  "totalIncome": number,
  "totalExpenses": number,
  "potentialDeductions": number,
  "complianceScore": number (0-100, how accountant-ready the books are),
  "transactions": [
    {
      "date": "original date",
      "description": "original description",
      "amount": number,
      "category": "one of: Income, Travel, Office Supplies, Software, Meals, Utilities, Rent, Insurance, Professional Services, Marketing, Equipment, Personal, Cash, Contractors, Other",
      "type": "income or expense",
      "status": "clean or flagged",
      "flagReason": "short reason if flagged, omit if clean",
      "flagQuestion": "yes/no clarifying question if flagged, omit if clean"
    }
  ],
  "categories": [
    {"name": "category name", "total": number, "count": number, "color": "one of: blue, green, purple, orange, pink, cyan, amber, red, emerald, indigo"}
  ],
  "insights": [
    {"text": "conversational insight about the data", "type": "one of: deduction, warning, tip, info"}
  ]
}

Rules:
- Positive amounts are income, negative are expenses. If all amounts are positive, treat context clues in descriptions to determine type.
- Flag transactions that look personal, have vague descriptions, are unusually large, or need documentation.
- Include 3-5 insights that sound like a smart friend reviewing their finances.
- potentialDeductions = sum of expense amounts that are likely tax-deductible.
- complianceScore = percentage of transactions that are clean and well-categorized.
- Return raw JSON only. No explanation text.`;

  try {
    const res = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 8192,
      messages: [
        { role: "system", content: system },
        { role: "user", content: JSON.stringify(expenseData) },
      ],
    });

    const rawText = res.choices[0]?.message?.content ?? "";

    if (!rawText || rawText.trim() === "") {
      throw new Error("Groq returned empty response");
    }

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("analyzeExpenses failed:", error);
    throw error;
  }
}

export async function chatAboutExpenses(
  question: string,
  expenseData: ExpenseRecord[],
): Promise<string> {
  const client = getClient();

  const system =
    "You are a helpful financial assistant. The user will provide their " +
    "expense data and ask a question about it. Answer concisely in plain text. " +
    FOREIGN_CONTRACTOR_DISCLAIMER;

  try {
    const res = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 4096,
      messages: [
        { role: "system", content: system },
        {
          role: "user",
          content: `Here are my expenses:\n${JSON.stringify(expenseData, null, 2)}\n\n${question}`,
        },
      ],
    });

    return res.choices[0]?.message?.content ?? "";
  } catch (error) {
    console.error("chatAboutExpenses failed:", error);
    throw error;
  }
}
