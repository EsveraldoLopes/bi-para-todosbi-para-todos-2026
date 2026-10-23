-- Executar no SQL Editor do projeto Supabase após revisão.
create table if not exists public.articles (
 id uuid primary key default gen_random_uuid(),
 title text not null check (char_length(title) between 3 and 240),
 summary text not null,
 body text not null,
 category text not null check (category in ('Angola','Mundo','Diáspora','Desporto','Tecnologia','Oportunidades')),
 author text not null default 'Redação Para Todos',
 source_url text check (source_url is null or source_url like 'https://%'),
 published boolean not null default false,
 published_at timestamptz not null default now(),
 created_at timestamptz not null default now()
);
alter table public.articles enable row level security;
revoke all on public.articles from anon, authenticated;
grant select on public.articles to anon, authenticated;
create policy "Public can read published articles" on public.articles
 for select to anon, authenticated
 using (published = true and published_at <= now());
create index if not exists articles_publication_idx on public.articles (published_at desc) where published = true;
-- Gestão de conteúdos pelo Table Editor do Supabase, com a conta do proprietário.
-- Não se concedem permissões públicas de escrita.
