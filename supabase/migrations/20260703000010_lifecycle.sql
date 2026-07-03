-- ============================================================
-- Lifecycle emails (retention = automation, zero human support)
-- - premium_since: mốc ngày-0 (khi kích hoạt premium)
-- - lifecycle_log: chống gửi trùng (mỗi kind gửi 1 lần / parent)
-- - cron: chạy lifecycle-email hằng ngày 10:00 VN (03:00 UTC)
-- ============================================================

-- 1) Mốc ngày-0 -------------------------------------------------
alter table public.profiles add column if not exists premium_since timestamptz;

-- Backfill khách premium hiện có (xấp xỉ = hạn - 365 ngày; đủ dùng cho lifecycle)
update public.profiles
  set premium_since = premium_until - interval '365 days'
  where plan = 'premium' and premium_since is null and premium_until is not null;

-- Tự set premium_since lần đầu lên premium (bắt mọi đường kích hoạt: code + SePay)
create or replace function public.set_premium_since()
returns trigger
language plpgsql
as $$
begin
  if new.plan = 'premium'
     and (old.plan is distinct from 'premium')
     and new.premium_since is null then
    new.premium_since := now();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_set_premium_since on public.profiles;
create trigger trg_set_premium_since
  before update on public.profiles
  for each row execute function public.set_premium_since();

-- 2) Chống gửi trùng ------------------------------------------
create table if not exists public.lifecycle_log (
  profile_id uuid references public.profiles(id) on delete cascade,
  kind text not null,               -- 'welcome' | 'day3' | 'week4'
  sent_at timestamptz not null default now(),
  primary key (profile_id, kind)
);
alter table public.lifecycle_log enable row level security;
-- Không policy: chỉ service-role (edge function) đọc/ghi.

-- 3) Cron hằng ngày -------------------------------------------
select cron.schedule(
  'luk-lifecycle-daily',
  '0 3 * * *',
  $$
  select net.http_post(
    url := 'https://mqgfdotuywgxpoiezpmj.supabase.co/functions/v1/lifecycle-email',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xZ2Zkb3R1eXdneHBvaWV6cG1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5NDk0NjIsImV4cCI6MjA5ODUyNTQ2Mn0.fqH1t2PUJUS7iZKLi0Az9Ig3ttQbamrYX7huxhEZJS4"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
