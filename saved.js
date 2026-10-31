'use strict';
// Reading-list metadata stays on this browser; no account or remote writes.
(()=>{
 const KEY='jpt-saved-articles-v1',LIMIT=100;
 const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
 function read(){
  try{const value=JSON.parse(localStorage.getItem(KEY)||'[]');const seen=new Set();
   return {ok:true,items:(Array.isArray(value)?value:[]).filter(a=>a&&UUID.test(a.id)&&typeof a.title==='string'&&a.title.trim()&&!seen.has(a.id)&&(seen.add(a.id),true)).slice(0,LIMIT).map(a=>({id:a.id,title:a.title.slice(0,320),category:typeof a.category==='string'?a.category.slice(0,50):'',published_at:Number.isFinite(Date.parse(a.published_at))?a.published_at:null}))};
  }catch{return {ok:false,items:[]};}
 }
 const dialog=document.createElement('dialog');dialog.id='saved-news';dialog.className='saved-dialog';dialog.setAttribute('aria-labelledby','saved-news-title');
 const head=document.createElement('div');head.className='saved-heading';
 const heading=document.createElement('h2');heading.id='saved-news-title';heading.textContent='As suas notícias guardadas';
 const close=document.createElement('button');close.type='button';close.className='saved-close';close.textContent='Fechar ×';close.setAttribute('aria-label','Fechar notícias guardadas');close.addEventListener('click',()=>dialog.close());head.append(heading,close);
 const note=document.createElement('p');note.className='saved-note';note.textContent='Lista guardada apenas neste navegador. Requer internet para abrir as notícias. Limpar os dados do navegador apaga a lista.';
 const list=document.createElement('ul');list.className='saved-list';
 const empty=document.createElement('p');empty.className='saved-empty';
 const status=document.createElement('p');status.className='saved-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 dialog.append(head,note,list,empty,status);document.body.append(dialog);
 const feedback=document.createElement('p');feedback.className='saved-feedback';feedback.setAttribute('role','status');feedback.setAttribute('aria-live','polite');feedback.hidden=true;document.body.append(feedback);
 let feedbackTimer;
 function announce(text){status.textContent=text;feedback.textContent=text;feedback.hidden=dialog.open;clearTimeout(feedbackTimer);feedbackTimer=setTimeout(()=>{feedback.hidden=true;},6000);}
 function refresh(){
  const state=read();
  document.querySelectorAll('[data-saved-count]').forEach(el=>{el.textContent=String(state.items.length);});
  document.querySelectorAll('[data-save-article]').forEach(button=>{const saved=state.items.some(a=>a.id===button.dataset.saveArticle);button.setAttribute('aria-pressed',String(saved));button.textContent=saved?'Guardada ✓':'Guardar notícia';});
  list.replaceChildren();empty.hidden=state.items.length>0;
  empty.textContent=state.ok?'Ainda não guardou notícias. Abra uma notícia e escolha «Guardar notícia».':'Não foi possível ler a lista neste navegador. Verifique se permite armazenamento local.';
  state.items.forEach((a,index)=>{
   const li=document.createElement('li'),link=document.createElement('a'),meta=document.createElement('span'),title=document.createElement('strong'),remove=document.createElement('button');
   link.href='/noticia/'+encodeURIComponent(a.id);title.textContent=a.title;meta.textContent=a.category+(a.published_at?' · '+new Date(a.published_at).toLocaleDateString('pt-PT'):'');link.append(meta,title);
   remove.type='button';remove.textContent='Remover';remove.setAttribute('aria-label','Remover da lista: '+a.title);
   remove.addEventListener('click',()=>{const current=read();if(!current.ok){announce('Não foi possível ler a lista. A notícia não foi removida.');return;}if(!write(current.items.filter(item=>item.id!==a.id),'Notícia removida da lista.'))return;const controls=list.querySelectorAll('button');(controls[Math.min(index,controls.length-1)]||close).focus();});
   li.append(link,remove);list.append(li);
  });
 }
 function write(items,message){
  try{localStorage.setItem(KEY,JSON.stringify(items));refresh();announce(message);return true;}
  catch{announce('Não foi possível guardar a alteração neste navegador. A lista não foi alterada.');return false;}
 }
 function setArticle(button,article){
  if(!button)return;button.hidden=!!article.demo||!UUID.test(article.id||'');
  if(button.hidden){delete button.dataset.saveArticle;return;}
  button.dataset.saveArticle=article.id;button.dataset.articleTitle=article.title;button.dataset.articleCategory=article.category||'';button.dataset.articlePublished=article.published_at||'';refresh();
 }
 document.addEventListener('click',event=>{
  const opener=event.target.closest('[data-open-saved]');if(opener){feedback.hidden=true;status.textContent='';refresh();if(!dialog.open)dialog.showModal();return;}
  const button=event.target.closest('[data-save-article]');if(!button||!UUID.test(button.dataset.saveArticle||''))return;
  const state=read();if(!state.ok){announce('O armazenamento local não está disponível. Não foi possível guardar a notícia.');return;}
  const id=button.dataset.saveArticle,exists=state.items.some(a=>a.id===id);
  if(exists){write(state.items.filter(a=>a.id!==id),'Notícia removida da lista.');return;}
  if(state.items.length>=LIMIT){announce('A lista tem 100 notícias. Remova uma antes de guardar outra.');return;}
  const title=button.dataset.articleTitle;if(!title)return;
  write([{id,title:title.slice(0,320),category:button.dataset.articleCategory||'',published_at:button.dataset.articlePublished||null},...state.items],'Notícia guardada para ler mais tarde.');
 });
 window.addEventListener('storage',event=>{if(event.key===KEY||event.key===null)refresh();});
 window.JPTSaved={setArticle};refresh();
})();
