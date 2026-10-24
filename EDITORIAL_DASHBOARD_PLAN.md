# Painel editorial — plano de implementação

## Objetivo
Permitir a um administrador autenticado criar, editar, agendar e publicar notícias na tabela `public.articles`.

## Segurança
- A autorização de escrita tem de ser validada por políticas RLS no Supabase, nunca apenas pelo JavaScript.
- Conceder INSERT, UPDATE e DELETE apenas ao papel `authenticated`, com políticas que confirmem `public.profiles.role = 'admin'` para `auth.uid()`.
- Garantir SELECT dos rascunhos apenas para administradores e manter a política de leitura pública existente.
- Não publicar chaves secretas nem service_role no navegador.
- Testar operações permitidas para administrador e recusadas para utilizador comum e visitante anónimo.

## Interface
- Listagem de artigos, incluindo rascunhos e agendados.
- Formulário com título, resumo, corpo, categoria, autor, fonte e metadados de imagem.
- Guardar como rascunho; publicar ou agendar após revisão.
- Confirmar explicitamente a eliminação de artigos.

## Validação
- Verificar o comportamento das políticas RLS.
- Testar criação de rascunho e confirmar que não aparece no portal público.
- Testar publicação de artigo e edição posterior.
- Rever a pré-visualização Vercel antes de integrar na produção.
