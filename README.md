# SadsSaint's TATS PALOR — Booking Website

Dark black/silver booking site for SadsSaint's TATS PALOR.

## Included
- Responsive branded booking website
- Real booking-request API at `/api/book.js`
- Supabase database schema in `supabase.sql`
- Studio + customer transactional email notifications through Brevo
- Protected booking list endpoint at `/api/availability.js`
- Vercel configuration

## Booking email destination
All new booking notifications are sent to:

**sadsainttattoopalor@gmail.com**

Customer confirmation emails are sent to the email address entered on the booking form. The studio address above is the fixed booking-recipient address in the backend unless `STUDIO_EMAIL` is intentionally changed.

Brevo requires the configured sender to be registered/verified before transactional email can be sent.

## Go live
1. Create the Supabase project and run `supabase.sql` in the SQL Editor.
2. Create a Brevo account and add/verify `sadsainttattoopalor@gmail.com` as a transactional sender (or authenticate a sending domain).
3. Deploy this repo to Vercel.
4. Add the required variables to Vercel Environment Variables:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `BREVO_API_KEY`
   - `STUDIO_EMAIL` (set to `sadsainttattoopalor@gmail.com`)
   - `BOOKING_FROM_EMAIL` (a verified Brevo sender; currently `sadsainttattoopalor@gmail.com`)
   - `BOOKING_FROM_NAME` (for example, `SadsSaint's TATS PALOR`)
5. Set a long random `ADMIN_BOOKING_TOKEN` if the protected booking-list endpoint is enabled.

Never commit API keys or the Supabase service-role key to this repository. Keep them in Vercel environment variables.

## Booking flow
Visitor submits the form → request is saved as `pending` in Supabase → Brevo sends the booking notification to **sadsainttattoopalor@gmail.com** → Brevo sends a confirmation email to the visitor → the studio confirms the final appointment by reply.

The final calendar-slot locking and deposit/payment step needs the studio's preferred calendar/payment provider account. This repo is provider-neutral rather than inventing credentials or exposing secrets.
