'use strict';
/* Sports data: ESPN's public-facing but undocumented feeds. Unofficial,
   potentially rate-limited; no fabricated scores or persistent visitor IDs. */
(()=>{
const section=document.getElementById('sports-live');
if(!section)return;
const $=id=>document.getElementById(id);
const LEAGUES=[
 ['soccer','uefa.nations','Liga das Nações UEFA'],['soccer','caf.nations_qual','Qualificação para a CAN'],
 ['soccer','fifa.friendly','Amigáveis de seleções'],['soccer','uefa.wchampions','Liga dos Campeões feminina'],
 ['soccer','por.1','Liga Portugal'],['soccer','eng.1','Premier League'],
 ['soccer','esp.1','LaLiga'],['soccer','uefa.champions','Champions League'],
 ['soccer','ita.1','Serie A'],['soccer','ger.1','Bundesliga'],
 ['basketball','nba','NBA'],['basketball','wnba','WNBA'],
 ['hockey','nhl','NHL'],['football','nfl','NFL'],['baseball','mlb','MLB']
];
const SPORT={soccer:'Futebol',basketball:'Basquetebol',hockey:'Hóquei no gelo',football:'Futebol americano',baseball:'Basebol'};
let footballAvailable=false;
let all=[],currentFilter='all',lastFetch=0,pending=false;
const knownTeams=[];
function addTeam(team){if(!team||!team.displayName)return;const key=normal(team.displayName);if(!knownTeams.some(t=>normal(t.displayName)===key))knownTeams.push(team);}
const MIN_DELAY=180000,REFRESH_INTERVAL=180000;
const normal=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt').replace(/[^a-z0-9]+/g,' ').trim();
function safeLogo(value){try{const u=new URL(value);return u.protocol==='https:'&&/^(?:a\.espncdn\.com|cdn\.espn\.com|a\.espn\.com)$/.test(u.hostname)?u.href:null;}catch{return null;}}
function teamName(o){return o?.team?.shortDisplayName||o?.team?.displayName||o?.team?.name||'Equipa';}
function getEvents(feed,sport,league){
 return (Array.isArray(feed?.events)?feed.events:[]).map(e=>{
 const c=e.competitions?.[0],teams=c?.competitors;
 if(!Array.isArray(teams)||teams.length!==2)return null;
 const home=teams.find(x=>x.homeAway==='home')||teams[1],away=teams.find(x=>x.homeAway==='away')||teams[0];
 if(!home||!away)return null;
 addTeam(home.team);addTeam(away.team);
 const state=e.status?.type?.state||'pre',description=e.status?.type?.shortDetail||'';
 const date=Date.parse(e.date||c.date);
 if(!Number.isFinite(date))return null;
 return {id:String(e.id),sport,league,date,state,detail:description,home,away,
  link:'https://www.espn.com/'+(sport==='soccer'?'soccer':sport==='basketball'?'nba':sport==='hockey'?'nhl':sport==='football'?'nfl':'mlb')+'/scoreboard'};
 }).filter(Boolean);
}
const timeFmt=new Intl.DateTimeFormat('pt-PT',{hour:'2-digit',minute:'2-digit',timeZone:'Europe/Lisbon'});
function statusOf(e){if(e.state==='in')return e.detail?'Em direto · '+e.detail:'Em direto';if(e.state==='post')return 'Final';return timeFmt.format(e.date);}
function scoreOf(c,e){return e.state==='pre'?'–':String(c.score??'–');}
function crest(team){const href=safeLogo(team?.team?.logo||team?.team?.logos?.[0]?.href);if(!href)return null;const img=document.createElement('img');img.src=href;img.alt='Emblema de '+teamName(team);img.loading='lazy';img.decoding='async';img.referrerPolicy='no-referrer';return img;}
function render(){
 const list=$('sports-scores');list.replaceChildren();
 const selected=all.filter(e=>currentFilter==='all'||(currentFilter==='other'?!['soccer','basketball'].includes(e.sport):e.sport===currentFilter));
 selected.sort((a,b)=>(a.state==='in'?0:a.state==='pre'?1:2)-(b.state==='in'?0:b.state==='pre'?1:2)||a.date-b.date);
 const visible=selected.slice(0,10);
 if(!visible.length){const p=document.createElement('p');p.textContent=currentFilter==='soccer'&&!footballAvailable?'Não foi possível consultar os jogos de futebol.':'Sem jogos nas competições acompanhadas para hoje.';list.append(p);return;}
 for(const e of visible){
  const card=document.createElement('article');card.className='sports-game';
  const top=document.createElement('div');top.className='sports-game-top';
  const league=document.createElement('span');league.textContent=SPORT[e.sport]+' · '+e.league;
  const status=document.createElement('span');status.className=e.state==='in'?'sports-live-now':'sports-game-status';status.textContent=statusOf(e);top.append(league,status);
  const matchup=document.createElement('div');matchup.className='sports-matchup';
  for(const t of [e.away,e.home]){const side=document.createElement('div');side.className='sports-team';const logo=crest(t);if(logo)side.append(logo);const name=document.createElement('span');name.textContent=teamName(t);side.append(name);const score=document.createElement('strong');score.textContent=scoreOf(t,e);side.append(score);matchup.append(side);}
  card.append(top,matchup);list.append(card);
 }
}
function matchTeams(text,e){
 if(e.sport!=='soccer'&&e.sport!=='basketball'&&e.sport!=='hockey'&&e.sport!=='baseball'&&e.sport!=='football')return false;
 const title=normal(text);
 return [e.home,e.away].every(c=>{
  const team=c.team||{};
  const aliases=[team.displayName,team.shortDisplayName,team.name].filter(Boolean).map(normal).filter(n=>n.length>=4);
  return aliases.some(n=>title.includes(n));
 });
}
function parseMatchReport(title){
 const text=String(title||'').trim();
 const score=text.match(/\b(\d{1,3})\s*[–—-]\s*(\d{1,3})\b/);
 const draw=text.match(/^(.{2,50}?)\s+e\s+(.{2,50}?)\s+(?:empataram|empatam|ficaram empatados)\b/i);
 if(draw){
  const names=[draw[1].trim(),draw[2].trim()];
  if(names.some(x=>x.length<3||x.length>52))return null;
  const tied=text.match(/empatam\s+a\s+(um|uma|dois|duas|tr[eê]s|quatro|\d+)/i);
  const words={um:1,uma:1,dois:2,duas:2,'três':3,tres:3,quatro:4};
  const value=tied?(Number(tied[1])||words[normal(tied[1])]||null):null;
  return {names,score:value===null?null:[value,value]};
 }
 const won=text.match(/^(.{2,50}?)\s+(?:vence|vencem|derrota|derrotam|bate|batem|supera|superam)\s+(.{2,52}?)(?=\s+por\s+|\s+na\s+|\s+no\s+|\s+ap[oó]s\s+|$)/i);
 if(won){
  const names=[won[1].trim(),won[2].trim()];
  if(names.some(x=>x.length<3||x.length>52))return null;
  return {names,score:score?[Number(score[1]),Number(score[2])]:null};
 }
 const lost=text.match(/^(.{2,50}?)\s+(?:perde|perdem)\s+por\s+\d{1,3}\s*[–—-]\s*\d{1,3}\s+(?:com|frente\s+a|contra)\s+(.{2,52}?)\s*$/i);
 if(lost&&score){
  const names=[lost[1].trim(),lost[2].trim().replace(/^(?:o|a|os|as)\s+/i,'')];
  if(names.some(x=>x.length<3||x.length>52))return null;
  return {names,score:[Number(score[2]),Number(score[1])]};
 }
 return null;
}
function namesFromHeadline(title){return parseMatchReport(title)?.names||null;}
function findKnownTeam(name){
 const needle=normal(name);
 if(needle.length<3)return null;
 const knownAliases={
  'philadelphia':'philadelphia 76ers','cleveland':'cleveland cavaliers',
  'thunder':'oklahoma city thunder','nuggets':'denver nuggets',
  'bulls':'chicago bulls','bucks':'milwaukee bucks',
  'benfica':'sl benfica','braga':'sc braga',
  'nottingham forest':'nottingham forest','ipswich':'ipswich town',
  'ferencvaros':'ferencvarosi tc','bournemouth':'afc bournemouth',
  'milan':'ac milan','gent':'kaa gent','omonia':'omonia nicosia'
 };
 const canonical=knownAliases[needle]||needle;
 return knownTeams.find(t=>[t.displayName,t.shortDisplayName,t.name,t.abbreviation,t.nickname]
  .filter(Boolean).some(alias=>normal(alias)===needle||normal(alias)===canonical))||null;
}
async function loadTeamCatalogue(){
 // Fetch verified team badges only for supported leagues; never guess image filenames.
 const target=[['soccer','eng.1'],['soccer','por.1'],['soccer','esp.1'],['soccer','ger.1'],['soccer','ita.1'],['basketball','nba']];
 const responses=await Promise.allSettled(target.map(async ([sport,league])=>{
  const control=new AbortController();const timeout=setTimeout(()=>control.abort(),8000);
  try{const url='https://site.api.espn.com/apis/site/v2/sports/'+sport+'/'+league+'/teams?limit=100';
  const response=await fetch(url,{signal:control.signal});if(!response.ok)return;
  const body=await response.json();
  for(const group of body?.sports||[])for(const l of group?.leagues||[])for(const entry of l?.teams||[])addTeam(entry.team);
  }finally{clearTimeout(timeout);}
 }));
 scheduleEnrich();
}
function artForArticle(title,container){
 if(!container)return;
 // A licensed, credited real photo takes precedence over generated team graphics.
 if(container.dataset.editorialPhoto==='true')return;
 const match=all.find(e=>matchTeams(title,e));
 const report=parseMatchReport(title);
 const names=report?.names||(match?[teamName(match.away),teamName(match.home)]:null);
 const verified=names?names.map(findKnownTeam):[];
 if(!names)return;
 const key=title+':'+(match?.id||'headline')+':'+verified.map(t=>t?.id||'').join('/');
 if(container.dataset.sportsMatch===key)return;
 container.dataset.sportsMatch=key;
 container.classList.add('sports-teams-art');container.classList.remove('has-photo');
 container.replaceChildren();
 const strip=document.createElement('div');strip.className='sports-teams-strip';
 names.forEach((name,i)=>{
  const box=document.createElement('div');box.className='sports-teams-logo';
  const logoTeam=verified[i];const badge=logoTeam?crest({team:logoTeam}):null;
  if(badge)box.append(badge);
  else {const monogram=document.createElement('span');monogram.className='sports-team-monogram';monogram.textContent=name.split(/\s+/).map(p=>p[0]).slice(0,2).join('').toLocaleUpperCase('pt');box.append(monogram);}
  const label=document.createElement('span');label.textContent=name;box.append(label);strip.append(box);
 });
 const separator=document.createElement('span');separator.className='sports-vs';
 separator.textContent=report?.score?report.score.join(' – '):'×';
 if(report?.score)separator.classList.add('sports-result-score');
 strip.insertBefore(separator,strip.children[1]);
 const note=document.createElement('span');note.className='sports-teams-note';
 note.textContent=report?.score?'RESULTADO INDICADO NO TÍTULO · ILUSTRAÇÃO EDITORIAL':verified.every(Boolean)?'EMBLEMAS DAS EQUIPAS · DADOS ESPN':'EQUIPAS REFERIDAS NA NOTÍCIA · ILUSTRAÇÃO EDITORIAL';
 container.append(strip,note);container.removeAttribute('aria-hidden');
}
function enrichArticles(){
 for(const card of document.querySelectorAll('#articles .article')){
  const heading=card.querySelector('h3 button')?.textContent||'';
  const category=card.querySelector('.eyebrow')?.textContent;
  if(category==='Desporto')artForArticle(heading,card.querySelector('.art'));
 }
 const active=document.getElementById('slide-title')?.textContent||'';
 if(document.getElementById('slide-category')?.textContent==='Desporto')artForArticle(active,$('slide-art'));
}
let enrichmentQueued=false;
function scheduleEnrich(){if(enrichmentQueued)return;enrichmentQueued=true;requestAnimationFrame(()=>{enrichmentQueued=false;enrichArticles();});}
new MutationObserver(scheduleEnrich).observe($('articles'),{childList:true,subtree:true});
new MutationObserver(scheduleEnrich).observe($('slide-title'),{childList:true});
document.addEventListener('sports-art-fallback',scheduleEnrich);
scheduleEnrich();
void loadTeamCatalogue();
$('sports-explore').onclick=()=>{[...document.querySelectorAll('#categories button')].find(b=>b.textContent.includes('Desporto'))?.click();document.getElementById('articles').scrollIntoView({behavior:'smooth'});};
const dayKey=date=>new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Lisbon',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date).filter(p=>p.type!=='literal').map(p=>p.value).join('');
const make=(tag,value)=>{const node=document.createElement(tag);if(value)node.textContent=value;return node;};
const highlights=make('section');
highlights.hidden=true;highlights.setAttribute('aria-label','Destaques do Desporto');
highlights.style.cssText='margin-top:20px;min-width:0';
const copy=document.querySelector('.sports-showcase-copy');
copy?.append(highlights);
function renderHighlights(){
 const items=articles.filter(a=>!a.demo&&a.category==='Desporto'&&!a._fallbackPhoto&&hasSlidePhoto(a)&&dayKey(Date.parse(a.published_at))===dayKey(Date.now()))
  .sort((a,b)=>Date.parse(b.published_at)-Date.parse(a.published_at));
 highlights.replaceChildren();highlights.hidden=true;
 const title=make('h3','Destaques do Desporto'),frame=make('div'),counter=make('span');
 const prev=make('button','Anterior'),next=make('button','Seguinte');
 prev.type=next.type='button';counter.setAttribute('aria-live','polite');
 const controls=make('div');controls.style.cssText='display:flex;gap:10px;align-items:center;flex-wrap:wrap';controls.append(prev,counter,next);
 highlights.append(title,frame,controls);
 let index=0,request=0;
 function paint(step=1){
  if(!items.length){highlights.hidden=true;return;}
  const a=items[index],token=++request,img=articleImage(a,true);
  const ready=()=>{
   if(token!==request||!frame.isConnected)return;
   img.style.cssText='display:block;width:100%;height:auto;border-radius:12px';
   const link=make('a',a.title);link.href='/noticia/'+encodeURIComponent(a.id);
   const credit=make('small',[a.image_credit,a.image_caption].filter(Boolean).join(' · '));
   frame.replaceChildren(img,make('h4'),credit);frame.children[1].append(link);
   highlights.hidden=false;counter.textContent=(index+1)+' / '+Math.min(items.length,10);
   prev.disabled=next.disabled=items.length<2;
  };
  const fail=()=>{if(token!==request||!frame.isConnected)return;items.splice(index,1);if(items.length){index=(index+(step<0?-1:0)+items.length)%items.length;paint(step);}else highlights.hidden=true;};
  if(!img){fail();return;}
  if(img.complete){if(img.naturalWidth)ready();else fail();}
  else{img.addEventListener('load',ready,{once:true});img.addEventListener('error',fail,{once:true});}
 }
 items.splice(10);
 prev.onclick=()=>{index=(index-1+items.length)%items.length;paint(-1);};
 next.onclick=()=>{index=(index+1)%items.length;paint();};
 paint();
}
new MutationObserver(renderHighlights).observe($('articles'),{childList:true});
renderHighlights();
const tables=make('section'),toggle=make('button','Ver classificações'),chooser=make('select'),tableBody=make('div');
const scores=$('sports-scores'),scoreStatus=$('sports-status'),scoreRefresh=$('sports-refresh');
tables.className='sports-standings';
tables.id='sports-standings';
tables.hidden=true;
tables.setAttribute('aria-label','Classificações');
toggle.type='button';
toggle.className='sports-standings-toggle';
toggle.setAttribute('aria-controls',tables.id);
toggle.setAttribute('aria-expanded','false');
tableBody.className='sports-standings-body';
tableBody.tabIndex=0;
tableBody.setAttribute('role','region');
tableBody.setAttribute('aria-label','Tabela de classificação');
chooser.setAttribute('aria-label','Competição para classificação');
tables.append(chooser,tableBody);
scores.before(toggle,tables);
toggle.addEventListener('click',()=>{
 const show=tables.hidden;
 tables.hidden=!show;
 scores.hidden=scoreStatus.hidden=scoreRefresh.hidden=show;
 toggle.textContent=show?'Voltar aos jogos em direto':'Ver classificações';
 toggle.setAttribute('aria-expanded',String(show));
 if(show)void loadStandings();
 else void refresh();
});
let standingsToken=0;
const standingsCache=new Map();
function configureStandings(){
 const sport=currentFilter==='all'?'soccer':currentFilter;
 const eligible=LEAGUES.filter(([kind,key])=>!key.includes('friendly')&&(sport==='other'?!['soccer','basketball'].includes(kind):sport===kind));
 const previous=chooser.value;
 chooser.replaceChildren(...eligible.map(([kind,key,label])=>new Option(label,kind+'/'+key)));
 if(eligible.some(([kind,key])=>kind+'/'+key===previous))chooser.value=previous;
 else if(sport==='soccer')chooser.value='soccer/por.1';
 if(!tables.hidden)void loadStandings();
}
function standingsGroups(feed){
 if(feed?.standings?.entries?.length)return [feed];
 return (feed?.children||[]).flatMap(standingsGroups);
}
async function loadStandings(){
 const key=chooser.value,token=++standingsToken;
 tableBody.textContent='A consultar a classificação…';
 try{
  let entry=standingsCache.get(key);
  if(!entry||Date.now()-entry.at>15*60000){
   const response=await fetch('https://site.api.espn.com/apis/v2/sports/'+key+'/standings',{signal:AbortSignal.timeout(8500)});
   if(!response.ok)throw Error('Indisponível');
   entry={at:Date.now(),groups:standingsGroups(await response.json())};
   if(!entry.groups.length)throw Error('Sem dados');
   standingsCache.set(key,entry);
  }
  if(token!==standingsToken)return;
  tableBody.replaceChildren();
  for(const group of entry.groups){
   const table=make('table'),head=table.createTHead().insertRow(),body=table.createTBody();
   const entries=group.standings.entries,fields=[['J','gamesPlayed'],['V','wins'],['D','losses'],['Pts','points'],['% V','winPercent']]
    .filter(([,name])=>(name!=='points'||key.startsWith('soccer/')||key.startsWith('hockey/'))&&entries.some(e=>e.stats?.some(x=>x.name===name)));
   for(const label of ['Equipa',...fields.map(([label])=>label)]){const th=make('th',label);th.scope='col';head.append(th);}
   for(const e of entries){
    const row=body.insertRow();row.insertCell().textContent=teamName(e);
    for(const [,name] of fields)row.insertCell().textContent=e.stats?.find(x=>x.name===name)?.displayValue??'—';
   }
   const caption=table.createCaption();caption.textContent=group.name||chooser.selectedOptions[0]?.textContent||'Classificação';
   table.style.cssText='width:100%;text-align:left;margin:10px 0;font-size:.85rem';
   tableBody.append(table);
  }
  tableBody.append(make('small','Fonte: ESPN'));
 }catch{if(token===standingsToken)tableBody.textContent='Classificação indisponível para esta competição.';}
}
chooser.onchange=loadStandings;
async function refresh(force=false){
 if(pending||document.hidden)return;
 if(!force&&Date.now()-lastFetch<MIN_DELAY)return;
 pending=true;$('sports-status').textContent='A atualizar resultados reais…';
 const day=dayKey(Date.now());
 const settled=await Promise.allSettled(LEAGUES.map(async([sport,league,label])=>{
  const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),8500);
  try{const url='https://site.api.espn.com/apis/site/v2/sports/'+sport+'/'+league+'/scoreboard?dates='+day;
   const response=await fetch(url,{signal:controller.signal,cache:'no-store'});if(!response.ok)throw Error('Indisponível');
   return {sport,events:getEvents(await response.json(),sport,label).filter(e=>dayKey(e.date)===day)};
  }finally{clearTimeout(timeout);}
 }));
 const success=settled.filter(r=>r.status==='fulfilled');
 footballAvailable=success.some(r=>r.value.sport==='soccer');
 if(success.length){const seen=new Set();all=success.flatMap(r=>r.value.events).filter(e=>{const key=e.sport+'/'+e.id;if(seen.has(key))return false;seen.add(key);return true;});lastFetch=Date.now();render();scheduleEnrich();}
 const now=new Intl.DateTimeFormat('pt-PT',{hour:'2-digit',minute:'2-digit',timeZone:'Europe/Lisbon'}).format(new Date());
 $('sports-status').textContent=success.length?'Fonte: ESPN (dados externos, atualização '+now+' Lisboa). Pode haver atrasos ou ligas indisponíveis. Atualização automática enquanto esta área está visível.':'Não foi possível obter os resultados em tempo real. Volte a tentar. Não são apresentados marcadores fictícios.';
 pending=false;
}
for(const button of document.querySelectorAll('[data-sport-filter]'))button.addEventListener('click',()=>{
 currentFilter=button.dataset.sportFilter;
 for(const b of document.querySelectorAll('[data-sport-filter]'))b.setAttribute('aria-pressed',String(b===button));
 render();configureStandings();
});
$('sports-refresh').addEventListener('click',()=>refresh(true));
let visible=false;
const observer=new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);if(visible)void refresh();},{rootMargin:'600px'});
observer.observe(section);
configureStandings();
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&visible)void refresh();});
setInterval(()=>{if(visible&&!document.hidden)void refresh();},REFRESH_INTERVAL);
})();
