interface Props { className?: string; size?: number }

// Stylized "R" mark inspired by the brand reference
export function RevenioLogo({ className = "", size = 36 }: Props) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      aria-label="Revenio"
    >
      <defs>
        <linearGradient id="rg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(0.55 0.12 70)" />
          <stop offset="50%" stopColor="oklch(0.88 0.16 88)" />
          <stop offset="100%" stopColor="oklch(0.55 0.12 70)" />
        </linearGradient>
      </defs>
      <g fill="url(#rg)">
        {/* Bold custom R */}
        <path d="M10 6 L34 6 C44 6 50 12 50 22 C50 30 45 35 38 37 L52 58 L42 58 L29 38 L20 38 L20 58 L10 58 Z M20 14 L20 30 L33 30 C38 30 41 27 41 22 C41 17 38 14 33 14 Z" />
      </g>
    </svg>
  );
}
