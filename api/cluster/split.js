import { supabase } from '../lib/supabase.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { clusterId, orderAmount } = req.body;

    if (!clusterId || !orderAmount) {
      return res.status(400).json({ error: 'clusterId and orderAmount are required' });
    }

    if (Number(orderAmount) <= 0) {
      return res.status(400).json({ error: 'orderAmount must be positive' });
    }

    // 1. Fetch cluster members
    const { data: members, error: memErr } = await supabase
      .from('cluster_members')
      .select('*, users(name, upi_id)')
      .eq('cluster_id', clusterId);

    if (memErr) throw memErr;
    if (!members || members.length === 0) {
      return res.status(404).json({ error: 'No members found for this cluster' });
    }

    // 2. Validate all members locked
    const unlocked = members.filter(m => !m.is_locked);
    if (unlocked.length > 0) {
      return res.status(400).json({
        error: 'All members must have splits locked before calculating',
        unlockedMembers: unlocked.map(m => m.user_id),
      });
    }

    // 3. Validate splits sum to 100%
    const totalPct = members.reduce((s, m) => s + Number(m.split_pct || 0), 0);
    if (Math.abs(totalPct - 100) > 0.01) {
      return res.status(400).json({
        error: `Split percentages must sum to 100%. Current sum: ${totalPct}%`,
        actualSum: totalPct,
      });
    }

    // 4. Calculate splits with rounding fix
    const amount = Number(orderAmount);
    let distributed = 0;
    const splits = members.map((m, i) => {
      const pct = Number(m.split_pct);
      let amountDue;

      if (i === members.length - 1) {
        // Last member gets the remainder to fix rounding
        amountDue = amount - distributed;
      } else {
        amountDue = Math.round(amount * pct / 100);
        distributed += amountDue;
      }

      return {
        userId: m.user_id,
        name: m.users?.name || 'Unknown',
        upiId: m.users?.upi_id || null,
        role: m.role,
        splitPct: pct,
        amountDue,
      };
    });

    return res.status(200).json({
      clusterId,
      orderAmount: amount,
      totalMembers: members.length,
      splits,
    });
  } catch (e) {
    console.error('[cluster/split]', e);
    return res.status(500).json({ error: 'Internal server error', detail: e.message });
  }
}
