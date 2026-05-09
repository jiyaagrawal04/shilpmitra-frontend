import { supabase } from '../../lib/supabase.js';
import { generateJSON } from '../../lib/gemini.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { userId, schemeName } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    // 1. Fetch user + transactions
    const { data: user } = await supabase.from('users').select('*').eq('id', userId).single();
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { data: txns } = await supabase.from('transactions').select('*')
      .eq('seller_id', userId).eq('payment_status', 'completed').order('created_at', { ascending: false });

    const totalRevenue = (txns || []).reduce((s, t) => s + Number(t.amount), 0);
    const months = new Set((txns || []).map(t => t.created_at?.substring(0, 7)));

    // 2. Fetch scheme criteria
    let scheme = null;
    if (schemeName) {
      const { data } = await supabase.from('scheme_criteria').select('*')
        .ilike('scheme_name', `%${schemeName}%`).limit(1);
      scheme = data?.[0];
    }
    if (!scheme) {
      const { data } = await supabase.from('scheme_criteria').select('*').limit(1);
      scheme = data?.[0];
    }

    // 3. Gemini generates loan application content
    const prompt = `Generate a professional loan application form content for an Indian artisan applying under ${scheme?.scheme_name || 'Government Scheme'}.

APPLICANT:
Name: ${user.name}
Craft: ${user.craft_type || 'Traditional Craft'}
Location: ${user.location || 'India'}
State: ${user.state || 'India'}
Phone: ${user.phone || 'N/A'}
Group: ${user.group_status || 'General'}
Total Sales: ₹${totalRevenue}
Active Months: ${months.size}

SCHEME: ${scheme?.scheme_name || 'Government Scheme'}
Benefits: ${JSON.stringify(scheme?.criteria_json?.benefits || [])}
Loan Amount: ${scheme?.criteria_json?.loan_amount || 'As per scheme'}

Return JSON:
{
  "applicationTitle": "Loan Application under [Scheme Name]",
  "applicantSection": {
    "fullName": "${user.name}",
    "fatherName": "To be filled",
    "dateOfBirth": "To be filled",
    "gender": "To be filled",
    "category": "${user.group_status || 'General'}",
    "address": "${user.location || 'To be filled'}",
    "state": "${user.state || 'To be filled'}",
    "phone": "${user.phone || 'To be filled'}",
    "aadhaar": "XXXX-XXXX-${user.aadhaar_last4 || 'XXXX'}"
  },
  "businessSection": {
    "businessName": "generated business name",
    "craftType": "${user.craft_type || 'Traditional Craft'}",
    "yearsInBusiness": "${Math.ceil(months.size / 12)} years",
    "monthlyIncome": "₹${Math.round(totalRevenue / Math.max(months.size, 1))}",
    "totalRevenue": "₹${totalRevenue}",
    "businessDescription": "2-3 sentence AI-generated description of the artisan's business"
  },
  "loanSection": {
    "schemeName": "${scheme?.scheme_name || 'Government Scheme'}",
    "loanAmountRequested": "${scheme?.criteria_json?.loan_amount || 'As per scheme'}",
    "purpose": "AI-generated purpose statement",
    "repaymentPlan": "As per scheme guidelines"
  },
  "declarationText": "I hereby declare that the information provided above is true and correct..."
}`;

    const appData = await generateJSON(prompt);

    // 4. Generate PDF using jsPDF
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(31, 60, 136);
    doc.rect(0, 0, pageWidth, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text(appData.applicationTitle || 'Loan Application', pageWidth / 2, 15, { align: 'center' });
    doc.setFontSize(9);
    doc.text('ShilpMitra AI-Generated Application', pageWidth / 2, 23, { align: 'center' });

    let y = 40;
    doc.setTextColor(0, 0, 0);

    // Section helper
    const addSection = (title, fields) => {
      if (y > 260) { doc.addPage(); y = 20; }
      doc.setFillColor(240, 245, 255);
      doc.rect(15, y - 5, pageWidth - 30, 8, 'F');
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.text(title, 18, y);
      y += 8;
      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      Object.entries(fields).forEach(([key, val]) => {
        if (y > 275) { doc.addPage(); y = 20; }
        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
        doc.setFont(undefined, 'bold');
        doc.text(`${label}:`, 20, y);
        doc.setFont(undefined, 'normal');
        const lines = doc.splitTextToSize(String(val || 'N/A'), pageWidth - 85);
        doc.text(lines, 75, y);
        y += lines.length * 5 + 3;
      });
      y += 5;
    };

    addSection('APPLICANT DETAILS', appData.applicantSection || {});
    addSection('BUSINESS DETAILS', appData.businessSection || {});
    addSection('LOAN REQUEST', appData.loanSection || {});

    // Declaration
    if (y > 240) { doc.addPage(); y = 20; }
    doc.setFillColor(240, 245, 255);
    doc.rect(15, y - 5, pageWidth - 30, 8, 'F');
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('DECLARATION', 18, y);
    y += 8;
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    const declLines = doc.splitTextToSize(appData.declarationText || 'I declare all information is true.', pageWidth - 40);
    doc.text(declLines, 20, y);
    y += declLines.length * 4 + 15;

    // Signature boxes
    doc.setDrawColor(200);
    doc.rect(20, y, 60, 20);
    doc.rect(120, y, 60, 20);
    doc.setFontSize(8);
    doc.text('Applicant Signature', 30, y + 25);
    doc.text('Bank Officer Signature', 128, y + 25);

    // Footer
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text(`Generated by ShilpMitra AI | ${new Date().toLocaleDateString('en-IN')} | Ref: SM-${Date.now().toString(36).toUpperCase()}`, pageWidth / 2, 290, { align: 'center' });

    // 5. Upload to Supabase
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    const fileName = `loan_app_${userId.substring(0, 8)}_${Date.now()}.pdf`;

    let pdfUrl = null;
    try {
      await supabase.storage.from('trade-pdfs').upload(fileName, pdfBuffer, { contentType: 'application/pdf', upsert: true });
      const { data: urlData } = supabase.storage.from('trade-pdfs').getPublicUrl(fileName);
      pdfUrl = urlData?.publicUrl;
    } catch (e) {
      console.warn('[loan-application] Upload failed:', e.message);
    }

    return res.status(200).json({
      success: true,
      pdfUrl,
      fileName,
      applicationData: appData,
      message: `Loan application generated for ${user.name} under ${scheme?.scheme_name || 'Government Scheme'}`,
    });
  } catch (e) {
    console.error('[loan-application]', e);
    return res.status(500).json({ error: 'PDF generation failed', detail: e.message });
  }
}
