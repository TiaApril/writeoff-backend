const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai";
const MODEL = "gemini-2.0-flash";

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

function getApiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment variables");
  }
  return apiKey;
}

async function chatCompletion(
  system: string,
  userMessage: string,
  maxTokens = 8192,
): Promise<string> {
  const apiKey = getApiKey();

  const res = await fetch(`${GEMINI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: system },
        { role: "user", content: userMessage },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${body}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

export async function analyzeExpenses(
  expenseData: ExpenseRecord[],
): Promise<AnalysisResult> {
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
- Only flag transactions that are GENUINELY AMBIGUOUS. Do NOT flag transactions where the description clearly indicates the nature:
  - If the description says "personal" or is an obvious personal expense (Netflix, gym, groceries, personal subscription), mark it as category "Personal", status "clean". No flag needed.
  - If the description clearly indicates a business expense (office rent, QuickBooks, AWS, business insurance), mark it as the appropriate business category, status "clean". No flag needed.
  - Only flag when you truly cannot tell from the description whether it is business or personal (e.g. "Best Buy $1200", "Amazon purchase", "Uber", "ATM withdrawal").
- For flagged items, write a specific clarifying question referencing the actual transaction, not a generic question.
- Include 3-5 insights that sound like a smart friend reviewing their finances.
- potentialDeductions = sum of expense amounts that are likely tax-deductible. Do NOT include items categorized as Personal.
- complianceScore = percentage of transactions that are clean and well-categorized.
- Return raw JSON only. No explanation text.`;

  try {
    const rawText = await chatCompletion(system, JSON.stringify(expenseData));

    if (!rawText || rawText.trim() === "") {
      throw new Error("Gemini returned empty response");
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
  const system =
    "You are a helpful financial assistant. The user will provide their " +
    "expense data and ask a question about it. Answer concisely in plain text. " +
    FOREIGN_CONTRACTOR_DISCLAIMER;

  try {
    return await chatCompletion(
      system,
      `Here are my expenses:\n${JSON.stringify(expenseData, null, 2)}\n\n${question}`,
      4096,
    );
  } catch (error) {
    console.error("chatAboutExpenses failed:", error);
    throw error;
  }
}
