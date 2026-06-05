interface Props { className?: string; size?: number }

/**
 * REVENIO mark — bold geometric R with a sharp diagonal leg,
 * matching the brand reference. Filled with the gold gradient.
 */
export function RevenioLogo({ className = "", size = 36 }: Props) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      aria-label="Revenio"
      fill="none"
    >
      <defs>
        <linearGradient id="revGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(0.62 0.13 75)" />
          <stop offset="45%" stopColor="oklch(0.90 0.16 88)" />
          <stop offset="100%" stopColor="oklch(0.55 0.12 70)" />
        </linearGradient>
      </defs>
      {/* Stem */}
      <rect x="14" y="8" width="18" height="84" fill="url(#revGold)" />
      {/* Bowl (top loop) - filled with cut-out */}
      <path
        d="M14 8 H58 C76 8 86 20 86 36 C86 52 76 64 58 64 H32 V46 H56 C62 46 66 42 66 36 C66 30 62 26 56 26 H32 Z"
        fill="url(#revGold)"
      />
      {/* Diagonal leg — the signature angular cut */}
      <path
        d="M44 56 L92 92 L70 92 L28 60 Z"
        fill="url(#revGold)"
      />
    </svg>
  );
}

/**
 * Wordmark — REVENIO set in heavy uppercase letterforms with
 * the brand's tight tracking, matching the reference image.
 */
export function RevenioWordmark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`font-sans font-bold uppercase tracking-[0.18em] text-foreground ${className}`}
      style={{ fontStretch: "expanded" }}
    >
      REVENIO
    </span>
  );
}
