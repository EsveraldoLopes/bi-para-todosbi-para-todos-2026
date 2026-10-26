# Rotina editorial diária — Jingolokela

## Objetivo
Manter as seis notícias mais recentes na secção «O que merece a sua atenção», sem confundir a data da última consulta com a data de publicação e sem inventar notícias.

## Procedimento de cada edição
1. Consultar fontes primárias e jornais credíveis para Angola, Portugal, mundo, diáspora, desporto, tecnologia e oportunidades.
2. Escolher as seis notícias de maior interesse e atualidade. Confirmar os factos principais em fontes acessíveis, incluindo as datas.
3. Redigir título original, resumo e corpo editorial em português, sem copiar integralmente textos protegidos.
4. Indicar sempre a fonte original (source_url) e autor; preencher a categoria adequada.
5. Se houver imagem, confirmar licença, crédito, URL de origem e legenda clara (incluindo se é imagem de arquivo).
6. Guardar inicialmente o artigo com published=false no Table Editor do Supabase.
7. Rever títulos, factos, links, ortografia e eventuais correções.
8. Só então definir published=true, com published_at correto (não atribuir uma data nova a conteúdo antigo).
9. Verificar na página de testes que os seis artigos aparecem por published_at descendente; pesquisar, abrir, partilhar e usar «Ver todas».
10. Confirmar em mobile e desktop antes de integrar mudanças da branch principal.

## Automatismos e limitações
O navegador volta a consultar os artigos publicados ao abrir a página, de 15 em 15 minutos enquanto está visível e quando o visitante regressa ao separador. O botão «Atualizar notícias» permite consultar a edição de imediato. Isto NÃO cria novos artigos, não revê conteúdos e não substitui a redação.

O carrossel e a grelha continuam separados. Se não houver seis artigos novos, aparecem os artigos publicados existentes ordenados pela data real. Não simular notícias nem atualizar published_at para parecer que são recentes.

## Critério de publicação
A redação é responsável por aprovação final; RLS mantém a escrita inacessível ao público. Não ativar autopublicação a partir de RSS ou feeds externos sem revisão humana.
