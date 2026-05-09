import { supabase } from '../lib/supabase.js';
import { chatGenerate } from '../lib/gemini.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { userId, message, history = [], language = 'en' } = req.body;
    if (!message) return res.status(400).json({ error: 'message is required' });

    const lang = ['en', 'hi', 'kn'].includes(language) ? language : 'en';

    // 1. Fetch user profile
    let userProfile = { name: 'Artisan', craft_type: 'Unknown', location: 'India' };
    if (userId) {
      const { data: user } = await supabase.from('users').select('*').eq('id', userId).single();
      if (user) userProfile = user;
    }

    // 2. Fetch last 90 days transactions
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    let recentSales = [];
    if (userId) {
      const { data: txns } = await supabase
        .from('transactions')
        .select('amount, created_at, buyer_name')
        .eq('seller_id', userId)
        .gte('created_at', ninetyDaysAgo)
        .order('created_at', { ascending: false })
        .limit(20);
      recentSales = txns || [];
    }

    // 3. Fetch live scheme criteria
    const { data: criteria } = await supabase.from('scheme_criteria').select('scheme_name, criteria_json');

    const totalRecent = recentSales.reduce((s, t) => s + Number(t.amount), 0);

    const langInstruction = lang === 'hi'
      ? 'Respond ENTIRELY in Hindi (Devanagari script). Use "जी" suffix for respect.'
      : lang === 'kn'
      ? 'Respond ENTIRELY in Kannada (ಕನ್ನಡ script). Use respectful forms.'
      : 'Respond in simple English.';

    const systemPrompt = `You are ShilpMitra AI, a friendly financial assistant for rural Indian artisans and MSMEs.

ARTISAN PROFILE:
- Name: ${userProfile.name}
- Craft: ${userProfile.craft_type || 'Unknown'}
- Location: ${userProfile.location || 'Unknown'}
- State: ${userProfile.state || 'Unknown'}

RECENT SALES (last 90 days):
- Total: ₹${totalRecent.toLocaleString('en-IN')}
- Transactions: ${recentSales.length}
${recentSales.slice(0, 5).map(t => `  • ₹${Number(t.amount).toLocaleString('en-IN')} from ${t.buyer_name || 'Unknown'}`).join('\n')}

AVAILABLE SCHEMES:
${(criteria || []).map(c => `- ${c.scheme_name}`).join('\n')}

INSTRUCTIONS:
- Be conversational and friendly, not formal
- Keep answers concise (2-3 sentences)
- If asked about schemes, use the criteria data above
- ${langInstruction}
- Always return JSON: { "reply": "main response in user's language", "replyHi": "Hindi version", "replyKn": "Kannada version" }`;

    // 5. Build conversation contents
    const contents = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: '{"reply": "Namaste! How can I help you today?", "replyHi": "नमस्ते! मैं आपकी कैसे मदद कर सकता हूँ?"}' }] },
    ];

    // Add history
    for (const msg of history.slice(-10)) {
      if (msg.role === 'user') {
        contents.push({ role: 'user', parts: [{ text: msg.text }] });
      } else {
        contents.push({ role: 'model', parts: [{ text: JSON.stringify({ reply: msg.text }) }] });
      }
    }

    // Add current message
    contents.push({ role: 'user', parts: [{ text: message }] });

    const result = await chatGenerate(contents);

    return res.status(200).json(result);
  } catch (e) {
    console.error('[chat]', e);
    if (e.status) return res.status(e.status).json(e);
    return res.status(500).json({
      reply: 'Sorry, I had trouble connecting. Please try again.',
      replyHi: 'क्षमा करें, कनेक्ट करने में परेशानी हुई।',
    });
  }
}
