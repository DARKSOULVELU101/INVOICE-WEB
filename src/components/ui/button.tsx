import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/core/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.985]",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-br from-brand-600 to-accent-500 text-white shadow-sm hover:shadow-md hover:brightness-110",
        secondary:
          "border border-border bg-white text-ink-900 shadow-sm hover:bg-ink-50 hover:border-ink-300",
        ghost: "text-ink-700 hover:bg-ink-100 hover:text-ink-900",
        danger: "bg-semantic-danger text-white shadow-sm hover:bg-red-700",
        dangerGhost: "text-semantic-danger hover:bg-semantic-dangerBg",
        outline: "border-2 border-brand-500 text-brand-700 hover:bg-brand-50",
        subtle: "bg-ink-100 text-ink-800 hover:bg-ink-200",
      },
      size: {
        xs: "h-7 px-2.5 text-xs",
        sm: "h-8 px-3 text-sm",
        md: "h-9.5 px-4 text-sm",
        lg: "h-11 px-5 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden />
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };