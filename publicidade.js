'use strict';
const adForm=document.getElementById('ad-form');
const adFormat=document.getElementById('ad-format');
const adPackage=document.getElementById('ad-package');
const selectionStatus=document.getElementById('ad-selected-package');
const formatByPackage={
 'Essencial — 49 € / 15 dias':'Faixa entre secções',
 'Destaque — 99 € / 30 dias':'Faixa de destaque',
 'Parceiro Plus — 149 € / 30 dias':'Faixa de destaque + 1 publicação Facebook + 1 publicação Instagram'
};
function applyPackage(value){
 if(![...adPackage.options].some(option=>option.value===value))return;
 adPackage.value=value;
 if(formatByPackage[value])adFormat.value=formatByPackage[value];
 selectionStatus.textContent=value==='A definir — gostaria de uma proposta'?'Pode escolher um dos pacotes acima ou indicar o que pretende.':'Pacote pré-selecionado: '+value+'. Esta seleção não constitui reserva nem pagamento.';
}
const query=new URLSearchParams(location.search);
const requestedPackage=query.get('pacote');
if(requestedPackage)applyPackage(requestedPackage);
const requestedFormat=query.get('formato');
if(requestedFormat&&[...adFormat.options].some(option=>option.value===requestedFormat))adFormat.value=requestedFormat;
adPackage.addEventListener('change',()=>applyPackage(adPackage.value));
document.querySelectorAll('[data-package]').forEach(a=>a.addEventListener('click',()=>applyPackage(a.dataset.package)));
document.querySelectorAll('[data-format]:not([data-package])').forEach(a=>a.addEventListener('click',()=>{adFormat.value=a.dataset.format;applyPackage('A definir — gostaria de uma proposta');}));
adForm.addEventListener('submit',event=>{event.preventDefault();if(!adForm.reportValidity())return;const data=new FormData(adForm);const text=['Pedido de publicidade — Jingolokela Para Todos','',`Empresa ou projeto: ${data.get('business')}`,`Responsável: ${data.get('name')}`,`E-mail: ${data.get('email')}`,`Pacote solicitado: ${data.get('package')}`,`Formato: ${data.get('format')}`,`Website a divulgar: ${data.get('advertiser_link')||'Não indicado'}`,'','Proposta:',data.get('message'),'','Pedido de avaliação comercial. Preços indicativos, sem reserva ou pagamento; sujeitos a confirmação por escrito.'].join('\n');document.getElementById('proposal-text').value=text;document.getElementById('email-proposal').href='mailto:dudji@hotmail.com?subject='+encodeURIComponent('Pedido de publicidade — '+data.get('business'))+'&body='+encodeURIComponent(text);document.getElementById('whatsapp-proposal').href='https://wa.me/351932099780?text='+encodeURIComponent(text);document.getElementById('proposal-result').hidden=false;document.getElementById('proposal-status').textContent='Pedido preparado. Escolha e-mail ou WhatsApp e confirme o envio nessa aplicação.';document.getElementById('proposal-text').focus();});
document.getElementById('copy-proposal').addEventListener('click',async()=>{const output=document.getElementById('proposal-text');try{await navigator.clipboard.writeText(output.value);document.getElementById('proposal-status').textContent='Pedido copiado. Pode colá-lo numa mensagem.';}catch{output.focus();output.select();document.getElementById('proposal-status').textContent='Selecione e copie o texto do pedido.';}});
document.getElementById('download-proposal').addEventListener('click',()=>{const file=new Blob([document.getElementById('proposal-text').value],{type:'text/plain;charset=utf-8'});const url=URL.createObjectURL(file);const a=document.createElement('a');a.href=url;a.download='pedido-publicidade-jingolokela-para-todos.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);document.getElementById('proposal-status').textContent='Descarregamento iniciado. O pedido ainda não foi enviado.';});
