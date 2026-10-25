import {createClient} from 'https://esm.sh/@supabase/supabase-js@2';
const cfg=window.PORTAL_CONFIG;
const $=id=>document.getElementById(id),message=$('message');
if(!cfg?.supabaseUrl||!cfg?.supabaseAnonKey){message.textContent='Configuração indisponível.';throw Error('Missing config');}
const db=createClient(cfg.supabaseUrl,cfg.supabaseAnonKey);
let currentId=null,rows=[];
const fields=['title','summary','body','category','author','source_url','image_url','image_alt','image_credit','image_source_url','image_caption'];
function notify(text){message.textContent=text;}
function previewEditorialImage(){
 const wrapper=$('editor-image-preview'),photo=$('editor-image-thumb'),caption=$('editor-image-caption');
 const raw=$('image_url').value.trim();let safe=null;
 try{const u=new URL(raw);if(u.protocol==='https:'&&['images.unsplash.com','images.pexels.com','upload.wikimedia.org'].includes(u.hostname.toLowerCase()))safe=u.href;}catch{}
 wrapper.hidden=!safe;
 if(!safe){photo.removeAttribute('src');return;}
 photo.src=safe;photo.alt=$('image_alt').value.trim()||'Pré-visualização da fotografia da notícia';
 caption.textContent=$('image_credit').value.trim()?'Crédito: '+$('image_credit').value.trim():'Pré-visualização. Verifique a autorização de reutilização e os créditos antes de publicar.';
}
for(const id of ['image_url','image_alt','image_credit'])$(id).addEventListener('input',previewEditorialImage);
$('editor-image-thumb').addEventListener('error',()=>{$('editor-image-caption').textContent='Não foi possível carregar esta imagem. Verifique a ligação.';});

function dateInput(value){const d=value?new Date(value):new Date();return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16);}
function clearForm(){$('article-form').reset();currentId=null;$('editor-title').textContent='Novo artigo';$('author').value='Redação Notícias Para Todos';$('published_at').value=dateInput();notify('');previewEditorialImage();}
function edit(row){currentId=row.id;fields.forEach(k=>$(k).value=row[k]??'');$('published').checked=row.published;$('published_at').value=dateInput(row.published_at);$('editor-title').textContent='Editar artigo';previewEditorialImage();window.scrollTo({top:0,behavior:'smooth'});}
async function isAdmin(){const {data:{user},error}=await db.auth.getUser();if(error||!user)return false;const result=await db.from('profiles').select('role').eq('id',user.id).maybeSingle();return !result.error&&result.data?.role==='admin';}
async function refresh(){if(!(await isAdmin())){$('login').hidden=false;$('dashboard').hidden=true;notify('');return;}
$('login').hidden=true;$('dashboard').hidden=false;await load();}
function stateOf(row){if(!row.published)return 'draft';return new Date(row.published_at)>new Date()?'scheduled':'published';}
function renderStats(){
 const counts={total:rows.length,draft:0,published:0,scheduled:0};
 for(const row of rows)counts[stateOf(row)]++;
 const container=$('stats');container.replaceChildren();
 for(const [name,count] of [['Total de artigos',counts.total],['Publicados',counts.published],['Rascunhos',counts.draft],['Agendados',counts.scheduled]]){
  const card=document.createElement('div');card.className='metric';const number=document.createElement('strong');number.textContent=count;const label=document.createElement('span');label.textContent=name;card.append(number,label);container.append(card);
 }
}
function renderList(){
 const term=$('search').value.trim().toLocaleLowerCase('pt');
 const status=$('status-filter').value,category=$('category-filter').value;
 const filtered=rows.filter(row=>(status==='all'||stateOf(row)===status)&&(category==='all'||row.category===category)&&(!term||(row.title+' '+(row.summary||'')).toLocaleLowerCase('pt').includes(term)));
 const list=$('articles');list.replaceChildren();
 for(const row of filtered){
  const item=document.createElement('div');item.className='item';
  const title=document.createElement('strong');title.textContent=row.title;
  const meta=document.createElement('p');meta.textContent=row.category+' · '+({draft:'Rascunho',published:'Publicado',scheduled:'Agendado'}[stateOf(row)]);
  const editButton=document.createElement('button');editButton.className='secondary';editButton.type='button';editButton.textContent='Editar';editButton.onclick=()=>edit(row);
  const del=document.createElement('button');del.className='danger';del.type='button';del.textContent='Eliminar';
  del.onclick=async()=>{if(!confirm('Eliminar definitivamente este artigo?'))return;const {error}=await db.from('articles').delete().eq('id',row.id);if(error){notify(error.message);return;}if(currentId===row.id)clearForm();await load();notify('Artigo eliminado.');};
  item.append(title,meta,editButton,del);list.append(item);
 }
 if(!filtered.length)list.textContent='Nenhum artigo corresponde aos filtros.';
}
let audienceRecords=[],audiencePeriod=7;
function renderAudienceChart(){
 const chart=$('audience-chart'),caption=$('audience-chart-caption');chart.replaceChildren();
 const dates=[];const now=new Date();for(let i=audiencePeriod-1;i>=0;i--){const date=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate()-i));dates.push(date.toISOString().slice(0,10));}
 const counts=new Map();for(const r of audienceRecords)if(!r.article_id)counts.set(r.view_date,(counts.get(r.view_date)||0)+Number(r.view_count));
 const values=dates.map(day=>counts.get(day)||0),max=Math.max(1,...values);const total=values.reduce((sum,n)=>sum+n,0);
 dates.forEach((day,i)=>{const column=document.createElement('div');column.className='chart-column';const count=document.createElement('span');count.className='chart-value';count.textContent=String(values[i]);const bar=document.createElement('div');bar.className='chart-bar';bar.style.height=(values[i]===0?2:Math.max(6,Math.round(values[i]/max*145)))+'px';bar.title=day+': '+values[i]+' visitas';const label=document.createElement('span');label.className='chart-label';label.textContent=audiencePeriod===7?day.slice(5):((i%Math.ceil(audiencePeriod/10)===0||i===dates.length-1)?day.slice(5):'');column.append(count,bar,label);chart.append(column);});
 chart.setAttribute('aria-label','Visitas diárias nos últimos '+audiencePeriod+' dias: '+total+' visualizações da página inicial.');
 caption.textContent=total.toLocaleString('pt-PT')+' visitas à página inicial nos últimos '+audiencePeriod+' dias (UTC). As aberturas de artigos são contabilizadas em separado.';
}
for(const button of document.querySelectorAll('[data-period]'))button.onclick=()=>{audiencePeriod=Number(button.dataset.period);for(const b of document.querySelectorAll('[data-period]'))b.setAttribute('aria-pressed',String(b===button));renderAudienceChart();};
async function loadAudience(){
 const {data,error}=await db.from('daily_views').select('view_date,article_id,view_count').order('view_date',{ascending:false}).limit(5000);
 const box=$('audience-stats'),top=$('top-articles');box.replaceChildren();top.replaceChildren();
 if(error){top.textContent='Não foi possível carregar a audiência: '+error.message;return;}
 const records=data||[];audienceRecords=records;renderAudienceChart();const today=new Date().toISOString().slice(0,10),home=records.filter(r=>!r.article_id);
 const total=home.reduce((sum,r)=>sum+Number(r.view_count),0),todayCount=home.filter(r=>r.view_date===today).reduce((sum,r)=>sum+Number(r.view_count),0);
 const articleViews=records.filter(r=>r.article_id).reduce((sum,r)=>sum+Number(r.view_count),0);
 const recent=(days,offset=0)=>records.filter(r=>{const n=Math.floor((Date.parse(today+'T00:00:00Z')-Date.parse(r.view_date+'T00:00:00Z'))/86400000);return n>=offset&&n<offset+days;}).reduce((acc,row)=>acc+Number(row.view_count),0);
 const last7=recent(7),previous7=recent(7,7),todayAll=records.filter(r=>r.view_date===today).reduce((acc,row)=>acc+Number(row.view_count),0);
 const growth=previous7>0?Math.round((last7-previous7)/previous7*100):null;
 for(const [label,value] of [['Visualizações hoje (todas as páginas)',todayAll],['Visualizações nos últimos 7 dias',last7],['Comparação com os 7 dias anteriores',growth===null?'Sem base anterior':(growth>0?'+':'')+growth+'%'],['Visitas à página inicial',total],['Aberturas de artigos',articleViews]]){

  const card=document.createElement('div');card.className='metric';const strong=document.createElement('strong');strong.textContent=value.toLocaleString('pt-PT');const name=document.createElement('span');name.textContent=label;card.append(strong,name);box.append(card);
 }
 const byId=new Map();for(const row of records)if(row.article_id)byId.set(row.article_id,(byId.get(row.article_id)||0)+Number(row.view_count));
 const ranked=[...byId].sort((a,b)=>b[1]-a[1]).slice(0,10);
 if(!ranked.length){top.textContent='Ainda não existem visualizações de artigos registadas.';return;}
 const list=document.createElement('ol');for(const [id,count] of ranked){const item=document.createElement('li');const article=rows.find(r=>r.id===id);const link=document.createElement('a');link.href='https://www.jingolokela.com/noticia/'+encodeURIComponent(id);link.target='_blank';link.rel='noopener noreferrer';link.textContent=article?.title||'Notícia indisponível';item.append(link,' — '+count.toLocaleString('pt-PT')+' visualizações');list.append(item);}top.append(list);
}
$('audience-reload').onclick=loadAudience;
async function load(){
 const {data,error}=await db.from('articles').select('*').order('created_at',{ascending:false}).limit(1000);
 if(error){notify('Não foi possível listar artigos: '+error.message);return;}
 rows=data||[];renderStats();renderList();await loadAudience();await adLoad();
}
for(const id of ['search','status-filter','category-filter'])$(id).addEventListener('input',renderList);

$('login-form').onsubmit=async e=>{e.preventDefault();const btn=e.submitter;btn.disabled=true;try{const {error}=await db.auth.signInWithPassword({email:$('email').value.trim(),password:$('password').value});if(error){notify('Credenciais inválidas ou sessão indisponível.');return;}if(!(await isAdmin())){await db.auth.signOut();notify('Conta sem autorização administrativa.');return;}$('password').value='';await refresh();}catch{notify('Erro de ligação. Tente novamente.');}finally{btn.disabled=false;}};
let adCurrentId=null,adCampaigns=[];
const adFields={advertiser:'ad-advertiser',title:'ad-title',placement:'ad-placement',start_date:'ad-start',end_date:'ad-end',status:'ad-status',destination_url:'ad-destination',image_url:'ad-image',amount_eur:'ad-amount',notes:'ad-notes'};
function adNotify(text){$('ad-message').textContent=text;}
function adClear(){
 adCurrentId=null;$('ad-campaign-form').reset();$('ad-form-title').textContent='Nova campanha';
 const today=new Date().toISOString().slice(0,10);$('ad-start').value=today;$('ad-end').value=today;adNotify('');
}
function adEdit(campaign){
 adCurrentId=campaign.id;for(const [field,id] of Object.entries(adFields))$(id).value=campaign[field]??'';
 $('ad-form-title').textContent='Editar campanha';$('commercial').scrollIntoView({behavior:'smooth',block:'start'});adNotify('Campanha selecionada para edição.');
}
function adRender(){
 const list=$('ad-list'),stats=$('ad-stats');list.replaceChildren();stats.replaceChildren();
 for(const [label,count] of [['Total de campanhas',adCampaigns.length],['Propostas',adCampaigns.filter(a=>a.status==='draft').length],['Aprovadas',adCampaigns.filter(a=>a.status==='approved').length],['Pausadas',adCampaigns.filter(a=>a.status==='paused').length]]){
 const card=document.createElement('div');card.className='metric';const value=document.createElement('strong');value.textContent=String(count);const name=document.createElement('span');name.textContent=label;card.append(value,name);stats.append(card);
 }
 if(!adCampaigns.length){list.textContent='Não existem campanhas registadas.';return;}
 const names={draft:'Proposta',approved:'Aprovada (não publicada)',paused:'Pausada',completed:'Concluída'};
 const locations={hero:'Faixa de destaque',between_sections:'Faixa entre secções'};
 for(const ad of adCampaigns){
 const row=document.createElement('div');row.className='ad-entry';
 const title=document.createElement('strong');title.textContent=ad.advertiser+' · '+ad.title;
 const meta=document.createElement('small');meta.textContent=(locations[ad.placement]||ad.placement)+' · '+(names[ad.status]||ad.status)+' · '+ad.start_date+' a '+ad.end_date+(ad.amount_eur==null?'':' · '+Number(ad.amount_eur).toLocaleString('pt-PT',{style:'currency',currency:'EUR'}));
 const edit=document.createElement('button');edit.type='button';edit.textContent='Editar';edit.onclick=()=>adEdit(ad);
 const del=document.createElement('button');del.type='button';del.className='danger';del.textContent='Eliminar';del.onclick=async()=>{
 if(!confirm('Eliminar definitivamente esta campanha?'))return;
 if(!(await isAdmin())){adNotify('Acesso não autorizado.');return;}
 const {error}=await db.from('ad_campaigns').delete().eq('id',ad.id);if(error){adNotify('Erro ao eliminar: '+error.message);return;}
 if(adCurrentId===ad.id)adClear();await adLoad();adNotify('Campanha eliminada.');
 };
 row.append(title,meta,document.createElement('br'),edit,del);list.append(row);
 }
}
async function adLoad(){
 const {data,error}=await db.from('ad_campaigns').select('*').order('created_at',{ascending:false}).limit(500);
 if(error){adNotify('Não foi possível carregar campanhas: '+error.message);return;}
 adCampaigns=data||[];adRender();
}
$('ad-reload').onclick=adLoad;
$('ad-reset').onclick=adClear;
$('ad-campaign-form').onsubmit=async event=>{
 event.preventDefault();const btn=$('ad-save');btn.disabled=true;
 try{
 if(!(await isAdmin())){adNotify('Acesso não autorizado.');return;}
 const payload={};for(const [field,id] of Object.entries(adFields))payload[field]=$(id).value.trim();
 if(payload.end_date<payload.start_date){adNotify('A data de fim deve ser igual ou posterior ao início.');return;}
 for(const key of ['destination_url','image_url']){if(payload[key]&&!/^https:\/\//i.test(payload[key])){adNotify('As ligações têm de começar por https://');return;}payload[key]=payload[key]||null;}
 if(payload.status==='approved'&&!payload.destination_url){adNotify('Para aprovar e publicar uma campanha é obrigatório indicar a ligação HTTPS do anunciante.');return;}
 payload.amount_eur=payload.amount_eur===''?null:Number(payload.amount_eur);
 if(payload.amount_eur!==null&&(!Number.isFinite(payload.amount_eur)||payload.amount_eur<0)){adNotify('Introduza um valor válido.');return;}
 payload.notes=payload.notes||null;
 const query=adCurrentId?db.from('ad_campaigns').update(payload).eq('id',adCurrentId):db.from('ad_campaigns').insert(payload);
 const {error}=await query;if(error){adNotify('Não foi possível guardar: '+error.message);return;}
 adClear();await adLoad();adNotify('Campanha guardada. Nenhum anúncio foi publicado automaticamente.');
 }catch(error){adNotify('Erro ao guardar campanha: '+error.message);}finally{btn.disabled=false;}
};
adClear();

$('logout').onclick=async()=>{await db.auth.signOut();clearForm();await refresh();};
$('reload').onclick=load;$('new').onclick=clearForm;$('reset').onclick=clearForm;
$('article-form').onsubmit=async e=>{e.preventDefault();const btn=$('save');btn.disabled=true;try{
if(!(await isAdmin())){notify('Sessão sem autorização.');return;}
const payload={};for(const k of fields){const v=$(k).value.trim();payload[k]=['source_url','image_url','image_alt','image_credit','image_source_url','image_caption'].includes(k)?v||null:v;}
if(payload.category==='Desporto'&&payload.image_url){
 if(/photo-1771344164616-3582e4dc2f07|photo-1549210194-fb0aac030c32/.test(payload.image_url)){
  notify('Esta imagem genérica já foi usada em notícias sem relação com o confronto. Escolha uma fotografia específica ou deixe o campo vazio para mostrar o cartão das equipas e resultado.');return;
 }
 if(!payload.image_credit||!payload.image_source_url||!payload.image_alt){
  notify('Nas notícias desportivas com fotografia, indique descrição, crédito e origem/licença da imagem. Se não tiver foto apropriada, deixe o campo vazio para criar o cartão do confronto.');return;
 }
}
if(payload.image_url){const host=new URL(payload.image_url).hostname.toLowerCase();if(!['images.unsplash.com','images.pexels.com','upload.wikimedia.org'].includes(host)){notify('Utilize imagens de Unsplash, Pexels ou Wikimedia Commons com autorização adequada.');return;}if(host!=='images.unsplash.com'&&(!payload.image_credit||!payload.image_source_url)){notify('Para fotografias editoriais, indique o crédito e a ligação de origem/licença da imagem.');return;}}
for(const k of ['source_url','image_url','image_source_url'])if(payload[k]&&!payload[k].startsWith('https://')){notify('As ligações devem usar HTTPS.');return;}
payload.published=$('published').checked;payload.published_at=new Date($('published_at').value).toISOString();
const query=currentId?db.from('articles').update(payload).eq('id',currentId):db.from('articles').insert(payload);
const {error}=await query;if(error){notify('Falha ao guardar: '+error.message);return;}clearForm();await load();notify('Artigo guardado com sucesso.');
}catch(err){notify('Erro ao guardar: '+err.message);}finally{btn.disabled=false;}};
clearForm();await refresh();