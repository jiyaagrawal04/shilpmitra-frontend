// Vercel Cron Job: Auto-refresh government scheme data
// Runs weekly via vercel.json cron config
// GET /api/cron/refresh-policies

import { supabase } from '../lib/supabase.js';
import { generateJSON } from '../lib/gemini.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Verify cron secret (Vercel sends this header)
  const cronSecret = req.headers['authorization'];
  const isVercelCron = cronSecret === `Bearer ${process.env.CRON_SECRET}`;
  const isManual = req.query.manual === 'true';

  if (!isVercelCron && !isManual) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // 1. Get all existing schemes
    const { data: schemes, error } = await supabase.from('scheme_criteria').select('*');
    if (error) throw error;
    if (!schemes?.length) return res.status(200).json({ message: 'No schemes to check', updated: 0 });

    const results = [];

    for (const scheme of schemes) {
      try {
        // 2. Fetch latest info from source URL
        let pageContent = '';
        if (scheme.source_url) {
          try {
            const response = await fetch(scheme.source_url, {
              headers: { 'User-Agent': 'ShilpMitra-PolicyBot/1.0' },
              signal: AbortSignal.timeout(10000),
            });
            if (response.ok) {
              const html = await response.text();
              // Extract text content (strip HTML tags)
              pageContent = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                .replace(/<[^>]+>/g, ' ')
                .replace(/\s+/g, ' ')
                .trim()
                .substring(0, 5000); // Limit for Gemini context
            }
          } catch (fetchErr) {
            console.warn(`[cron] Failed to fetch ${scheme.source_url}:`, fetchErr.message);
          }
        }

        if (!pageContent) {
          results.push({ scheme_id: scheme.scheme_id, status: 'skipped', reason: 'Could not fetch source' });
          continue;
        }

        // 3. Ask Gemini to compare old vs new data
        const prompt = `You are a policy analyst. Compare the EXISTING scheme criteria with the LATEST information from the government website.

EXISTING CRITERIA for "${scheme.scheme_name}":
${JSON.stringify(scheme.criteria_json)}

LATEST WEBSITE CONTENT:
${pageContent}

Did anything change? Return ONLY valid JSON:
{
  "hasChanges": true/false,
  "changes": [
    {"field": "field_name", "oldValue": "old", "newValue": "new", "description": "what changed"}
  ],
  "updatedCriteria": { ...complete updated criteria object if changes exist, else null },
  "summary": "1-2 sentence summary of changes, or 'No changes detected'"
}`;

        const comparison = await generateJSON(prompt);

        if (comparison.hasChanges && comparison.updatedCriteria) {
          // 4. Update scheme_criteria
          const { error: updateErr } = await supabase.from('scheme_criteria').update({
            criteria_json: comparison.updatedCriteria,
            version: (scheme.version || 0) + 1,
            updated_at: new Date().toISOString(),
            updated_by: 'auto_cron',
          }).eq('scheme_id', scheme.scheme_id);

          if (updateErr) throw updateErr;

          // 5. Notify all users about the change
          const { data: users } = await supabase.from('users').select('id');
          if (users?.length) {
            const notifs = users.map(u => ({
              user_id: u.id,
              type: 'policy_update',
              scheme_id: scheme.scheme_id,
              title_en: `📋 ${scheme.scheme_name} updated!`,
              title_hi: `📋 ${scheme.scheme_name} अपडेट हुआ!`,
              title_kn: `📋 ${scheme.scheme_name} ನವೀಕರಿಸಲಾಗಿದೆ!`,
              body_en: comparison.summary,
              body_hi: comparison.summary,
              body_kn: comparison.summary,
              is_read: false,
              metadata: { changes: comparison.changes, version: (scheme.version || 0) + 1 },
            }));
            await supabase.from('notifications').insert(notifs);
          }

          results.push({
            scheme_id: scheme.scheme_id,
            status: 'updated',
            version: (scheme.version || 0) + 1,
            changes: comparison.changes,
            summary: comparison.summary,
          });
        } else {
          results.push({ scheme_id: scheme.scheme_id, status: 'no_changes', summary: comparison.summary });
        }
      } catch (schemeErr) {
        results.push({ scheme_id: scheme.scheme_id, status: 'error', error: schemeErr.message });
      }
    }

    const updated = results.filter(r => r.status === 'updated').length;
    return res.status(200).json({
      message: `Policy refresh complete. ${updated}/${schemes.length} schemes updated.`,
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (e) {
    console.error('[cron/refresh-policies]', e);
    return res.status(500).json({ error: 'Cron job failed', detail: e.message });
  }
}
