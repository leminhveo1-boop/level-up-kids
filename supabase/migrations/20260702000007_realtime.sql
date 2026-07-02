-- ============================================================
-- V1.2 — Enable realtime on game_states (remote approve 📲)
-- ============================================================

alter publication supabase_realtime add table public.game_states;
