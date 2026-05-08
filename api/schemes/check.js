import { supabase } from '../lib/supabase.js';
import { generateJSON } from '../lib/gemini.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    // 1. Fetch live criteria from scheme_criteria table
    const { data: criteria, error: critErr } = await supabase
      .from('scheme_criteria')
      .select('*');

    if (critErr) throw critErr;
    if (!criteria || criteria.length === 0) {
      return res.status(503).json({ error: 'Run seed-policies first. scheme_criteria table is empty.' });
    }

    // 2. Fetch user profile
    const { data: user, error: userErr } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userErr || !user) return res.status(404).json({ error: 'User not found' });

    // 3. Compute ledger stats
    const { data: txns } = await supabase
      .from('transactions')
      .select('amount, created_at')
      .eq('seller_id', userId)
      .eq('payment_status', 'completed');

    const totalRevenue = (txns || []).reduce((s, t) => s + Number(t.amount), 0);
    const months = new Set((txns || []).map(t => t.created_at?.substring(0, 7))); // YYYY-MM
    const monthsActive = months.size;
    const avgMonthly = monthsActive > 0 ? Math.round(totalRevenue / monthsActive) : 0;

    // 4. Check cluster membership
    const { data: membership } = await supabase
      .from('cluster_members')
      .select('cluster_id')
      .eq('user_id', userId);

    const clusterCount = membership?.length || 0;

    // 5. Send to Gemini for scoring
    const prompt = `You are a government scheme eligibility checker for Indian artisans.

ARTISAN PROFILE:
- Name: ${user.name}
- Craft: ${user.craft_type || 'Unknown'}
- Location: ${user.location || 'Unknown'}, ${user.state || 'Unknown'}
- Income Band: ${user.income_band || 'Unknown'}
- Group Status: ${user.group_status || 'None'}

LEDGER STATS:
- Total Revenue: ₹${totalRevenue.toLocaleString('en-IN')}
- Months Active: ${monthsActive}
- Avg Monthly: ₹${avgMonthly.toLocaleString('en-IN')}
- Cluster Memberships: ${clusterCount}

AVAILABLE SCHEMES:
${criteria.map(c => `- ${c.scheme_name} (${c.scheme_id}): ${JSON.stringify(c.criteria_json)}`).join('\n')}

For each scheme, calculate an eligibility score (0-100) and explain why.
Return ONLY valid JSON array:
[
  {
    "schemeId": "scheme_id_here",
    "schemeName": "Scheme Name",
    "score": 85,
    "status": "eligible" | "partial" | "ineligible",
    "reason": "1-2 sentence explanation in English",
    "reasonHi": "Same explanation in Hindi",
    "missingDocs": ["list", "of", "missing", "documents"],
    "nextStep": "What they should do next"
  }
]`;

    const matches = await generateJSON(prompt);

    return res.status(200).json({
      userId,
      totalRevenue,
      monthsActive,
      avgMonthly,
      clusterCount,
      schemes: Array.isArray(matches) ? matches : [matches],
    });
  } catch (e) {
    console.error('[schemes/check]', e);
    if (e.status) return res.status(e.status).json(e);
    return res.status(500).json({ error: 'Internal server error', detail: e.message });
  }
}
