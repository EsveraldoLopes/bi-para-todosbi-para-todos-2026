'use strict';
(() => {
  const PAGE_SIZE=12;
  const categories=['Angola','Mundo','Diáspora','Desporto','Tecnologia','Oportunidades'];
  const form=document.getElementById('archive-form'),query=document.getElementById('archive-query'),category=document.getElementById('archive-category');
  const results=document.getElementById('archive-results'),status=document.getElementById('archive-status'),more=document.getElementById('archive-more');
  let generation=0,controller=null,cursor=null,totalShown=0,hasMore=false,active={};
  const params=new URLSearchParams(location.search);query.value=(params.get('q')||'').slice(0,120);category.value=categories.includes(params.get('seccao'))?params.get('seccao'):'';
  function quotedPattern(value){return '"*'+value.replace(/\\/g,'\\\\').replace(/"/g,'\\"').replace(/[\*%_]/g,'\\$&')+'*"';}
  function requestUrl(config,filters,after){
    const base=new URL(config.supabaseUrl);if(base.protocol!=='https:')throw Error('Configuration invalide');
    const url=new URL('/rest/v1/articles',base);
    url.search=new URLSearchParams({select:'id,title,summary,category,published_at,image_url,image_alt',published:'eq.true',published_at:'lte.'+filters.asOf,order:'published_at.desc,id.desc',limit:String(PAGE_SIZE+1)});
    if(filters.category)url.searchParams.set('category','eq.'+filters.category);
    const conditions=[];
    if(filters.query){const pattern=quotedPattern(filters.query);conditions.push('or(title.ilike.'+pattern+',summary.ilike.'+pattern+')');}
    if(after)conditions.push('or(published_at.lt.'+after.published_at+',and(published_at.eq.'+after.published_at+',id.lt.'+after.id+'))');
    if(conditions.length)url.searchParams.set('and','('+conditions.join(',')+')');
    return url;
  }
  function safeImage(value){try{const u=new URL(value);return u.protocol==='https:'&&u.hostname==='images.unsplash.com'?u.href:null;}catch{return null;}}
  function card(article){
    const el=document.createElement('article');el.className='archive-card';
    const href='/noticia/'+encodeURIComponent(article.id),visual=document.createElement('a');visual.href=href;visual.tabIndex=-1;visual.setAttribute('aria-hidden','true');
    const placeholder=()=>{const p=document.createElement('span');p.className='archive-placeholder';p.textContent=article.category;visual.replaceChildren(p);};
    const image=safeImage(article.image_url);
    if(image){const img=document.createElement('img');img.src=image;img.alt=article.image_alt||'';img.loading='lazy';img.width=640;img.height=360;img.addEventListener('error',placeholder,{once:true});visual.append(img);}else placeholder();
    const body=document.createElement('div');body.className='archive-card-body';const tag=document.createElement('p');tag.className='eyebrow';tag.textContent=article.category;
    const title=document.createElement('h3'),link=document.createElement('a');link.href=href;link.textContent=article.title;title.append(link);
    const summary=document.createElement('p');summary.textContent=article.summary;
    const date=document.createElement('time');date.dateTime=article.published_at;date.textContent=new Date(article.published_at).toLocaleDateString('pt-PT',{dateStyle:'long',timeZone:'Europe/Lisbon'});
    body.append(tag,title,summary,date);el.append(visual,body);return el;
  }
  async function load(reset=false){
    if(reset){generation++;controller?.abort();cursor=null;totalShown=0;hasMore=false;active={query:query.value.trim(),category:category.value,asOf:new Date().toISOString()};results.replaceChildren();more.hidden=true;}
    const current=generation;controller=new AbortController();const ownController=controller;
    results.setAttribute('aria-busy','true');more.disabled=true;status.textContent='A carregar notícias…';
    try{
      const config=window.PORTAL_CONFIG;if(!config?.supabaseUrl||!config?.supabaseAnonKey)throw Error('Configuração indisponível');
      const headers={apikey:config.supabaseAnonKey};if(!config.supabaseAnonKey.startsWith('sb_publishable_'))headers.Authorization='Bearer '+config.supabaseAnonKey;
      const response=await fetch(requestUrl(config,active,cursor),{headers,signal:AbortSignal.any([ownController.signal,AbortSignal.timeout(12000)])});
      if(!response.ok)throw Error('Não foi possível consultar o arquivo');const rows=await response.json();if(!Array.isArray(rows))throw Error('Resposta inválida');if(current!==generation)return;
      if(rows.some(a=>!a.id||typeof a.title!=='string'||!categories.includes(a.category)||!Number.isFinite(Date.parse(a.published_at))))throw Error('Notícia inválida');
      hasMore=rows.length>PAGE_SIZE;const page=rows.slice(0,PAGE_SIZE);results.append(...page.map(card));totalShown+=page.length;if(page.length)cursor=page[page.length-1];
      status.textContent=totalShown+' '+(totalShown===1?'notícia encontrada':'notícias encontradas')+(hasMore?' · há mais para explorar':'');
      if(!totalShown){const p=document.createElement('p');p.className='archive-empty';p.textContent='Não encontrámos notícias para estes filtros. Experimente outro tema ou escolha todas as secções.';results.append(p);}
      more.hidden=!hasMore;more.textContent='Carregar notícias anteriores ↓';
    }catch(error){if(current!==generation||ownController.signal.aborted)return;status.textContent=totalShown?'As notícias já carregadas continuam disponíveis. Não foi possível carregar mais.':'Não foi possível carregar o arquivo. Tente novamente.';more.hidden=false;more.textContent='Tentar novamente ↻';}
    finally{if(current===generation){results.setAttribute('aria-busy','false');more.disabled=false;}}
  }
  function syncUrl(){const u=new URL(location.href);u.search='';if(query.value.trim())u.searchParams.set('q',query.value.trim());if(category.value)u.searchParams.set('seccao',category.value);history.replaceState({},'',u);}
  form.addEventListener('submit',event=>{event.preventDefault();syncUrl();void load(true);});
  document.getElementById('archive-clear').addEventListener('click',()=>{query.value='';category.value='';syncUrl();void load(true);});
  more.addEventListener('click',()=>{void load(totalShown===0);});
  void load(true);
})();
