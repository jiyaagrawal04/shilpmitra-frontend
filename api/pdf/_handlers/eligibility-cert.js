import { supabase } from '../../lib/supabase.js';
import { generateJSON } from '../../lib/gemini.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { userId, schemeName } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const { data: user } = await supabase.from('users').select('*').eq('id', userId).single();
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { data: txns } = await supabase.from('transactions').select('amount, created_at')
      .eq('seller_id', userId).eq('payment_status', 'completed');

    const totalRevenue = (txns || []).reduce((s, t) => s + Number(t.amount), 0);
    const months = new Set((txns || []).map(t => t.created_at?.substring(0, 7)));

    // Scheme lookup
    let scheme = null;
    if (schemeName) {
      const { data } = await supabase.from('scheme_criteria').select('*')
        .ilike('scheme_name', `%${schemeName}%`).limit(1);
      scheme = data?.[0];
    }

    // Get eligibility score from Gemini
    const scorePrompt = `Score this artisan's eligibility for ${scheme?.scheme_name || 'Government Scheme'} (0-100).
Name: ${user.name}, Craft: ${user.craft_type}, Revenue: ₹${totalRevenue}, Months Active: ${months.size}, Group: ${user.group_status || 'General'}
Criteria: ${JSON.stringify(scheme?.criteria_json || {})}
Return JSON: {"score":85,"status":"eligible","strengths":["point1"],"gaps":["gap1"],"recommendation":"1 sentence"}`;

    const scoreData = await generateJSON(scorePrompt);

    // Generate PDF certificate
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    const pw = doc.internal.pageSize.getWidth();

    // Certificate border
    doc.setDrawColor(31, 60, 136);
    doc.setLineWidth(2);
    doc.rect(10, 10, pw - 20, 277);
    doc.setLineWidth(0.5);
    doc.rect(13, 13, pw - 26, 271);

    // Header
    doc.setFillColor(31, 60, 136);
    doc.rect(13, 13, pw - 26, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text('ELIGIBILITY ASSESSMENT CERTIFICATE', pw / 2, 28, { align: 'center' });
    doc.setFontSize(9);
    doc.text('ShilpMitra AI-Powered Assessment', pw / 2, 35, { align: 'center' });

    let y = 55;
    doc.setTextColor(0, 0, 0);

    // Certificate number
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Certificate No: SM-CERT-${Date.now().toString(36).toUpperCase()}`, pw - 20, 48, { align: 'right' });
    doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, pw - 20, 53, { align: 'right' });
    doc.setTextColor(0, 0, 0);

    // Main body
    doc.setFontSize(11);
    doc.text('This is to certify that:', 25, y);
    y += 12;

    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(31, 60, 136);
    doc.text(user.name, pw / 2, y, { align: 'center' });
    y += 8;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100);
    doc.text(`${user.craft_type || 'Traditional Artisan'} | ${user.location || 'India'}`, pw / 2, y, { align: 'center' });
    y += 15;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Has been assessed for eligibility under:`, 25, y);
    y += 10;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(31, 60, 136);
    doc.text(scheme?.scheme_name || 'Government Artisan Scheme', pw / 2, y, { align: 'center' });
    y += 15;

    // Score circle (simulated)
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('Eligibility Score:', 25, y);
    const score = scoreData.score || 0;
    const color = score >= 70 ? [39, 174, 96] : score >= 40 ? [243, 156, 18] : [231, 76, 60];
    doc.setFontSize(28);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...color);
    doc.text(`${score}%`, 80, y + 2);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(`Status: ${(scoreData.status || 'assessed').toUpperCase()}`, 115, y);
    y += 18;

    // Details table
    const details = [
      ['Craft Type', user.craft_type || 'N/A'],
      ['Total Revenue', `₹${totalRevenue.toLocaleString('en-IN')}`],
      ['Active Months', `${months.size} months`],
      ['Category', user.group_status || 'General'],
      ['Recommendation', scoreData.recommendation || 'Proceed with application'],
    ];

    doc.setFontSize(9);
    details.forEach(([label, val]) => {
      if (y > 250) { doc.addPage(); y = 30; }
      doc.setFont(undefined, 'bold');
      doc.text(`${label}:`, 25, y);
      doc.setFont(undefined, 'normal');
      doc.text(String(val), 80, y);
      y += 7;
    });

    y += 5;
    if (scoreData.strengths?.length) {
      doc.setFont(undefined, 'bold');
      doc.text('Strengths:', 25, y); y += 6;
      doc.setFont(undefined, 'normal');
      scoreData.strengths.forEach(s => { doc.text(`• ${s}`, 30, y); y += 5; });
      y += 3;
    }
    if (scoreData.gaps?.length) {
      doc.setFont(undefined, 'bold');
      doc.text('Gaps to Address:', 25, y); y += 6;
      doc.setFont(undefined, 'normal');
      scoreData.gaps.forEach(g => { doc.text(`• ${g}`, 30, y); y += 5; });
    }

    // Footer
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text('This certificate is AI-generated for informational purposes and does not constitute official government approval.', pw / 2, 275, { align: 'center' });
    doc.text('Powered by ShilpMitra — AI Artisan Funding Platform', pw / 2, 280, { align: 'center' });

    // Upload
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    const fileName = `cert_${userId.substring(0, 8)}_${Date.now()}.pdf`;
    let pdfUrl = null;
    try {
      await supabase.storage.from('trade-pdfs').upload(fileName, pdfBuffer, { contentType: 'application/pdf', upsert: true });
      const { data: urlData } = supabase.storage.from('trade-pdfs').getPublicUrl(fileName);
      pdfUrl = urlData?.publicUrl;
    } catch (e) { console.warn('[eligibility-cert] Upload:', e.message); }

    return res.status(200).json({
      success: true,
      pdfUrl,
      fileName,
      score: scoreData.score,
      status: scoreData.status,
      message: `Eligibility certificate generated for ${user.name}`,
    });
  } catch (e) {
    console.error('[eligibility-cert]', e);
    return res.status(500).json({ error: 'Certificate generation failed', detail: e.message });
  }
}
