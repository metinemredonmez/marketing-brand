/**
 * Linear / Vercel tarzı subtle dot-grid background pattern.
 * Hero section'larında "pattern + fade mask" tekniği için.
 *
 * Server Component — sıfır JS. Saf SVG + CSS mask.
 */
export function GridPattern({
  className = "",
  /** "dots" or "grid" */
  variant = "dots",
}: {
  className?: string;
  variant?: "dots" | "grid";
}) {
  const id = `gp-${variant}-${Math.random().toString(36).slice(2, 8)}`;
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)] ${className}`}
    >
      <svg
        className="h-full w-full text-foreground/[0.06] dark:text-foreground/[0.08]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {variant === "dots" ? (
            <pattern
              id={id}
              x="0"
              y="0"
              width="24"
              height="24"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="1" cy="1" r="1" fill="currentColor" />
            </pattern>
          ) : (
            <pattern
              id={id}
              x="0"
              y="0"
              width="48"
              height="48"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 48 0 L 0 0 0 48"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
            </pattern>
          )}
        </defs>
        <rect width="100%" height="100%" fill={`url(#${id})`} />
      </svg>
    </div>
  );
}
