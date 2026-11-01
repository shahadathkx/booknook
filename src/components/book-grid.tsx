"use client";

import React from "react";
import { Book } from "@/types/book";
import { BookCard } from "@/components/book-card";
import { EmptyState } from "@/components/empty-state";

interface BookGridProps {
  books: Book[];
  hasFilters: boolean;
  onClearFilters: () => void;
  onOpenAddBook: () => void;
  onBorrowClick: (book: Book) => void;
  onReturnClick: (book: Book) => void;
  onDetailsClick: (book: Book) => void;
}

export function BookGrid({
  books,
  hasFilters,
  onClearFilters,
  onOpenAddBook,
  onBorrowClick,
  onReturnClick,
  onDetailsClick,
}: BookGridProps) {
  if (books.length === 0) {
    return (
      <EmptyState
        hasFilters={hasFilters}
        onClearFilters={onClearFilters}
        onOpenAddBook={onOpenAddBook}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {books.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          onBorrowClick={onBorrowClick}
          onReturnClick={onReturnClick}
          onDetailsClick={onDetailsClick}
        />
      ))}
    </div>
  );
}
