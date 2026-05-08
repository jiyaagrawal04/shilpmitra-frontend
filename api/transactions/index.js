import { supabase } from '../lib/supabase.js';
import { generateJSON } from '../lib/gemini.js';

// Internal scheme check (same logic as /api/schemes/check)
async function checkSchemes(userId) {
  const { data: criteria } = await supabase.from('scheme_criteria').select('*');
  if (!criteria || criteria.length === 0) return [];

  const { data: user } = await supabase.from('users').select('*').eq('id', userId).single();
  if (!user) return [];

  const { data: txns } = await supabase
    .from('transactions').select('amount, created_at')
    .eq('seller_id', userId).eq('payment_status', 'completed');

  const totalRevenue = (txns || []).reduce((s, t) => s + Number(t.amount), 0);
  const months = new Set((txns || []).map(t => t.created_at?.substring(0, 7)));
  const monthsActive = months.size;

  const prompt = `You are a scheme eligibility checker. Artisan: ${user.name}, Craft: ${user.craft_type}, Revenue: ₹${totalRevenue}, Months: ${monthsActive}.
Schemes: ${criteria.map(c => `${c.scheme_name}: ${JSON.stringify(c.criteria_json)}`).join('; ')}.
Return JSON array: [{ "schemeId": "id", "schemeName": "name", "score": 85, "status": "eligible" }]`;

  try {
    const matches = await generateJSON(prompt);
    return Array.isArray(matches) ? matches : [matches];
  } catch { return []; }
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { sellerId, productId, clusterId, buyerName, amount, upiRef, notes } = req.body;

    if (!sellerId || !amount) {
      return res.status(400).json({ error: 'sellerId and amount are required' });
    }

    // 1. Save the transaction
    const { data: txn, error: txnErr } = await supabase
      .from('transactions')
      .insert({
        seller_id: sellerId,
        product_id: productId || null,
        cluster_id: clusterId || null,
        buyer_name: buyerName || 'Anonymous',
        amount: Number(amount),
        upi_ref: upiRef || null,
        payment_status: 'completed',
        notes: notes || null,
      })
      .select()
      .single();

    if (txnErr) throw txnErr;

    // 2. Check cumulative thresholds
    const { data: allTxns } = await supabase
      .from('transactions')
      .select('amount, created_at')
      .eq('seller_id', sellerId)
      .eq('payment_status', 'completed');

    const totalRevenue = (allTxns || []).reduce((s, t) => s + Number(t.amount), 0);
    const months = new Set((allTxns || []).map(t => t.created_at?.substring(0, 7)));
    const monthsActive = months.size;

    const thresholdsCrossed = [];
    if (totalRevenue >= 50000 && totalRevenue - Number(amount) < 50000) thresholdsCrossed.push('₹50K');
    if (totalRevenue >= 100000 && totalRevenue - Number(amount) < 100000) thresholdsCrossed.push('₹1L');
    if (monthsActive >= 6) thresholdsCrossed.push('6_months');

    let notification = null;

    // 3. If threshold crossed → check schemes → generate notification
    if (thresholdsCrossed.length > 0) {
      const schemes = await checkSchemes(sellerId);
      const topScheme = schemes.find(s => s.score >= 70);

      if (topScheme) {
        // Check if notification already exists for this scheme
        const { data: existing } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', sellerId)
          .eq('scheme_id', topScheme.schemeId)
          .limit(1);

        if (!existing || existing.length === 0) {
          // Generate trilingual notification via Gemini
          const notifPrompt = `Generate a congratulatory notification for an artisan who just became eligible for "${topScheme.schemeName}" scheme.
Threshold crossed: ${thresholdsCrossed.join(', ')}. Score: ${topScheme.score}%.
Return ONLY valid JSON:
{
  "title_en": "English title (short, exciting)",
  "title_hi": "Hindi title",
  "title_kn": "Kannada title",
  "body_en": "English body (1-2 sentences, actionable)",
  "body_hi": "Hindi body",
  "body_kn": "Kannada body"
}`;

          try {
            const notifText = await generateJSON(notifPrompt);

            const { data: notif } = await supabase
              .from('notifications')
              .insert({
                user_id: sellerId,
                type: 'scheme_eligible',
                title_en: notifText.title_en,
                title_hi: notifText.title_hi,
                title_kn: notifText.title_kn,
                body_en: notifText.body_en,
                body_hi: notifText.body_hi,
                body_kn: notifText.body_kn,
                scheme_id: topScheme.schemeId,
                metadata: { score: topScheme.score, thresholds: thresholdsCrossed },
              })
              .select()
              .single();

            notification = notif;
          } catch (e) {
            console.warn('[transactions] Notification gen failed:', e.message);
          }
        }
      }
    }

    return res.status(201).json({
      transaction: txn,
      totalRevenue,
      monthsActive,
      thresholdsCrossed,
      notification,
    });
  } catch (e) {
    console.error('[transactions]', e);
    if (e.status) return res.status(e.status).json(e);
    return res.status(500).json({ error: 'Internal server error', detail: e.message });
  }
}
