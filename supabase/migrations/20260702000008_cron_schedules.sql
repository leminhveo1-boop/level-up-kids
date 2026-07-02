-- ============================================================
-- V1.2 — Scheduled jobs via pg_cron + pg_net
-- - send-push:    20:00 VN daily  (13:00 UTC) — remind parents of pending approvals
-- - weekly-email: 19:00 VN Sunday (12:00 UTC) — weekly family report
-- Note: the Authorization bearer below is the PUBLIC anon key (already shipped
-- in every client bundle) — it only passes the function's JWT gate; real
-- privileges come from the service-role env inside the function.
-- ============================================================

create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'luk-send-push-evening',
  '0 13 * * *',
  $$
  select net.http_post(
    url := 'https://mqgfdotuywgxpoiezpmj.supabase.co/functions/v1/send-push',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xZ2Zkb3R1eXdneHBvaWV6cG1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5NDk0NjIsImV4cCI6MjA5ODUyNTQ2Mn0.fqH1t2PUJUS7iZKLi0Az9Ig3ttQbamrYX7huxhEZJS4"}'::jsonb,
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
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xZ2Zkb3R1eXdneHBvaWV6cG1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5NDk0NjIsImV4cCI6MjA5ODUyNTQ2Mn0.fqH1t2PUJUS7iZKLi0Az9Ig3ttQbamrYX7huxhEZJS4"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
