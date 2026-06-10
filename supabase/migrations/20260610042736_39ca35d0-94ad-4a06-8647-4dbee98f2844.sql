-- Track free-tier scene usage per (user, world) so the cap can be enforced server-side
CREATE TABLE public.free_scene_usage (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  world_id text NOT NULL,
  count integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, world_id)
);

GRANT SELECT ON public.free_scene_usage TO authenticated;
GRANT ALL ON public.free_scene_usage TO service_role;

ALTER TABLE public.free_scene_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scene usage"
  ON public.free_scene_usage FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Server-side tier lookup used by the ai-scene edge function
CREATE OR REPLACE FUNCTION public.get_user_tier(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN s.product_id = 'revenio_immortal' THEN 'immortal'
    WHEN s.product_id = 'revenio_legend' THEN 'legend'
    ELSE 'free'
  END
  FROM public.subscriptions s
  WHERE s.user_id = _user_id
    AND s.status IN ('active','trialing')
    AND (s.current_period_end IS NULL OR s.current_period_end > now())
  ORDER BY s.created_at DESC
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_tier(uuid) TO authenticated, service_role;