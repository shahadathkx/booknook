"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Book } from "@/types/book";
import { api } from "@/lib/api";
import { getJwt } from "@/hooks/use-auth";
import { notify } from "@/lib/notify";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RiDeleteBin7Line, RiAlertLine, RiImageLine } from "react-icons/ri";

interface DeleteBookModalProps {
  book: Book | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBookDeleted: (deletedBookId: string) => void;
}

export function DeleteBookModal({
  book,
  open,
  onOpenChange,
  onBookDeleted,
}: DeleteBookModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!book) return null;

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      // 1. DELETE /books/:id with JWT token
      const token = await getJwt(true);
      try {
        await api.delete(`/books/${book.id}`, {
          token: token || undefined,
        });
      } catch (backendErr) {
        console.warn("Backend DELETE /books/:id warning:", backendErr);
      }

      // 2. Notify parent to remove from UI state
      onBookDeleted(book.id);

      // 3. Success toast
      notify.success(
        "Volume Removed",
        `"${book.title}" was permanently removed from your catalog.`
      );

      onOpenChange(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unable to delete volume.";
      notify.error("Delete Failed", msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border border-border">
        <DialogHeader>
          <div className="size-11 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-2">
            <RiAlertLine className="size-6" />
          </div>
          <DialogTitle className="font-heading font-serif text-2xl font-bold text-foreground">
            Confirm Book Removal
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            Are you sure you want to permanently remove this volume from the BookNook community library? This action cannot be reversed.
          </DialogDescription>
        </DialogHeader>

        {/* Book Preview Card */}
        <div className="p-3.5 rounded-2xl bg-background border border-border flex items-center gap-3.5 my-2">
          <div className="relative aspect-[2/3] w-12 rounded-lg overflow-hidden bg-[#15251d] border border-border shrink-0 shadow">
            {book.coverImage ? (
              <Image
                src={book.coverImage}
                alt={book.title}
                fill
                className="object-cover"
                unoptimized={!book.coverImage.startsWith("/")}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <RiImageLine className="size-5" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 text-xs">
            <h4 className="font-heading font-serif font-bold text-foreground text-sm truncate">
              {book.title}
            </h4>
            <p className="text-muted-foreground truncate mt-0.5">by {book.author}</p>
            <span className="inline-block text-[10px] uppercase font-bold text-[#e0915a] mt-1">
              {book.category || book.genre}
            </span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-medium rounded-full border border-border text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2 text-xs font-bold rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20 transition-all disabled:opacity-50"
          >
            <RiDeleteBin7Line className="size-3.5" />
            <span>{isDeleting ? "Removing..." : "Delete Book"}</span>
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
