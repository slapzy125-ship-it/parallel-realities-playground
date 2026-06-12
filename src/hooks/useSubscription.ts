import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getPaddleEnvironment } from "@/lib/paddle";
import { getMySubscription } from "@/utils/payments.functions";

export type Tier = "free" | "legend" | "immortal";

const TIER_RANK: Record<Tier, number> = { free: 0, legend: 1, immortal: 2 };

export function tierFromProductId(productId?: string | null): Tier {
  if (productId === "revenio_immortal") return "immortal";
  if (productId === "revenio_legend") return "legend";
  return "free";
}

export function tierMeets(current: Tier, required: Tier): boolean {
  return TIER_RANK[current] >= TIER_RANK[required];
}

export function useSubscription() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const fetchSub = useServerFn(getMySubscription);
  const env = getPaddleEnvironment();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
      setUserEmail(data.user?.email ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null);
      setUserEmail(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const { data, refetch, isLoading } = useQuery({
    queryKey: ["subscription", userId, env],
    queryFn: () => fetchSub({ data: { environment: env } }),
    enabled: !!userId,
  });

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`subscriptions-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "subscriptions", filter: `user_id=eq.${userId}` },
        () => refetch(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, refetch]);

  const sub = data?.subscription as any;
  // Subscription gating removed: every authenticated user gets full Immortal access.
  // Unauthenticated users remain "free" so pages can show a sign-in prompt.
  const tier: Tier = (userId ? "immortal" : "free") as Tier;
  const isActive = !!userId;
  void userEmail;

  return { subscription: sub, tier, isActive, isLoading, userId, refetch };
}
