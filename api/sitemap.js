'use strict';
const ROOT='https://bi-para-todosbi-para-todos-2026.vercel.app';
const SUPABASE_URL=process.env.SUPABASE_URL||'https://nampznzziskqwyjzvvob.supabase.co';
const SUPABASE_KEY=process.env.SUPABASE_ANON_KEY||'sb_publishable_9u18qsxaBtaHBTe21u-gFw_RzZM2h__';
module.exports=async function handler(req,res){
 res.setHeader('Content-Type','application/xml; charset=utf-8');
 res.setHeader('Cache-Control','public, max-age=0, s-maxage=600, stale-while-revalidate=3600');
 try{
  let entries=[],offset=0;
  for(let page=0;page<10;page++){
   const url=new URL('/rest/v1/articles',SUPABASE_URL);
   url.search=new URLSearchParams({select:'id,published_at',published:'eq.true',published_at:'lte.'+new Date().toISOString(),order:'published_at.desc',limit:'1000',offset:String(offset)});
   const response=await fetch(url,{headers:{apikey:SUPABASE_KEY},signal:AbortSignal.timeout(8000)});
   if(!response.ok)throw Error('feed unavailable');
   const batch=await response.json();if(!Array.isArray(batch))throw Error('bad feed');
   entries.push(...batch.filter(a=>/^[a-f0-9-]{36}$/i.test(a.id)&&Number.isFinite(Date.parse(a.published_at))));
   if(batch.length<1000)break;offset+=batch.length;
  }
  const pages=['/','/anunciar.html'];
  const urls=pages.map(path=>'  <url><loc>'+ROOT+path+'</loc></url>');
  for(const a of entries){urls.push('  <url><loc>'+ROOT+'/noticia/'+encodeURIComponent(a.id)+'</loc><lastmod>'+new Date(a.published_at).toISOString().slice(0,10)+'</lastmod></url>');}
  res.statusCode=200;res.end('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+urls.join('\n')+'\n</urlset>\n');
 }catch(error){res.statusCode=503;res.setHeader('Cache-Control','no-store');res.end('<?xml version="1.0" encoding="UTF-8"?><error>Mapa temporariamente indisponível</error>');}
};
