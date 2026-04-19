import { chatAboutExpenses } from "@/lib/llm";
import type { ExpenseRecord } from "@/lib/llm";

export async function POST(request: Request) {
  // Parse body
  let body: Record<string, any>;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "A question is required" },
      { status: 400 },
    );
  }

  const question = body.question || body.message || body.query;
  let expenseData: ExpenseRecord[] =
    body.expenseData || body.records || body.data || [];

  if (expenseData.length === 0) {
    expenseData = [
      {
        date: "context",
        description:
          "The user has uploaded a bank statement with multiple transactions including cash withdrawals, contractor payments, and mixed personal and business expenses.",
        amount: 0,
      },
    ];
  }

  if (!question) {
    return Response.json(
      { error: "Question is required" },
      { status: 400 },
    );
  }

  try {
    const answer = await chatAboutExpenses(question, expenseData);
    return new Response(answer, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch (err: any) {
    console.error("Chat error:", err);
    return Response.json(
      { error: err.message || "Unable to process chat request" },
      { status: 502 },
    );
  }
}
