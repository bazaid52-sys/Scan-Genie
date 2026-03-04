import * as React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Beautiful, tactile button component
export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "default" | "secondary" | "outline" | "ghost" | "destructive" | "glass";
    size?: "default" | "sm" | "lg" | "icon";
  }
>(({ className, variant = "default", size = "default", ...props }, ref) => {
  const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";
  
  const variants = {
    default: "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    outline: "border-2 border-border bg-transparent hover:bg-secondary hover:text-secondary-foreground",
    ghost: "hover:bg-secondary hover:text-secondary-foreground",
    destructive: "bg-destructive text-destructive-foreground shadow-lg shadow-destructive/25 hover:bg-destructive/90 hover:shadow-xl",
    glass: "bg-white/20 backdrop-blur-md text-white border border-white/30 hover:bg-white/30 shadow-lg",
  };
  
  const sizes = {
    default: "h-11 px-5 py-2",
    sm: "h-9 px-3 rounded-lg",
    lg: "h-14 px-8 rounded-2xl text-base",
    icon: "h-11 w-11",
  };

  return (
    <button
      ref={ref}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    />
  );
});
Button.displayName = "Button";

// Depth-rich Card component
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-border/50 bg-card text-card-foreground shadow-xl shadow-black/5 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-black/10",
        className
      )}
      {...props}
    />
  );
}
