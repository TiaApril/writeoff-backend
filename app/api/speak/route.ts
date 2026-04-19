import { synthesizeSpeech } from "@/lib/elevenlabs";

export async function POST(request: Request) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "ElevenLabs API key not configured" },
      { status: 500 },
    );
  }

  let body: { text?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "A text string is required" }, { status: 400 });
  }

  if (!body.text || typeof body.text !== "string" || !body.text.trim()) {
    return Response.json({ error: "Text must not be empty" }, { status: 400 });
  }

  try {
    const { audio, contentType } = await synthesizeSpeech(apiKey, body.text);
    return new Response(new Uint8Array(audio), {
      status: 200,
      headers: { "Content-Type": contentType },
    });
  } catch (err: any) {
    console.error("ElevenLabs error:", err);
    return Response.json(
      { error: err.message || "Unable to synthesize speech" },
      { status: 502 },
    );
  }
}
