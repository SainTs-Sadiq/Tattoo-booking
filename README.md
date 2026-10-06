# SadsSaint's TATS PALOR — Booking Website

Home-service-only tattoo booking site with the Artist, Reviews, FAQ, dynamic portfolio and protected admin dashboard restored from the supplied ZIP.

## Included
- Responsive branded website
- Artist profile and style categories
- Reviews/testimonials
- FAQ and deposit/rescheduling information
- Home-service-only booking form
- Supabase booking storage
- Brevo studio + customer transactional emails
- Protected `/admin` dashboard
- Portfolio upload, captions, reorder and delete
- Booking request list and status management in the admin dashboard
- Vercel Blob portfolio storage

## Required Vercel environment variables
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `BREVO_API_KEY`
- `BOOKING_FROM_EMAIL`
- `BOOKING_FROM_NAME`
- `STUDIO_EMAIL`
- `ADMIN_PASSWORD`
- `SESSION_SECRET`
- `BLOB_READ_WRITE_TOKEN` — added automatically when a Vercel Blob store is connected

The studio booking inbox is `sadsainttattoopalor@gmail.com`.

## Admin
Open `/admin` and sign in with `ADMIN_PASSWORD`. The dashboard manages portfolio images and lets you review/update booking statuses.

Never commit secrets to GitHub.

## Booking flow
Visitor submits the form → request is saved as `pending` in Supabase → Brevo emails the studio at `sadsainttattoopalor@gmail.com` and sends a confirmation to the client → the studio reviews the request in `/admin`.

All public bookings are forced server-side to `home-service`; there is no appointment-type selector.
