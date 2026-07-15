-- ============================================================
-- Close the zero-auth gap on send-push / weekly-email / lifecycle-email:
-- any caller holding the public anon key could invoke them before this.
-- Re-registers the 3 cron jobs to also send an `x-cron-secret` header,
-- sourced from Supabase Vault, which each edge function now verifies
-- against its own CRON_SECRET env var (see supabase/functions/*/index.ts).
--
-- MANUAL STEPS REQUIRED (cannot be scripted — needs project owner access):
--   1) Generate a random secret:      openssl rand -hex 32
--   2) Store it in Vault (run once, via SQL editor or `supabase db execute`):
--        select vault.create_secret('<the-random-secret>', 'cron_secret');
--   3) Set the SAME value as CRON_SECRET on all 3 functions:
--        npx supabase secrets set CRON_SECRET=<the-random-secret>
--   4) THEN apply this migration (`npx supabase db push`) so the cron jobs
--      start sending the header. Order matters — steps 2–3 before step 4,
--      otherwise the functions fail open (see index.ts comments) until then.
-- ============================================================

select cron.unschedule('luk-send-push-evening');
select cron.unschedule('luk-weekly-email-sunday');
select cron.unschedule('luk-lifecycle-daily');

select cron.schedule(
  'luk-send-push-evening',
  '0 13 * * *',
  $$
  select net.http_post(
    url := 'https://mqgfdotuywgxpoiezpmj.supabase.co/functions/v1/send-push',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xZ2Zkb3R1eXdneHBvaWV6cG1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5NDk0NjIsImV4cCI6MjA5ODUyNTQ2Mn0.fqH1t2PUJUS7iZKLi0Az9Ig3ttQbamrYX7huxhEZJS4',
      'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')
    ),
    body := '{}'::jsonb
  );
  $$
);

select cron.schedule(
  'luk-weekly-email-sunday',
  '0 12 * * 0',
  $$
  select net.http_post(
    url := 'https://mqgfdotuywgxpoiezpmj.supabase.co/functions/v1/weekly-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xZ2Zkb3R1eXdneHBvaWV6cG1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5NDk0NjIsImV4cCI6MjA5ODUyNTQ2Mn0.fqH1t2PUJUS7iZKLi0Az9Ig3ttQbamrYX7huxhEZJS4',
      'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')
    ),
    body := '{}'::jsonb
  );
  $$
);

select cron.schedule(
  'luk-lifecycle-daily',
  '0 3 * * *',
  $$
  select net.http_post(
    url := 'https://mqgfdotuywgxpoiezpmj.supabase.co/functions/v1/lifecycle-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xZ2Zkb3R1eXdneHBvaWV6cG1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5NDk0NjIsImV4cCI6MjA5ODUyNTQ2Mn0.fqH1t2PUJUS7iZKLi0Az9Ig3ttQbamrYX7huxhEZJS4',
      'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')
    ),
    body := '{}'::jsonb
  );
  $$
);
