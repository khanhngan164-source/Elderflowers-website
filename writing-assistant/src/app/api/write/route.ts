import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { checkPassword } from "@/lib/auth";
import { buildUserMessage, SYSTEM_PROMPT } from "@/lib/prompt";
import { WriteRequestSchema, WriteResultSchema } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const client = new Anthropic();

function fail(status: number, error: string) {
  return Response.json({ error }, { status });
}

export async function POST(request: Request) {
  const auth = checkPassword(
    request.headers.get("x-app-password"),
    process.env.APP_PASSWORD,
    process.env.NODE_ENV === "production",
  );
  if (!auth.ok) return fail(auth.status, auth.error);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "Yêu cầu không hợp lệ.");
  }
  const parsed = WriteRequestSchema.safeParse(body);
  if (!parsed.success) return fail(400, parsed.error.issues[0]?.message ?? "Thiếu thông tin.");

  try {
    const response = await client.beta.messages.parse({
      model: "claude-opus-5-5",
      max_tokens: 16000,
      // Medium balances speed and quality for translation. Use "low" for faster replies, "high" if quality falls short.
      output_config: { effort: "medium", format: betaZodOutputFormat(WriteResultSchema) },
      // If the model declines (false-positive safety refusal), the API retries on a suitable model.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: buildUserMessage(parsed.data) }],
    });

    if (response.stop_reason === "refusal") {
      return fail(422, "AI từ chối xử lý nội dung này. Hãy thử diễn đạt lại.");
    }
    if (response.stop_reason === "max_tokens" || !response.parsed_output) {
      return fail(502, "AI trả về kết quả không đầy đủ. Hãy thử lại.");
    }
    return Response.json(response.parsed_output);
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) return fail(500, "API key của Anthropic không hợp lệ hoặc chưa được đặt.");
    if (error instanceof Anthropic.RateLimitError) return fail(429, "Gọi AI quá nhiều trong thời gian ngắn. Đợi một chút rồi thử lại.");
    if (error instanceof Anthropic.BadRequestError) return fail(400, `Yêu cầu bị từ chối: ${error.message}`);
    if (error instanceof Anthropic.APIConnectionError) return fail(503, "Không kết nối được tới AI. Kiểm tra mạng rồi thử lại.");
    if (error instanceof Anthropic.APIError) return fail(502, `Lỗi từ AI (${error.status}). Hãy thử lại.`);
    console.error(error);
    return fail(500, "Có lỗi không mong muốn.");
  }
}
