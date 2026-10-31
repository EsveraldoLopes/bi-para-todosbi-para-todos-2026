'use strict';
(() => {
 const config=window.PORTAL_CONFIG;
 const pollRoot=document.getElementById('reader-poll');
 const production=['www.jingolokela.com','jingolokela.com'].includes(location.hostname);
 const isBot=navigator.webdriver||/bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegrambot/i.test(navigator.userAgent);
 async function rpc(name,body){
  if(!config?.supabaseUrl||!config?.supabaseAnonKey)throw Error('config');
  const response=await fetch(config.supabaseUrl+'/rest/v1/rpc/'+name,{method:'POST',headers:{'Content-Type':'application/json',apikey:config.supabaseAnonKey},body:JSON.stringify(body),keepalive:true});
  if(!response.ok)throw Error('request');
  return response.status===204?null:response.json();
 }
 const safeRead=(storage,key)=>{try{return window[storage].getItem(key);}catch{return null;}};
 const safeWrite=(storage,key,value)=>{try{window[storage].setItem(key,value);return true;}catch{return false;}};
 const channelNames={facebook:'Facebook',instagram:'Instagram',whatsapp:'WhatsApp',telegram:'Telegram',google:'Google',other:'Outra origem',direct:'Direta ou desconhecida'};
 function sourceFor(url){
  const h=url.hostname.toLowerCase();
  if(h==='facebook.com'||h.endsWith('.facebook.com')||h==='fb.com')return 'facebook';
  if(h==='instagram.com'||h.endsWith('.instagram.com'))return 'instagram';
  if(h==='wa.me'||h==='whatsapp.com'||h.endsWith('.whatsapp.com'))return 'whatsapp';
  if(h==='t.me'||h==='telegram.me')return 'telegram';
  if(/(^|\.)google\.[a-z.]+$/.test(h))return 'google';
  return 'other';
 }
 function landingSource(){
  const raw=new URL(location.href).searchParams.get('utm_source')?.toLowerCase();
  if(raw)return ({fb:'facebook',ig:'instagram',wa:'whatsapp'}[raw])||(Object.hasOwn(channelNames,raw)?raw:'other');
  try{const ref=new URL(document.referrer);if(ref.hostname!==location.hostname)return sourceFor(ref);}catch{}
  return 'direct';
 }
 function event(source,event){
  if(!production||isBot||navigator.doNotTrack==='1'||!Object.hasOwn(channelNames,source))return;
  void rpc('jpt_record_event',{p_source:source,p_event:event}).catch(()=>{});
 }
 function recordLanding(){
  if(!production||isBot||navigator.doNotTrack==='1'||document.visibilityState!=='visible')return;
  const key='jpt-entry-30m',source=landingSource();let previous;
  try{previous=JSON.parse(safeRead('sessionStorage',key)||'null');}catch{}
  if(previous&&Date.now()-previous.time<1800000&&(source==='direct'||source===previous.source))return;
  // Only a source label and time in this tab; no visitor identifier.
  safeWrite('sessionStorage',key,JSON.stringify({source,time:Date.now()}));event(source,'landing');
 }
 recordLanding();document.addEventListener('visibilitychange',recordLanding);
 let lastClick=0;
 document.addEventListener('click',e=>{
  const target=e.target instanceof Element?e.target.closest('a,button'):null;if(!target||Date.now()-lastClick<1000)return;
  let source,kind;
  if(target.matches('#share-whatsapp')){source='whatsapp';kind='share';}
  else if(target.matches('#share-facebook')){source='facebook';kind='share';}
  else if(target.matches('#share-telegram')){source='telegram';kind='share';}
  else if(target.matches('#share,#reader-native-share,#share-journal')){source='other';kind='share';}
  else if(target.tagName==='A'){
   try{const url=new URL(target.href,location.href);const s=sourceFor(url);const isShare=/\/sharer\/|\/send|\/share\//.test(url.pathname);
    if(isShare&&s!=='other'){source=s;kind='share';}
    else if(['facebook','instagram'].includes(s)){source=s;kind='follow';}
   }catch{}
  }
  if(source){lastClick=Date.now();event(source,kind);}
 });
 if(!pollRoot)return;
 const make=(tag,cls,text)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el;};
 function randomToken(){
  if(crypto.randomUUID)return crypto.randomUUID();
  const bytes=crypto.getRandomValues(new Uint8Array(16));bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;
  const h=[...bytes].map(b=>b.toString(16).padStart(2,'0')).join('');return h.slice(0,8)+'-'+h.slice(8,12)+'-'+h.slice(12,16)+'-'+h.slice(16,20)+'-'+h.slice(20);
 }
 let current=null,token=null,showResults=false,busy=false;
 const tokenKey=id=>'jpt-poll-token:'+id;
 function storedToken(id){try{const value=safeRead('localStorage',tokenKey(id));return /^[0-9a-f-]{36}$/i.test(value||'')?value:null;}catch{return null;}}
 function render(message=''){
  pollRoot.replaceChildren();
  if(!current){pollRoot.append(make('p','','Não há uma sondagem aberta neste momento.'));return;}
  const form=make('form','poll-form'),field=make('fieldset');field.append(make('legend','poll-question',current.question));
  const options=make('div','poll-options');
  for(const option of current.options){
   const label=make('label','poll-option');const input=make('input');input.type='radio';input.name='poll-option';input.value=option.id;input.required=true;input.checked=current.selected===option.id;input.disabled=!!current.selected||busy;
   label.append(input,make('span','',option.label));options.append(label);
  }
  field.append(options);form.append(field);
  const actions=make('div','poll-actions'),submit=make('button','poll-submit',current.selected?'Resposta registada':'Votar');submit.type='submit';submit.disabled=!!current.selected||busy;
  const results=make('button','poll-results-toggle',showResults?'Ocultar resultados':'Ver resultados');results.type='button';results.setAttribute('aria-expanded',String(showResults));results.setAttribute('aria-controls','poll-results');results.onclick=()=>{showResults=!showResults;render();};
  actions.append(submit,results);form.append(actions);
  const status=make('p','poll-status',message||(current.selected?'Obrigado por participares. A tua resposta já está guardada.':''));status.setAttribute('role','status');
  form.onsubmit=async e=>{
   e.preventDefault();if(busy||current.selected)return;const option=new FormData(form).get('poll-option');if(!option)return;
   if(!token){token=randomToken();safeWrite('localStorage',tokenKey(current.id),token);}
   busy=true;submit.disabled=true;status.textContent='A guardar a tua resposta…';
   try{const data=await rpc('jpt_vote',{p_poll:current.id,p_option:option,p_token:token});if(!data?.selected)throw Error('unconfirmed');current=data;showResults=true;busy=false;render();}
   catch{busy=false;submit.disabled=false;status.textContent='Não foi possível confirmar a resposta. Tenta novamente; uma repetição não duplica o voto.';}
  };
  pollRoot.append(form,status);
  const panel=make('div','poll-results');panel.id='poll-results';panel.hidden=!showResults;
  const total=Number(current.total)||0;panel.append(make('p','poll-total',total===1?'1 resposta registada':total.toLocaleString('pt-PT')+' respostas registadas'));
  for(const option of current.options){const count=Number(option.votes)||0,percentage=total?Math.round(count/total*100):0;const row=make('div','poll-result');row.append(make('span','',option.label),make('strong','',count+' · '+percentage+'%'));const bar=make('progress');bar.max=total||1;bar.value=count;bar.setAttribute('aria-label',option.label+': '+count+' respostas ('+percentage+'%)');row.append(bar);panel.append(row);}
  pollRoot.append(panel,make('p','poll-footnote','Aberta até '+new Date(current.ends_at).toLocaleDateString('pt-PT')+'. Uma resposta por navegador. Não é necessário criar conta.'));
 }
 async function load(){
  pollRoot.replaceChildren(make('p','','A carregar a sondagem…'));
  try{current=await rpc('jpt_current_poll',{});if(current){token=storedToken(current.id);if(token)current=await rpc('jpt_current_poll',{p_token:token});showResults=!!current?.selected;}render();}
  catch{pollRoot.replaceChildren(make('p','','A sondagem está temporariamente indisponível.'));const retry=make('button','poll-results-toggle','Tentar novamente');retry.type='button';retry.onclick=load;pollRoot.append(retry);}
 }
 void load();
})();
