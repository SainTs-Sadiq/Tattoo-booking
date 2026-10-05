import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const STUDIO_EMAIL = process.env.STUDIO_EMAIL || 'sadsainttattoopalor@gmail.com';
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const FROM_EMAIL = process.env.BOOKING_FROM_EMAIL || STUDIO_EMAIL;
const FROM_NAME = process.env.BOOKING_FROM_NAME || "SadsSaint's TATS PALOR";

const clean = (value, max = 5000) => String(value ?? '').trim().slice(0, max);

async function sendBrevoEmail({ to, subject, text, replyTo }) {
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'api-key': BREVO_API_KEY,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      sender: { email: FROM_EMAIL, name: FROM_NAME },
      to: [{ email: to }],
      replyTo: replyTo ? { email: replyTo } : undefined,
      subject,
      textContent: text
    })
  });
  if (!response.ok) throw new Error(`Brevo email failed: ${response.status} ${await response.text()}`);
  return response.json();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY || !BREVO_API_KEY) {
    return res.status(500).json({ error: 'Booking service is not configured yet.' });
  }

  const body = req.body || {};
  const name = clean(body.name, 120);
  const email = clean(body.email, 254).toLowerCase();
  const phone = clean(body.phone, 60);
  const preferred_date = clean(body.preferred_date, 20);
  const preferred_time = clean(body.preferred_time, 60);
  const size = clean(body.size, 100);
  const placement = clean(body.placement, 160);
  const style = clean(body.style, 5000);
  const reference_links = clean(body.reference_links, 2000);

  if (!name || !email || !style) return res.status(400).json({ error: 'Name, email, and tattoo idea are required.' });
  if (!/^([^\s@]+)@([^\s@]+)\.([^\s@]+)$/.test(email)) return res.status(400).json({ error: 'Please enter a valid email address.' });

  const { data, error } = await supabase.from('booking_requests').insert({
    name, email, phone, preferred_date: preferred_date || null, preferred_time, size, placement, style, reference_links
  }).select('id, created_at').single();
  if (error) return res.status(500).json({ error: 'Could not save your booking request.' });

  const summary = `\nName: ${name}\nEmail: ${email}\nPhone: ${phone || 'Not provided'}\nPreferred date: ${preferred_date || 'Flexible'}\nPreferred time: ${preferred_time || 'Flexible'}\nSize: ${size || 'Not specified'}\nPlacement: ${placement || 'Not specified'}\n\nTattoo idea / style:\n${style}\n\nReference links:\n${reference_links || 'None provided'}\n\nBooking ID: ${data.id}`;

  const results = await Promise.allSettled([
    sendBrevoEmail({ from: FROM_EMAIL, to: STUDIO_EMAIL, replyTo: email, subject: `New tattoo booking request — ${name}`, text: `A new SadsSaint's booking request was submitted.${summary}` }),
    sendBrevoEmail({ to: email, subject: `Booking request received — SadsSaint's TATS PALOR`, text: `Hi ${name},\n\nThanks for reaching out to SadsSaint's TATS PALOR. Your booking request has been received and is pending confirmation.\n${summary}\n\nThe studio will reply to this email once your preferred date/time is reviewed.\n\n— SadsSaint's TATS PALOR` })
  ]);

  if (results.some(r => r.status === 'rejected')) console.error('One or more confirmation emails failed', results);
  return res.status(201).json({ ok: true, bookingId: data.id, emailSent: !results.some(r => r.status === 'rejected') });
}
