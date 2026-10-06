import crypto from 'node:crypto';
export function send(res,code,body,headers={}){res.statusCode=code;res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');Object.entries(headers).forEach(([k,v])=>res.setHeader(k,v));res.end(JSON.stringify(body));}
export async function readRaw(req,limit){const chunks=[];let size=0;for await(const c of req){size+=c.length;if(size>limit)throw Object.assign(new Error('too large'),{code:413});chunks.push(c)}return Buffer.concat(chunks)}
export async function readJson(req,limit=5e4){const raw=await readRaw(req,limit);return raw.length?JSON.parse(raw.toString()):{}}
export const clean=(v,n=500)=>String(v==null?'':v).replace(/[\r\n]+/g,' ').slice(0,n);
const secret=()=>process.env.SESSION_SECRET||'';
const sign=v=>crypto.createHmac('sha256',secret()).update(v).digest('hex');
export const makeToken=()=>{const exp=String(Date.now()+12*3600e3);return exp+'.'+sign(exp)};
export function isAdmin(req){if(!secret())return false;const m=/(?:^|; )ss_admin=([^;]+)/.exec(req.headers.cookie||'');if(!m)return false;const [exp,sig]=m[1].split('.');if(!exp||!sig||Number(exp)<Date.now())return false;const a=Buffer.from(sig),b=Buffer.from(sign(exp));return a.length===b.length&&crypto.timingSafeEqual(a,b)}
export function safeEqual(x,y){const a=crypto.createHash('sha256').update(String(x)).digest(),b=crypto.createHash('sha256').update(String(y)).digest();return crypto.timingSafeEqual(a,b)}