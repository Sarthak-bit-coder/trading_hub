-- Per-user saved progress for Trading Research Academy.
-- One row per user; the app stores the same JSON it keeps in localStorage.

create table public.user_state (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  state      jsonb not null,
  version    integer not null default 2,
  updated_at timestamptz not null default now(),
  -- Keep rows small: the app's backup is well under 1 MB.
  constraint user_state_size check (pg_column_size(state) <= 1048576),
  constraint user_state_object check (jsonb_typeof(state) = 'object')
);

-- Deny by default: no access for anon, owner-only access for signed-in users.
alter table public.user_state enable row level security;
revoke all on table public.user_state from anon, authenticated;
grant select, insert, update, delete on table public.user_state to authenticated;

create policy "Users read their own state" on public.user_state
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users insert their own state" on public.user_state
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users update their own state" on public.user_state
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users delete their own state" on public.user_state
  for delete to authenticated using ((select auth.uid()) = user_id);

-- The server sets updated_at; clients cannot backdate or forward-date it.
create function public.user_state_touch() returns trigger
  language plpgsql security invoker set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;
create trigger user_state_touch before insert or update on public.user_state
  for each row execute function public.user_state_touch();
revoke execute on function public.user_state_touch() from public, anon, authenticated;
