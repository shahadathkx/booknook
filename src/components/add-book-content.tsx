"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLibrary } from "@/context/library-context";
import { useAuth } from "@/hooks/use-auth";
import { notify } from "@/lib/notify";
import { SectionHeading } from "@/components/ui/section-heading";
import { BookNookButton } from "@/components/ui/booknook-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { BookGenre } from "@/types/book";
import { COVER_THEMES } from "@/lib/seed-data";
import {
  RiBookReadLine,
  RiArrowLeftLine,
  RiSparklingLine,
  RiCheckLine,
  RiBook2Line,
  RiUser3Line,
  RiHashtag,
  RiCalendarLine,
} from "react-icons/ri";

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

export function AddBookContent() {
  const router = useRouter();
  const { addBook } = useLibrary();
  const { user, isLoading: isAuthLoading, isPending } = useAuth();

  // Private route: wait for useSession's isPending to finish before deciding anything
  useEffect(() => {
    if (!isPending && !isAuthLoading && !user) {
      router.replace("/login?callbackUrl=/add-book");
    }
  }, [isPending, isAuthLoading, user, router]);

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState<BookGenre>("Fiction");
  const [isbn, setIsbn] = useState("");
  const [publishedYear, setPublishedYear] = useState<string>("2026");
  const [description, setDescription] = useState("");
  const [coverThemeKey, setCoverThemeKey] = useState("emerald");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    setPublishedYear(currentYear.toString());
  }, []);

  // Show spinner while useSession is pending
  if (isPending || isAuthLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-28 flex flex-col items-center justify-center gap-4 text-center">
        <Spinner size="lg" />
        <div>
          <p className="font-heading font-serif text-lg font-bold text-foreground">
            Verifying Cataloging Permissions
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Loading reader credentials...
          </p>
        </div>
      </div>
    );
  }

  // Prevent flash of content if unauthenticated while router.replace executes
  if (!user) {
    return null;
  }

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim() || title.trim().length < 2) {
      newErrors.title = "Book title must be at least 2 characters long.";
    }
    if (!author.trim() || author.trim().length < 2) {
      newErrors.author = "Author name must be at least 2 characters long.";
    }
    if (!isbn.trim()) {
      newErrors.isbn = "ISBN identifier is required (e.g. 978-0141439518).";
    }
    const year = parseInt(publishedYear, 10);
    const maxYear = new Date().getFullYear() + 1;
    if (isNaN(year) || year < 1000 || year > maxYear) {
      newErrors.publishedYear = `Enter a valid 4-digit year (between 1000 and ${maxYear}).`;
    }
    if (!description.trim() || description.trim().length < 15) {
      newErrors.description = "Please provide a meaningful synopsis of at least 15 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      notify.error("Incomplete Book Details", "Please fix the highlighted fields to add this volume.");
      return;
    }

    setIsSubmitting(true);
    const result = addBook({
      title: title.trim(),
      author: author.trim(),
      genre,
      isbn: isbn.trim(),
      publishedYear: parseInt(publishedYear, 10),
      description: description.trim(),
      coverThemeName: coverThemeKey,
    });

    if (result.success) {
      notify.success(
        "Volume Cataloged",
        `"${title.trim()}" has been placed onto the BookNook library shelves.`
      );
      router.push("/books");
    } else {
      notify.error("Cataloging Failed", result.error || "Unable to add book at this time.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Back button */}
      <div className="mb-6">
        <Link
          href="/books"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-[#8fd9a8] transition-colors"
        >
          <RiArrowLeftLine className="size-4" />
          <span>Back to All Books</span>
        </Link>
      </div>

      <SectionHeading
        eyebrow="Library Acquisitions"
        title="Add a New Volume to the Shelves"
        description="Contribute a book to the BookNook community collection. Fill in the bibliographic details and select a custom spine palette."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
        {/* Form Container */}
        <div className="lg:col-span-8 rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#8fd9a8]/60 to-transparent" />

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Book Title <span className="text-[#e0915a]">*</span>
              </label>
              <div className="relative">
                <Input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. The Picture of Dorian Gray"
                  className="pl-9 h-10 rounded-full bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-[#8fd9a8]"
                />
                <RiBook2Line className="size-4 text-muted-foreground absolute left-3 top-3 pointer-events-none" />
              </div>
              {errors.title && <p className="text-[11px] text-rose-400 mt-1 pl-1">{errors.title}</p>}
            </div>

            {/* Author */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Author Name <span className="text-[#e0915a]">*</span>
              </label>
              <div className="relative">
                <Input
                  type="text"
                  required
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="e.g. Oscar Wilde"
                  className="pl-9 h-10 rounded-full bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-[#8fd9a8]"
                />
                <RiUser3Line className="size-4 text-muted-foreground absolute left-3 top-3 pointer-events-none" />
              </div>
              {errors.author && <p className="text-[11px] text-rose-400 mt-1 pl-1">{errors.author}</p>}
            </div>

            {/* Genre & Year Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Genre / Category <span className="text-[#e0915a]">*</span>
                </label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value as BookGenre)}
                  className="w-full h-10 rounded-full bg-background border border-border px-4 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-[#8fd9a8]"
                >
                  {GENRES.map((g) => (
                    <option key={g} value={g} className="bg-card text-foreground">
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Publication Year <span className="text-[#e0915a]">*</span>
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    required
                    value={publishedYear}
                    onChange={(e) => setPublishedYear(e.target.value)}
                    placeholder="1890"
                    className="pl-9 h-10 rounded-full bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-[#8fd9a8]"
                  />
                  <RiCalendarLine className="size-4 text-muted-foreground absolute left-3 top-3 pointer-events-none" />
                </div>
                {errors.publishedYear && (
                  <p className="text-[11px] text-rose-400 mt-1 pl-1">{errors.publishedYear}</p>
                )}
              </div>
            </div>

            {/* ISBN */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                ISBN Identifier <span className="text-[#e0915a]">*</span>
              </label>
              <div className="relative">
                <Input
                  type="text"
                  required
                  value={isbn}
                  onChange={(e) => setIsbn(e.target.value)}
                  placeholder="978-0141439570"
                  className="pl-9 h-10 rounded-full bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-[#8fd9a8]"
                />
                <RiHashtag className="size-4 text-muted-foreground absolute left-3 top-3 pointer-events-none" />
              </div>
              {errors.isbn && <p className="text-[11px] text-rose-400 mt-1 pl-1">{errors.isbn}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Synopsis / Description <span className="text-[#e0915a]">*</span>
              </label>
              <Textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A compelling, philosophical tale exploring art, morality, and the corruption of a young aristocrat..."
                className="rounded-2xl bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-[#8fd9a8] resize-none"
              />
              {errors.description && (
                <p className="text-[11px] text-rose-400 mt-1 pl-1">{errors.description}</p>
              )}
            </div>

            {/* Theme Selector */}
            <div className="pt-2">
              <label className="text-xs font-semibold text-foreground block mb-2">
                Cover Binding Palette
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {Object.entries(COVER_THEMES).map(([key, theme]) => {
                  const isSelected = coverThemeKey === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setCoverThemeKey(key)}
                      className={`h-11 rounded-xl bg-gradient-to-br ${theme.gradientClass} border transition-all flex items-center justify-center ${
                        isSelected
                          ? "border-[#8fd9a8] ring-2 ring-[#8fd9a8] scale-105"
                          : "border-white/10 opacity-75 hover:opacity-100"
                      }`}
                      title={theme.name}
                    >
                      {isSelected && <RiCheckLine className="size-4 text-white drop-shadow" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form Actions */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-border">
              <Link href="/books">
                <Button
                  type="button"
                  variant="outline"
                  size="default"
                  className="rounded-full text-xs border-border"
                >
                  Cancel
                </Button>
              </Link>
              <BookNookButton
                type="submit"
                size="default"
                disabled={isSubmitting}
                className="gap-2 font-bold"
              >
                <RiSparklingLine className="size-4" />
                <span>{isSubmitting ? "Cataloging Book..." : "Add to Library"}</span>
              </BookNookButton>
            </div>
          </form>
        </div>

        {/* Live Spine Preview Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#e0915a] block mb-3">
              Spine & Cover Preview
            </span>

            <div
              className={`w-40 h-56 mx-auto rounded-xl bg-gradient-to-br ${
                COVER_THEMES[coverThemeKey]?.gradientClass || "from-stone-900 to-stone-800"
              } shadow-xl border border-white/20 p-4 flex flex-col justify-between text-left transition-all duration-300`}
            >
              <div>
                <span className="text-[10px] uppercase tracking-wider text-amber-200/90 font-bold block mb-1">
                  {genre}
                </span>
                <h4 className="font-heading font-serif text-sm font-bold text-white line-clamp-3 leading-snug">
                  {title.trim() || "Untitled Book"}
                </h4>
              </div>

              <div>
                <p className="text-[11px] text-white/80 font-medium truncate">
                  {author.trim() || "Unknown Author"}
                </p>
                <p className="text-[9px] text-white/60 mt-0.5">
                  Pub. {publishedYear || "—"}
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
              Books are placed onto BookNook with an available circulation status ready for immediate checkout.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
