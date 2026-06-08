import { useState } from "react";
import { initializePaddle, getPaddlePriceId } from "@/lib/paddle";
import { supabase } from "@/integrations/supabase/client";

export function usePaddleCheckout() {
  const [loading, setLoading] = useState(false);

  const openCheckout = async (options: {
    priceId: string;
    successUrl?: string;
  }) => {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) {
        window.location.href = "/auth";
        return;
      }
      await initializePaddle();
      const paddlePriceId = await getPaddlePriceId(options.priceId);
      window.Paddle.Checkout.open({
        items: [{ priceId: paddlePriceId, quantity: 1 }],
        customer: user.email ? { email: user.email } : undefined,
        customData: { userId: user.id },
        settings: {
          displayMode: "overlay",
          successUrl:
            options.successUrl ||
            `${window.location.origin}/experience?checkout=success`,
          allowLogout: false,
          variant: "one-page",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return { openCheckout, loading };
}
