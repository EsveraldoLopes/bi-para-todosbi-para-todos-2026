'use strict';
const ORIGIN='https://bi-para-todosbi-para-todos-2026.vercel.app';
const SUPABASE_URL=process.env.SUPABASE_URL||'https://nampznzziskqwyjzvvob.supabase.co';
const SUPABASE_KEY=process.env.SUPABASE_ANON_KEY||'sb_publishable_9u18qsxaBtaHBTe21u-gFw_RzZM2h__';
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const esc=x=>String(x==null?'':x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const meta=x=>esc(String(x||'').replace(/\s+/g,' ').slice(0,320));
function publicPhoto(a){
 if(a.category==='Desporto'&&/photo-1771344164616-3582e4dc2f07|photo-1549210194-fb0aac030c32/.test(a.image_url||''))return null;
 try{const u=new URL(a.image_url);return u.protocol==='https:'&&['images.unsplash.com','images.pexels.com','upload.wikimedia.org','commons.wikimedia.org'].includes(u.hostname)?u.href:null;}catch{return null;}
}
function jsonld(a,canonical,image){
 return JSON.stringify({'@context':'https://schema.org','@type':'NewsArticle',headline:a.title,description:a.summary,datePublished:a.published_at,dateModified:a.updated_at||a.published_at,author:{'@type':'Organization',name:a.author||'Redação Notícias Para Todos'},publisher:{'@type':'NewsMediaOrganization',name:'Notícias Para Todos',url:ORIGIN},mainEntityOfPage:canonical,url:canonical,...(image?{image:[image]}:{})}).replace(/</g,'\\u003c');
}
function template(a){
 const canonical=ORIGIN+'/noticia/'+encodeURIComponent(a.id),image=publicPhoto(a),title=meta(a.title),desc=meta(a.summary);
 const paragraphs=String(a.body||a.summary||'').split(/\n\s*\n/).filter(Boolean).map(p=>'<p>'+esc(p).replace(/\n/g,'<br>')+'</p>').join('\n');
 let source='';try{const u=new URL(a.source_url);if(u.protocol==='https:')source='<p><a href="'+esc(u.href)+'" target="_blank" rel="noopener noreferrer nofollow">Consultar fonte original ↗</a></p>';}catch{}
 const date=new Date(a.published_at),dateDisplay=Number.isFinite(date.getTime())?date.toLocaleDateString('pt-PT',{day:'numeric',month:'long',year:'numeric'}):'';
 const photo=image?'<figure><img src="'+esc(image)+'" alt="'+meta(a.image_alt||a.title)+'" loading="eager"><figcaption>'+esc(a.image_caption||'Fotografia de arquivo ou imagem editorial.')+(a.image_credit?' · '+esc(a.image_credit):'')+'</figcaption></figure>':'';
 return '<!doctype html><html lang="pt-PT"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="index,follow,max-image-preview:large"><title>'+title+' — Notícias Para Todos</title><meta name="description" content="'+desc+'"><link rel="canonical" href="'+esc(canonical)+'"><meta property="og:type" content="article"><meta property="og:locale" content="pt_PT"><meta property="og:site_name" content="Notícias Para Todos"><meta property="og:title" content="'+title+'"><meta property="og:description" content="'+desc+'"><meta property="og:url" content="'+esc(canonical)+'"><meta property="article:published_time" content="'+esc(a.published_at)+'"><meta name="twitter:card" content="'+(image?'summary_large_image':'summary')+'"><meta name="twitter:title" content="'+title+'"><meta name="twitter:description" content="'+desc+'">'+(image?'<meta property="og:image" content="'+esc(image)+'"><meta name="twitter:image" content="'+esc(image)+'">':'')+'<script type="application/ld+json">'+jsonld(a,canonical,image)+'</script><style>:root{color-scheme:light}*{box-sizing:border-box}body{margin:0;background:#f5f8fc;color:#15243e;font:17px/1.8 system-ui,-apple-system,sans-serif}header{background:#101e35;color:#fff;padding:22px max(20px,calc((100vw - 960px)/2))}header a{font-size:24px;font-weight:850;color:#fff;text-decoration:none}main{max-width:860px;margin:45px auto 75px;padding:0 22px}article{background:white;padding:clamp(20px,4vw,54px);border-radius:17px;border:1px solid #e3e8f0}h1{font-size:clamp(30px,4.7vw,51px);line-height:1.17;letter-spacing:-1.3px;margin:17px 0}h1+p{font-size:20px;line-height:1.5;color:#435673}.category{color:#b03828;letter-spacing:.13em;text-transform:uppercase;font-weight:800;font-size:12px}.date{font-size:13px;color:#607188}figure{margin:28px 0}figure img{width:100%;height:auto;max-height:530px;object-fit:cover;border-radius:10px}figcaption{font-size:12px;color:#61718a;margin-top:6px;line-height:1.6}.story p{margin:0 0 20px;white-space:normal;overflow-wrap:anywhere}.link{font-size:14px;color:#23578f}footer{text-align:center;margin:25px;color:#607188;font-size:12px}a{color:#205797}a:focus-visible{outline:3px solid #e5a83a;outline-offset:4px}@media(max-width:520px){main{margin:18px auto 40px}article{padding:22px}}</style></head><body><header><a href="/">notícias para todos.</a></header><main><article><div class="category">'+esc(a.category)+'</div><h1>'+title+'</h1><p>'+desc+'</p><p class="date">'+esc(dateDisplay)+' · '+esc(a.author||'Redação Notícias Para Todos')+'</p>'+photo+'<div class="story">'+paragraphs+'</div>'+source+'<p><a class="link" href="/">← Voltar ao jornal</a></p></article><footer>Notícias Para Todos · Informação com contexto e fontes identificadas.</footer></main></body></html>';
}
module.exports=async function handler(req,res){
 res.setHeader('Content-Type','text/html; charset=utf-8');
 res.setHeader('Cache-Control','public, max-age=0, s-maxage=180, stale-while-revalidate=300');
 res.setHeader('X-Content-Type-Options','nosniff');
 const id=typeof req.query?.id==='string'?req.query.id:'';
 if(!UUID.test(id)){res.statusCode=404;res.setHeader('X-Robots-Tag','noindex');return res.end('<h1>Notícia não encontrada</h1><a href="/">Voltar ao jornal</a>');}
 try{
  const url=new URL('/rest/v1/articles',SUPABASE_URL);url.search=new URLSearchParams({select:'id,title,summary,body,category,author,source_url,published_at,updated_at,image_url,image_alt,image_credit,image_caption',id:'eq.'+id,published:'eq.true',published_at:'lte.'+new Date().toISOString(),limit:'1'});
  const response=await fetch(url,{headers:{apikey:SUPABASE_KEY},signal:AbortSignal.timeout(8000)});
  if(!response.ok)throw Error('read failure '+response.status);
  const [a]=await response.json();
  if(!a||!a.title||!a.body){res.statusCode=404;res.setHeader('X-Robots-Tag','noindex');return res.end('<h1>Notícia não encontrada</h1><a href="/">Voltar ao jornal</a>');}
  res.statusCode=200;return res.end(template(a));
 }catch(err){res.statusCode=503;res.setHeader('X-Robots-Tag','noindex');res.setHeader('Cache-Control','no-store');return res.end('<h1>Notícia temporariamente indisponível</h1><a href="/">Voltar ao jornal</a>');}
};
