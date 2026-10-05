import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!process.env.ADMIN_BOOKING_TOKEN || token !== process.env.ADMIN_BOOKING_TOKEN) return res.status(401).json({ error: 'Unauthorized' });
  const { data, error } = await supabase.from('booking_requests').select('*').order('preferred_date', { ascending: true }).order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: 'Could not load bookings.' });
  return res.status(200).json({ bookings: data });
}
