"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Book } from "@/types/book";
import { normalizeBook } from "@/lib/books";
import { useAuth } from "@/hooks/use-auth";
import { useLibrary } from "@/context/library-context";
import { SectionHeading } from "@/components/ui/section-heading";
import { BookNookButton } from "@/components/ui/booknook-button";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { EditBookModal } from "@/components/dialogs/edit-book-modal";
import { DeleteBookModal } from "@/components/dialogs/delete-book-modal";
import { ApiError, api } from "@/lib/api";
import { getJwt } from "@/lib/auth-client";
import toast from "react-hot-toast";
import {
  RiBookMarkedLine,
  RiAddCircleLine,
  RiEditLine,
  RiDeleteBin7Line,
  RiImageLine,
  RiBookOpenLine,
} from "react-icons/ri";

export function MyBooksContent() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading, isPending } = useAuth();
  const { books: contextBooks, updateBook: contextUpdateBook, deleteBook: contextDeleteBook } = useLibrary();

  const [userBooks, setUserBooks] = useState<Book[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(true);


  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [deletingBook, setDeletingBook] = useState<Book | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);


  useEffect(() => {
    if (!isPending && !isAuthLoading && !user) {
      router.replace("/login?callbackUrl=/my-books");
    }
  }, [isPending, isAuthLoading, user, router]);


  const fetchUserBooks = useCallback(async (userEmail: string) => {
    try {
      const token = await getJwt(true);
      setIsFetching(true);
      const response = await api.get<{ data?: unknown[] } | unknown[]>("/books/my", {
        token: token || undefined,
      });
      const items = Array.isArray(response) ? response : response.data;
      if (!Array.isArray(items)) {
        throw new Error("The server returned an invalid books response.");
      }

      setUserBooks(items.map(normalizeBook));
      setIsFetching(false);
      return;
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        router.replace("/login?callbackUrl=/my-books");
        setUserBooks([]);
        setIsFetching(false);
        return;
      }

      if (error instanceof ApiError && error.status !== 0) {
        toast.error(error.message);
        setUserBooks([]);
        setIsFetching(false);
        return;
      }

      console.warn("Books service unavailable; using the local catalog.", error);
    }


    const emailLower = userEmail.toLowerCase().trim();
    const matched = contextBooks.filter((book) => {
      if (typeof book.addedBy === "object" && book.addedBy?.email) {
        return book.addedBy.email.toLowerCase().trim() === emailLower;
      }
      if (typeof book.addedBy === "string") {
        return book.addedBy.toLowerCase().trim() === emailLower;
      }
      return false;
    });

    setUserBooks(matched);
    setIsFetching(false);
  }, [contextBooks, router]);

  useEffect(() => {
    if (!user?.email) return;
    const userEmail = user.email;
    const timer = window.setTimeout(() => {
      void fetchUserBooks(userEmail);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [user, isAuthLoading, fetchUserBooks]);


  const handleBookUpdated = (updatedBook: Book) => {

    setUserBooks((prev) =>
      prev.map((b) => (b.id === updatedBook.id ? updatedBook : b))
    );

    contextUpdateBook(updatedBook.id, updatedBook);
  };


  const handleBookDeleted = (deletedId: string) => {

    setUserBooks((prev) => prev.filter((b) => b.id !== deletedId));

    contextDeleteBook(deletedId);
  };


  if (isPending || isAuthLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 flex flex-col items-center justify-center gap-4 text-center">
        <Spinner size="lg" />
        <div>
          <p className="font-heading font-serif text-lg font-bold text-foreground">
            Opening Your Personal Reading Sanctuary
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Verifying patron credentials to access your contributed shelf...
          </p>
        </div>
      </div>
    );
  }


  if (!user) {
    return null;
  }

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      { }
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 border-b border-border">
        <div>
          <SectionHeading
            eyebrow="Curated Contributions"
            title="My Books & Shelf Inventory"
            description="Manage books you have contributed to the BookNook community library. Edit circulation details, update descriptions, or remove titles."
          />
        </div>

        <div className="flex items-center gap-3 shrink-0 self-start md:self-end">
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground px-3.5 py-1.5 rounded-full bg-card border border-border">
            <RiBookOpenLine className="size-4 text-[#8fd9a8]" />
            <span>
              Patron: <strong className="text-foreground">{user.name || user.email}</strong>
            </span>
          </div>

          <Link href="/add-book">
            <BookNookButton size="default" className="gap-2">
              <RiAddCircleLine className="size-4" />
              <span>Add Book</span>
            </BookNookButton>
          </Link>
        </div>
      </div>

      { }
      <div className="mt-8">
        {isFetching ? (
          <div className="py-24 flex flex-col items-center justify-center gap-4 text-center">
            <Spinner size="lg" />
            <div>
              <p className="font-heading font-serif text-lg font-bold text-foreground">
                Loading Your Bookshelf
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Retrieving your contributed books from the circulation registry...
              </p>
            </div>
          </div>
        ) : userBooks.length === 0 ? (

          <div className="py-20 px-6 max-w-lg mx-auto text-center rounded-3xl border border-border bg-card shadow-sm flex flex-col items-center justify-center">
            <div className="size-16 rounded-2xl bg-[#15251d] border border-[#1f362b] text-[#8fd9a8] flex items-center justify-center mb-4 shadow-inner">
              <RiBookMarkedLine className="size-8" />
            </div>

            <span className="text-[11px] font-bold uppercase tracking-widest text-[#e0915a] mb-2">
              Personal Catalog
            </span>

            <h3 className="font-heading font-serif text-2xl font-bold text-foreground mb-2">
              No Contributed Books on Your Shelf
            </h3>

            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              You haven&apos;t added any books to the BookNook community shelves yet. Share your favorite fiction, science, or history volume to make it available for fellow patrons to borrow.
            </p>

            <Link href="/add-book">
              <BookNookButton variant="primary" size="default" className="gap-2">
                <RiAddCircleLine className="size-4" />
                <span>Add Your First Book</span>
              </BookNookButton>
            </Link>
          </div>
        ) : (
          <div>
            { }
            <div className="hidden md:block rounded-3xl border border-border bg-card overflow-hidden shadow-lg">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-background/50 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    <th scope="col" className="py-4 px-6 w-24">
                      Cover
                    </th>
                    <th scope="col" className="py-4 px-6">
                      Title & Author
                    </th>
                    <th scope="col" className="py-4 px-6">
                      Category
                    </th>
                    <th scope="col" className="py-4 px-6">
                      Copies
                    </th>
                    <th scope="col" className="py-4 px-6 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-sm">
                  {userBooks.map((book) => {
                    const copies =
                      typeof book.totalCopies === "number"
                        ? book.totalCopies
                        : typeof book.availableCopies === "number"
                        ? book.availableCopies
                        : 1;

                    const categoryName = book.category || book.genre;

                    return (
                      <tr
                        key={book.id}
                        className="hover:bg-muted/30 transition-colors group"
                      >
                        { }
                        <td className="py-4 px-6">
                          <div className="relative aspect-[2/3] w-14 rounded-xl overflow-hidden bg-[#15251d] border border-border shadow-sm shrink-0">
                            {book.coverImage ? (
                              <Image
                                src={book.coverImage}
                                alt={book.title}
                                fill
                                className="object-cover"
                                unoptimized={!book.coverImage.startsWith("/")}
                              />
                            ) : (
                              <div
                                className={`w-full h-full bg-gradient-to-br ${
                                  book.coverTheme?.gradientClass ||
                                  "from-slate-900 to-indigo-950"
                                } flex items-center justify-center p-1 text-center`}
                              >
                                <RiImageLine className="size-4 text-amber-200" />
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Title & Author */}
                        <td className="py-4 px-6">
                          <Link
                            href={`/books/${book.id}`}
                            className="font-heading font-serif font-bold text-base text-foreground group-hover:text-[#8fd9a8] transition-colors line-clamp-1 block"
                          >
                            {book.title}
                          </Link>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            by {book.author}
                          </p>
                          <span className="text-[11px] text-muted-foreground/80 mt-1 block">
                            ISBN: {book.isbn || "Unassigned"}
                          </span>
                        </td>

                        {/* Category */}
                        <td className="py-4 px-6">
                          <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#e0915a] bg-[#e0915a]/10 px-2.5 py-0.5 rounded-full border border-[#e0915a]/25">
                            {categoryName}
                          </span>
                        </td>

                        {/* Copies */}
                        <td className="py-4 px-6">
                          <div className="text-xs">
                            <span className="font-bold text-foreground text-sm">
                              {copies}
                            </span>
                            <span className="text-muted-foreground ml-1">
                              {copies === 1 ? "copy" : "copies"}
                            </span>
                          </div>
                          <span className="text-[10px] text-[#8fd9a8] block mt-0.5">
                            {book.availableCopies ?? copies} available
                          </span>
                        </td>

                        {/* Edit & Delete Actions */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingBook(book);
                                setIsEditOpen(true);
                              }}
                              className="rounded-full text-xs gap-1.5 border-border hover:border-[#8fd9a8] hover:text-[#8fd9a8] hover:bg-[#8fd9a8]/10 h-8"
                            >
                              <RiEditLine className="size-3.5" />
                              <span>Edit</span>
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setDeletingBook(book);
                                setIsDeleteOpen(true);
                              }}
                              className="rounded-full text-xs gap-1.5 border-border text-rose-400 hover:text-rose-300 hover:border-rose-400 hover:bg-rose-500/10 h-8"
                            >
                              <RiDeleteBin7Line className="size-3.5" />
                              <span>Delete</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View (Shown on screens < md) */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {userBooks.map((book) => {
                const copies =
                  typeof book.totalCopies === "number"
                    ? book.totalCopies
                    : typeof book.availableCopies === "number"
                    ? book.availableCopies
                    : 1;

                const categoryName = book.category || book.genre;

                return (
                  <div
                    key={book.id}
                    className="rounded-3xl border border-border bg-card p-4 shadow-sm flex flex-col gap-4 relative overflow-hidden"
                  >
                    <div className="flex items-start gap-3.5">
                      {/* Cover Thumbnail */}
                      <div className="relative aspect-[2/3] w-20 rounded-2xl overflow-hidden bg-[#15251d] border border-border shrink-0 shadow">
                        {book.coverImage ? (
                          <Image
                            src={book.coverImage}
                            alt={book.title}
                            fill
                            className="object-cover"
                            unoptimized={!book.coverImage.startsWith("/")}
                          />
                        ) : (
                          <div
                            className={`w-full h-full bg-gradient-to-br ${
                              book.coverTheme?.gradientClass ||
                              "from-slate-900 to-indigo-950"
                            } flex items-center justify-center p-2 text-center`}
                          >
                            <RiImageLine className="size-6 text-amber-200" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#e0915a] bg-[#e0915a]/10 px-2 py-0.5 rounded-full border border-[#e0915a]/25 mb-1">
                          {categoryName}
                        </span>

                        <Link href={`/books/${book.id}`}>
                          <h4 className="font-heading font-serif font-bold text-foreground text-base leading-snug line-clamp-1 hover:text-[#8fd9a8]">
                            {book.title}
                          </h4>
                        </Link>

                        <p className="text-xs text-muted-foreground mt-0.5">
                          by {book.author}
                        </p>

                        <div className="mt-2 text-xs">
                          <span className="font-semibold text-foreground">
                            {copies} {copies === 1 ? "copy" : "copies"}
                          </span>
                          <span className="text-[11px] text-[#8fd9a8] ml-2">
                            ({book.availableCopies ?? copies} available)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons on mobile */}
                    <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingBook(book);
                          setIsEditOpen(true);
                        }}
                        className="rounded-full text-xs gap-1.5 flex-1 border-border hover:border-[#8fd9a8] hover:text-[#8fd9a8]"
                      >
                        <RiEditLine className="size-3.5" />
                        <span>Edit</span>
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setDeletingBook(book);
                          setIsDeleteOpen(true);
                        }}
                        className="rounded-full text-xs gap-1.5 flex-1 border-border text-rose-400 hover:text-rose-300 hover:border-rose-400 hover:bg-rose-500/10"
                      >
                        <RiDeleteBin7Line className="size-3.5" />
                        <span>Delete</span>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Edit Book Modal */}
      <EditBookModal
        book={editingBook}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onBookUpdated={handleBookUpdated}
      />

      {/* Custom Delete Confirmation Modal (No window.confirm) */}
      <DeleteBookModal
        book={deletingBook}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onBookDeleted={handleBookDeleted}
      />
    </div>
  );
}
