import {createClient} from 'https://esm.sh/@supabase/supabase-js@2';
const cfg=window.PORTAL_CONFIG;
const $=id=>document.getElementById(id),message=$('message');
if(!cfg?.supabaseUrl||!cfg?.supabaseAnonKey){message.textContent='Configuração indisponível.';throw Error('Missing config');}
const db=createClient(cfg.supabaseUrl,cfg.supabaseAnonKey);
let currentId=null,rows=[];
const fields=['title','summary','body','category','author','source_url','image_url','image_alt','image_credit','image_source_url','image_caption'];
function notify(text){message.textContent=text;}
function dateInput(value){const d=value?new Date(value):new Date();return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16);}
function clearForm(){$('article-form').reset();currentId=null;$('editor-title').textContent='Novo artigo';$('author').value='Redação Notícias Para Todos';$('published_at').value=dateInput();notify('');}
function edit(row){currentId=row.id;fields.forEach(k=>$(k).value=row[k]??'');$('published').checked=row.published;$('published_at').value=dateInput(row.published_at);$('editor-title').textContent='Editar artigo';window.scrollTo({top:0,behavior:'smooth'});}
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
async function load(){
 const {data,error}=await db.from('articles').select('*').order('created_at',{ascending:false}).limit(1000);
 if(error){notify('Não foi possível listar artigos: '+error.message);return;}
 rows=data||[];renderStats();renderList();
}
for(const id of ['search','status-filter','category-filter'])$(id).addEventListener('input',renderList);

$('login-form').onsubmit=async e=>{e.preventDefault();const btn=e.submitter;btn.disabled=true;try{const {error}=await db.auth.signInWithPassword({email:$('email').value.trim(),password:$('password').value});if(error){notify('Credenciais inválidas ou sessão indisponível.');return;}if(!(await isAdmin())){await db.auth.signOut();notify('Conta sem autorização administrativa.');return;}$('password').value='';await refresh();}catch{notify('Erro de ligação. Tente novamente.');}finally{btn.disabled=false;}};
$('logout').onclick=async()=>{await db.auth.signOut();clearForm();await refresh();};
$('reload').onclick=load;$('new').onclick=clearForm;$('reset').onclick=clearForm;
$('article-form').onsubmit=async e=>{e.preventDefault();const btn=$('save');btn.disabled=true;try{
if(!(await isAdmin())){notify('Sessão sem autorização.');return;}
const payload={};for(const k of fields){const v=$(k).value.trim();payload[k]=['source_url','image_url','image_alt','image_credit','image_source_url','image_caption'].includes(k)?v||null:v;}
if(payload.image_url&&new URL(payload.image_url).hostname!=='images.unsplash.com'){notify('A imagem deve ser de images.unsplash.com, como exige o portal.');return;}
for(const k of ['source_url','image_url','image_source_url'])if(payload[k]&&!payload[k].startsWith('https://')){notify('As ligações devem usar HTTPS.');return;}
payload.published=$('published').checked;payload.published_at=new Date($('published_at').value).toISOString();
const query=currentId?db.from('articles').update(payload).eq('id',currentId):db.from('articles').insert(payload);
const {error}=await query;if(error){notify('Falha ao guardar: '+error.message);return;}clearForm();await load();notify('Artigo guardado com sucesso.');
}catch(err){notify('Erro ao guardar: '+err.message);}finally{btn.disabled=false;}};
clearForm();await refresh();