-- Executar UMA vez no SQL Editor do Supabase depois de rever.
-- Esta migração não altera o acesso público de leitura.
create or replace function public.is_portal_admin()
returns boolean language sql stable security definer
set search_path = '' as $$
  select exists(select 1 from public.profiles where id = (select auth.uid()) and role = 'admin')
$$;
revoke all on function public.is_portal_admin() from public, anon;
grant execute on function public.is_portal_admin() to authenticated;
alter table public.profiles enable row level security;
-- Manter a política existente que permite ler o próprio perfil.
-- Os privilégios SQL são adicionais às políticas RLS.
grant select on public.profiles to authenticated;
grant select, insert, update on public.articles to authenticated;
drop policy if exists "Portal admins can read articles" on public.articles;
create policy "Portal admins can read articles" on public.articles for select to authenticated using ((select public.is_portal_admin()));
drop policy if exists "Portal admins can insert articles" on public.articles;
create policy "Portal admins can insert articles" on public.articles for insert to authenticated with check ((select public.is_portal_admin()));
drop policy if exists "Portal admins can update articles" on public.articles;
create policy "Portal admins can update articles" on public.articles for update to authenticated using ((select public.is_portal_admin())) with check ((select public.is_portal_admin()));
-- Sem DELETE no painel. Rascunhos continuam invisíveis para leitores.
