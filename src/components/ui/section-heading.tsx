"use client";

import React from "react";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
  align?: "left" | "center";
  id?: string;
}

/**
 * Single consistent section heading style across BookNook:
 * - Font: Fraunces Serif
 * - Size: 2xl sm:3xl
 * - Color: Crisp theme foreground
 * - Eyebrow: Small orange step/category tag (#e0915a)
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  className = "",
  align = "left",
  id,
}: SectionHeadingProps) {
  const isCenter = align === "center";

  return (
    <div
      className={`mb-4 ${isCenter ? "text-center mx-auto" : "text-left"} ${className}`}
    >
      {eyebrow && (
        <span className="inline-block text-[#e0915a] text-[11px] font-bold uppercase tracking-widest mb-1">
          {eyebrow}
        </span>
      )}
      <h2 id={id} className="font-heading font-serif text-2xl sm:text-3xl font-bold tracking-tight text-foreground leading-tight">
        {title}
      </h2>
      {description && (
        <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 max-w-2xl leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
