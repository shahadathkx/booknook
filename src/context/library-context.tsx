"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, useSyncExternalStore } from "react";
import { Book, AddBookInput, BorrowBookInput, BookCoverTheme, BookStatus } from "@/types/book";
import { INITIAL_BOOKS, COVER_THEMES } from "@/lib/seed-data";
import { siteConfig } from "@/lib/config";
import { useHydrated } from "@/hooks/use-hydrated";

const STORAGE_KEY = "booknook_library_catalog_v1";
const LIBRARY_CHANGE_EVENT = "booknook-library-change";

function subscribeToLibraryStorage(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(LIBRARY_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(LIBRARY_CHANGE_EVENT, onChange);
  };
}

function getLibraryStorageSnapshot(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function getServerLibraryStorageSnapshot(): null {
  return null;
}

function parseStoredBooks(serializedBooks: string | null): Book[] | null {
  if (!serializedBooks) return null;
  try {
    const parsed: unknown = JSON.parse(serializedBooks);
    return Array.isArray(parsed) && parsed.length > 0 ? (parsed as Book[]) : null;
  } catch {
    return null;
  }
}

interface LibraryContextType {
  books: Book[];
  isLoaded: boolean;
  totalCount: number;
  availableCount: number;
  borrowedCount: number;
  addBook: (input: AddBookInput) => { success: boolean; book?: Book; error?: string };
  updateBook: (bookId: string, updates: Partial<Book>) => { success: boolean; book?: Book; error?: string };
  deleteBook: (bookId: string) => { success: boolean; error?: string };
  borrowBook: (bookId: string, input: BorrowBookInput) => { success: boolean; book?: Book; error?: string };
  returnBook: (bookId: string) => { success: boolean; book?: Book; error?: string };
  getBookById: (bookId: string) => Book | undefined;
  resetCatalog: () => void;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const [memoryBooks, setMemoryBooks] = useState<Book[]>(INITIAL_BOOKS);
  const isLoaded = useHydrated();
  const serializedBooks = useSyncExternalStore(
    subscribeToLibraryStorage,
    getLibraryStorageSnapshot,
    getServerLibraryStorageSnapshot
  );
  const storedBooks = useMemo(() => parseStoredBooks(serializedBooks), [serializedBooks]);
  const books = storedBooks ?? memoryBooks;

  useEffect(() => {
    if (serializedBooks && !storedBooks) {
      console.warn("Could not load library catalog from localStorage, using seed data.");
    }
  }, [serializedBooks, storedBooks]);


  const saveBooks = (updated: Book[]) => {
    setMemoryBooks(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event(LIBRARY_CHANGE_EVENT));
    } catch (e) {
      console.error("Failed to persist catalog:", e);
    }
  };

  const addBook = (input: AddBookInput): { success: boolean; book?: Book; error?: string } => {

    const cleanTitle = input.title?.trim() || "";
    const cleanAuthor = input.author?.trim() || "";
    const cleanDescription = input.description?.trim() || "";
    const resolvedIsbn =
      input.isbn?.trim() ||
      `978-0${Math.floor(100000000 + Math.random() * 900000000)}`;

    if (!cleanTitle || cleanTitle.length < 2) {
      return { success: false, error: "Please enter a valid book title (at least 2 characters)." };
    }
    if (!cleanAuthor || cleanAuthor.length < 2) {
      return { success: false, error: "Please enter an author name (at least 2 characters)." };
    }
    if (!cleanDescription || cleanDescription.length < 10) {
      return { success: false, error: "Please enter a descriptive synopsis (at least 10 characters)." };
    }

    const year = Number(input.publishedYear) || new Date().getFullYear();


    const themeKey = input.coverThemeName || "emerald";
    const selectedTheme: BookCoverTheme = COVER_THEMES[themeKey] || COVER_THEMES.emerald;

    const totalCopies = Math.max(1, input.totalCopies || 1);
    const availableCopies =
      typeof input.availableCopies === "number"
        ? input.availableCopies
        : totalCopies;

    const newBook: Book = {
      id: `bn-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      title: cleanTitle,
      author: cleanAuthor,
      genre: input.genre,
      category: input.category || input.genre,
      isbn: resolvedIsbn,
      publishedYear: year,
      description: cleanDescription,
      coverTheme: selectedTheme,
      coverImage: input.coverImage,
      totalCopies,
      availableCopies,
      addedBy: input.addedBy,
      status: "available",
      currentBorrow: null,
      addedAt: new Date().toISOString(),
    };

    const updated = [newBook, ...books];
    saveBooks(updated);
    return { success: true, book: newBook };
  };

  const updateBook = (
    bookId: string,
    updates: Partial<Book>
  ): { success: boolean; book?: Book; error?: string } => {
    const target = books.find((b) => b.id === bookId);
    if (!target) {
      return { success: false, error: "Book not found in library catalog." };
    }

    const updatedBook: Book = {
      ...target,
      ...updates,
      id: target.id,
    };

    const updated = books.map((b) => (b.id === bookId ? updatedBook : b));
    saveBooks(updated);
    return { success: true, book: updatedBook };
  };

  const deleteBook = (bookId: string): { success: boolean; error?: string } => {
    const exists = books.some((b) => b.id === bookId);
    if (!exists) {
      return { success: false, error: "Book not found in library catalog." };
    }

    const updated = books.filter((b) => b.id !== bookId);
    saveBooks(updated);
    return { success: true };
  };

  const borrowBook = (
    bookId: string,
    input: BorrowBookInput
  ): { success: boolean; book?: Book; error?: string } => {
    const cleanName = input.borrowerName?.trim();
    if (!cleanName || cleanName.length < 2) {
      return { success: false, error: "Please provide the borrower's full name (at least 2 characters)." };
    }

    const targetBook = books.find((b) => b.id === bookId);
    if (!targetBook) {
      return { success: false, error: "Book not found in library registry." };
    }

    const currentCopies =
      typeof targetBook.availableCopies === "number"
        ? targetBook.availableCopies
        : targetBook.status === "available"
        ? 1
        : 0;

    if (currentCopies <= 0) {
      return {
        success: false,
        error: "Not Available",
      };
    }

    const loanDays = input.loanDurationDays > 0 ? input.loanDurationDays : siteConfig.defaultLoanDays;
    const borrowedAt = new Date();
    const dueDate = new Date(borrowedAt.getTime() + loanDays * 24 * 60 * 60 * 1000);

    const updatedBooks = books.map((book) => {
      if (book.id === bookId) {
        const newCopies = Math.max(0, currentCopies - 1);
        return {
          ...book,
          status: (newCopies === 0 ? "borrowed" : "available") as BookStatus,
          availableCopies: newCopies,
          currentBorrow: {
            id: `brw-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
            borrowerName: cleanName,
            borrowerEmail: input.borrowerEmail?.trim() || undefined,
            borrowedAt: borrowedAt.toISOString(),
            dueDate: dueDate.toISOString(),
            notes: input.notes?.trim() || undefined,
          },
        };
      }
      return book;
    });

    saveBooks(updatedBooks);
    const updatedBook = updatedBooks.find((b) => b.id === bookId);
    return { success: true, book: updatedBook };
  };

  const returnBook = (bookId: string): { success: boolean; book?: Book; error?: string } => {
    const targetBook = books.find((b) => b.id === bookId);
    if (!targetBook) {
      return { success: false, error: "Book not found in library registry." };
    }

    const updatedBooks = books.map((book) => {
      if (book.id === bookId) {
        const currentCopies =
          typeof book.availableCopies === "number" ? book.availableCopies : 0;
        const total = book.totalCopies ?? Math.max(1, currentCopies + 1);
        const newCopies = Math.min(total, currentCopies + 1);
        return {
          ...book,
          status: "available" as const,
          availableCopies: newCopies,
          currentBorrow: null,
        };
      }
      return book;
    });

    saveBooks(updatedBooks);
    const updatedBook = updatedBooks.find((b) => b.id === bookId);
    return { success: true, book: updatedBook };
  };

  const getBookById = (bookId: string) => {
    return books.find((b) => b.id === bookId);
  };

  const resetCatalog = () => {
    saveBooks(INITIAL_BOOKS);
  };

  const totalCount = books.length;
  const availableCount = useMemo(() => books.filter((b) => b.status === "available").length, [books]);
  const borrowedCount = useMemo(() => books.filter((b) => b.status === "borrowed").length, [books]);

  return (
    <LibraryContext.Provider
      value={{
        books,
        isLoaded,
        totalCount,
        availableCount,
        borrowedCount,
        addBook,
        updateBook,
        deleteBook,
        borrowBook,
        returnBook,
        getBookById,
        resetCatalog,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error("useLibrary must be used within a LibraryProvider");
  }
  return context;
}
