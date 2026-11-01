"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { BookX, RotateCcw, Plus } from "lucide-react";

interface EmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
  onOpenAddBook: () => void;
}

export function EmptyState({
  hasFilters,
  onClearFilters,
  onOpenAddBook,
}: EmptyStateProps) {
  return (
    <div className="text-center py-16 px-4 rounded-3xl border border-dashed border-stone-300 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/20 max-w-lg mx-auto my-8">
      <div className="size-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4">
        <BookX className="size-7" />
      </div>

      <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
        {hasFilters ? "No Matching Volumes Found" : "The Library Shelf is Empty"}
      </h3>

      <p className="text-xs text-stone-600 dark:text-stone-400 max-w-sm mx-auto mt-1.5 leading-relaxed">
        {hasFilters
          ? "We could not locate any titles matching your current search criteria or category filter."
          : "There are currently no books cataloged in this collection. Be the first to add a volume!"}
      </p>

      <div className="flex items-center justify-center gap-3 mt-6">
        {hasFilters ? (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="text-xs gap-1.5"
          >
            <RotateCcw className="size-3.5" />
            Clear Filter Criteria
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={onOpenAddBook}
            className="bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs gap-1.5"
          >
            <Plus className="size-3.5" />
            Add First Book
          </Button>
        )}
      </div>
    </div>
  );
}
