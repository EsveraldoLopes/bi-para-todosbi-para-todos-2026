'use strict';
const ORIGIN='https://www.jingolokela.com';
const SUPABASE_URL=process.env.SUPABASE_URL||'https://nampznzziskqwyjzvvob.supabase.co';
const SUPABASE_KEY=process.env.SUPABASE_ANON_KEY||'sb_publishable_9u18qsxaBtaHBTe21u-gFw_RzZM2h__';
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const esc=x=>String(x==null?'':x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const meta=x=>esc(String(x||'').replace(/\s+/g,' ').slice(0,320));
const sportsSelectedTeamPhotos={ 
 'ca87701f-6823-4ea8-bda5-87029c8ee646':{
  image_url:'https://commons.wikimedia.org/wiki/Special:Redirect/file/Marcelino_Nunez.png',
  image_alt:'Marcelino Núñez com a camisola do Ipswich Town em fotografia de 2025',
  image_credit:'MilesaMFC / Wikimedia Commons · CC0 · Arquivo 2025',
  image_source_url:'https://commons.wikimedia.org/wiki/File:Marcelino_Nunez.png',
  image_caption:'Marcelino Núñez ao serviço do Ipswich Town em 2025; imagem de arquivo, não retrata o encontro com Nottingham Forest. CC0.'
 },
 '3deb2fd4-66f1-4bee-abe4-08ba99257171':{
  image_url:'https://commons.wikimedia.org/wiki/Special:Redirect/file/Benfica-campeao-supertaca-2025.jpg',
  image_alt:'Jogadores do Benfica celebram a Supertaça de 2025',
  image_credit:'Sport Lisboa e Benfica / Wikimedia Commons · CC BY 3.0 · Arquivo 2025',
  image_source_url:'https://commons.wikimedia.org/wiki/File:Benfica-campeao-supertaca-2025.jpg',
  image_caption:'Equipa do Benfica campeã da Supertaça de 2025. Imagem de arquivo, não do confronto com o Omonia. Sport Lisboa e Benfica / Wikimedia Commons, CC BY 3.0.'
 },
 'bc675e3f-53d3-4292-ae8e-f19748791df0':{
  image_url:'https://commons.wikimedia.org/wiki/Special:Redirect/file/Grizzlies_vs._Thunder%2C_March_2025.png',
  image_alt:'Shai Gilgeous-Alexander dos Oklahoma City Thunder a lançar um lance livre frente aos Memphis Grizzlies, em março de 2025',
  image_credit:'Young Ru Finch / Wikimedia Commons · CC BY 3.0 · Arquivo 2025',
  image_source_url:'https://commons.wikimedia.org/wiki/File:Grizzlies_vs._Thunder,_March_2025.png',
  image_caption:'Shai Gilgeous-Alexander em ação pelos Thunder frente aos Grizzlies em março de 2025. Não é o jogo com os Nuggets. Young Ru Finch / Wikimedia Commons, CC BY 3.0; imagem reenquadrada.'
 },
 'df4b45a0-ebbc-4496-9534-680a9b8c5627':{
  image_url:'https://upload.wikimedia.org/wikipedia/commons/f/fa/SC_Braga_2011.jpg',
  image_alt:'Equipa de futebol do Sporting de Braga em 2011',
  image_credit:'Roger Gorączniak / Wikimedia Commons · CC BY 3.0 · Arquivo',
  image_source_url:'https://commons.wikimedia.org/wiki/File:SC_Braga_2011.jpg',
  image_caption:'Fotografia de arquivo do SC Braga, de 2011; não é do jogo frente ao Gent. CC BY 3.0.'
 },
 '45cf6e2f-76b3-43b9-b45b-a5c7afc8e967':{
  image_url:'https://upload.wikimedia.org/wikipedia/commons/0/05/Ferencv%C3%A1ros_starting_11_2026_Magyar_Kupa_final.jpg',
  image_alt:'Jogadores do Ferencváros antes da final da Taça da Hungria de 2026',
  image_credit:'Rakeck / Wikimedia Commons · CC BY-SA 4.0 · Arquivo 2026',
  image_source_url:'https://commons.wikimedia.org/wiki/File:Ferencv%C3%A1ros_starting_11_2026_Magyar_Kupa_final.jpg',
  image_caption:'Arquivo do Ferencváros em maio de 2026, na final da Taça da Hungria; não representa a partida frente ao Torreense. CC BY-SA 4.0.'
 },
 '91fdeb98-758c-40d3-a6a3-854e13311fd2':{
  image_url:'https://commons.wikimedia.org/wiki/Special:Redirect/file/1_tyrese_maxey_2026_%28cropped%29.jpg?width=1200',
  image_alt:'Tyrese Maxey com equipamento dos Philadelphia 76ers durante um jogo da NBA em abril de 2026',
  image_credit:'Chensiyuan / Wikimedia Commons · CC BY-SA 4.0 · Arquivo 2026',
  image_source_url:'https://commons.wikimedia.org/wiki/File:1_tyrese_maxey_2026_(cropped).jpg',
  image_caption:'Tyrese Maxey dos Philadelphia 76ers, em abril de 2026. Fotografia de arquivo, não do encontro com Cleveland. Chensiyuan / Wikimedia Commons, CC BY-SA 4.0; versão recortada.'
 },
 '58aee1c1-391b-4e7c-94ce-8d860d6369f7':{
  image_url:'https://upload.wikimedia.org/wikipedia/commons/f/f8/2011_UEFA_Europa_League_trophy_at_Museu_FC_Porto.jpg',
  image_alt:'Troféu da Liga Europa da UEFA exposto no Museu FC Porto',
  image_credit:'Threeohsix / Wikimedia Commons · CC BY-SA 4.0',
  image_source_url:'https://commons.wikimedia.org/wiki/File:2011_UEFA_Europa_League_trophy_at_Museu_FC_Porto.jpg',
  image_caption:'Imagem ilustrativa do troféu da Liga Europa exposto no Museu FC Porto; não documenta os jogos referidos no artigo. CC BY-SA 4.0.'
 },

 'b6258a6a-f536-4f4e-be1d-b30e8833156f':{
  image_url:'https://upload.wikimedia.org/wikipedia/commons/e/e6/Elenco_do_Bournemouth_abra%C3%A7ados_ap%C3%B3s_gol_de_Rayan.jpg',
  image_alt:'Jogadores do Bournemouth abraçados a celebrar um golo durante um jogo da Premier League em fevereiro de 2026',
  image_credit:'AFC Bournemouth / Wikimedia Commons · CC BY 4.0 · Arquivo 2026',
  image_source_url:'https://commons.wikimedia.org/wiki/File:Elenco_do_Bournemouth_abra%C3%A7ados_ap%C3%B3s_gol_de_Rayan.jpg',
  image_caption:'Fotografia de ação de um jogo do Bournemouth em 8 de fevereiro de 2026; NÃO representa a partida com o Milan. AFC Bournemouth / Wikimedia Commons, CC BY 4.0; enquadramento adaptado.'
 }
};
const sportsSpecificArchives={
 '00b58532-b1c5-4e44-86bb-5453c5d54525':{
  image_url:'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Chicago_Bulls_vs._Milwaukee_Bucks_April_2023_34_%28in-game_action%29.jpg/1280px-Chicago_Bulls_vs._Milwaukee_Bucks_April_2023_34_%28in-game_action%29.jpg',
  image_alt:'Chicago Bulls e Milwaukee Bucks em campo num jogo disputado em abril de 2023',
  image_credit:'Michael Barera / Wikimedia Commons · CC BY-SA 4.0 · Arquivo 2023',
  image_source_url:'https://commons.wikimedia.org/wiki/File:Chicago_Bulls_vs._Milwaukee_Bucks_April_2023_34_(in-game_action).jpg',
  image_caption:'Fotografia de arquivo de Bulls contra Bucks, em 5 de abril de 2023 (105–92). NÃO representa o jogo 132–125 desta notícia. Michael Barera / Wikimedia Commons, CC BY-SA 4.0; enquadramento adaptado ao cartão.'
 }
};

function editorialPhoto(article){
 let a=article;
 if(a.category==='Desporto'&&/photo-1771344164616-3582e4dc2f07|photo-1549210194-fb0aac030c32/.test(a.image_url||'')){
  const archived=sportsSpecificArchives[a.id]||sportsSelectedTeamPhotos[a.id];
  a=archived?{...a,...archived}:{...a,image_url:null};
 }
 try{const u=new URL(a.image_url);if(["https://www.jingolokela.com/media/riquinho-jingolokela-20261031.jpg","https://www.jingolokela.com/media/mulenvos-jingolokela-20261031.jpg"].includes(u.href)||u.protocol==='https:'&&['images.unsplash.com','images.pexels.com','upload.wikimedia.org','thumb.wikimedia.org','commons.wikimedia.org'].includes(u.hostname)||u.href==="https://scm.gov.ao/media/uploads/large_Whats_App_Image_2026_08_28_at_11_40_06_2_7d550f238d.jpeg")return {url:u.href,alt:a.image_alt||a.title,credit:a.image_credit||'',caption:a.image_caption||'Fotografia editorial de arquivo'};}catch{}
 return null;
}
function jsonld(a,canonical,image){
 return JSON.stringify({'@context':'https://schema.org','@type':'NewsArticle',headline:a.title,description:a.summary,datePublished:a.published_at,dateModified:a.updated_at||a.published_at,author:{'@type':'Organization',name:a.author||'Redação Jingolokela Para Todos'},publisher:{'@type':'NewsMediaOrganization',name:'Jingolokela Para Todos',url:ORIGIN},mainEntityOfPage:canonical,url:canonical,...(image?{image:[image]}:{})}).replace(/</g,'\\u003c');
}
async function relatedArticles(article){
 try{
  const url=new URL('/rest/v1/articles',SUPABASE_URL);
  url.search=new URLSearchParams({select:'id,title,summary,category,published_at',published:'eq.true',published_at:'lte.'+new Date().toISOString(),id:'neq.'+article.id,order:'published_at.desc',limit:'24'});
  const response=await fetch(url,{headers:{apikey:SUPABASE_KEY},signal:AbortSignal.timeout(2000)});
  if(!response.ok)return [];
  const rows=await response.json();if(!Array.isArray(rows))return [];
  const seen=new Set([article.id]);
  return rows.filter(a=>{if(!UUID.test(a.id)||!a.title||seen.has(a.id)||!Number.isFinite(Date.parse(a.published_at))||Date.parse(a.published_at)>Date.now())return false;seen.add(a.id);return true;}).sort((a,b)=>Number(b.category===article.category)-Number(a.category===article.category)).slice(0,3);
 }catch{return [];}
}
function relatedSection(article,related){
 if(!related.length)return '';
 const cards=related.map(a=>'<a class="next-story" href="/noticia/'+encodeURIComponent(a.id)+'"><span>'+esc(a.category)+' · '+esc(new Date(a.published_at).toLocaleDateString('pt-PT',{day:'numeric',month:'short'}))+'</span><h3>'+esc(a.title)+'</h3><p>'+esc(a.summary)+'</p><b>Continuar a ler ↗</b></a>').join('');
 return '<section class="next-reading" aria-labelledby="next-reading-title"><p class="category">A sua próxima leitura</p><h2 id="next-reading-title">Continue a acompanhar a atualidade</h2><div class="next-stories">'+cards+'</div><a class="all-stories" href="/arquivo.html?seccao='+encodeURIComponent(article.category)+'">Ver mais notícias de '+esc(article.category)+' ↗</a></section>';
}

function template(a,related=[]){
 const minutes=Math.max(1,Math.ceil(String(a.body||a.summary||'').trim().split(/\s+/).filter(Boolean).length/200));
 const toolbar='<div class="reading-tools" aria-label="Opções de leitura"><span>'+minutes+' min de leitura · estimativa</span><div><button id="text-smaller" type="button" aria-label="Diminuir tamanho do texto" disabled>A−</button><button id="text-larger" type="button" aria-label="Aumentar tamanho do texto">A+</button></div><a href="/feed.xml">Acompanhar por RSS ↗</a></div>';
 const canonical=ORIGIN+'/noticia/'+encodeURIComponent(a.id),photoInfo=editorialPhoto(a),image=photoInfo?.url||null,title=meta(a.title),desc=meta(a.summary);
 const paragraphs=String(a.body||a.summary||'').split(/\n\s*\n/).filter(Boolean).map(p=>'<p>'+esc(p).replace(/\n/g,'<br>')+'</p>').join('\n');
 let source='';try{const u=new URL(a.source_url);if(u.protocol==='https:')source='<p><a href="'+esc(u.href)+'" target="_blank" rel="noopener noreferrer nofollow">Consultar fonte original ↗</a></p>';}catch{}
 const date=new Date(a.published_at),dateDisplay=Number.isFinite(date.getTime())?date.toLocaleDateString('pt-PT',{day:'numeric',month:'long',year:'numeric'}):'';
 const shareMessage=encodeURIComponent(a.title+' — Jingolokela Para Todos');
 const shareLink=encodeURIComponent(canonical);
 const shareBox='<nav class="share-options" aria-label="Partilhar notícia"><strong>Partilhe esta notícia</strong><div><a href="https://api.whatsapp.com/send?text='+shareMessage+'%20'+shareLink+'" target="_blank" rel="noopener noreferrer">WhatsApp</a><a href="https://www.facebook.com/sharer/sharer.php?u='+shareLink+'" target="_blank" rel="noopener noreferrer">Facebook</a><a href="https://t.me/share/url?url='+shareLink+'&text='+shareMessage+'" target="_blank" rel="noopener noreferrer">Telegram</a><button type="button" id="native-share" hidden>Partilhar no telemóvel ↗</button><button type="button" id="copy-link">Copiar ligação</button></div><span id="copy-status" role="status"></span></nav>';
 const viewScript='<script>(function(){const link='+JSON.stringify(canonical)+';const smaller=document.getElementById("text-smaller"),larger=document.getElementById("text-larger"),story=document.querySelector(".story");let textSize=18;function resizeText(){story.style.fontSize=textSize+"px";smaller.disabled=textSize<=18;larger.disabled=textSize>=24}smaller.addEventListener("click",()=>{textSize=Math.max(18,textSize-2);resizeText()});larger.addEventListener("click",()=>{textSize=Math.min(24,textSize+2);resizeText()});const share=document.getElementById("native-share");if(typeof navigator.share==="function"){share.hidden=false;share.addEventListener("click",async()=>{try{await navigator.share({title:document.querySelector("h1").textContent,url:link})}catch(error){if(error.name!=="AbortError")document.getElementById("copy-status").textContent="Use os botões de partilha ou copie a ligação."}})}const btn=document.getElementById("copy-link");if(btn)btn.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(link);document.getElementById("copy-status").textContent="Ligação copiada."}catch{document.getElementById("copy-status").textContent=link}});const id='+JSON.stringify(a.id)+';const key="jpt-article-view-"+id;if(navigator.webdriver||/bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegrambot/i.test(navigator.userAgent)||document.visibilityState!=="visible")return;try{if(sessionStorage.getItem(key))return;sessionStorage.setItem(key,"1")}catch{}fetch('+JSON.stringify(SUPABASE_URL+'/rest/v1/rpc/record_page_view')+',{method:"POST",headers:{"Content-Type":"application/json","apikey":'+JSON.stringify(SUPABASE_KEY)+'},body:JSON.stringify({p_article_id:id}),keepalive:true}).catch(()=>{})})()</'+'script>';
 const photo=image?'<figure><img src="'+esc(image)+'" alt="'+meta(photoInfo.alt)+'" loading="eager"'+(["https://www.jingolokela.com/media/riquinho-jingolokela-20261031.jpg","https://www.jingolokela.com/media/mulenvos-jingolokela-20261031.jpg"].includes(image)?' style="object-fit:contain"':'')+'><figcaption>'+esc(photoInfo.caption)+(photoInfo.credit?' · '+esc(photoInfo.credit):'')+'</figcaption></figure>':'';
 return '<!doctype html><html lang="pt-PT"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="index,follow,max-image-preview:large"><title>'+title+' — Jingolokela Para Todos</title><meta name="description" content="'+desc+'"><link rel="alternate" type="application/rss+xml" title="Jingolokela Para Todos" href="https://www.jingolokela.com/feed.xml"><link rel="canonical" href="'+esc(canonical)+'"><meta property="og:type" content="article"><meta property="og:locale" content="pt_PT"><meta property="og:site_name" content="Jingolokela Para Todos"><meta property="og:title" content="'+title+'"><meta property="og:description" content="'+desc+'"><meta property="og:url" content="'+esc(canonical)+'"><meta property="article:published_time" content="'+esc(a.published_at)+'"><meta name="twitter:card" content="'+(image?'summary_large_image':'summary')+'"><meta name="twitter:title" content="'+title+'"><meta name="twitter:description" content="'+desc+'">'+(image?'<meta property="og:image" content="'+esc(image)+'"><meta name="twitter:image" content="'+esc(image)+'">':'')+'<script type="application/ld+json">'+jsonld(a,canonical,image)+'</script><style>:root{color-scheme:light}*{box-sizing:border-box}body{margin:0;background:#f5f8fc;color:#15243e;font:17px/1.8 system-ui,-apple-system,sans-serif}header{background:#101e35;color:#fff;padding:22px max(20px,calc((100vw - 960px)/2));display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px}header a{font-size:24px;font-weight:850;color:#fff;text-decoration:none}main{max-width:860px;margin:45px auto 75px;padding:0 22px}article{background:white;padding:clamp(20px,4vw,54px);border-radius:17px;border:1px solid #e3e8f0}h1{font-size:clamp(30px,4.7vw,51px);line-height:1.17;letter-spacing:-1.3px;margin:17px 0}h1+p{font-size:20px;line-height:1.5;color:#435673}.category{color:#b03828;letter-spacing:.13em;text-transform:uppercase;font-weight:800;font-size:12px}.date{font-size:13px;color:#607188}figure{margin:28px 0}figure img{width:100%;height:auto;max-height:530px;object-fit:cover;border-radius:10px}figcaption{font-size:12px;color:#61718a;margin-top:6px;line-height:1.6}.story p{margin:0 0 20px;white-space:normal;overflow-wrap:anywhere}.link{font-size:14px;color:#23578f}footer{text-align:center;margin:25px;color:#607188;font-size:12px}a{color:#205797}a:focus-visible,button:focus-visible{outline:3px solid #e5a83a;outline-offset:4px}.share-options{margin:30px 0;padding:21px;background:#eef3fb;border-radius:12px}.share-options strong{display:block;font-size:15px;margin-bottom:12px}.share-options div{display:flex;flex-wrap:wrap;gap:9px}.share-options a,.share-options button{display:inline-block;padding:9px 12px;background:#102e59;color:#fff;border:0;border-radius:8px;text-decoration:none;font:600 13px system-ui;cursor:pointer}.share-options span{font-size:12px;color:#375e80}.article-social{display:flex;gap:9px;flex-wrap:wrap}.article-social a{font-size:13px;font-weight:700;color:#fff;border:1px solid #687a95;border-radius:999px;padding:7px 13px;white-space:nowrap}.article-social a:hover{background:#2d4569}.article-follow{padding:22px;border:1px solid #e0e7f0;border-radius:12px;background:#f5f8fd;margin:24px 0}.article-follow strong{display:block;font-size:17px}.article-follow p{font-size:13px;color:#4c5e78;margin:5px 0 12px}.article-follow div{display:flex;gap:10px;flex-wrap:wrap}.article-follow a{display:inline-flex;gap:5px;border-radius:999px;padding:8px 14px;background:#102e59;color:white;font-size:13px;font-weight:700;text-decoration:none}.next-reading{margin:30px 0;border-top:1px solid #e0e7f0;padding-top:26px}.next-reading h2{font-size:25px;line-height:1.25;margin:8px 0 18px}.next-stories{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.next-story{display:flex;flex-direction:column;padding:17px;border:1px solid #dce5f1;border-radius:12px;text-decoration:none;color:#15243e;transition:background .15s}.next-story:hover{background:#eef3fb}.next-story span{font-size:11px;color:#607188}.next-story h3{font-size:16px;line-height:1.4;margin:10px 0}.next-story p{font-size:13px;line-height:1.5;margin:0 0 14px;color:#50627a}.next-story b{font-size:12px;color:#205797;margin-top:auto}.all-stories{display:inline-block;font-size:14px;font-weight:700;margin-top:16px}@media(max-width:680px){.next-stories{grid-template-columns:1fr}}.reading-tools{display:flex;align-items:center;flex-wrap:wrap;gap:10px;margin:22px 0;padding:12px 0;border-block:1px solid #e0e7f0;font-size:12px;color:#607188}.reading-tools>span{flex:1;min-width:150px}.reading-tools>div{display:flex;gap:6px}.reading-tools button{min-width:44px;min-height:44px;border:1px solid #dce5f1;border-radius:9px;background:#fff;color:#15243e;font-weight:700;cursor:pointer}.reading-tools button:disabled{opacity:.4;cursor:default}.reading-tools a{font-size:12px;font-weight:700}.story{font-size:18px;line-height:1.85}.share-options button[hidden]{display:none}@media(max-width:520px){main{margin:18px auto 40px}article{padding:22px}header a{font-size:20px}}</style></head><body><header><a href="/">jingolokela para todos.</a><nav class="article-social" aria-label="Segue-nos nas redes sociais"><a href="https://www.facebook.com/profile.php?id=61596112431278" target="_blank" rel="noopener noreferrer">Facebook ↗</a><a href="https://www.instagram.com/jingolokelaparatodos/" target="_blank" rel="noopener noreferrer">Instagram ↗</a></nav></header><main><article><div class="category">'+esc(a.category)+'</div><h1>'+title+'</h1><p>'+desc+'</p><p class="date">'+esc(dateDisplay)+' · '+esc(a.author||'Redação Jingolokela Para Todos')+'</p>'+toolbar+photo+'<div class="story">'+paragraphs+'</div>'+source+shareBox+relatedSection(a,related)+'<section class="article-follow" aria-label="Redes sociais oficiais"><strong>Segue o Jingolokela Para Todos</strong><p>Recebe as nossas notícias e acompanha a atualidade nas redes sociais.</p><div><a href="https://www.facebook.com/profile.php?id=61596112431278" target="_blank" rel="noopener noreferrer">Facebook ↗</a><a href="https://www.instagram.com/jingolokelaparatodos/" target="_blank" rel="noopener noreferrer">Instagram ↗</a></div></section><p><a class="link" href="/">← Voltar ao jornal</a></p></article><footer>Jingolokela Para Todos · Informação com contexto e fontes identificadas.<p><a href="/arquivo.html">Arquivo</a> · <a href="/feed.xml">RSS</a> · <a href="/sobre.html">Sobre</a> · <a href="/privacidade.html">Privacidade</a> · <a href="/contactos.html">Contactos e correções</a> · <a href="/anunciar.html">Publicidade</a></p></footer></main>'+viewScript+'</body></html>';
}
module.exports=async function handler(req,res){
 res.setHeader('Content-Type','text/html; charset=utf-8');
 res.setHeader('Cache-Control','public, max-age=0, s-maxage=180, stale-while-revalidate=300');
 res.setHeader('X-Content-Type-Options','nosniff');
 const id=typeof req.query?.id==='string'?req.query.id:'';
 if(!UUID.test(id)){res.statusCode=404;res.setHeader('X-Robots-Tag','noindex');return res.end('<h1>Notícia não encontrada</h1><a href="/">Voltar ao jornal</a>');}
 try{
  const url=new URL('/rest/v1/articles',SUPABASE_URL);url.search=new URLSearchParams({select:'id,title,summary,body,category,author,source_url,published_at,image_url,image_alt,image_credit,image_caption',id:'eq.'+id,published:'eq.true',published_at:'lte.'+new Date().toISOString(),limit:'1'});
  const response=await fetch(url,{headers:{apikey:SUPABASE_KEY},signal:AbortSignal.timeout(8000)});
  if(!response.ok)throw Error('read failure '+response.status);
  const [a]=await response.json();
  if(!a||!a.title||!a.body){res.statusCode=404;res.setHeader('X-Robots-Tag','noindex');return res.end('<h1>Notícia não encontrada</h1><a href="/">Voltar ao jornal</a>');}
  const related=await relatedArticles(a);
  res.statusCode=200;return res.end(template(a,related));
 }catch(err){res.statusCode=503;res.setHeader('X-Robots-Tag','noindex');res.setHeader('Cache-Control','no-store');return res.end('<h1>Notícia temporariamente indisponível</h1><a href="/">Voltar ao jornal</a>');}
};
