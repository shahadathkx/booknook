"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLibrary } from "@/context/library-context";
import { notify } from "@/lib/notify";
import { BookGenre } from "@/types/book";
import { COVER_THEMES } from "@/lib/seed-data";
import { BookPlus, Sparkles, BookOpen } from "lucide-react";

interface AddBookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GENRES: BookGenre[] = [
  "Classic Literature",
  "Fiction",
  "Science Fiction",
  "Fantasy",
  "Mystery & Thriller",
  "Non-Fiction",
  "Philosophy",
  "Biography",
];

export function AddBookDialog({ open, onOpenChange }: AddBookDialogProps) {
  const { addBook } = useLibrary();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState<BookGenre>("Fiction");
  const [isbn, setIsbn] = useState("");
  const [publishedYear, setPublishedYear] = useState<string>("2026");
  const [description, setDescription] = useState("");
  const [coverThemeKey, setCoverThemeKey] = useState("navy");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [maxAllowedYear, setMaxAllowedYear] = useState<number>(2027);


  React.useEffect(() => {
    const current = new Date().getFullYear();
    setPublishedYear(current.toString());
    setMaxAllowedYear(current + 1);
  }, []);

  const handleReset = () => {
    setTitle("");
    setAuthor("");
    setGenre("Fiction");
    setIsbn("");
    setPublishedYear(new Date().getFullYear().toString());
    setDescription("");
    setCoverThemeKey("navy");
    setErrors({});
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim() || title.trim().length < 2) {
      newErrors.title = "Book title must be at least 2 characters.";
    }
    if (!author.trim() || author.trim().length < 2) {
      newErrors.author = "Author name must be at least 2 characters.";
    }
    if (!isbn.trim()) {
      newErrors.isbn = "ISBN identifier is required (e.g., 978-0141439518).";
    }
    const yearNum = parseInt(publishedYear, 10);
    const maxYear = new Date().getFullYear() + 1;
    if (isNaN(yearNum) || yearNum < 1000 || yearNum > maxYear) {
      newErrors.publishedYear = `Enter a valid 4-digit publication year (up to ${maxYear}).`;
    }
    if (!description.trim() || description.trim().length < 15) {
      newErrors.description = "Provide a meaningful synopsis (at least 15 characters).";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      notify.error("Incomplete Book Details", "Please correct the highlighted fields before adding.");
      return;
    }

    const result = addBook({
      title: title.trim(),
      author: author.trim(),
      genre,
      isbn: isbn.trim(),
      publishedYear: parseInt(publishedYear, 10),
      description: description.trim(),
      coverThemeName: coverThemeKey,
    });

    if (result.success && result.book) {
      notify.success(
        "Book Added to Shelf",
        `"${result.book.title}" by ${result.book.author} has been cataloged.`
      );
      handleReset();
      onOpenChange(false);
    } else {
      notify.error("Could Not Add Book", result.error || "An unexpected error occurred.");
    }
  };

  const activeTheme = COVER_THEMES[coverThemeKey] || COVER_THEMES.navy;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <BookPlus className="size-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">Catalog Acquisition</span>
          </div>
          <DialogTitle className="text-xl font-serif text-stone-900 dark:text-stone-50">
            Add a New Book to BookNook
          </DialogTitle>
          <DialogDescription className="text-stone-600 dark:text-stone-400 text-xs">
            Enter the bibliographic metadata and choose a luxury hardcover spine finish.
          </DialogDescription>
        </DialogHeader>

        {/* Live Mini Preview */}
        <div className="my-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-100/70 dark:bg-stone-900/50 p-3.5 flex items-center gap-3.5">
          <div
            className={`w-14 h-20 shrink-0 rounded-md bg-gradient-to-br ${activeTheme.gradientClass} shadow-md border border-white/20 flex flex-col justify-between p-1.5 transition-colors duration-300`}
          >
            <div className="border-b border-white/20 pb-0.5">
              <span className="text-[7px] font-serif block truncate font-bold text-amber-200">
                {title || "Untitled"}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[6px] opacity-75 block truncate text-stone-200">
                {author || "Author"}
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-medium text-stone-700 dark:text-stone-300">
              <Sparkles className="size-3 text-amber-500" />
              <span>Live Hardcover Preview</span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 truncate mt-0.5 font-serif font-semibold">
              {title.trim() ? title : "Awaiting book title..."}
            </p>
            <p className="text-[11px] text-stone-400 dark:text-stone-500 truncate">
              {author.trim() ? `By ${author}` : "By Anonymous Author"} • {genre}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Title */}
          <div>
            <label className="text-xs font-medium text-stone-700 dark:text-stone-300 block mb-1">
              Book Title <span className="text-rose-500">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: "" }));
              }}
              placeholder="e.g. The Catcher in the Rye"
              className={errors.title ? "border-rose-500 focus-visible:ring-rose-500/30" : ""}
            />
            {errors.title && <p className="text-[11px] text-rose-500 mt-1">{errors.title}</p>}
          </div>

          {/* Author & Genre Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-stone-700 dark:text-stone-300 block mb-1">
                Author <span className="text-rose-500">*</span>
              </label>
              <Input
                value={author}
                onChange={(e) => {
                  setAuthor(e.target.value);
                  if (errors.author) setErrors((prev) => ({ ...prev, author: "" }));
                }}
                placeholder="e.g. J.D. Salinger"
                className={errors.author ? "border-rose-500 focus-visible:ring-rose-500/30" : ""}
              />
              {errors.author && <p className="text-[11px] text-rose-500 mt-1">{errors.author}</p>}
            </div>

            <div>
              <label className="text-xs font-medium text-stone-700 dark:text-stone-300 block mb-1">
                Genre <span className="text-rose-500">*</span>
              </label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value as BookGenre)}
                className="h-8 w-full rounded-lg border border-input bg-background px-2.5 py-1 text-xs text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {GENRES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ISBN & Published Year Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-stone-700 dark:text-stone-300 block mb-1">
                ISBN Identifier <span className="text-rose-500">*</span>
              </label>
              <Input
                value={isbn}
                onChange={(e) => {
                  setIsbn(e.target.value);
                  if (errors.isbn) setErrors((prev) => ({ ...prev, isbn: "" }));
                }}
                placeholder="e.g. 978-0316769488"
                className={errors.isbn ? "border-rose-500 focus-visible:ring-rose-500/30" : ""}
              />
              {errors.isbn && <p className="text-[11px] text-rose-500 mt-1">{errors.isbn}</p>}
            </div>

            <div>
              <label className="text-xs font-medium text-stone-700 dark:text-stone-300 block mb-1">
                Published Year <span className="text-rose-500">*</span>
              </label>
              <Input
                type="number"
                value={publishedYear}
                onChange={(e) => {
                  setPublishedYear(e.target.value);
                  if (errors.publishedYear) setErrors((prev) => ({ ...prev, publishedYear: "" }));
                }}
                placeholder="e.g. 1951"
                min="1000"
                max={maxAllowedYear}
                className={errors.publishedYear ? "border-rose-500 focus-visible:ring-rose-500/30" : ""}
              />
              {errors.publishedYear && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.publishedYear}</p>
              )}
            </div>
          </div>

          {/* Cover Style Swatches */}
          <div>
            <label className="text-xs font-medium text-stone-700 dark:text-stone-300 block mb-1.5">
              Hardcover Palette Finish
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {Object.entries(COVER_THEMES).map(([key, theme]) => {
                const isSelected = coverThemeKey === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setCoverThemeKey(key)}
                    className={`h-11 rounded-lg border p-1 text-left flex flex-col justify-between transition-all ${
                      isSelected
                        ? "ring-2 ring-amber-500 border-amber-500 scale-[1.03] shadow-sm"
                        : "border-stone-200 dark:border-stone-800 hover:border-stone-400 opacity-80 hover:opacity-100"
                    } bg-gradient-to-br ${theme.gradientClass}`}
                  >
                    <span className="text-[8px] font-medium leading-none block truncate text-white">
                      {theme.name.split("&")[0]}
                    </span>
                    <span
                      className="size-2 rounded-full self-end block"
                      style={{ backgroundColor: theme.accentColor }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium text-stone-700 dark:text-stone-300 block mb-1">
              Book Synopsis <span className="text-rose-500">*</span>
            </label>
            <Textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors((prev) => ({ ...prev, description: "" }));
              }}
              rows={3}
              placeholder="A genuine literary summary describing themes, characters, and historical context..."
              className={errors.description ? "border-rose-500 focus-visible:ring-rose-500/30" : ""}
            />
            {errors.description && (
              <p className="text-[11px] text-rose-500 mt-1">{errors.description}</p>
            )}
            <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-1">
              Real descriptions help patrons discover books easily. No lorem ipsum text.
            </p>
          </div>

          <DialogFooter className="mt-4 pt-3 border-t border-stone-200 dark:border-stone-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                handleReset();
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-amber-600 hover:bg-amber-700 text-white font-medium shadow-sm gap-1.5"
            >
              <BookOpen className="size-3.5" />
              Add to Collection
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
