import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const flash = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

/**
 * Generate structured JSON from Gemini
 */
export async function generateJSON(prompt, retries = 1) {
  for (let i = 0; i <= retries; i++) {
    try {
      const prefixed = i > 0
        ? `IMPORTANT: Return ONLY valid JSON, no markdown fences.\n\n${prompt}`
        : prompt;

      const result = await Promise.race([
        flash.generateContent(prefixed),
        new Promise((_, reject) => setTimeout(() => reject(new Error('AI_TIMEOUT')), 30000)),
      ]);

      const text = result.response.text();
      const cleaned = text.replace(/```json\n?|```/g, '').trim();
      return JSON.parse(cleaned);
    } catch (e) {
      if (e.message === 'AI_TIMEOUT') throw { status: 504, error: 'AI service timeout', retry: true };
      if (i === retries) throw { status: 422, error: 'Invalid JSON from AI', raw: e.message };
    }
  }
}

/**
 * Generate JSON from image (Vision)
 */
export async function generateFromImage(prompt, imageBase64, mimeType = 'image/jpeg') {
  const result = await Promise.race([
    flash.generateContent([
      prompt,
      { inlineData: { data: imageBase64, mimeType } },
    ]),
    new Promise((_, reject) => setTimeout(() => reject(new Error('AI_TIMEOUT')), 30000)),
  ]);

  const text = result.response.text();
  return JSON.parse(text.replace(/```json\n?|```/g, '').trim());
}

/**
 * Chat with Gemini (multi-turn) — with retry + longer timeout
 */
export async function chatGenerate(contents, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const timeout = 45000 + attempt * 15000; // 45s, 60s, 75s
      const result = await Promise.race([
        flash.generateContent({ contents }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('AI_TIMEOUT')), timeout)),
      ]);

      const text = result.response.text();
      try {
        return JSON.parse(text.replace(/```json\n?|```/g, '').trim());
      } catch {
        return { reply: text, replyHi: text };
      }
    } catch (e) {
      if (e.message === 'AI_TIMEOUT' && attempt < retries) {
        console.warn(`[chatGenerate] Timeout on attempt ${attempt + 1}, retrying...`);
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1))); // 1s, 2s backoff
        continue;
      }
      if (e.message === 'AI_TIMEOUT') throw { status: 504, error: 'AI service timeout', retry: true };
      throw e;
    }
  }
}
