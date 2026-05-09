// Gemini API via Vite proxy (avoids browser CORS issue)
// In dev: /gemini-api → https://generativelanguage.googleapis.com
// In prod: deploy as a backend function (Vercel/Supabase edge function)

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL = 'gemini-2.5-flash';

console.log('[Gemini] API Key present:', !!apiKey);

// ─── CORE FETCH HELPER ────────────────────────────────────────
async function geminiGenerate(contents, jsonMode = true, timeoutMs = 45000) {
  const isDev = typeof window !== 'undefined' && window.location?.hostname === 'localhost';
  const baseUrl = isDev
    ? `/gemini-api/v1beta/models/${MODEL}:generateContent`
    : `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
  const url = `${baseUrl}?key=${apiKey}`;

  const body = {
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
    },
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[Gemini] API error:', res.status, errText);
      throw new Error(`Gemini API error ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log('[Gemini] Raw response:', text.substring(0, 200));

    if (jsonMode) {
      try {
        return JSON.parse(text.replace(/```json\n?|```/g, '').trim());
      } catch (e) {
        console.error('[Gemini] JSON parse error:', e, 'raw:', text);
        throw new Error('Invalid JSON from Gemini');
      }
    }
    return text;
  } catch (e) {
    if (e.name === 'AbortError') {
      throw new Error('AI_TIMEOUT');
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

// ─── FALLBACKS ───────────────────────────────────────────────
const fallbackProductAnalysis = {
  title: 'Hand-Painted Terracotta Planter',
  titleHi: 'हस्तचित्रित टेराकोटा प्लांटर',
  category: 'Pottery',
  tags: ['terracotta', 'handmade', 'planter', 'garden'],
  suggestedPrice: 650,
  craftType: 'Pottery',
};

const fallbackExplanation = {
  text: 'This scheme provides micro-credit for expanding your small business.',
  textHi: 'यह योजना आपके छोटे व्यवसाय के विस्तार के लिए सूक्ष्म ऋण प्रदान करती है।',
};

// ─── PRODUCT VISION ANALYSIS ─────────────────────────────────
export async function analyzeProduct(imageBase64) {
  if (!apiKey) {
    console.warn('[Gemini] No API key – using fallback');
    return fallbackProductAnalysis;
  }
  try {
    const mimeType = imageBase64.startsWith('data:image/png') ? 'image/png' : 'image/jpeg';
    const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;

    const result = await geminiGenerate([
      {
        parts: [
          {
            text: `Analyze this artisan product image. Return ONLY a valid JSON object:
            {
              "title": "English product name",
              "titleHi": "Hindi product name",
              "category": "one of: Handloom, Pottery, Woodwork, Jewelry, Other",
              "tags": ["tag1", "tag2", "tag3"],
              "suggestedPrice": 500,
              "craftType": "type of craft"
            }`,
          },
          { inlineData: { data: base64Data, mimeType } },
        ],
      },
    ]);
    return result;
  } catch (e) {
    console.error('[Gemini] analyzeProduct error:', e);
    return fallbackProductAnalysis;
  }
}

// ─── CONVERSATIONAL CHAT ─────────────────────────────────────
export async function chatWithGemini(userMessage, artisanProfile, history = []) {
  if (!apiKey) {
    console.warn('[Gemini] No API key – using fallback chat');
    return {
      reply: `Based on your profile as a ${artisanProfile.craft} artisan with ₹${artisanProfile.totalSales?.toLocaleString()} in sales, you may be eligible for PM Vishwakarma and MUDRA Loan. Ask me anything!`,
      replyHi: `${artisanProfile.craft} शिल्पकार के रूप में आप PM विश्वकर्मा और मुद्रा ऋण के लिए पात्र हो सकते हैं।`,
    };
  }

  try {
    // Build conversation history for Gemini
    const systemPrompt = `You are ShilpMitra AI, a helpful financial assistant for rural artisans and MSMEs in India.
Artisan profile: Name: ${artisanProfile.name}, Craft: ${artisanProfile.craft}, Location: ${artisanProfile.location}, Total Sales: ₹${artisanProfile.totalSales?.toLocaleString()}.
You help artisans understand government schemes like PM Vishwakarma, MUDRA Loan, SFURTI, PM SVANidhi, and others.
IMPORTANT: Always respond as a friendly conversational assistant, not with bullet points. Keep answers concise.
Return ONLY a valid JSON: { "reply": "English response", "replyHi": "Hindi response" }`;

    const contents = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      {
        role: 'model',
        parts: [
          {
            text: '{"reply": "Namaste! I am your ShilpMitra AI assistant. How can I help you today?", "replyHi": "नमस्ते! मैं आपका ShilpMitra AI सहायक हूँ। आज मैं आपकी कैसे मदद कर सकता हूँ?"}',
          },
        ],
      },
    ];

    // Add conversation history (skip the initial AI greeting, start from index 1)
    const chatHistory = history.slice(1);
    for (const msg of chatHistory) {
      if (msg.role === 'user') {
        contents.push({ role: 'user', parts: [{ text: msg.text }] });
      } else if (msg.role === 'ai' && msg.text !== userMessage) {
        contents.push({
          role: 'model',
          parts: [{ text: `{"reply": "${msg.text.replace(/"/g, "'")}", "replyHi": "${(msg.textHi || '').replace(/"/g, "'")}"}` }],
        });
      }
    }

    // Add the current user message
    contents.push({ role: 'user', parts: [{ text: userMessage }] });

    console.log('[Gemini] Sending chat with', contents.length, 'turns');
    const result = await geminiGenerate(contents);
    return result;
  } catch (e) {
    console.error('[Gemini] chatWithGemini error:', e.message);
    return {
      reply: 'Sorry, I had trouble connecting. Please try again in a moment.',
      replyHi: 'क्षमा करें, कनेक्ट करने में परेशानी हुई। कृपया पुनः प्रयास करें।',
    };
  }
}

// ─── SCHEME EXPLAINER ─────────────────────────────────────────
export async function explainScheme(schemeName, language = 'hi') {
  if (!apiKey) {
    return fallbackExplanation;
  }
  try {
    const result = await geminiGenerate([
      {
        parts: [
          {
            text: `Explain the Indian government scheme "${schemeName}" in very simple terms for a rural artisan.
Return ONLY a valid JSON: { "text": "1-2 sentence English explanation", "textHi": "1-2 sentence Hindi explanation" }`,
          },
        ],
      },
    ]);
    return result;
  } catch (e) {
    console.error('[Gemini] explainScheme error:', e);
    return fallbackExplanation;
  }
}

// Backward compat alias
export async function matchSchemes(artisanProfile, _salesHistory, userMessage) {
  return chatWithGemini(
    userMessage || 'Which schemes am I eligible for?',
    artisanProfile
  );
}
