import { Link } from "@tanstack/react-router";
import { ReactNode } from "react";
import { Tier, tierMeets, useSubscription } from "@/hooks/useSubscription";

interface PaywallGateProps {
  requiredTier: Tier;
  feature?: string;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Client-side gate for premium UI. The real security boundary lives in the
 * ai-scene edge function (server-side tier check) — this is UX only.
 */
export function PaywallGate({ requiredTier, feature, children, fallback }: PaywallGateProps) {
  const { tier, userId, isLoading } = useSubscription();
  if (isLoading) return null;
  if (tierMeets(tier, requiredTier)) return <>{children}</>;
  if (fallback !== undefined) return <>{fallback}</>;

  const tierName = requiredTier === "immortal" ? "Immortal" : "Legend";
  return (
    <div
      style={{
        background: "#1A1A24",
        border: "1px solid #D4A843",
        padding: "24px",
        borderRadius: "2px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: "10px", letterSpacing: "3px", color: "#D4A843", marginBottom: "12px" }}>
        🔒 {tierName.toUpperCase()} TIER
      </div>
      <div style={{ color: "#E8E4D8", fontSize: "16px", fontWeight: 600, marginBottom: "8px", fontFamily: "'Cinzel',serif" }}>
        {feature ?? `Upgrade to ${tierName}`}
      </div>
      <div style={{ color: "#7A7A8A", fontSize: "12px", marginBottom: "20px", lineHeight: 1.5 }}>
        {requiredTier === "immortal"
          ? "Reserved for Immortal subscribers."
          : "This is a Legend feature. Subscribe to unlock."}
      </div>
      <Link
        to="/pricing"
        style={{
          display: "inline-block",
          background: "#D4A843",
          color: "#0A0A0C",
          padding: "10px 24px",
          fontSize: "11px",
          letterSpacing: "3px",
          textDecoration: "none",
          fontWeight: 700,
        }}
      >
        {userId ? "VIEW PLANS" : "SIGN IN & UPGRADE"}
      </Link>
    </div>
  );
}
