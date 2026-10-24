'use strict';
/* Sports data: ESPN's public-facing but undocumented feeds. Unofficial,
   potentially rate-limited; no fabricated scores or persistent visitor IDs. */
(()=>{
const section=document.getElementById('sports-live');
if(!section)return;
const $=id=>document.getElementById(id);
const LEAGUES=[
 ['soccer','por.1','Liga Portugal'],['soccer','eng.1','Premier League'],
 ['soccer','esp.1','LaLiga'],['soccer','uefa.champions','Champions League'],
 ['soccer','ita.1','Serie A'],['soccer','ger.1','Bundesliga'],
 ['basketball','nba','NBA'],['basketball','wnba','WNBA'],
 ['hockey','nhl','NHL'],['football','nfl','NFL'],['baseball','mlb','MLB']
];
const SPORT={soccer:'Futebol',basketball:'Basquetebol',hockey:'Hóquei no gelo',football:'Futebol americano',baseball:'Basebol'};
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
function statusOf(e){if(e.state==='in')return e.detail||'AO VIVO';if(e.state==='post')return 'Final';return timeFmt.format(e.date);}
function scoreOf(c,e){return e.state==='pre'?'–':String(c.score??'–');}
function crest(team){const href=safeLogo(team?.team?.logo||team?.team?.logos?.[0]?.href);if(!href)return null;const img=document.createElement('img');img.src=href;img.alt='Emblema de '+teamName(team);img.loading='lazy';img.decoding='async';img.referrerPolicy='no-referrer';return img;}
function render(){
 const list=$('sports-scores');list.replaceChildren();
 const selected=all.filter(e=>currentFilter==='all'||(currentFilter==='other'?!['soccer','basketball'].includes(e.sport):e.sport===currentFilter));
 selected.sort((a,b)=>(a.state==='in'?0:a.state==='pre'?1:2)-(b.state==='in'?0:b.state==='pre'?1:2)||a.date-b.date);
 const visible=selected.slice(0,10);
 if(!visible.length){const p=document.createElement('p');p.textContent=all.length?'Não há jogos disponíveis nesta modalidade para hoje.':'Sem jogos disponíveis neste momento. Consulte novamente mais tarde.';list.append(p);return;}
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
  const names=[lost[1].trim(),lost[2].trim()];
  if(names.some(x=>x.length<3||x.length>52))return null;
  return {names,score:[Number(score[2]),Number(score[1])]};
 }
 return null;
}
function namesFromHeadline(title){return parseMatchReport(title)?.names||null;}
function findKnownTeam(name){
 const needle=normal(name);
 if(needle.length<3)return null;
 return knownTeams.find(t=>[t.displayName,t.shortDisplayName,t.name,t.abbreviation,t.nickname]
  .filter(Boolean).some(alias=>normal(alias)===needle))||null;
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
scheduleEnrich();
void loadTeamCatalogue();
$('sports-explore').onclick=()=>{[...document.querySelectorAll('#categories button')].find(b=>b.textContent.includes('Desporto'))?.click();document.getElementById('articles').scrollIntoView({behavior:'smooth'});};
async function refresh(force=false){
 if(pending||document.hidden)return;
 if(!force&&Date.now()-lastFetch<MIN_DELAY)return;
 pending=true;$('sports-status').textContent='A atualizar resultados reais…';
 const dayParts=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Lisbon',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
 const getPart=type=>dayParts.find(p=>p.type===type)?.value||'';
 const day=getPart('year')+getPart('month')+getPart('day');
 const settled=await Promise.allSettled(LEAGUES.map(async([sport,league,label])=>{
  const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),8500);
  try{const url='https://site.api.espn.com/apis/site/v2/sports/'+sport+'/'+league+'/scoreboard?dates='+day;
   const response=await fetch(url,{signal:controller.signal,cache:'no-store'});if(!response.ok)throw Error('Indisponível');
   return getEvents(await response.json(),sport,label);
  }finally{clearTimeout(timeout);}
 }));
 const success=settled.filter(r=>r.status==='fulfilled');
 if(success.length){const seen=new Set();all=success.flatMap(r=>r.value).filter(e=>{const key=e.sport+'/'+e.id;if(seen.has(key))return false;seen.add(key);return true;});lastFetch=Date.now();render();scheduleEnrich();}
 const now=new Intl.DateTimeFormat('pt-PT',{hour:'2-digit',minute:'2-digit',timeZone:'Europe/Lisbon'}).format(new Date());
 $('sports-status').textContent=success.length?'Fonte: ESPN (dados externos, atualização '+now+' Lisboa). Pode haver atrasos ou ligas indisponíveis. Atualização automática enquanto esta área está visível.':'Não foi possível obter os resultados em tempo real. Volte a tentar. Não são apresentados marcadores fictícios.';
 pending=false;
}
for(const button of document.querySelectorAll('[data-sport-filter]'))button.addEventListener('click',()=>{
 currentFilter=button.dataset.sportFilter;
 for(const b of document.querySelectorAll('[data-sport-filter]'))b.setAttribute('aria-pressed',String(b===button));
 render();
});
$('sports-refresh').addEventListener('click',()=>refresh(true));
let visible=false;
const observer=new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);if(visible)void refresh();},{rootMargin:'600px'});
observer.observe(section);
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&visible)void refresh();});
setInterval(()=>{if(visible&&!document.hidden)void refresh();},REFRESH_INTERVAL);
})();
