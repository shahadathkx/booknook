"use client";

import React from "react";
import { useLibrary } from "@/context/library-context";
import { BookFilterStatus } from "@/types/book";
import { RiBookReadLine, RiCheckboxCircleLine, RiBookmark3Line } from "react-icons/ri";

interface StatsBannerProps {
  currentFilter: BookFilterStatus;
  onFilterSelect: (filter: BookFilterStatus) => void;
}

export function StatsBanner({ currentFilter, onFilterSelect }: StatsBannerProps) {
  const { totalCount, availableCount, borrowedCount } = useLibrary();

  const stats = [
    {
      id: "all" as const,
      label: "Total Collection",
      sublabel: "Cataloged in library",
      value: totalCount,
      icon: RiBookReadLine,
      colorClass: "text-[#8fd9a8]",
      bgClass: "bg-[#8fd9a8]/10 border-[#8fd9a8]/20",
      activeRing: "ring-2 ring-[#8fd9a8]",
    },
    {
      id: "available" as const,
      label: "Available to Borrow",
      sublabel: "Ready on shelves",
      value: availableCount,
      icon: RiCheckboxCircleLine,
      colorClass: "text-[#8fd9a8]",
      bgClass: "bg-[#8fd9a8]/15 border-[#8fd9a8]/25",
      activeRing: "ring-2 ring-[#8fd9a8]",
    },
    {
      id: "borrowed" as const,
      label: "Currently on Loan",
      sublabel: "Checked out by patrons",
      value: borrowedCount,
      icon: RiBookmark3Line,
      colorClass: "text-[#e0915a]",
      bgClass: "bg-[#e0915a]/15 border-[#e0915a]/25",
      activeRing: "ring-2 ring-[#e0915a]",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 my-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const isActive = currentFilter === stat.id;

        return (
          <button
            key={stat.id}
            type="button"
            onClick={() => onFilterSelect(stat.id)}
            className={`group text-left p-4 rounded-2xl border transition-all duration-200 bg-card hover:border-[#8fd9a8]/50 ${
              isActive
                ? `border-[#8fd9a8] shadow-sm ${stat.activeRing}`
                : "border-border"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                {stat.label}
              </span>
              <div className={`p-2 rounded-xl border ${stat.bgClass}`}>
                <Icon className={`size-4 ${stat.colorClass}`} />
              </div>
            </div>

            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-heading font-serif text-3xl font-bold tracking-tight text-foreground">
                {stat.value}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {stat.sublabel}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
