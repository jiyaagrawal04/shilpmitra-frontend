import { supabase } from '../lib/supabase.js';
import { generateJSON, flash } from '../lib/gemini.js';

// ─── TOOL DEFINITIONS ──────────────────────────────────────
const TOOLS = {
  check_eligibility: {
    description: 'Check which government schemes the artisan is eligible for',
    execute: async (userId) => {
      const { data: criteria } = await supabase.from('scheme_criteria').select('*');
      if (!criteria?.length) return { error: 'No scheme data available' };

      const { data: user } = await supabase.from('users').select('*').eq('id', userId).single();
      if (!user) return { error: 'User not found' };

      const { data: txns } = await supabase.from('transactions').select('amount, created_at')
        .eq('seller_id', userId).eq('payment_status', 'completed');

      const totalRevenue = (txns || []).reduce((s, t) => s + Number(t.amount), 0);
      const months = new Set((txns || []).map(t => t.created_at?.substring(0, 7)));

      const prompt = `You are a scheme eligibility checker. Artisan: ${user.name}, Craft: ${user.craft_type}, Revenue: ₹${totalRevenue}, Active Months: ${months.size}, Group: ${user.group_status || 'General'}.
Schemes: ${criteria.map(c => `${c.scheme_name}: ${JSON.stringify(c.criteria_json)}`).join('\n')}
Return JSON array: [{"schemeName":"name","score":85,"status":"eligible"|"partial"|"ineligible","reason":"why","missingDocs":["doc1"],"nextStep":"what to do"}]`;

      const result = await generateJSON(prompt);
      return { user: user.name, totalRevenue, monthsActive: months.size, schemes: Array.isArray(result) ? result : [result] };
    }
  },

  generate_trade_record: {
    description: 'Generate a trade record PDF for bank verification',
    execute: async (userId) => {
      return { action: 'generate_pdf', type: 'trade_record', userId, url: `/api/pdf/trade-record`, method: 'POST', body: { userId } };
    }
  },

  generate_loan_application: {
    description: 'Generate a pre-filled loan application PDF for a specific scheme',
    execute: async (userId, schemeName) => {
      return { action: 'generate_pdf', type: 'loan_application', userId, schemeName, url: `/api/pdf/loan-application`, method: 'POST', body: { userId, schemeName } };
    }
  },

  generate_eligibility_certificate: {
    description: 'Generate an eligibility assessment certificate PDF',
    execute: async (userId, schemeName) => {
      return { action: 'generate_pdf', type: 'eligibility_cert', userId, schemeName, url: `/api/pdf/eligibility-cert`, method: 'POST', body: { userId, schemeName } };
    }
  },

  check_missing_documents: {
    description: 'Check what documents the artisan still needs to upload',
    execute: async (userId) => {
      const { data: user } = await supabase.from('users').select('*').eq('id', userId).single();
      if (!user) return { error: 'User not found' };

      const docs = {
        aadhaar: !!user.aadhaar_last4,
        phone: !!user.phone,
        bank_account: !!user.upi_id,
        craft_proof: !!user.craft_type,
        location: !!user.location,
      };

      const { data: membership } = await supabase.from('cluster_members').select('cluster_id').eq('user_id', userId);
      docs.cluster_certificate = (membership?.length || 0) > 0;

      const missing = Object.entries(docs).filter(([, v]) => !v).map(([k]) => k);
      const complete = Object.entries(docs).filter(([, v]) => v).map(([k]) => k);

      return { missing, complete, completionPct: Math.round((complete.length / Object.keys(docs).length) * 100) };
    }
  },

  get_sales_summary: {
    description: 'Get a summary of recent sales and income trends',
    execute: async (userId) => {
      const { data: txns } = await supabase.from('transactions').select('amount, created_at, buyer_name')
        .eq('seller_id', userId).eq('payment_status', 'completed').order('created_at', { ascending: false }).limit(30);

      if (!txns?.length) return { totalSales: 0, count: 0, message: 'No sales recorded yet' };

      const total = txns.reduce((s, t) => s + Number(t.amount), 0);
      const monthly = {};
      txns.forEach(t => {
        const m = t.created_at?.substring(0, 7) || 'unknown';
        monthly[m] = (monthly[m] || 0) + Number(t.amount);
      });

      return { totalSales: total, transactionCount: txns.length, monthlyBreakdown: monthly, recentSales: txns.slice(0, 5) };
    }
  },

  explain_scheme: {
    description: 'Explain a specific government scheme in simple terms',
    execute: async (userId, schemeName) => {
      const { data: criteria } = await supabase.from('scheme_criteria').select('*')
        .ilike('scheme_name', `%${schemeName}%`).limit(1);

      if (!criteria?.length) return { error: `Scheme "${schemeName}" not found` };

      const scheme = criteria[0];
      const prompt = `Explain the Indian government scheme "${scheme.scheme_name}" in very simple terms for a rural artisan. Include: who can apply, benefits, how to apply.
Criteria: ${JSON.stringify(scheme.criteria_json)}
Return JSON: {"explanation":"2-3 sentence simple English explanation","explanationHi":"Same in Hindi","benefits":["benefit1","benefit2"],"howToApply":"step by step"}`;

      const result = await generateJSON(prompt);
      return { schemeName: scheme.scheme_name, ...result };
    }
  }
};

// ─── AGENT ENDPOINT ────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { userId, message, history = [], language = 'en' } = req.body;
    if (!message) return res.status(400).json({ error: 'message is required' });

    const lang = ['en', 'hi', 'kn'].includes(language) ? language : 'en';

    // 1. Fetch user context
    let userProfile = { name: 'Artisan', craft_type: 'Unknown' };
    if (userId) {
      const { data: user } = await supabase.from('users').select('*').eq('id', userId).single();
      if (user) userProfile = user;
    }

    // 2. Ask Gemini to decide which tool to use
    const toolDecisionPrompt = `You are ShilpMitra AI Agent — an autonomous assistant for Indian artisans. You don't just chat, you TAKE ACTIONS.

ARTISAN: ${userProfile.name}, Craft: ${userProfile.craft_type || 'Unknown'}, Location: ${userProfile.location || 'Unknown'}

AVAILABLE TOOLS:
- check_eligibility: Check scheme eligibility (use when user asks about schemes, eligibility, funding)
- generate_trade_record: Generate trade record PDF (use when user asks for trade record, bank document)
- generate_loan_application: Generate loan application PDF (use when user wants to apply for a loan/scheme)
- generate_eligibility_certificate: Generate eligibility certificate (use when user needs proof of eligibility)
- check_missing_documents: Check what documents are missing (use when user asks about documents, requirements)
- get_sales_summary: Get sales summary (use when user asks about sales, income, revenue)
- explain_scheme: Explain a scheme simply (use when user asks "what is" a scheme or needs explanation)
- none: Just chat normally (for greetings, general questions)

USER MESSAGE: "${message}"

Decide which tool to use. Return ONLY valid JSON:
{
  "tool": "tool_name_here",
  "schemeName": "scheme name if relevant, else null",
  "reasoning": "why you chose this tool"
}`;

    let toolDecision;
    try {
      toolDecision = await generateJSON(toolDecisionPrompt);
    } catch {
      toolDecision = { tool: 'none', reasoning: 'fallback to chat' };
    }

    const toolName = toolDecision.tool || 'none';
    let toolResult = null;
    let actionsTaken = [];

    // 3. Execute the chosen tool
    if (toolName !== 'none' && TOOLS[toolName]) {
      try {
        toolResult = await TOOLS[toolName].execute(userId, toolDecision.schemeName);
        actionsTaken.push({ tool: toolName, schemeName: toolDecision.schemeName, result: toolResult });
      } catch (e) {
        console.warn(`[agent] Tool ${toolName} failed:`, e.message);
        toolResult = { error: e.message };
      }
    }

    // 4. Generate final response using tool results
    const langInstruction = lang === 'hi'
      ? 'Respond ENTIRELY in Hindi (Devanagari script). Use "जी" suffix for respect. Keep it simple for rural artisans.'
      : lang === 'kn'
      ? 'Respond ENTIRELY in Kannada (ಕನ್ನಡ script). Use respectful forms. Keep it simple for rural artisans.'
      : 'Respond in simple English. Use easy words for rural artisans.';

    const responsePrompt = `You are ShilpMitra AI Agent. Generate a helpful, conversational response.

USER: "${message}"
TOOL USED: ${toolName}
TOOL RESULT: ${toolResult ? JSON.stringify(toolResult) : 'No tool used'}
LANGUAGE INSTRUCTION: ${langInstruction}

RULES:
- Be friendly and conversational (not formal)
- If a tool was used, summarize the results naturally
- For eligibility: mention score, eligible schemes, and next steps
- For documents: list what's missing clearly
- For PDFs: tell user the document is ready to download
- Keep it concise (3-4 sentences max)
- The "reply" field MUST be entirely in the user's chosen language
- Always include "replyHi" in Hindi and "replyKn" in Kannada
- "suggestedActions" should be in the user's language

Return ONLY valid JSON:
{
  "reply": "Main response in the requested language",
  "replyEn": "English version (always include)",
  "replyHi": "Hindi version (always include)",
  "replyKn": "Kannada version (always include)",
  "suggestedActions": ["action button text 1", "action button text 2"]
}`;

    let response;
    try {
      response = await generateJSON(responsePrompt);
    } catch {
      response = {
        reply: toolResult
          ? `I checked and here are the results. ${JSON.stringify(toolResult).substring(0, 200)}`
          : 'I\'m here to help! Ask me about schemes, documents, or sales.',
        replyEn: 'I\'m here to help!',
        replyHi: 'मैं मदद के लिए हूँ!',
        suggestedActions: []
      };
    }

    return res.status(200).json({
      ...response,
      toolUsed: toolName,
      toolResult,
      actionsTaken,
      agentMode: true,
    });
  } catch (e) {
    console.error('[agent]', e);
    return res.status(500).json({
      reply: 'Sorry, I encountered an error. Please try again.',
      replyHi: 'क्षमा करें, एक त्रुटि हुई। कृपया पुनः प्रयास करें।',
      agentMode: true,
      error: e.message,
    });
  }
}
