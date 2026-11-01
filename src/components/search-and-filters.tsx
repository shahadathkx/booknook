"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BookFilterStatus, BookGenre } from "@/types/book";
import { RiSearchLine, RiCloseLine, RiFilter3Line } from "react-icons/ri";

interface SearchAndFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusFilter: BookFilterStatus;
  onStatusChange: (status: BookFilterStatus) => void;
  genreFilter: string;
  onGenreChange: (genre: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  availableGenres: BookGenre[];
  onClearFilters: () => void;
  totalFilteredCount: number;
}

export function SearchAndFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  genreFilter,
  onGenreChange,
  sortBy,
  onSortChange,
  availableGenres,
  onClearFilters,
  totalFilteredCount,
}: SearchAndFiltersProps) {
  const isFiltered = searchQuery.trim() !== "" || statusFilter !== "all" || genreFilter !== "all";

  return (
    <div className="space-y-3.5 mb-6">
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by title, author, or ISBN..."
            className="pl-9 pr-8 text-sm h-10 rounded-full bg-card border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-[#8fd9a8]"
          />
          <RiSearchLine className="size-4 text-muted-foreground absolute left-3.5 top-3 pointer-events-none" />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-3 p-0.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
              aria-label="Clear search query"
            >
              <RiCloseLine className="size-4" />
            </button>
          )}
        </div>

        {/* Status Filter Segmented Control */}
        <div className="flex rounded-full p-1 bg-card border border-border self-start md:self-auto shrink-0">
          {(
            [
              { id: "all", label: "All Books" },
              { id: "available", label: "Available" },
              { id: "borrowed", label: "On Loan" },
            ] as const
          ).map((tab) => {
            const isSelected = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onStatusChange(tab.id)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${
                  isSelected
                    ? "bg-[#8fd9a8] text-[#0e1a14] shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Secondary Filter Line: Genre & Sort By */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <RiFilter3Line className="size-3.5 text-[#8fd9a8]" />
            <span>Genre:</span>
          </div>
          <select
            value={genreFilter}
            onChange={(e) => onGenreChange(e.target.value)}
            className="h-8 rounded-full border border-border bg-card px-3 py-1 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-[#8fd9a8]/40"
          >
            <option value="all">All Genres</option>
            {availableGenres.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1.5 text-muted-foreground ml-2">
            <span>Sort by:</span>
          </div>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="h-8 rounded-full border border-border bg-card px-3 py-1 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-[#8fd9a8]/40"
          >
            <option value="newest">Recently Added</option>
            <option value="title-asc">Title (A-Z)</option>
            <option value="author-asc">Author (A-Z)</option>
            <option value="year-desc">Publication Year (Newest)</option>
            <option value="year-asc">Publication Year (Oldest)</option>
          </select>
        </div>

        {/* Filter Count & Reset */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">
            Showing <strong className="text-foreground">{totalFilteredCount}</strong>{" "}
            {totalFilteredCount === 1 ? "volume" : "volumes"}
          </span>

          {isFiltered && (
            <Button
              variant="ghost"
              size="xs"
              onClick={onClearFilters}
              className="text-[#e0915a] hover:text-[#e0915a]/80 text-xs h-7 px-2 rounded-full"
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
