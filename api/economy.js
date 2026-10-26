// Vercel serverless news proxy: only preapproved country codes and Google News feeds.
const names={AO:'Angola',ZA:'South Africa',NA:'Namibia',CD:'DR Congo',CG:'Republic of Congo',RW:'Rwanda',NG:'Nigeria',DZ:'Algeria',KE:'Kenya',EG:'Egypt',MA:'Morocco',GH:'Ghana',MZ:'Mozambique',PT:'Portugal',GB:'United Kingdom',DE:'Germany',FR:'France',BE:'Belgium',NL:'Netherlands',ES:'Spain',IT:'Italy',CH:'Switzerland',PL:'Poland',BR:'Brazil',US:'United States',CA:'Canada',MX:'Mexico',AR:'Argentina',CL:'Chile',CO:'Colombia',CN:'China',IN:'India',JP:'Japan',KR:'South Korea',SG:'Singapore',AE:'United Arab Emirates',SA:'Saudi Arabia',ID:'Indonesia',AU:'Australia',NZ:'New Zealand'};
function decode(value){return String(value||'').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/&#(x[0-9a-f]+|\d+);/gi,(_,v)=>{const n=v[0].toLowerCase()==='x'?parseInt(v.slice(1),16):Number(v);return n>0&&n<=0x10ffff?String.fromCodePoint(n):'';}).replace(/&(?:amp|lt|gt|quot|apos|nbsp);/g,s=>({ '&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&apos;':"'",'&nbsp;':' '}[s]));}
function field(xml,tag){return decode((xml.match(new RegExp('<'+tag+'(?:\\s[^>]*)?>([\\s\\S]*?)<\\/'+tag+'>','i'))||[])[1]||'').trim();}
export default async function handler(req,res){
 if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
 const code=String(req.query.country||'AO').toUpperCase();
 if(!Object.hasOwn(names,code))return res.status(400).json({error:'País inválido'});
 const pt=['AO','PT','BR','MZ'].includes(code),lang=pt?'pt':'en',hl=code==='BR'?'pt-BR':pt?'pt-PT':'en-US';
 const q=(pt?'economia negócios investimentos inflação ':'economy business markets investment inflation ')+names[code];
 const u='https://news.google.com/rss/search?'+new URLSearchParams({q,hl,gl:code,ceid:code+':'+(code==='BR'?'pt-419':lang)});
 try{
  const signal=AbortSignal.timeout(8500);
  const result=await fetch(u,{signal,headers:{'User-Agent':'JingolokelaNews/1.0 (economic headlines; contact dudji@hotmail.com)','Accept':'application/rss+xml, application/xml;q=0.9'}});
  if(!result.ok)throw Error('Upstream '+result.status);
  const xml=await result.text();const chunks=xml.match(/<item\b[^>]*>[\s\S]*?<\/item>/gi)||[];
  const items=chunks.slice(0,10).map(item=>{const link=field(item,'link');let parsed;try{parsed=new URL(link);}catch{return null;}
   if(parsed.protocol!=='https:'||parsed.hostname!=='news.google.com')return null;
   return {title:field(item,'title').slice(0,250),link:parsed.href,pubDate:field(item,'pubDate'),author:field(item,'source').slice(0,100)};
  }).filter(x=>x&&x.title);
  if(!items.length)throw Error('No entries');
  res.setHeader('Cache-Control','public, s-maxage=900, stale-while-revalidate=1800');
  return res.status(200).json({country:code,items});
 }catch{return res.status(503).json({error:'Não foi possível consultar as fontes neste momento.',items:[]});}
}
