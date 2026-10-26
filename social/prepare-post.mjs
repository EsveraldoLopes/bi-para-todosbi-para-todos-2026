// Jingolokela: preparation-only social post payload. No public posting credentials here.
export function prepareSocialPublication(article) {
 if (!article || article.published !== true || !article.id || !article.title) return {ok:false,reason:"Artigo não aprovado"};
 const when=Date.parse(article.published_at);
 if (!Number.isFinite(when) || when>Date.now()) return {ok:false,reason:"Publicação futura"};
 const url="https://www.jingolokela.com/noticia/"+encodeURIComponent(article.id);
 const title=String(article.title).trim().slice(0,220);
 const summary=String(article.summary||"").trim().slice(0,350);
 const image=String(article.image_url||"");
 // Instagram requires an actual public image. Never invent or reuse unrelated photographs.
 const instagramReady=/^https:\/\//.test(image)&&Boolean(article.image_credit)&&Boolean(article.image_source_url);
 const message=title+"\n\n"+summary+"\n\nLeia a notícia: "+url+"\n\n#Jingolokela #NoticiasParaTodos";
 return {ok:true,articleId:article.id,articleUrl:url,facebook:{text:message,media:instagramReady?[image]:[]},instagram:instagramReady?{text:message,media:[image]}:null,instagramStatus:instagramReady?"ready":"needs_licensed_image",requiresApproval:false};
}
