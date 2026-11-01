"use client";

import React from "react";

export interface BookNookButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "default" | "lg" | "icon";
  children: React.ReactNode;
}

/**
 * Standard BookNook button style:
 * Reuses the ONE consistent button style specified:
 * - Rounded full pill shape
 * - Mint green (#8fd9a8) primary background
 * - Deep green-black (#0e1a14) contrasting text
 * - Tactile micro-interactions (hover scale, subtle shadow)
 */
export function BookNookButton({
  variant = "primary",
  size = "default",
  className = "",
  children,
  ...props
}: BookNookButtonProps) {
  // Base classes for consistent rounded button
  const base =
    "inline-flex items-center justify-center font-medium transition-all duration-200 select-none outline-none disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";

  // Size mappings
  const sizes = {
    sm: "h-8 px-3.5 text-xs rounded-full gap-1.5",
    default: "h-10 px-5 text-sm rounded-full gap-2",
    lg: "h-12 px-6 text-base rounded-full gap-2.5",
    icon: "size-9 p-0 rounded-full",
  };

  // Variants (Defaulting to the designated rounded mint-green style)
  const variants = {
    primary:
      "bg-[#8fd9a8] hover:bg-[#7bc895] text-[#0e1a14] font-semibold shadow-xs hover:shadow-md hover:scale-[1.02]",
    secondary:
      "bg-[#15251d] hover:bg-[#1c3328] text-[#e6f0ea] border border-[#1f362b] shadow-xs",
    outline:
      "border border-[#8fd9a8]/40 hover:border-[#8fd9a8] text-[#8fd9a8] hover:bg-[#8fd9a8]/10",
    ghost:
      "hover:bg-[#8fd9a8]/10 text-[#e6f0ea] hover:text-[#8fd9a8]",
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
