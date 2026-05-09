// Unified PDF router — merges trade-record, eligibility-cert, loan-application
// Route: POST /api/pdf?type=trade-record|eligibility-cert|loan-application

import tradeRecord from './_handlers/trade-record.js';
import eligibilityCert from './_handlers/eligibility-cert.js';
import loanApplication from './_handlers/loan-application.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const type = req.query.type || req.body?.type || 'trade-record';

  switch (type) {
    case 'trade-record': return tradeRecord(req, res);
    case 'eligibility-cert': return eligibilityCert(req, res);
    case 'loan-application': return loanApplication(req, res);
    default: return res.status(400).json({ error: `Unknown PDF type: ${type}. Use: trade-record, eligibility-cert, loan-application` });
  }
}
