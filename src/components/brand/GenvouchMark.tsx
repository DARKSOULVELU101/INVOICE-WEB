import { cn } from "@/core/lib/utils";

export function GenvouchMark({
  className,
  gradientId = "gv-mark-gradient",
}: {
  className?: string;
  gradientId?: string;
}) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className={cn("h-9 w-9", className)}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="48" y2="48">
          <stop stopColor="#1F41F5" />
          <stop offset="0.55" stopColor="#7C3AED" />
          <stop offset="1" stopColor="#0891B2" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="13" fill={`url(#${gradientId})`} />
      <path
        d="M13 34V14h3.2l8.1 12V14h3.4v20h-3.2l-8.1-12v12H13Z"
        fill="#fff"
      />
      <path
        d="M33 34V18.5H28V15h13v3.5H36.2V34H33Z"
        fill="#fff"
        opacity="0.92"
      />
    </svg>
  );
}