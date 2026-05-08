// Client-side AI Agent — works on localhost without serverless functions
// Mirrors the server-side agent but runs entirely in the browser via Gemini REST API

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL = 'gemini-2.5-flash';

async function geminiCall(prompt) {
  const url = `/gemini-api/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
    }),
  });
  if (!res.ok) throw new Error(`Gemini ${res.status}`);
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  return JSON.parse(text.replace(/```json\n?|```/g, '').trim());
}

// ─── CLIENT-SIDE TOOLS ────────────────────────────────────
const TOOLS = {
  check_eligibility: async (profile) => {
    const prompt = `You are ShilpMitra AI Agent checking scheme eligibility.
Artisan: ${profile.name}, Craft: ${profile.craft}, Location: ${profile.location}, Total Sales: ₹${profile.totalSales}, Active Months: 18, Group: ${profile.group || 'OBC'}.

Available schemes: PM Vishwakarma (for traditional artisans, toolkit + ₹3L credit), MUDRA Shishu (₹50K loan for micro enterprises), PMEGP (₹50L manufacturing, 15-35% subsidy), SFURTI (cluster-based, ₹2.5Cr).

Return JSON array:
[{"schemeName":"name","score":85,"status":"eligible","reason":"why eligible","missingDocs":["if any"],"nextStep":"what to do next"}]`;
    return await geminiCall(prompt);
  },

  check_missing_documents: async (profile) => {
    return {
      missing: ['PAN Card', 'Cluster Certificate'],
      complete: ['Aadhaar', 'Phone', 'Bank Account', 'Craft Proof', 'Location'],
      completionPct: 71,
    };
  },

  get_sales_summary: async (profile) => {
    return {
      totalSales: profile.totalSales || 81700,
      transactionCount: 42,
      monthlyBreakdown: { '2024-04': 6800, '2024-05': 7000, '2024-06': 6500 },
      recentSales: [
        { buyer_name: 'A. Sharma', amount: 4500, created_at: '2024-06-14' },
        { buyer_name: 'R. Patel', amount: 1200, created_at: '2024-06-13' },
      ],
    };
  },

  generate_trade_record: async () => {
    return { action: 'generate_pdf', type: 'trade_record', message: 'Trade record PDF ready!' };
  },

  generate_loan_application: async (profile, schemeName) => {
    return { action: 'generate_pdf', type: 'loan_application', schemeName, message: `Loan application for ${schemeName || 'PM Vishwakarma'} ready!` };
  },

  generate_eligibility_certificate: async (profile, schemeName) => {
    return { action: 'generate_pdf', type: 'eligibility_cert', schemeName, message: 'Eligibility certificate ready!' };
  },

  explain_scheme: async (profile, schemeName) => {
    const prompt = `Explain the Indian government scheme "${schemeName || 'PM Vishwakarma'}" in very simple terms for a rural artisan.
Return JSON: {"explanation":"2-3 sentence simple English","explanationHi":"Same in Hindi","benefits":["benefit1","benefit2"],"howToApply":"step by step"}`;
    return await geminiCall(prompt);
  },
};

// ─── MAIN AGENT FUNCTION ──────────────────────────────────
export async function runAgent(message, profile, history = [], language = 'en') {
  if (!apiKey) {
    return {
      reply: 'Gemini API key not configured.',
      replyHi: 'Gemini API कुंजी कॉन्फ़िगर नहीं है।',
      toolUsed: 'none',
      agentMode: true,
      suggestedActions: [],
    };
  }

  // 1. Decide which tool to use
  const decisionPrompt = `You are ShilpMitra AI Agent. Decide which tool to use.

TOOLS: check_eligibility, generate_trade_record, generate_loan_application, generate_eligibility_certificate, check_missing_documents, get_sales_summary, explain_scheme, none

USER: "${message}"

Return ONLY JSON: {"tool":"tool_name","schemeName":"scheme if relevant else null","reasoning":"why"}`;

  let decision;
  try {
    decision = await geminiCall(decisionPrompt);
  } catch {
    decision = { tool: 'none' };
  }

  const toolName = decision.tool || 'none';
  let toolResult = null;

  // 2. Execute tool
  if (toolName !== 'none' && TOOLS[toolName]) {
    try {
      toolResult = await TOOLS[toolName](profile, decision.schemeName);
    } catch (e) {
      console.warn(`[agent-local] Tool ${toolName} failed:`, e.message);
    }
  }

  // 3. Generate response
  const lang = language === 'hi' ? 'Hindi' : language === 'kn' ? 'Kannada' : 'English';
  const responsePrompt = `You are ShilpMitra AI Agent. Generate a friendly response.
USER: "${message}"
TOOL: ${toolName}
RESULT: ${toolResult ? JSON.stringify(toolResult) : 'No tool used'}
LANGUAGE: ${lang}
ARTISAN: ${profile.name}, ${profile.craft}

Be conversational, concise (3-4 sentences). Summarize tool results naturally.
Return JSON: {"reply":"response in ${lang}","replyEn":"English","replyHi":"Hindi","suggestedActions":["action1","action2"]}`;

  let response;
  try {
    response = await geminiCall(responsePrompt);
  } catch {
    response = {
      reply: toolResult
        ? `Done! ${JSON.stringify(toolResult).substring(0, 150)}`
        : "I'm here to help! Ask about schemes, documents, or sales.",
      replyEn: "I'm here to help!",
      replyHi: 'मैं मदद के लिए हूँ!',
      suggestedActions: ['Check my eligibility', 'What documents do I need?'],
    };
  }

  return {
    ...response,
    toolUsed: toolName,
    toolResult,
    agentMode: true,
  };
}
