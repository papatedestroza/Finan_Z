import { type ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-accent-foreground hover:brightness-110",
  secondary:
    "bg-surface-raised text-foreground border border-border hover:border-foreground-subtle",
  ghost: "text-foreground-muted hover:text-foreground",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", className = "", ...props }, ref) => (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-medium tracking-wide transition-[filter,border-color,color] active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none ${variants[variant]} ${className}`}
      {...props}
    />
  )
);

Button.displayName = "Button";
