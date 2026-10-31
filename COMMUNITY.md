# Participação e origem das visitas

Implementação de 31 de outubro de 2026.

## Publicação

- `community.sql` é uma migração aditiva, aplicada uma vez no projeto Supabase `nampznzziskqwyjzvvob`.
- `community.js` e `community.css` são usados na página inicial; as páginas individuais carregam apenas o JavaScript para medir entradas e cliques.
- `admin.html` e `editorial.js` apresentam os últimos 30 dias em **Redes e participação**, após autenticação com um perfil `admin` existente.
- Nenhuma tarefa agendada, fluxo social ou artigo foi alterado.

## Sondagem

A primeira pergunta fica aberta durante sete dias. Opções: Angola, Mundo, Diáspora, Desporto, Tecnologia e Oportunidades. Respostas e resultados são persistentes no Supabase. O navegador guarda um UUID aleatório por sondagem; apenas o SHA-256 desse UUID é guardado na base. A chave única (sondagem, hash) torna uma repetição idempotente e conserva a primeira escolha.

Uma resposta por navegador não significa uma resposta por pessoa: limpar o armazenamento ou usar outro dispositivo pode permitir nova participação. Não há verificação de identidade. Os resultados não constituem uma amostra representativa. A criação de uma nova sondagem é uma operação editorial administrativa na tabela privada `jpt_community.polls`; não existe formulário público de criação.

## Métricas

Apenas `www.jingolokela.com` e `jingolokela.com` registam os novos eventos. A medição respeita Do Not Track e ignora agentes automatizados reconhecidos.

- `landing`: entrada inferida da etiqueta utm_source ou do domínio de referência. Memória do separador reduz repetições durante 30 minutos.
- `share`: clique num controlo de partilha; não confirma envio.
- `follow`: clique numa ligação de rede; não confirma novo seguidor.

Só são guardados dia UTC, canal de uma lista fechada, tipo de evento e contador. Não são guardados nomes, e-mails, IP, referência completa ou texto arbitrário de campanha nas novas tabelas. Sem referência ou UTM, tráfego social pode ser classificado como direto/desconhecido. A contagem não mede pessoas únicas e pode ser afetada por automação não identificada ou armazenamento bloqueado. Estes dados começam com esta publicação; não recuperam histórico anterior.

## Segurança e verificação

As tabelas ficam no esquema privado `jpt_community`, com RLS e sem privilégios diretos para anon/authenticated. A API pública usa wrappers SECURITY INVOKER; os auxiliares privados têm search_path vazio e privilégios explícitos. O relatório verifica auth.uid() e o perfil admin no servidor.

Testes em transação com rollback confirmaram voto idempotente, recusa de opção inválida, validação de canal, ausência de acesso direto às tabelas e bloqueio do relatório para não administradores. O teste de interface foi isolado, com respostas simuladas, sem acrescentar votos à sondagem pública. Os votos públicos arrancaram em zero.

Avisos informativos de RLS sem políticas nas novas tabelas são intencionais: o acesso direto é negado. Avisos anteriores sobre funções de contagem e autenticação existentes não foram modificados nesta entrega.
