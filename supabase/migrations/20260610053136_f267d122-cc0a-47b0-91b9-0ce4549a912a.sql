REVOKE INSERT, UPDATE, DELETE ON public.free_scene_usage FROM authenticated, anon;
GRANT ALL ON public.free_scene_usage TO service_role;
ALTER TABLE public.free_scene_usage ENABLE ROW LEVEL SECURITY;