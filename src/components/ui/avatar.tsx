import { cn } from "@/core/lib/utils";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

const avatarVariants = cva("relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-brand-500 to-accent-600 font-semibold text-white", {
  variants: {
    size: {
      xs: "h-6 w-6 text-[10px]",
      sm: "h-8 w-8 text-xs",
      md: "h-10 w-10 text-sm",
      lg: "h-12 w-12 text-base",
    },
  },
  defaultVariants: { size: "md" },
});

export function Avatar({
  name,
  image,
  className,
  size,
}: {
  name?: string | null;
  image?: string | null;
  className?: string;
  size?: VariantProps<typeof avatarVariants>["size"];
}) {
  const initials = (name || "GV")
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (image) {
    return (
      <span className={cn(avatarVariants({ size }), className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={name || "avatar"} className="h-full w-full object-cover" />
      </span>
    );
  }
  return <span className={cn(avatarVariants({ size }), className)}>{initials}</span>;
}