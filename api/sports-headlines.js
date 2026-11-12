function decode(value){return String(value||'').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/&#(x[0-9a-f]+|\d+);/gi,(_,v)=>{const n=v[0].toLowerCase()==='x'?parseInt(v.slice(1),16):Number(v);return n>0&&n<=0x10ffff?String.fromCodePoint(n):'';}).replace(/&(?:amp|lt|gt|quot|apos|nbsp);/g,s=>({ '&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&apos;':"'",'&nbsp;':' '}[s]));}
function field(xml,tag){return decode((xml.match(new RegExp('<'+tag+'(?:\\s[^>]*)?>([\\s\\S]*?)<\\/'+tag+'>','i'))||[])[1]||'').trim();}
const feeds=[
 {name:'zerozero',host:'zerozero.pt',feed:'https://www.zerozero.pt/rss_list.php',search:'site:zerozero.pt'},
 {name:'365Scores',host:'365scores.com',feed:'https://www.365scores.com/pt-br/news/magazine/feed/',search:'site:365scores.com/pt-br/news/magazine/'}
];
async function headlines(feed,fallback=false){
 const url=fallback?'https://news.google.com/rss/search?'+new URLSearchParams({q:feed.search+' when:2d',hl:'pt-PT',gl:'PT',ceid:'PT:pt'}):feed.feed;
 const response=await fetch(url,{signal:AbortSignal.timeout(4500),headers:{Accept:'application/rss+xml, application/xml;q=0.9'}});
 if(!response.ok)throw Error('Feed indisponível');
 const now=Date.now(),rows=[];
 for(const item of (await response.text()).match(/<item\b[^>]*>[\s\S]*?<\/item>/gi)||[]){
  const title=field(item,'title').replace(/\s+-\s+(?:zerozero(?:\.pt)?|365scores)$/i,'').slice(0,230);
  const date=Date.parse(field(item,'pubDate'));
  let link;try{link=new URL(field(item,'link'));}catch{continue;}
  if(link.protocol!=='https:'||!title||!(date<=now&&date>=now-48*3600000))continue;
  if(fallback?link.hostname!=='news.google.com':!(link.hostname===feed.host||link.hostname.endsWith('.'+feed.host)))continue;
  rows.push({title,link:link.href,date,source:feed.name});
 }
 return rows.sort((a,b)=>b.date-a.date).slice(0,10);
}
export default async function handler(req,res){
 if(req.method!=='GET')return res.status(405).json({items:[]});
 const groups=await Promise.all(feeds.map(async feed=>{
  const direct=await headlines(feed).catch(()=>[]);
  return direct.length?direct:headlines(feed,true).catch(()=>[]);
 }));
 const items=groups.flat();
 res.setHeader('Cache-Control',groups.every(g=>g.length)?'public, s-maxage=600, stale-while-revalidate=1200':'no-store');
 return res.status(items.length?200:503).json({items});
}
