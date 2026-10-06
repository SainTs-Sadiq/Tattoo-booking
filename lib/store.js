import {list,put,del} from '@vercel/blob';
export async function readManifest(){const {blobs}=await list({prefix:'manifest.json'});const m=blobs.find(b=>b.pathname==='manifest.json');if(!m)return [];const r=await fetch(m.url+'?t='+Date.now(),{cache:'no-store'});return r.ok?r.json():[]}
export async function writeManifest(items){await put('manifest.json',JSON.stringify(items),{access:'public',contentType:'application/json',addRandomSuffix:false,allowOverwrite:true,cacheControlMaxAge:60})}
export async function putImage(name,buf,contentType){return put(name,buf,{access:'public',contentType,addRandomSuffix:false})}
export async function delImage(url){await del(url)}