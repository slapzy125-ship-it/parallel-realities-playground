REVOKE EXECUTE ON FUNCTION public.get_user_tier(uuid) FROM authenticated, anon, public;
GRANT EXECUTE ON FUNCTION public.get_user_tier(uuid) TO service_role;