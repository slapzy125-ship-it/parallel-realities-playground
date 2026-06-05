
CREATE TABLE public.simulations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New Saga',
  character_name TEXT NOT NULL,
  character_age INTEGER NOT NULL,
  world TEXT NOT NULL,
  traits TEXT NOT NULL DEFAULT '',
  goals TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.simulations TO authenticated;
GRANT ALL ON public.simulations TO service_role;
ALTER TABLE public.simulations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own simulations" ON public.simulations FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.simulation_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  simulation_id UUID NOT NULL REFERENCES public.simulations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user','assistant','system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX simulation_messages_sim_idx ON public.simulation_messages(simulation_id, created_at);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.simulation_messages TO authenticated;
GRANT ALL ON public.simulation_messages TO service_role;
ALTER TABLE public.simulation_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own simulation messages" ON public.simulation_messages FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.simulations s WHERE s.id = simulation_id AND s.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.simulations s WHERE s.id = simulation_id AND s.user_id = auth.uid()));

CREATE OR REPLACE FUNCTION public.touch_simulation_updated_at() RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.simulations SET updated_at = now() WHERE id = NEW.simulation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER bump_simulation_updated_at
AFTER INSERT ON public.simulation_messages
FOR EACH ROW EXECUTE FUNCTION public.touch_simulation_updated_at();
