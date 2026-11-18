-- pgTAP tests for user_state access. Run with: supabase test db
begin;
select plan(9);

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'a@example.test'),
  ('22222222-2222-2222-2222-222222222222', 'b@example.test');

-- Anonymous: no access at all.
set local role anon;
select throws_ok($$ select * from public.user_state $$, '42501', null, 'anon cannot read');
select throws_ok($$ insert into public.user_state (user_id, state) values ('11111111-1111-1111-1111-111111111111', '{}') $$, '42501', null, 'anon cannot insert');

-- User A writes and reads only their own row.
set local role authenticated;
set local request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';
select lives_ok($$ insert into public.user_state (user_id, state) values ('11111111-1111-1111-1111-111111111111', '{"theme":"dark"}') $$, 'user A inserts own row');
select throws_ok($$ insert into public.user_state (user_id, state) values ('22222222-2222-2222-2222-222222222222', '{}') $$, '42501', null, 'user A cannot insert for user B');
select results_eq($$ select count(*)::int from public.user_state $$, array[1], 'user A sees exactly one row');
select throws_ok($$ insert into public.user_state (user_id, state) values ('11111111-1111-1111-1111-111111111111', '"text"') $$, '23514', null, 'state must be a JSON object');

-- User B cannot see or change user A's row.
set local request.jwt.claims = '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}';
select results_eq($$ select count(*)::int from public.user_state $$, array[0], 'user B sees no rows');
select results_eq($$ with u as (update public.user_state set state = '{}' where user_id = '11111111-1111-1111-1111-111111111111' returning 1) select count(*)::int from u $$, array[0], 'user B cannot update user A');
select results_eq($$ with d as (delete from public.user_state where user_id = '11111111-1111-1111-1111-111111111111' returning 1) select count(*)::int from d $$, array[0], 'user B cannot delete user A');

select * from finish();
rollback;
