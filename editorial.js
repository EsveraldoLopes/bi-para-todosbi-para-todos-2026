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
async function load(){const {data,error}=await db.from('articles').select('*').order('created_at',{ascending:false}).limit(200);if(error){notify('Não foi possível listar artigos: '+error.message);return;}rows=data||[];const list=$('articles');list.replaceChildren();for(const row of rows){const item=document.createElement('div');item.className='item';const title=document.createElement('strong');title.textContent=row.title;const meta=document.createElement('p');meta.textContent=row.category+' · '+(row.published?'Publicado/agendado':'Rascunho');const editButton=document.createElement('button');editButton.className='secondary';editButton.textContent='Editar';editButton.onclick=()=>edit(row);const del=document.createElement('button');del.className='danger';del.textContent='Eliminar';del.onclick=async()=>{if(!confirm('Eliminar definitivamente este artigo?'))return;const {error}=await db.from('articles').delete().eq('id',row.id);if(error){notify(error.message);return;}if(currentId===row.id)clearForm();await load();};item.append(title,meta,editButton,del);list.append(item);}if(!rows.length)list.textContent='Ainda não há artigos.';}
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