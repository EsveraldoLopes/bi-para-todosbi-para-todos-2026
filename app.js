'use strict';
const sections=['Todas','Angola','Mundo','Diáspora','Desporto','Tecnologia','Oportunidades'];
const descriptions=[['Angola','Angola no centro da nossa leitura','Cidadania, sociedade e economia: os temas que aproximam o país dos seus cidadãos.','A secção Angola será dedicada aos acontecimentos do país, com contexto, fontes identificadas e atenção às diferentes províncias.\n\nEste texto apresenta a linha editorial do portal. Não relata um acontecimento atual.'],['Mundo','Um mundo, muitas perspetivas','África, Europa, Américas, Ásia e Oceânia numa leitura em português.','O nosso acompanhamento internacional abrangerá diferentes regiões, distinguindo factos confirmados, declarações e análise.\n\nEste texto é uma apresentação editorial, não uma notícia de atualidade.'],['Diáspora','Histórias que atravessam fronteiras','As comunidades angolanas e lusófonas também fazem parte da conversa.','A diáspora terá espaço para histórias de comunidade, cultura e ligação aos países de origem. Informações práticas serão acompanhadas de fontes oficiais e datas de verificação.\n\nConteúdo de apresentação.'],['Desporto','O jogo merece mais contexto','Futebol e basquetebol, dos grandes campeonatos aos novos talentos.','Resultados, percursos e protagonistas integrarão a cobertura desportiva. As notícias distinguirão resultados confirmados, rumores de transferências e opinião.\n\nConteúdo de apresentação, sem resultados ou notícias atuais.'],['Tecnologia','Compreender a mudança digital','Inteligência artificial, cibersegurança e tecnologia no dia a dia.','Esta secção explicará tendências tecnológicas e aplicações práticas numa linguagem acessível, com atenção às fontes e às limitações das ferramentas.\n\nConteúdo de apresentação.'],['Oportunidades','Informação que abre caminhos','Formação, bolsas e oportunidades profissionais com requisitos claros.','As oportunidades publicadas deverão incluir a entidade responsável, a ligação oficial, os requisitos e o prazo. A elegibilidade dependerá sempre das condições de cada programa.\n\nEste texto não anuncia candidaturas abertas.']];
const examples=descriptions.map((a,i)=>({id:'apresentacao-'+i,category:a[0],title:a[1],summary:a[2],body:a[3],author:'Redação Notícias Para Todos',demo:true}));
const hasConfig=Boolean(window.PORTAL_CONFIG?.supabaseUrl&&window.PORTAL_CONFIG?.supabaseAnonKey);
let articles=hasConfig?[]:examples,selected=sections.find(s=>s===new URLSearchParams(location.search).get('seccao'))||'Todas';
let loading=hasConfig;
let showAll=false;
// Editorial selection remains stable when carousel photographs are added.
const leadArticleIds=["66e6eb9c-6ed9-452c-b8d7-59ae3a0ca45f", "1e50da69-331d-4c0e-917d-6dbd60764cb5", "530a563d-f1ea-400e-ba20-0f3c2fd3fb6b", "74a45a04-89db-408f-a8be-48224f81a597", "b6258a6a-f536-4f4e-be1d-b30e8833156f", "91fdeb98-758c-40d3-a6a3-854e13311fd2"];
const isLeadArticle=a=>leadArticleIds.includes(a.id);
const $=id=>document.getElementById(id);const reader=$('reader');
$('date').textContent=new Date().toLocaleDateString('pt-PT',{dateStyle:'long',timeZone:'Europe/Lisbon'});$('year').textContent=new Date().getFullYear();
const sectionCopy={Angola:['Angola, em destaque.','Sociedade, cidadania e economia: acompanhe os acontecimentos do país.'],Mundo:['O mundo, em perspetiva.','As notícias internacionais que ajudam a compreender o nosso tempo.'],Diáspora:['Ligações sem fronteiras.','Notícias das comunidades angolanas e lusófonas pelo mundo.'],Desporto:['A emoção do desporto.','Futebol, basquetebol e os protagonistas da atualidade desportiva.'],Tecnologia:['O futuro acontece agora.','Tecnologia, inteligência artificial e cibersegurança em linguagem clara.'],Oportunidades:['O próximo passo começa aqui.','Formação, bolsas e oportunidades com fontes e requisitos identificados.']};
const defaultHero=document.querySelector('h1').innerHTML;
function selectSection(section,updateUrl=true){selected=section;showAll=false;$('search').value='';if(updateUrl){const url=new URL(location.href);if(section==='Todas')url.searchParams.delete('seccao');else url.searchParams.set('seccao',section);url.hash='';history.pushState({},'',url);}render();setSlides();document.querySelector('.intro').scrollIntoView({behavior:'instant',block:'start'});}
sections.forEach(section=>{const b=document.createElement('button');b.type='button';b.dataset.section=section;b.setAttribute('aria-label',section);b.setAttribute('aria-controls','articles');const label=document.createElement('span');label.textContent=section;const count=document.createElement('span');count.className='category-count';count.setAttribute('aria-hidden','true');count.textContent='—';b.append(label,count);b.onclick=()=>selectSection(section);$('categories').append(b);});
window.addEventListener('popstate',()=>{selectSection(sections.find(s=>s===new URLSearchParams(location.search).get('seccao'))||'Todas',false);});
function updateSectionUI(total){document.querySelectorAll('#categories button').forEach(b=>{const n=articles.filter(a=>!a.demo&&(b.dataset.section==='Todas'||a.category===b.dataset.section)).length;b.setAttribute('aria-pressed',String(b.dataset.section===selected));b.querySelector('.category-count').textContent=loading?'—':String(n);b.title=b.dataset.section+' · '+n+' notícias';});const hero=document.querySelector('h1');if(selected==='Todas'){hero.innerHTML=defaultHero;document.querySelector('.lead').textContent='Atualidade, contexto e oportunidades. Um espaço em português para ligar Angola, a diáspora e o mundo.';}else{hero.textContent=sectionCopy[selected][0];document.querySelector('.lead').textContent=sectionCopy[selected][1];}document.querySelector('.markets').hidden=selected!=='Todas';$('feed-title').textContent=selected==='Todas'?'O que merece a sua atenção.':'Notícias de '+selected+'.';$('section-status').textContent=loading?'A carregar…':total+' '+(total===1?'artigo disponível':'artigos disponíveis')+(selected==='Todas'?' na edição.':' em '+selected+'.');$('show-all').textContent=selected==='Todas'?'Ver todas as notícias':'Ver todas de '+selected;$('empty').textContent=$('search').value?'Nenhum artigo corresponde à pesquisa nesta secção. Experimente outro tema.':'Ainda não há notícias publicadas nesta secção. Consulte as outras secções enquanto preparamos novos conteúdos.';$('back-all').hidden=loading||total>0||selected==='Todas';}
$('back-all').onclick=()=>selectSection('Todas');

const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function safeUrl(value){try{const u=new URL(value);return u.protocol==='https:'?u.href:null;}catch{return null;}}

// Curated licensed photographs depicting the actual club, NOT the reported match.
// They replace repeated generic stock pictures until match-specific rights are secured.
// Do not substitute historic team photographs for the event being reported.
// Editorial photos are kept only when selected for the article by the editor.
// The sports presentation module builds matchup graphics for match reports.
const repeatedStockSportPhoto=/photo-1771344164616-3582e4dc2f07|photo-1549210194-fb0aac030c32/;
// Carefully verified archive: same two teams, but a different match.
// Never label archival photos as depicting the result in this article.
// Only photographs taken during competitive matches may illustrate result stories.
// A photograph from a different match is explicitly marked as archive in its caption.
// No training sessions, portraits or press presentations.
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
function useCuratedSportsPhoto(article){
 if(article.category!=='Desporto')return article;
 // Keep any original photo specifically commissioned or selected for this article.
 const generic=!!article.image_url&&repeatedStockSportPhoto.test(article.image_url);
 if(!generic)return article;
 const archive=sportsSpecificArchives[article.id]||sportsSelectedTeamPhotos[article.id];
 if(archive)return {...article,...archive};
 // For all other sports results, prefer the actual two teams and correct score
 // to historically unrelated photos or generic stadium imagery.
 return {...article,image_url:null,image_credit:null,image_alt:null,image_source_url:null,image_caption:null};
}
function imageUrl(value){const url=safeUrl(value);if(!url)return null;const u=new URL(url);return ['images.unsplash.com','images.pexels.com','upload.wikimedia.org','thumb.wikimedia.org','commons.wikimedia.org'].includes(u.hostname)?u:null;}
function articleImage(article,eager=false){const url=imageUrl(article.image_url);if(!url)return null;const img=document.createElement('img');img.src=url.href;img.alt=article.image_alt||'Imagem relacionada com a notícia';img.loading=eager?'eager':'lazy';img.decoding='async';img.width=1200;img.height=800;img.referrerPolicy='no-referrer';if(eager)img.fetchPriority='high';return img;}
function readerImage(article){const fig=$('reader-image');fig.replaceChildren();const img=articleImage(article,true);fig.hidden=!img;if(!img)return;img.addEventListener('error',()=>{fig.hidden=true;},{once:true});const cap=document.createElement('figcaption');cap.textContent=article.image_caption||(article.image_credit?'Fotografia editorial':'Imagem ilustrativa.');if(article.image_credit){cap.append(' · ');const source=safeUrl(article.image_source_url);const credit=document.createElement(source?'a':'span');credit.textContent=article.image_credit;if(source){credit.href=source;credit.target='_blank';credit.rel='noopener noreferrer';}cap.append(credit);}fig.append(img,cap);}

async function trackView(articleId=null){
 if(!hasConfig)return;
 try{
  const endpoint=window.PORTAL_CONFIG.supabaseUrl+'/rest/v1/rpc/record_page_view';
  await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','apikey':window.PORTAL_CONFIG.supabaseAnonKey},body:JSON.stringify({p_article_id:articleId})});
 }catch(error){console.warn('Medição de audiência indisponível.');}
}
function relatedReading(article){
 const container=$('related-articles'),section=$('related-section');container.replaceChildren();
 const candidates=articles.filter(item=>item.id!==article.id&&!item.demo);
 const ranked=candidates.sort((a,b)=>Number(b.category===article.category)-Number(a.category===article.category)||(Date.parse(b.published_at)||0)-(Date.parse(a.published_at)||0)).slice(0,3);
 section.hidden=ranked.length===0;
 for(const related of ranked){const button=document.createElement('button');button.type='button';button.className='related-link';const label=document.createElement('span');label.className='related-category';label.textContent=related.category;const title=document.createElement('strong');title.textContent=related.title;button.append(label,title);button.onclick=()=>{openArticle(related);reader.scrollTo({top:0,behavior:'smooth'});};container.append(button);}
}
function openArticle(article){if(!article.demo)void trackView(article.id);const permalink=$('article-permalink');permalink.hidden=!!article.demo;permalink.href=article.demo?'#':'/noticia/'+encodeURIComponent(article.id);relatedReading(article);readerImage(article);$('reader-title').textContent=article.title;$('reader-category').textContent=article.category;$('reader-meta').textContent=article.demo?'Apresentação editorial · Redação Notícias Para Todos':`${article.author||'Redação Notícias Para Todos'} · ${new Date(article.published_at).toLocaleDateString('pt-PT')}`;$('reader-body').textContent=article.body||article.summary;const url=safeUrl(article.source_url);$('reader-source').hidden=!url;if(url)$('reader-source').href=url;$('share-status').textContent='';$('share').onclick=async()=>{const link=new URL('/noticia/'+encodeURIComponent(article.id),location.origin);try{await navigator.clipboard.writeText(link.href);$('share-status').textContent='Ligação copiada.';}catch{$('share-status').textContent='Copie esta ligação: '+link.href;}};if(!reader.open)reader.showModal();syncSlides();}
function render(){const q=normalize($('search').value);const filtered=articles.filter(a=>(selected==='Todas'||a.category===selected)&&normalize(`${a.title} ${a.summary} ${a.category}`).includes(q));updateSectionUI(filtered.length);$('articles').replaceChildren();$('empty').hidden=loading||filtered.length>0;$('show-all').hidden=filtered.length<=6||showAll;const ordered=selected==='Todas'&&!q?[...filtered.filter(isLeadArticle),...filtered.filter(a=>!isLeadArticle(a))]:filtered;const visible=showAll?ordered:ordered.slice(0,6);visible.forEach((a,i)=>{const card=document.createElement('article');card.className='article';const art=document.createElement('div');art.className='art tone'+(sections.indexOf(a.category)%6);art.setAttribute('aria-hidden','true');const icon=document.createElement('span');icon.className='art-symbol';icon.textContent=({Angola:'AO',Mundo:'↗',Diáspora:'↔',Desporto:'◎',Tecnologia:'✳',Oportunidades:'+'})[a.category]||'↗';art.append(icon);const label=document.createElement('span');label.className='label';label.textContent=a.category.toUpperCase();const number=document.createElement('span');number.className='number';number.textContent='NPT / '+String(i+1).padStart(2,'0');art.append(label,number);art.dataset.editorialPhoto=a.image_url&&a.image_credit&&a.image_source_url?'true':'false';const photo=articleImage(a,i===0);if(photo){art.classList.add('has-photo');art.removeAttribute('aria-hidden');const badge=document.createElement('span');badge.className='photo-badge';badge.textContent=a.image_caption?.toLowerCase().includes('arquivo')?'FOTOGRAFIA DE ARQUIVO':a.image_credit?'FOTOGRAFIA · '+a.image_credit:'IMAGEM EDITORIAL';art.append(photo,badge);photo.addEventListener('error',()=>{photo.remove();badge.remove();art.classList.remove('has-photo');art.dataset.editorialPhoto='false';art.setAttribute('aria-hidden','true');},{once:true});}const category=document.createElement('p');category.className='eyebrow';category.textContent=a.category;const h=document.createElement('h3');const b=document.createElement('button');b.textContent=a.title;b.onclick=()=>openArticle(a);h.append(b);const summary=document.createElement('p');summary.textContent=a.summary;const meta=document.createElement('span');meta.className='meta';meta.textContent=a.demo?'APRESENTAÇÃO EDITORIAL':'PUBLICADO · '+new Date(a.published_at).toLocaleDateString('pt-PT');card.append(art,category,h,summary,meta);$('articles').append(card);});}
function fromHash(){if(location.hash.startsWith('#artigo=')){try{const id=decodeURIComponent(location.hash.slice(8));const a=articles.find(x=>String(x.id)===id);if(a)openArticle(a);}catch{}}}
$('search').addEventListener('input',()=>{showAll=false;render();});$('show-all').onclick=()=>{showAll=true;render();};$('close-reader').onclick=()=>reader.close();window.addEventListener('hashchange',fromHash);render();
async function load(){const cfg=window.PORTAL_CONFIG||{};if(!cfg.supabaseUrl||!cfg.supabaseAnonKey){$('notice').textContent='Os artigos abaixo apresentam a linha editorial. Não são notícias de atualidade.';setSlides();fromHash();return;}try{const base=safeUrl(cfg.supabaseUrl);if(!base)throw Error('URL inválida');const url=new URL('/rest/v1/articles',base);url.search=new URLSearchParams({select:'id,title,summary,body,category,author,source_url,published_at,image_url,image_alt,image_credit,image_source_url,image_caption',published:'eq.true',published_at:'lte.'+new Date().toISOString(),order:'published_at.desc',limit:'60'});const res=await fetch(url,{headers:{apikey:cfg.supabaseAnonKey,...(cfg.supabaseAnonKey.startsWith('sb_publishable_')?{}:{Authorization:'Bearer '+cfg.supabaseAnonKey})},signal:AbortSignal.timeout(10000)});if(!res.ok)throw Error('Falha de leitura');const rows=await res.json();loading=false;articles=rows.filter(a=>a.id&&typeof a.title==='string'&&typeof a.summary==='string'&&typeof a.body==='string'&&sections.includes(a.category)&&a.category!=='Todas'&&Number.isFinite(Date.parse(a.published_at))).map(useCuratedSportsPhoto);$('notice').textContent=articles.length?'Artigos publicados pela redação. Consulte as fontes no final de cada leitura.':'A redação está a preparar as primeiras notícias. Volte em breve.';render();setSlides();fromHash();}catch{loading=false;articles=examples;render();setSlides();$('notice').textContent='Não foi possível carregar as notícias. Mostramos apenas a apresentação editorial. Tente novamente mais tarde.';fromHash();}}

// Carousel uses the full published edition; it pauses during reading and keyboard interaction.
let slides=[],slideIndex=0,slideTimer=null;
let slidePaused=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const carousel=document.querySelector('.news-carousel');
function paintSlide(){const a=slides[slideIndex];if(!a)return;$('slide-category').textContent=a.category;$('slide-title').textContent=a.title;$('slide-summary').textContent=a.summary;$('slide-counter').textContent=String(slideIndex+1).padStart(2,'0')+' / '+String(slides.length).padStart(2,'0');$('slide-open').disabled=false;$('slide-open').onclick=$('slide-title').onclick=()=>openArticle(a);const art=$('slide-art');art.replaceChildren();art.dataset.editorialPhoto=a.image_url&&a.image_credit&&a.image_source_url?'true':'false';const photo=articleImage(a,true);if(photo){photo.alt='';photo.addEventListener('error',()=>{photo.remove();art.dataset.editorialPhoto='false';document.dispatchEvent(new Event('sports-art-fallback'));},{once:true});art.append(photo);const label=document.createElement('span');label.className='slide-photo-label';label.textContent=a.image_caption?.toLowerCase().includes('arquivo')?'FOTOGRAFIA DE ARQUIVO':a.image_credit?'FOTOGRAFIA · '+a.image_credit:'IMAGEM EDITORIAL';art.append(label);}art.dataset.category=a.category;}
function syncSlides(){clearInterval(slideTimer);$('slide-toggle').textContent=slidePaused?'Reproduzir':'Pausar';$('slide-toggle').setAttribute('aria-label',slidePaused?'Reproduzir carrossel':'Pausar carrossel');$('slide-counter').setAttribute('aria-live',slidePaused?'polite':'off');if(!slidePaused&&slides.length>1&&!document.hidden&&!reader.open&&!carousel.matches(':hover')&&!carousel.contains(document.activeElement))slideTimer=setInterval(()=>{slideIndex=(slideIndex+1)%slides.length;paintSlide();},8000);}
function setSlides(){const edition=articles.filter(a=>!a.demo&&(selected==='Todas'||a.category===selected));const remaining=edition.filter(a=>!isLeadArticle(a));slides=selected==='Todas'&&remaining.length?remaining:edition;const hasSlides=slides.length>0;['slide-prev','slide-next','slide-toggle'].forEach(id=>{$(id).disabled=!hasSlides;});if(!hasSlides){$('slide-title').textContent=loading?'A carregar os destaques…':'Em breve · '+(selected==='Todas'?'Novos destaques':selected);$('slide-title').onclick=null;$('slide-title').disabled=true;$('slide-summary').textContent='Estamos a preparar notícias para esta secção. Explore as restantes secções do portal.';$('slide-open').disabled=true;$('slide-counter').textContent='0 / 0';$('slide-category').textContent=selected==='Todas'?'A nossa edição':selected;$('slide-art').replaceChildren();clearInterval(slideTimer);return;}$('slide-title').disabled=false;slideIndex=0;paintSlide();syncSlides();}

$('slide-prev').onclick=()=>{if(!slides.length)return;slideIndex=(slideIndex-1+slides.length)%slides.length;paintSlide();syncSlides();};
$('slide-next').onclick=()=>{if(!slides.length)return;slideIndex=(slideIndex+1)%slides.length;paintSlide();syncSlides();};
$('slide-toggle').onclick=()=>{slidePaused=!slidePaused;syncSlides();};
carousel.addEventListener('mouseenter',syncSlides);carousel.addEventListener('mouseleave',syncSlides);carousel.addEventListener('focusin',syncSlides);carousel.addEventListener('focusout',()=>queueMicrotask(syncSlides));document.addEventListener('visibilitychange',syncSlides);reader.addEventListener('close',syncSlides);reader.addEventListener('toggle',syncSlides);

// Official TradingView widget: source handles updates, trading sessions and data delays.
const marketConfig={colorTheme:'light',dateRange:'1D',locale:'pt',isTransparent:true,showFloatingTooltip:true,showSymbolLogo:true,showChart:true,width:'100%',height:520,plotLineColorGrowing:'#315acc',plotLineColorFalling:'#db4a36',gridLineColor:'rgba(20,34,59,0.06)',scaleFontColor:'#526078',belowLineFillColorGrowing:'rgba(49,90,204,0.12)',belowLineFillColorFalling:'rgba(219,74,54,0.12)',tabs:[{title:'Commodities',symbols:[{s:'TVC:UKOIL',d:'Petróleo Brent'},{s:'TVC:USOIL',d:'Petróleo WTI'},{s:'TVC:GOLD',d:'Ouro'},{s:'TVC:SILVER',d:'Prata'},{s:'CAPITALCOM:COPPER',d:'Cobre (CFD)'}]},{title:'Índices globais',symbols:[{s:'FOREXCOM:SPXUSD',d:'S&P 500 (CFD)'},{s:'FOREXCOM:NSXUSD',d:'Nasdaq 100 (CFD)'},{s:'INDEX:DEU40',d:'DAX · Alemanha'},{s:'FOREXCOM:UKXGBP',d:'FTSE 100 (CFD)'},{s:'INDEX:NKY',d:'Nikkei · Japão'}]},{title:'Câmbio',symbols:[{s:'FX:EURUSD',d:'Euro / Dólar'},{s:'FX:GBPUSD',d:'Libra / Dólar'},{s:'FX:USDJPY',d:'Dólar / Iene'},{s:'FX:USDCAD',d:'Dólar / Dólar canadiano'}]}]};
const marketScript=document.createElement('script');marketScript.src='https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js';marketScript.async=true;marketScript.textContent=JSON.stringify(marketConfig);marketScript.onerror=()=>{$('market-status').textContent='O painel não está disponível. Consulte os mercados na ligação TradingView.';};$('market-widget').append(marketScript);
new MutationObserver((_,observer)=>{const frame=$('market-widget').querySelector('iframe');if(frame){frame.title='Gráfico de commodities, índices globais e câmbio — TradingView';frame.addEventListener('load',()=>{$('market-status').textContent='Painel fornecido por TradingView. Se um símbolo estiver indisponível, escolha outro instrumento.';},{once:true});observer.disconnect();}}).observe($('market-widget'),{childList:true,subtree:true});


// Public campaigns are read from a sanitized, read-only table. Commercial notes
// and negotiated prices are never returned to readers.
async function displayApprovedAds(){
 const cfg=window.PORTAL_CONFIG||{};
 if(!cfg.supabaseUrl||!cfg.supabaseAnonKey)return;
 try{
  const base=safeUrl(cfg.supabaseUrl);if(!base)return;
  const endpoint=new URL('/rest/v1/ad_publications',base);
  endpoint.search=new URLSearchParams({select:'campaign_id,advertiser,title,placement,destination_url,image_url,start_date,end_date',order:'start_date.desc',limit:'50'});
  const response=await fetch(endpoint,{headers:{apikey:cfg.supabaseAnonKey,...(cfg.supabaseAnonKey.startsWith('sb_publishable_')?{}:{Authorization:'Bearer '+cfg.supabaseAnonKey})},signal:AbortSignal.timeout(10000)});
  if(!response.ok)return;
  const campaigns=await response.json();
  const today=new Date().toISOString().slice(0,10);
  for(const placement of ['hero','between_sections']){
   const slot=document.querySelector('[data-ad-placement="'+placement+'"]');
   if(!slot)continue;
   const ad=campaigns.find(c=>c.placement===placement&&c.start_date<=today&&c.end_date>=today&&safeUrl(c.destination_url)?.startsWith('https://')&&c.title&&c.advertiser);
   if(!ad)continue;
   const link=safeUrl(ad.destination_url);if(!link)continue;
   const tag=document.createElement('span');tag.className='ad-tag';tag.textContent='PUBLICIDADE · CONTEÚDO PATROCINADO';
   const detail=document.createElement('div');detail.className='ad-live-copy';
   const title=document.createElement('p');title.textContent=ad.title;
   const company=document.createElement('span');company.textContent='Anunciante: '+ad.advertiser;
   detail.append(title,company);
   if(ad.image_url){
    const imageUrl=safeUrl(ad.image_url);
    if(imageUrl&&imageUrl.startsWith('https://')){const photo=document.createElement('img');photo.className='ad-live-image';photo.src=imageUrl;photo.alt='Publicidade de '+ad.advertiser;photo.loading='lazy';photo.referrerPolicy='no-referrer';detail.prepend(photo);}
   }
   const action=document.createElement('a');action.href=link;action.target='_blank';action.rel='sponsored noopener noreferrer nofollow';action.textContent='Conhecer o anunciante ↗';
   slot.replaceChildren(tag,detail,action);
   slot.setAttribute('aria-label','Publicidade de '+ad.advertiser);
  }
 }catch(error){console.warn('Publicidade indisponível. Os espaços promocionais mantêm-se disponíveis.');}
}

setSlides();void trackView();load();
void displayApprovedAds();
