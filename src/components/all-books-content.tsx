"use client";

import React, { useState, useMemo } from "react";
import { useLibrary } from "@/context/library-context";
import { Book, BookFilterStatus, BookGenre } from "@/types/book";
import { SectionHeading } from "@/components/ui/section-heading";
import { SearchAndFilters } from "@/components/search-and-filters";
import { BookGrid } from "@/components/book-grid";
import { AddBookDialog } from "@/components/dialogs/add-book-dialog";
import { BorrowBookDialog } from "@/components/dialogs/borrow-book-dialog";
import { ReturnBookDialog } from "@/components/dialogs/return-book-dialog";
import { BookDetailsDialog } from "@/components/dialogs/book-details-dialog";
import { Spinner } from "@/components/ui/spinner";
import { BookNookButton } from "@/components/ui/booknook-button";
import { RiAddCircleLine, RiBookOpenLine } from "react-icons/ri";

export function AllBooksContent() {
  const { books, isLoaded, totalCount, availableCount, borrowedCount } = useLibrary();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookFilterStatus>("all");
  const [genreFilter, setGenreFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  // Modals state
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);
  const [borrowTargetBook, setBorrowTargetBook] = useState<Book | null>(null);
  const [returnTargetBook, setReturnTargetBook] = useState<Book | null>(null);
  const [detailsTargetBook, setDetailsTargetBook] = useState<Book | null>(null);

  const availableGenres = useMemo(() => {
    const set = new Set<BookGenre>();
    books.forEach((b) => set.add(b.genre));
    return Array.from(set);
  }, [books]);

  const filteredAndSortedBooks = useMemo(() => {
    return books
      .filter((book) => {
        if (statusFilter !== "all" && book.status !== statusFilter) {
          return false;
        }

        if (genreFilter !== "all" && book.genre !== genreFilter) {
          return false;
        }

        if (searchQuery.trim() !== "") {
          const query = searchQuery.toLowerCase().trim();
          const matchTitle = book.title.toLowerCase().includes(query);
          const matchAuthor = book.author.toLowerCase().includes(query);
          const matchIsbn = book.isbn.toLowerCase().includes(query);
          const matchDescription = book.description.toLowerCase().includes(query);
          const matchBorrower = book.currentBorrow?.borrowerName.toLowerCase().includes(query);

          if (!matchTitle && !matchAuthor && !matchIsbn && !matchDescription && !matchBorrower) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "title-asc") return a.title.localeCompare(b.title);
        if (sortBy === "author-asc") return a.author.localeCompare(b.author);
        if (sortBy === "year-desc") return b.publishedYear - a.publishedYear;
        if (sortBy === "year-asc") return a.publishedYear - b.publishedYear;
        return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
      });
  }, [books, searchQuery, statusFilter, genreFilter, sortBy]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setGenreFilter("all");
    setSortBy("newest");
  };

  const activeDetailsBook = useMemo(() => {
    if (!detailsTargetBook) return null;
    return books.find((b) => b.id === detailsTargetBook.id) || detailsTargetBook;
  }, [books, detailsTargetBook]);

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header with Title and Add Book Action */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-border">
        <div>
          <SectionHeading
            eyebrow="Complete Collection"
            title="All Books Catalog"
            description="Explore our complete archive of literary fiction, classics, philosophies, and modern works available for circulation."
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground px-3 py-1.5 rounded-full bg-card border border-border">
            <RiBookOpenLine className="size-4 text-[#8fd9a8]" />
            <span>
              <strong>{totalCount}</strong> total •{" "}
              <strong className="text-[#8fd9a8]">{availableCount}</strong> available •{" "}
              <strong className="text-[#e0915a]">{borrowedCount}</strong> borrowed
            </span>
          </div>

          <BookNookButton
            onClick={() => setIsAddBookOpen(true)}
            size="default"
            className="gap-2 shrink-0"
          >
            <RiAddCircleLine className="size-4" />
            <span>Add Book</span>
          </BookNookButton>
        </div>
      </div>

      {/* Search, Filter, & Sort Toolbar */}
      <div className="pt-6">
        <SearchAndFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          genreFilter={genreFilter}
          onGenreChange={setGenreFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
          availableGenres={availableGenres}
          onClearFilters={handleClearFilters}
          totalFilteredCount={filteredAndSortedBooks.length}
        />
      </div>

      {/* Book Grid Area */}
      <div className="mt-8">
        {!isLoaded ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-center">
            <Spinner size="lg" />
            <p className="text-xs text-muted-foreground">Opening library shelves...</p>
          </div>
        ) : (
          <BookGrid
            books={filteredAndSortedBooks}
            hasFilters={searchQuery !== "" || statusFilter !== "all" || genreFilter !== "all"}
            onClearFilters={handleClearFilters}
            onOpenAddBook={() => setIsAddBookOpen(true)}
            onBorrowClick={(book) => setBorrowTargetBook(book)}
            onReturnClick={(book) => setReturnTargetBook(book)}
            onDetailsClick={(book) => setDetailsTargetBook(book)}
          />
        )}
      </div>

      {/* Modal Dialogs */}
      <AddBookDialog open={isAddBookOpen} onOpenChange={setIsAddBookOpen} />

      <BorrowBookDialog
        book={borrowTargetBook}
        open={!!borrowTargetBook}
        onOpenChange={(open) => !open && setBorrowTargetBook(null)}
      />

      <ReturnBookDialog
        book={returnTargetBook}
        open={!!returnTargetBook}
        onOpenChange={(open) => !open && setReturnTargetBook(null)}
      />

      <BookDetailsDialog
        book={activeDetailsBook}
        open={!!detailsTargetBook}
        onOpenChange={(open) => !open && setDetailsTargetBook(null)}
        onBorrowClick={(book) => {
          setDetailsTargetBook(null);
          setBorrowTargetBook(book);
        }}
        onReturnClick={(book) => {
          setDetailsTargetBook(null);
          setReturnTargetBook(book);
        }}
      />
    </div>
  );
}
