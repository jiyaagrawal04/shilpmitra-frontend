import { supabase } from '../lib/supabase.js';
import { generateJSON } from '../lib/gemini.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { schemeId, pdfBase64, pdfFileName } = req.body;

    if (!schemeId) return res.status(400).json({ error: 'schemeId is required' });
    if (!pdfBase64) return res.status(400).json({ error: 'pdfBase64 is required' });

    // 1. Upload PDF to policy-docs bucket for audit trail
    let pdfUrl = null;
    try {
      const fileName = pdfFileName || `policy_${schemeId}_${Date.now()}.pdf`;
      const buffer = Buffer.from(pdfBase64, 'base64');

      const { error: upErr } = await supabase.storage
        .from('policy-docs')
        .upload(fileName, buffer, { contentType: 'application/pdf', upsert: true });

      if (!upErr) {
        const { data: urlData } = supabase.storage.from('policy-docs').getPublicUrl(fileName);
        pdfUrl = urlData?.publicUrl;
      }
    } catch (e) {
      console.warn('[admin/ingest-policy] Storage upload failed:', e.message);
    }

    // 2. Send PDF to Gemini for extraction (Gemini reads PDFs natively)
    const prompt = `You are a government policy analyst. Analyze this PDF document for scheme "${schemeId}".
Extract the eligibility criteria, benefits, and requirements.

Return ONLY valid JSON:
{
  "scheme_name": "Official scheme name",
  "criteria_json": {
    "min_months_active": 6,
    "min_revenue": 50000,
    "craft_types": ["list of eligible crafts"],
    "required_documents": ["Aadhaar", "PAN", "etc"],
    "max_funding": 300000,
    "age_requirement": "18+",
    "special_categories": ["SC", "ST", "Women"],
    "cluster_requirement": false,
    "min_cluster_members": 0,
    "benefits": ["benefit1", "benefit2"],
    "application_url": "url if mentioned",
    "additional_notes": "any other important info"
  }
}`;

    // Use Gemini with inline PDF data
    const { flash } = await import('../lib/gemini.js');
    const result = await Promise.race([
      flash.generateContent([
        prompt,
        { inlineData: { data: pdfBase64, mimeType: 'application/pdf' } },
      ]),
      new Promise((_, reject) => setTimeout(() => reject(new Error('AI_TIMEOUT')), 30000)),
    ]);

    const text = result.response.text();
    const extracted = JSON.parse(text.replace(/```json\n?|```/g, '').trim());

    // 3. Upsert into scheme_criteria with version increment
    const { data: existing } = await supabase
      .from('scheme_criteria')
      .select('version')
      .eq('scheme_id', schemeId)
      .single();

    const currentVersion = existing?.version || 0;

    const { data: upserted, error: upsertErr } = await supabase
      .from('scheme_criteria')
      .upsert({
        scheme_id: schemeId,
        scheme_name: extracted.scheme_name || schemeId,
        criteria_json: extracted.criteria_json || extracted,
        source_url: pdfUrl,
        updated_at: new Date().toISOString(),
        version: currentVersion + 1,
        updated_by: 'admin_ingest',
      })
      .select()
      .single();

    if (upsertErr) throw upsertErr;

    return res.status(200).json({
      message: 'Policy ingested successfully',
      schemeId,
      version: currentVersion + 1,
      pdfUrl,
      extracted: extracted.criteria_json || extracted,
      record: upserted,
    });
  } catch (e) {
    console.error('[admin/ingest-policy]', e);
    if (e.message === 'AI_TIMEOUT') {
      return res.status(504).json({ error: 'AI service timeout', retry: true });
    }
    if (e.status) return res.status(e.status).json(e);
    return res.status(500).json({ error: 'Internal server error', detail: e.message });
  }
}
