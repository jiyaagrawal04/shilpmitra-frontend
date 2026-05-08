import { supabase } from '../lib/supabase.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ error: 'user_id is required' });

  // GET — list notifications
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user_id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      return res.status(200).json({
        notifications: data || [],
        unreadCount: (data || []).filter(n => !n.is_read).length,
      });
    } catch (e) {
      console.error('[notifications GET]', e);
      return res.status(500).json({ error: 'Internal server error', detail: e.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
