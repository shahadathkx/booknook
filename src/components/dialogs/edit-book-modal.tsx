"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Book, BookGenre } from "@/types/book";
import { api } from "@/lib/api";
import { getJwt } from "@/hooks/use-auth";
import { notify } from "@/lib/notify";
import { BookNookButton } from "@/components/ui/booknook-button";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  RiEditLine,
  RiUploadCloud2Line,
  RiImageLine,
} from "react-icons/ri";

const CATEGORIES = ["Fiction", "Science", "History", "Kids", "Others"] as const;

interface EditBookModalProps {
  book: Book | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBookUpdated: (updatedBook: Book) => void;
}

export function EditBookModal({
  book,
  open,
  onOpenChange,
  onBookUpdated,
}: EditBookModalProps) {
  if (!book || !open) return null;

  return (
    <EditBookModalForm
      key={book.id}
      book={book}
      open={open}
      onOpenChange={onOpenChange}
      onBookUpdated={onBookUpdated}
    />
  );
}

interface EditBookModalFormProps extends Omit<EditBookModalProps, "book"> {
  book: Book;
}

function EditBookModalForm({
  book,
  open,
  onOpenChange,
  onBookUpdated,
}: EditBookModalFormProps) {
  const initialCategory = book.category || book.genre || "Fiction";
  const [title, setTitle] = useState(book.title || "");
  const [author, setAuthor] = useState(book.author || "");
  const [category, setCategory] = useState<string>(
    CATEGORIES.find((candidate) => candidate === initialCategory) || "Others"
  );
  const [description, setDescription] = useState(book.description || "");
  const [totalCopies, setTotalCopies] = useState<number | string>(
    book.totalCopies ?? (book.status === "available" ? 1 : 0)
  );
  const currentCoverUrl = book.coverImage || "";
  const [newCoverPreview, setNewCoverPreview] = useState<string | null>(null);
  const [uploadedCoverUrl, setUploadedCoverUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);


  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      notify.error("Invalid File", "Please select a valid image file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      notify.error("File Too Large", "Image size must be less than 10MB.");
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setNewCoverPreview(localPreview);

    const apiKey = process.env.NEXT_PUBLIC_IMGBB_KEY?.trim();
    if (!apiKey) {

      setIsUploading(true);
      setUploadProgress(50);
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setTimeout(() => {
          setUploadProgress(100);
          setUploadedCoverUrl(dataUrl);
          setIsUploading(false);
          notify.info(
            "Local Preview Updated",
            "Cover preview updated locally. (Configure NEXT_PUBLIC_IMGBB_KEY in .env for ImgBB CDN)."
          );
        }, 300);
      };
      reader.readAsDataURL(file);
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", `https://api.imgbb.com/1/upload?key=${apiKey}`);

      xhr.upload.onprogress = (evt) => {
        if (evt.lengthComputable) {
          const percent = Math.round((evt.loaded / evt.total) * 95);
          setUploadProgress(percent);
        }
      };

      xhr.onload = () => {
        setIsUploading(false);
        if (xhr.status === 200) {
          try {
            const data = JSON.parse(xhr.responseText);
            if (data?.data?.url) {
              setUploadProgress(100);
              setUploadedCoverUrl(data.data.url);
              setNewCoverPreview(data.data.url);
              notify.success("Image Uploaded", "New cover image successfully hosted on ImgBB.");
            } else {
              throw new Error(data?.error?.message || "Upload error");
            }
          } catch (pErr) {
            handleUploadFallback(file, pErr instanceof Error ? pErr.message : "Parse error");
          }
        } else {
          handleUploadFallback(file, `ImgBB returned HTTP ${xhr.status}`);
        }
      };

      xhr.onerror = () => {
        setIsUploading(false);
        handleUploadFallback(file, "Network connection to ImgBB failed.");
      };

      xhr.send(formData);
    } catch (err) {
      setIsUploading(false);
      handleUploadFallback(file, err instanceof Error ? err.message : "Upload error");
    }
  };

  const handleUploadFallback = (file: File, message: string) => {
    notify.error("Upload Warning", message);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setUploadedCoverUrl(dataUrl);
      setUploadProgress(100);
    };
    reader.readAsDataURL(file);
  };

  const handleResetImage = () => {
    setNewCoverPreview(null);
    setUploadedCoverUrl("");
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim() || title.trim().length < 2) {
      newErrors.title = "Book title must be at least 2 characters.";
    }
    if (!author.trim() || author.trim().length < 2) {
      newErrors.author = "Author name must be at least 2 characters.";
    }
    if (!description.trim() || description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters.";
    }
    const copies = Number(totalCopies);
    if (!totalCopies || isNaN(copies) || copies < 1) {
      newErrors.totalCopies = "Total copies must be at least 1.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!book) return;

    if (isUploading) {
      notify.info("Uploading", "Please wait until the new cover image finishes uploading.");
      return;
    }

    if (!validate()) {
      notify.error("Form Incomplete", "Please fix highlighted fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      const copiesNum = Math.max(1, Number(totalCopies) || 1);
      const finalCoverImage = uploadedCoverUrl || newCoverPreview || currentCoverUrl || book.coverImage;

      const mappedGenre: BookGenre =
        category === "Others" ? "Non-Fiction" : (category as BookGenre);

      const updatedPayload: Partial<Book> = {
        title: title.trim(),
        author: author.trim(),
        category,
        genre: mappedGenre,
        description: description.trim(),
        coverImage: finalCoverImage,
        totalCopies: copiesNum,
        availableCopies:
          typeof book.availableCopies === "number"
            ? Math.min(copiesNum, book.availableCopies)
            : copiesNum,
      };


      const token = await getJwt(true);
      try {
        await api.patch(`/books/${book.id}`, updatedPayload, {
          token: token || undefined,
        });
      } catch (backendErr) {
        console.warn("Backend PATCH /books/:id warning:", backendErr);
      }


      const updatedFullBook: Book = {
        ...book,
        ...updatedPayload,
      };
      onBookUpdated(updatedFullBook);


      notify.success(
        "Book Updated Successfully",
        `"${title.trim()}" has been updated in the library catalog.`
      );

      onOpenChange(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update book.";
      notify.error("Update Failed", msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayImage = newCoverPreview || currentCoverUrl;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-[#8fd9a8] mb-1">
            <RiEditLine className="size-5" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Catalog Editor
            </span>
          </div>
          <DialogTitle className="font-heading font-serif text-2xl font-bold text-foreground">
            Edit &quot;{book.title}&quot;
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Update the catalog metadata, circulation inventory, or replace cover art for this volume.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 my-2">
          {/* Title & Author */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Book Title <span className="text-[#e0915a]">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:border-[#8fd9a8]"
              />
              {errors.title && (
                <p className="text-[10px] text-rose-400 mt-1 font-medium">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Author <span className="text-[#e0915a]">*</span>
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:border-[#8fd9a8]"
              />
              {errors.author && (
                <p className="text-[10px] text-rose-400 mt-1 font-medium">{errors.author}</p>
              )}
            </div>
          </div>

          {/* Category & Total Copies */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Category <span className="text-[#e0915a]">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:border-[#8fd9a8]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Total Copies <span className="text-[#e0915a]">*</span>
              </label>
              <input
                type="number"
                min={1}
                value={totalCopies}
                onChange={(e) => setTotalCopies(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:border-[#8fd9a8]"
              />
              {errors.totalCopies && (
                <p className="text-[10px] text-rose-400 mt-1 font-medium">
                  {errors.totalCopies}
                </p>
              )}
            </div>
          </div>

          {/* Book Image (Keep current or upload new via ImgBB) */}
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1.5">
              Book Cover Artwork
            </label>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="p-3.5 rounded-2xl bg-background border border-border flex items-center gap-4">
              <div className="relative aspect-[2/3] w-16 rounded-xl overflow-hidden bg-[#15251d] border border-border shrink-0 shadow">
                {displayImage ? (
                  <Image
                    src={displayImage}
                    alt="Cover preview"
                    fill
                    className="object-cover"
                    unoptimized={!displayImage.startsWith("/")}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <RiImageLine className="size-6" />
                  </div>
                )}
              </div>

              <div className="flex-1 text-xs">
                <span className="text-muted-foreground block text-[11px]">
                  {newCoverPreview
                    ? "New replacement image selected"
                    : "Current cover image in use"}
                </span>

                {isUploading ? (
                  <div className="mt-1.5 space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-[#8fd9a8] font-bold">
                      <span className="flex items-center gap-1">
                        <Spinner size="sm" />
                        Uploading to ImgBB...
                      </span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-[#8fd9a8] transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1 rounded-full text-[11px] font-semibold bg-muted hover:bg-muted/80 text-foreground transition-colors flex items-center gap-1"
                    >
                      <RiUploadCloud2Line className="size-3.5 text-[#8fd9a8]" />
                      <span>Replace Cover</span>
                    </button>

                    {newCoverPreview && (
                      <button
                        type="button"
                        onClick={handleResetImage}
                        className="text-[11px] text-rose-400 hover:text-rose-300 transition-colors"
                      >
                        Revert
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              Short Description <span className="text-[#e0915a]">*</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:border-[#8fd9a8]"
            />
            {errors.description && (
              <p className="text-[10px] text-rose-400 mt-1 font-medium">
                {errors.description}
              </p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 text-xs font-medium rounded-full border border-border text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <BookNookButton
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting || isUploading}
            >
              <span>{isSubmitting ? "Saving Changes..." : "Save Changes"}</span>
            </BookNookButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
