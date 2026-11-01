"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { BookNookButton } from "@/components/ui/booknook-button";
import { siteConfig } from "@/lib/config";
import { RiBookReadLine, RiBookletLine, RiArrowDownLine, RiSparklingLine } from "react-icons/ri";

interface LibraryHeroProps {
  onOpenAddBook: () => void;
  onOpenLoans: () => void;
  onScrollToCatalog: () => void;
}

export function LibraryHero({
  onOpenAddBook,
  onOpenLoans,
  onScrollToCatalog,
}: LibraryHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card via-card to-background p-6 sm:p-10 shadow-sm mb-8">
      {/* Background ambient decorative motif */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 size-72 rounded-full bg-[#8fd9a8]/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 -mb-12 size-60 rounded-full bg-[#e0915a]/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-3xl">
        {/* Eyebrow Label */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#e0915a]/15 text-[#e0915a] border border-[#e0915a]/25 mb-4">
          <RiSparklingLine className="size-3 text-[#e0915a]" />
          <span>{siteConfig.libraryBranch} • Open Circulation</span>
        </div>

        {/* Section Heading */}
        <h1 className="font-heading font-serif text-3xl sm:text-5xl font-bold tracking-tight text-foreground leading-[1.15]">
          A Curated Sanctuary for Great Stories.
        </h1>

        <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl font-sans">
          Welcome to <strong className="text-foreground">{siteConfig.appName}</strong>. Add new literary acquisitions, borrow available volumes for your reading nook, and easily check books back onto the shelves when finished.
        </p>

        {/* Quick Action Buttons - Reusing ONE rounded mint green button style */}
        <div className="flex flex-wrap items-center gap-3 mt-6">
          <BookNookButton size="default" onClick={onOpenAddBook}>
            <RiBookReadLine className="size-4" />
            <span>Add a Book</span>
          </BookNookButton>

          <Button
            variant="outline"
            size="default"
            onClick={onOpenLoans}
            className="rounded-full text-xs font-semibold gap-2 border-border bg-card hover:bg-muted text-foreground"
          >
            <RiBookletLine className="size-4 text-[#8fd9a8]" />
            <span>Manage Active Loans</span>
          </Button>

          <Button
            variant="ghost"
            size="default"
            onClick={onScrollToCatalog}
            className="rounded-full text-muted-foreground hover:text-foreground text-xs gap-1.5"
          >
            <span>Explore Shelves</span>
            <RiArrowDownLine className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
