'use strict';
const ROOT='https://www.jingolokela.com';
const SUPABASE_URL=process.env.SUPABASE_URL||'https://nampznzziskqwyjzvvob.supabase.co';
const SUPABASE_KEY=process.env.SUPABASE_ANON_KEY||'sb_publishable_9u18qsxaBtaHBTe21u-gFw_RzZM2h__';
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const xml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
module.exports=async function handler(req,res){
 const news=req.query?.format==='news';
 if(!news&&req.query?.format!=='rss'){res.statusCode=404;return res.end('Recurso não encontrado');}
 res.setHeader('Content-Type',news?'application/xml; charset=utf-8':'application/rss+xml; charset=utf-8');
 res.setHeader('X-Content-Type-Options','nosniff');
 res.setHeader('Cache-Control','public, max-age=0, s-maxage=300, stale-while-revalidate=300');
 const now=new Date(),cutoff=now.getTime()-48*60*60*1000;
 try{
  const url=new URL('/rest/v1/articles',SUPABASE_URL);
  url.search=new URLSearchParams({select:'id,title,summary,category,published_at',published:'eq.true',published_at:'lte.'+now.toISOString(),order:'published_at.desc',limit:news?'1000':'50'});
  if(news)url.searchParams.set('and','(published_at.gte.'+new Date(cutoff).toISOString()+')');
  const response=await fetch(url,{headers:{apikey:SUPABASE_KEY},signal:AbortSignal.timeout(8000)});
  if(!response.ok)throw Error('feed unavailable');
  const rows=await response.json();if(!Array.isArray(rows))throw Error('invalid feed');
  const seen=new Set();
  const articles=rows.filter(a=>{const time=Date.parse(a.published_at);if(!UUID.test(a.id)||typeof a.title!=='string'||!a.title.trim()||!Number.isFinite(time)||time>now.getTime()||(news&&time<cutoff)||seen.has(a.id))return false;seen.add(a.id);return true;});
  let body;
  if(news){
   const urls=articles.slice(0,1000).map(a=>'<url><loc>'+ROOT+'/noticia/'+a.id+'</loc><news:news><news:publication><news:name>Jingolokela Para Todos</news:name><news:language>pt</news:language></news:publication><news:publication_date>'+new Date(a.published_at).toISOString()+'</news:publication_date><news:title>'+xml(a.title)+'</news:title></news:news></url>');
   body='<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">'+urls.join('\n')+'</urlset>';
  }else{
   const items=articles.slice(0,50).map(a=>{const link=ROOT+'/noticia/'+a.id;return '<item><title>'+xml(a.title)+'</title><link>'+link+'</link><guid isPermaLink="true">'+link+'</guid><pubDate>'+new Date(a.published_at).toUTCString()+'</pubDate><category>'+xml(a.category)+'</category><description>'+xml(a.summary)+'</description></item>';});
   body='<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>Jingolokela Para Todos</title><link>'+ROOT+'/</link><description>Angola, diáspora e mundo: notícias em português com fontes identificadas.</description><language>pt-PT</language><atom:link href="'+ROOT+'/feed.xml" rel="self" type="application/rss+xml"/><lastBuildDate>'+now.toUTCString()+'</lastBuildDate>'+items.join('\n')+'</channel></rss>';
  }
  res.statusCode=200;return res.end('<?xml version="1.0" encoding="UTF-8"?>\n'+body+'\n');
 }catch(error){res.statusCode=503;res.setHeader('Cache-Control','no-store');return res.end('<?xml version="1.0" encoding="UTF-8"?><error>Edição temporariamente indisponível</error>');}
};
