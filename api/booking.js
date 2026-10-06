import {createClient} from '@supabase/supabase-js';
const supabase=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
const STUDIO_EMAIL=process.env.STUDIO_EMAIL||'sadsainttattoopalor@gmail.com';
const BREVO_API_KEY=process.env.BREVO_API_KEY;
const FROM_EMAIL=process.env.BOOKING_FROM_EMAIL||STUDIO_EMAIL;
const FROM_NAME=process.env.BOOKING_FROM_NAME||"SadsSaint's TATS PALOR";
const clean=(v,n=5000)=>String(v??'').trim().slice(0,n);
async function sendEmail(x){const r=await fetch('https://api.brevo.com/v3/smtp/email',{method:'POST',headers:{accept:'application/json','api-key':BREVO_API_KEY,'content-type':'application/json'},body:JSON.stringify({sender:{email:FROM_EMAIL,name:FROM_NAME},to:[{email:x.to}],replyTo:x.replyTo?{email:x.replyTo}:undefined,subject:x.subject,textContent:x.text})});if(!r.ok)throw new Error('Brevo email failed: '+r.status)}
export default async function handler(req,res){
if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
if(!process.env.SUPABASE_URL||!process.env.SUPABASE_SERVICE_ROLE_KEY||!BREVO_API_KEY)return res.status(500).json({error:'Booking service is not configured yet.'});
const b=req.body||{};if(clean(b.website,100))return res.status(200).json({ok:true});
const name=clean(b.name,120),email=clean(b.email,254).toLowerCase(),phone=clean(b.phone,60),age=clean(b.age,10),gender=clean(b.gender,60),first=clean(b.first,30);
const location=clean(b.location,500),placement=clean(b.placement,160),refs=clean(b.refs,2000),pay=clean(b.pay,100),allergies=clean(b.allergies,500),notes=clean(b.notes,5000);
const preferred_date=clean(b.preferred_date,20),preferred_time=clean(b.preferred_time,60),size=clean(b.size,100),style=clean(b.style,5000),service_type='home-service';
if(!name||!email||!phone||!age||!first||!location||!placement||!notes||!b.ack)return res.status(400).json({error:'Please complete all required booking fields.'});
if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return res.status(400).json({error:'Please enter a valid email address.'});
const combinedNotes=['Age: '+age,'Gender: '+(gender||'Not provided'),'First tattoo: '+first,'Payment method: '+(payment_method||'Not provided'),'Allergies: '+(allergies||'None provided'),'Deposit acknowledgment: yes','Additional notes: '+notes].join('\n');
const result=await supabase.from('booking_requests').insert({name,email,phone,preferred_date:preferred_date||null,preferred_time:preferred_time||null,service_type,location,payment_method,size:size||null,placement,style:style||notes,reference_links:refs||null,notes:combinedNotes,status:'pending'}).select('id,created_at').single();
if(result.error){console.error(result.error);return res.status(500).json({error:'Could not save your booking request.'})}
const summary='\nName: '+name+'\nEmail: '+email+'\nPhone: '+phone+'\nAge: '+age+'\nGender: '+(gender||'Not provided')+'\nFirst tattoo: '+first+'\nService: Home service\nLocation: '+location+'\nPlacement: '+placement+'\nReference links: '+(refs||'None provided')+'\nPayment method: '+(pay||'Not provided')+'\nAllergies: '+(allergies||'None provided')+'\nPreferred date: '+(preferred_date||'Flexible')+'\nPreferred time: '+(preferred_time||'Flexible')+'\n\nTattoo idea / notes:\n'+notes+'\n\nBooking ID: '+result.data.id;
const results=await Promise.allSettled([
sendEmail({to:STUDIO_EMAIL,replyTo:email,subject:'New home-service booking — '+name,text:'A new SadsSaint\'s TATS PALOR booking request was submitted.'+summary}),
sendEmail({to:email,subject:'Booking request received — SadsSaint\'s TATS PALOR',text:'Hi '+name.split(' ')[0]+',\n\nThanks for reaching out to SadsSaint\'s TATS PALOR. Your home-service booking request has been received and is pending confirmation.'+summary+'\n\nThe studio will reply once your request is reviewed.\n\n— SadsSaint\'s TATS PALOR'})
]);
if(results.some(r=>r.status==='rejected'))console.error('Booking email failure',results);
return res.status(201).json({ok:true,bookingId:result.data.id,emailSent:results.every(r=>r.status==='fulfilled')});
}