import { ReactNode } from "react";
import { Tier } from "@/hooks/useSubscription";

interface PaywallGateProps {
  requiredTier: Tier;
  feature?: string;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Subscription gating has been removed. This component is a pass-through so
 * existing call sites keep compiling. Every signed-in user has full access.
 */
export function PaywallGate({ children }: PaywallGateProps) {
  return <>{children}</>;
}

