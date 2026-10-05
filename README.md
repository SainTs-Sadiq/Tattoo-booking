# SadsSaint's TATS PALOR — Booking Website

Dark black/silver booking site for SadsSaint's TATS PALOR.

## Included
- Responsive branded booking website
- Real booking-request API at `/api/book.js`
- Supabase database schema in `supabase.sql`
- Studio + customer email notifications through Resend
- Protected booking list endpoint at `/api/availability.js`
- Vercel configuration

## Go live
1. Create a Supabase project and run `supabase.sql` in SQL Editor.
2. Create a Resend account and verify the sending domain/address.
3. Deploy this repo to Vercel.
4. Add the variables in `.env.example` to Vercel Environment Variables.
5. Set `BOOKING_FROM_EMAIL` to a verified Resend sender.
6. Set a long random `ADMIN_BOOKING_TOKEN`.

The Supabase service-role key is server-side only and is never sent to the browser.

## Booking flow
Visitor submits the form → request is saved as `pending` → studio receives an email → visitor receives a confirmation email → studio confirms the final appointment by reply.

The final calendar-slot locking and deposit/payment step needs the studio's preferred calendar/payment provider account. This repo is provider-neutral rather than inventing credentials or exposing secrets.
