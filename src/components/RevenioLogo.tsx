import revenioMark from "@/assets/revenio-mark.png";

interface Props { className?: string; size?: number }

/**
 * REVENIO mark — official gold "R" monogram (rasterized from brand asset).
 */
export function RevenioLogo({ className = "", size = 36 }: Props) {
  return (
    <img
      src={revenioMark}
      alt="Revenio"
      width={size}
      height={size}
      className={`object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

/**
 * Wordmark — REVENIO in Josefin Sans, the geometric monoline typeface
 * matching the brand reference. Wide tracking, thin weight, perfect O.
 */
export function RevenioWordmark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`uppercase tracking-[0.32em] text-foreground ${className}`}
      style={{ fontFamily: "var(--font-brand)", fontWeight: 300 }}
    >
      REVENIO
    </span>
  );
}
