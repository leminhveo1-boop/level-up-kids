-- ============================================================
-- Vá lỗi: cột `plan` không bao giờ tự hạ về 'free' khi premium hết hạn.
-- Không cron nào làm việc này ⇒ email lifecycle/weekly lọc .eq("plan","premium")
-- gửi mãi cho nhà đã rời, và mọi số đếm khách trả tiền bị thổi phồng.
-- (Cổng tính năng vẫn đúng vì AuthContext kiểm cả premium_until.)
-- Run AFTER 20260725000001_admin_ops.sql. Xem docs/PLAN_ADMIN_OPS.md §1.3(c).
-- ============================================================

create or replace function public.expire_premium()
returns int language plpgsql security definer set search_path = public as $$
declare v_count int;
begin
  perform set_config('app.allow_plan_change', 'on', true);
  update public.profiles
    set plan = 'free'
    where plan = 'premium' and coalesce(premium_until, 'epoch') < now();
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

-- Internal only — cron calls it; no client should.
revoke all on function public.expire_premium() from public, anon, authenticated;

-- Nightly at 17:00 UTC (00:00 giờ VN). Re-runnable: drop the old schedule first.
do $$
begin
  perform cron.unschedule('luk-expire-premium-daily');
exception when others then
  null;  -- job chưa tồn tại lần đầu chạy migration
end
$$;

select cron.schedule(
  'luk-expire-premium-daily',
  '0 17 * * *',
  $$ select public.expire_premium(); $$
);
