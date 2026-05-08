import { supabase } from '../lib/supabase.js';
import { generateFromImage } from '../lib/gemini.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { imageBase64, description, sellerId } = req.body;

    if (!imageBase64) return res.status(400).json({ error: 'imageBase64 is required' });

    // Check size (~5MB in base64 is ~6.6M chars)
    if (imageBase64.length > 7_000_000) {
      return res.status(400).json({ error: 'Image exceeds 5MB limit' });
    }

    const mimeType = imageBase64.startsWith('data:image/png') ? 'image/png' : 'image/jpeg';
    const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;

    // 1. Upload to Supabase Storage
    let photoUrl = null;
    try {
      const fileName = `product_${Date.now()}.${mimeType === 'image/png' ? 'png' : 'jpg'}`;
      const buffer = Buffer.from(base64Data, 'base64');

      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('product-photos')
        .upload(fileName, buffer, { contentType: mimeType, upsert: false });

      if (!uploadErr && uploadData) {
        const { data: urlData } = supabase.storage.from('product-photos').getPublicUrl(fileName);
        photoUrl = urlData?.publicUrl || null;
      }
    } catch (e) {
      console.warn('[product/analyze] Storage upload skipped:', e.message);
    }

    // 2. Gemini Vision analysis
    const prompt = `You are an artisan product analyst for Indian handicrafts.
Analyze this product image${description ? ` with description: "${description}"` : ''}.
Return ONLY valid JSON:
{
  "title": "English product name",
  "titleHi": "Hindi product name",
  "category": "one of: Handloom, Pottery, Woodwork, Jewelry, Metalwork, Other",
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "suggestedPrice": 500,
  "craftType": "specific craft type",
  "material": "primary material",
  "region": "likely Indian region of origin"
}`;

    const analysis = await generateFromImage(prompt, base64Data, mimeType);

    return res.status(200).json({
      ...analysis,
      photoUrl,
    });
  } catch (e) {
    console.error('[product/analyze]', e);
    if (e.status) return res.status(e.status).json(e);
    return res.status(500).json({ error: 'Internal server error', detail: e.message });
  }
}
