import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "quiet";

/** Shared by real buttons and Next links; navigation and form semantics stay native. */
export function buttonClassName(variant: ButtonVariant = "primary", className = "") {
  return `arcade-button arcade-button--${variant} ${className}`.trim();
}

export function ArcadeButton({ variant = "primary", className = "", type = "submit", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return <button type={type} className={buttonClassName(variant, className)} {...props} />;
}
