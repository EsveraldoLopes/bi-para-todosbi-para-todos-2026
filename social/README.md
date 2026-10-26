# Distribuição automática Jingolokela → Facebook e Instagram

## Situação
As contas oficiais foram identificadas no Metricool (marca 7647464, Europe/Lisbon). **Não há publicação automática ativa**. A ligação do ChatGPT ao Metricool permite gerir publicações na conversa, mas não fornece ao código do site credenciais para a API do Metricool.

## Regras e arquitetura
1. Origem: tabela Supabase `public.articles`. Detetar INSERT e UPDATE com `published=true` e `published_at<=now()`, incluindo datas futuras quando efetivamente chegarem.
2. Uma fila persistente em base de dados deve ter chave única `(article_id,network)`, estado queued/processing/sent/error, tentativas e ID remoto. Inserir em transação no ato de publicação; processar por worker seguro (cron ou webhook); não disparar a partir do navegador.
3. Cada item inclui título original, resumo, permalink público da notícia e imagem autorizada. Facebook aceita ligação textual; Instagram requer imagem pública e licenciada. Artigos sem imagem adequada entram em revisão para Instagram.
4. Enviar através da API autorizada do Metricool ou das APIs oficiais da Meta, com credenciais **apenas** em secrets do servidor. Não publicar de novo quando se edita um artigo previamente divulgado; só republicar por decisão editorial.
5. Só marcar como enviado após a resposta de sucesso do fornecedor. Registar falhas sem criar duplicados; adicionar tentativas limitadas e confirmação do estado remoto antes de repetir.
6. O sistema editorial deve poder desativar a automação e bloquear um artigo. Não enviar as notícias históricas em massa ao ativar.
7. Primeiro executar teste controlado com artigo de teste aprovado pelo proprietário e observar as duas publicações.

## Pré-requisito ainda não confirmado
Confirmar se a conta Metricool tem acesso à API de publicação; a ligação pelo ChatGPT não é uma chave de API utilizável num webhook. Alternativa: Meta Graph API com app Meta, permissões aprovadas e gestão de tokens de página/Instagram.

## Implementação atual
`social/prepare-post.mjs` apenas prepara e valida conteúdos a partir de um artigo fornecido. **Não comunica com redes sociais** e não recebe segredos.

## Segurança e direitos
Não inserir tokens no repositório, JavaScript público, HTML ou mensagens de chat. Garantir direitos de partilha da fotografia (a licença da notícia e a licença da fotografia podem ser diferentes). Evitar alegar publicação imediata em caso de indisponibilidade das plataformas.
