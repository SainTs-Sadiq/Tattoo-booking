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
    headers: { accept: 'application/json', 'api-key': BREVO_API_KEY, 'content-type': 'application/json' },
    body: JSON.stringify({ sender:{email:FROM_EMAIL,name:FROM_NAME}, to:[{email:to}], replyTo:replyTo?{email:replyTo}:undefined, subject, textContent:text })
  });
  if (!response.ok) throw new Error(`Brevo email failed: ${response.status} ${await response.text()}`);
  return response.json();
}

export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
  if(!process.env.SUPABASE_URL||!process.env.SUPABASE_SERVICE_ROLE_KEY||!BREVO_API_KEY) return res.status(500).json({error:'Booking service is not configured yet.'});
  const body=req.body||{};
  if(clean(body.website,100)) return res.status(200).json({ok:true});
  const name=clean(body.name,120), email=clean(body.email,254).toLowerCase(), phone=clean(body.phone,60);
  const age=clean(body.age,10), gender=clean(body.gender,60), first=clean(body.first,30);
  const service_type='home-service';
  const location=clean(body.location,500), placement=clean(body.placement,160);
  const preferred_date=clean(body.preferred_date,20), preferred_time=clean(body.preferred_time,60);
  const size=clean(body.size,100), style=clean(body.style,5000), refs=clean(body.refs,2000);
  const pay=clean(body.pay,100), allergies=clean(body.allergies,500), notes=clean(body.notes,5000);
  if(!name||!email||!placement||!notes) return res.status(400).json({error:'Name, email, placement, and tattoo idea are required.'});
  if(!/^([^\s@]+)@([^\s@]+)\.([^\s@]+)$/.test(email)) return res.status(400).json({error:'Please enter a valid email address.'});
  if(service_type==='home-service'&&!location) return res.status(400).json({error:'Please provide the home service location.'});
  const combinedNotes=[`Age: ${age||'Not provided'}`,`Gender: ${gender||'Not provided'}`,`First tattoo: ${first||'Not provided'}`,`Payment method: ${pay||'Not provided'}`,`Allergies: ${allergies||'None provided'}`,`Additional notes: ${notes}`].join('\n');
  const {data,error}=await supabase.from('booking_requests').insert({
    name,email,phone,preferred_date:preferred_date||null,preferred_time,service_type,location,size,placement,
    style:style||notes,reference_links:refs,notes:combinedNotes
  }).select('id,created_at').single();
  if(error){console.error('Supabase booking insert failed:',error);return res.status(500).json({error:'Could not save your booking request.'});}
  const summary=`\nName: ${name}\nEmail: ${email}\nPhone: ${phone||'Not provided'}\nAppointment: ${service_type==='home-service'?'Home service':'Come to studio'}\nLocation: ${location||'Studio'}\nPreferred date: ${preferred_date||'Flexible'}\nPreferred time: ${preferred_time||'Flexible'}\nPlacement: ${placement}\nReference links: ${refs||'None provided'}\n\nTattoo idea / notes:\\n${notes}\n\nBooking ID: ${data.id}`;
  const results=await Promise.allSettled([
    sendBrevoEmail({to:STUDIO_EMAIL,replyTo:email,subject:`New tattoo booking request — ${name}`,text:`A new SadsSaint's booking request was submitted.${summary}`}),
    sendBrevoEmail({to:email,subject:`Booking request received — SadsSaint's TATS PALOR`,text:`Hi ${name},\n\nThanks for reaching out to SadsSaint's TATS PALOR. Your booking request has been received and is pending confirmation.\n${summary}\n\nThe studio will reply once your request is reviewed.\n\n— SadsSaint's TATS PALOR`})
  ]);
  if(results.some(r=>r.status==='rejected')) console.error('One or more booking emails failed',results);
  return res.status(201).json({ok:true,bookingId:data.id,emailSent:!results.some(r=>r.status==='rejected')});
}