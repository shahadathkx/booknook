"use client";

import React from "react";
import { cn } from "cn";

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "default" | "lg" | "xl";
  label?: string;
  variant?: "mint" | "muted" | "white";
}

/**
 * Reusable BookNook Spinner component
 * Matches the dark forest-green & mint-green design palette.
 */
export function Spinner({
  size = "default",
  label,
  variant = "mint",
  className = "",
  ...props
}: SpinnerProps) {
  const sizeClasses = {
    sm: "size-4 border-2",
    default: "size-6 border-2",
    lg: "size-8 border-[2.5px]",
    xl: "size-12 border-3",
  };

  const variantClasses = {
    mint: "border-[#8fd9a8] border-t-transparent",
    muted: "border-muted-foreground/30 border-t-muted-foreground",
    white: "border-white border-t-transparent",
  };

  return (
    <div
      className={cn("inline-flex items-center gap-2.5", className)}
      role="status"
      aria-label={label || "Loading"}
      {...props}
    >
      <div
        className={cn(
          "rounded-full animate-spin shrink-0",
          sizeClasses[size],
          variantClasses[variant]
        )}
      />
      {label && <span className="text-xs font-medium text-muted-foreground">{label}</span>}
    </div>
  );
}
