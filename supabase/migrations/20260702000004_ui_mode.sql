-- ============================================================
-- B5 — Age-cohort UI mode per child (UX_AUDIT Phần 4)
-- kid = 6-11 (forest/fantasy), teen = 12+ (dark/coach voice)
-- ============================================================

alter table public.children
  add column if not exists ui_mode text not null default 'kid'
  check (ui_mode in ('kid', 'teen'));
