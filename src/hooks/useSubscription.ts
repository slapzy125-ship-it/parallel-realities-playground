import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getPaddleEnvironment } from "@/lib/paddle";
import { getMySubscription } from "@/utils/payments.functions";

export type Tier = "free" | "legend" | "infinite";

function tierFromProductId(productId?: string | null): Tier {
  if (productId === "revenio_infinite") return "infinite";
  if (productId === "revenio_legend") return "legend";
  return "free";
}

export function useSubscription() {
  const [userId, setUserId] = useState<string | null>(null);
  const fetchSub = useServerFn(getMySubscription);
  const env = getPaddleEnvironment();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null);
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
  const active = !!sub && ["active", "trialing"].includes(sub.status) &&
    (!sub.current_period_end || new Date(sub.current_period_end) > new Date());
  const tier: Tier = active ? tierFromProductId(sub?.product_id) : "free";

  return { subscription: sub, tier, isActive: active, isLoading, userId, refetch };
}
