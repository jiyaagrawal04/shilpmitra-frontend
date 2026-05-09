import { supabase } from '../lib/supabase.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { user_id, action } = req.query;

  // PATCH — mark notification read: /api/notifications?user_id=xxx&action=read&notif_id=yyy
  if (req.method === 'PATCH') {
    try {
      const notifId = req.query.notif_id || req.body?.notif_id;
      if (!notifId) return res.status(400).json({ error: 'notif_id is required' });

      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notifId)
        .select()
        .single();

      if (error) throw error;
      if (!data) return res.status(404).json({ error: 'Notification not found' });
      return res.status(200).json(data);
    } catch (e) {
      console.error('[notifications PATCH]', e);
      return res.status(500).json({ error: 'Internal server error', detail: e.message });
    }
  }

  // GET — list notifications: /api/notifications?user_id=xxx
  if (req.method === 'GET') {
    if (!user_id) return res.status(400).json({ error: 'user_id is required' });
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
