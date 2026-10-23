# Notícias Para Todos — portal de notícias

Transformação integral do protótipo de petição num portal editorial estático, compatível com o alojamento Vercel existente. Nome: Notícias Para Todos.

## Funcionalidades

- Layout responsivo, navegação por seis secções e pesquisa sem distinção de acentos.
- Artigos em janela de leitura acessível, ligação partilhável e fonte original opcional.
- Sem recolha de assinaturas ou formulários de dados pessoais.
- Apresentações editoriais explicitamente identificadas enquanto a base de dados não está configurada. Não se incluem notícias ou resultados inventados.
- Leitura de até 60 artigos publicados no Supabase, por ordem de publicação. Conteúdos renderizados como texto, sem executar HTML.

## Vercel

Manter o projeto e domínio existentes. Framework preset: Other. Root directory: raiz do repositório. Não é necessário build; publicar a raiz. Rever a preview da pull request antes de integrar na branch de produção. A ligação efetiva deste repositório ao domínio ainda não foi confirmada.

## Supabase

1. A tabela e a política já foram aplicadas no projeto atual. `supabase.sql` documenta o esquema inicial; não repetir a execução no projeto configurado.
2. `supabaseUrl` e `supabaseAnonKey` em `config.js` já apontam para o projeto atual. Para outro projeto, usar apenas a URL e a chave pública publishable. Nunca incluir service_role ou palavras-passe. As chaves públicas ficam visíveis no navegador; a proteção é assegurada pelas políticas RLS.
3. No Table Editor, adicionar artigos à tabela `articles`: título, resumo, corpo em texto simples, categoria, autor, fonte e data.
4. Rever o conteúdo; só depois definir `published = true`. Datas futuras ficam ocultas até à hora indicada. A política permite apenas leitura pública de artigos publicados. Escrita pelo Table Editor do proprietário.
5. Verificar que rascunhos não são acessíveis usando a chave pública e testar a publicação numa preview.

O projeto Supabase `noticias-para-todos` está configurado na organização Notícias Para Todos (região eu-west-1). A tabela e a política foram aplicadas na migração `create_editorial_articles`. `config.js` contém apenas a URL e uma chave pública publishable. O texto de boas-vindas é editorial, sem notícias fictícias.

Validação real: leitura REST com a chave pública retornou 200 e o artigo de boas-vindas. Um teste transacional com o papel anon confirmou que só o artigo publicado era visível, ocultando rascunho e agendado; INSERT/UPDATE/DELETE públicos foram negados pelas permissões. O Security Advisor retornou zero alertas. Os dados temporários de teste foram revertidos.

A gestão de conteúdos é feita pelo Table Editor do Supabase. Ainda não existe painel próprio de administração ou recolha automática de notícias. A atualização diária nesta conversa não alimenta o site automaticamente.

## Verificação

`node --check app.js` e `node --check config.js`. Verificar em navegador: filtros, pesquisa sem resultados, abertura/fecho e Escape, ligação partilhada, apresentação móvel e carregamento/erro do Supabase. O portal não depende de imagens ou bibliotecas externas.

Antes do lançamento editorial: confirmar nome, contactos da redação, identidade responsável, política editorial e publicar notícias verificadas com fontes e direitos de utilização dos conteúdos.

