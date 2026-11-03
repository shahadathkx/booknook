"use client";

import React, { useState, useEffect, useTransition, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Book } from "@/types/book";
import { fetchBooks } from "@/lib/books";
import { CatalogBookCard } from "@/components/books/catalog-book-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { Spinner } from "@/components/ui/spinner";
import { BookNookButton } from "@/components/ui/booknook-button";
import {
  RiSearchLine,
  RiCloseLine,
  RiFilter3Line,
  RiBook2Line,
  RiRefreshLine,
} from "react-icons/ri";

const CATEGORIES = [
  "All Categories",
  "Fiction",
  "Science Fiction",
  "Classic Literature",
  "Science",
  "History",
  "Kids",
  "Philosophy",
  "Non-Fiction",
];

function getBookIdentity(book: Book): string {
  const isbn = book.isbn?.replace(/[^a-z0-9]/gi, "").toLowerCase();
  if (isbn) return `isbn:${isbn}`;

  const title = book.title.trim().toLowerCase().replace(/\s+/g, " ");
  const author = book.author.trim().toLowerCase().replace(/\s+/g, " ");
  return title && author ? `title:${title}|author:${author}` : `id:${book.id}`;
}

export function BooksCatalogView() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialCategory = searchParams.get("category") || "All Categories";
  const initialSearch = searchParams.get("search") || "";

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [, startTransition] = useTransition();


  const loadBooks = useCallback(async (cat: string, search: string) => {
    setIsLoading(true);
    try {
      const data = await fetchBooks({
        category: cat === "All Categories" ? undefined : cat,
        search: search.trim() || undefined,
        sort: "newest",
      });
      setBooks(Array.from(new Map(data.map((book) => [getBookIdentity(book), book])).values()));
    } catch {
      setBooks([]);
    } finally {
      setIsLoading(false);
    }
  }, []);


  useEffect(() => {
    const handler = setTimeout(() => {
      loadBooks(selectedCategory, searchQuery);
    }, 250);

    return () => clearTimeout(handler);
  }, [selectedCategory, searchQuery, loadBooks]);


  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    startTransition(() => {
      const params = new URLSearchParams(window.location.search);
      if (category === "All Categories") {
        params.delete("category");
      } else {
        params.set("category", category);
      }
      const newQuery = params.toString();
      router.replace(newQuery ? `/books?${newQuery}` : "/books", { scroll: false });
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    startTransition(() => {
      const params = new URLSearchParams(window.location.search);
      if (val.trim()) {
        params.set("search", val.trim());
      } else {
        params.delete("search");
      }
      const newQuery = params.toString();
      router.replace(newQuery ? `/books?${newQuery}` : "/books", { scroll: false });
    });
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All Categories");
    router.replace("/books", { scroll: false });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 border-b border-border">
        <div>
          <SectionHeading
            eyebrow="Open Circulation Catalog"
            title="Explore All Books"
            description="Browse community-shared literature across history, science, fiction, and philosophy. Search titles, authors, or filter by category."
          />
        </div>

        {/* Catalog quick stats */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground px-4 py-2 rounded-full bg-card border border-border shrink-0 self-start md:self-end">
          <RiBook2Line className="size-4 text-[#8fd9a8]" />
          <span>
            {isLoading ? (
              "Updating shelves..."
            ) : (
              <>
                <strong className="text-foreground">{books.length}</strong>{" "}
                {books.length === 1 ? "unique book" : "unique books"} listed
              </>
            )}
          </span>
        </div>
      </div>

      {/* Search and Category Filter Toolbar */}
      <div className="py-6 flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Search Box */}
          <div className="relative flex-1">
            <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search by title, author, or keyword..."
              className="w-full pl-10 pr-10 py-3 rounded-2xl bg-card border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-[#8fd9a8] focus:ring-1 focus:ring-[#8fd9a8] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted transition-colors"
              >
                <RiCloseLine className="size-4" />
              </button>
            )}
          </div>

          {/* Category Dropdown (Mobile-friendly alternative to pills) */}
          <div className="sm:hidden relative">
            <RiFilter3Line className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full pl-9 pr-8 py-3 rounded-2xl bg-card border border-border text-foreground text-sm focus:outline-none focus:border-[#8fd9a8] appearance-none"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pills (Visible on tablet and desktop) */}
        <div className="hidden sm:flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-1 flex items-center gap-1.5">
            <RiFilter3Line className="size-3.5 text-[#e0915a]" />
            Categories:
          </span>
          {CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => handleCategoryChange(category)}
                className={`text-xs font-medium px-3.5 py-1.5 rounded-full transition-all duration-200 border ${
                  isSelected
                    ? "bg-[#8fd9a8] text-[#0e1a14] border-[#8fd9a8] font-semibold shadow-sm"
                    : "bg-card text-muted-foreground border-border hover:border-[#8fd9a8]/50 hover:text-foreground"
                }`}
              >
                {category}
              </button>
            );
          })}

          {(searchQuery || selectedCategory !== "All Categories") && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-xs text-[#e0915a] hover:text-[#e0915a]/80 font-medium ml-auto flex items-center gap-1 hover:underline px-2 py-1"
            >
              <RiRefreshLine className="size-3.5" />
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area: Spinner / Grid / Empty State */}
      <div className="mt-4 min-h-[380px]">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-4 text-center">
            <Spinner size="lg" />
            <div>
              <p className="font-heading font-serif text-lg font-bold text-foreground">
                Retrieving Books from Shelves
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Querying the library database for current circulation records...
              </p>
            </div>
          </div>
        ) : books.length === 0 ? (

          <div className="py-20 px-6 max-w-lg mx-auto text-center rounded-3xl border border-border bg-card/60 shadow-sm flex flex-col items-center justify-center">
            <div className="size-16 rounded-2xl bg-[#15251d] border border-[#1f362b] text-[#e0915a] flex items-center justify-center mb-4 shadow-inner">
              <RiBook2Line className="size-8" />
            </div>

            <span className="text-[11px] font-bold uppercase tracking-widest text-[#e0915a] mb-2">
              No Matches Found
            </span>

            <h3 className="font-heading font-serif text-2xl font-bold text-foreground mb-2">
              No Books Found in Catalog
            </h3>

            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              {searchQuery
                ? `We could not find any titles or authors matching "${searchQuery}". Try verifying the spelling or exploring another category.`
                : "There are currently no volumes cataloged under this specific category filter. Check back soon or select a different category."}
            </p>

            <BookNookButton
              variant="primary"
              size="default"
              onClick={handleClearFilters}
              className="gap-2"
            >
              <RiRefreshLine className="size-4" />
              <span>Browse All Books</span>
            </BookNookButton>
          </div>
        ) : (

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <CatalogBookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
