import { cn } from "@/core/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
  {
    variants: {
      variant: {
        neutral: "bg-ink-100 text-ink-700",
        brand: "bg-brand-50 text-brand-700",
        success: "bg-semantic-successBg text-semantic-success",
        warning: "bg-semantic-warningBg text-semantic-warning",
        danger: "bg-semantic-dangerBg text-semantic-danger",
        info: "bg-semantic-infoBg text-semantic-info",
        accent: "bg-accent-violet/10 text-accent-violet",
      },
    },
    defaultVariants: { variant: "neutral" },
  }
);

export function Badge({
  className,
  variant,
  dot,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants> & { dot?: boolean }) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />}
      {props.children}
    </span>
  );
}