"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, getJwt } from "@/hooks/use-auth";
import { useLibrary } from "@/context/library-context";
import { api } from "@/lib/api";
import { notify } from "@/lib/notify";
import { SectionHeading } from "@/components/ui/section-heading";
import { BookNookButton } from "@/components/ui/booknook-button";
import { Spinner } from "@/components/ui/spinner";
import { BookGenre } from "@/types/book";
import {
  RiArrowLeftLine,
  RiUploadCloud2Line,
  RiCheckLine,
  RiCloseLine,
  RiImageLine,
  RiUser3Line,
  RiMailLine,
  RiLockLine,
  RiBookMarkedLine,
  RiShieldCheckLine,
  RiFileList3Line,
  RiHashtag,
} from "react-icons/ri";

const CATEGORIES = ["Fiction", "Science", "History", "Kids", "Others"] as const;
type CategoryType = (typeof CATEGORIES)[number];

export function AddBookForm() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading, isPending } = useAuth();
  const { addBook } = useLibrary();


  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState<CategoryType>("Fiction");
  const [description, setDescription] = useState("");
  const [totalCopies, setTotalCopies] = useState<number | string>(1);


  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);


  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);


  useEffect(() => {
    if (!isPending && !isAuthLoading && !user) {
      router.replace("/login?callbackUrl=/add-book");
    }
  }, [isPending, isAuthLoading, user, router]);


  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;


    if (!file.type.startsWith("image/")) {
      notify.error("Invalid File Type", "Please select a PNG, JPG, WEBP, or GIF image.");
      return;
    }


    if (file.size > 10 * 1024 * 1024) {
      notify.error("File Too Large", "Image size must be less than 10MB.");
      return;
    }

    setImageFile(file);
    setUploadError(null);


    const localPreviewUrl = URL.createObjectURL(file);
    setImagePreview(localPreviewUrl);


    await uploadToImgBB(file);
  };

  const uploadToImgBB = async (file: File) => {
    const apiKey = process.env.NEXT_PUBLIC_IMGBB_KEY?.trim();

    if (!apiKey) {

      setIsUploading(true);
      setUploadProgress(40);
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setTimeout(() => {
          setUploadProgress(100);
          setUploadedUrl(dataUrl);
          setIsUploading(false);
          notify.info(
            "Local Preview Active",
            "Cover preview generated locally. (Configure NEXT_PUBLIC_IMGBB_KEY in .env for ImgBB cloud storage)."
          );
        }, 400);
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

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 95);
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
              const hostedUrl = data.data.url;
              setUploadedUrl(hostedUrl);
              setImagePreview(hostedUrl);
              notify.success("Cover Uploaded", "Book image successfully hosted on ImgBB.");
            } else {
              throw new Error(data?.error?.message || "Invalid ImgBB response structure.");
            }
          } catch (parseErr) {
            const msg = parseErr instanceof Error ? parseErr.message : "Upload response parse failure";
            handleUploadFailure(file, msg);
          }
        } else {
          handleUploadFailure(file, `ImgBB returned HTTP ${xhr.status}`);
        }
      };

      xhr.onerror = () => {
        setIsUploading(false);
        handleUploadFailure(file, "Network connection to ImgBB failed.");
      };

      xhr.send(formData);
    } catch (err) {
      setIsUploading(false);
      const msg = err instanceof Error ? err.message : "Failed to initiate upload";
      handleUploadFailure(file, msg);
    }
  };

  const handleUploadFailure = (file: File, message: string) => {
    setUploadError(message);
    notify.error("ImgBB Upload Failed", message);


    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setUploadedUrl(dataUrl);
      setUploadProgress(100);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setUploadedUrl("");
    setUploadProgress(0);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };


  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim() || title.trim().length < 2) {
      newErrors.title = "Book title is required (at least 2 characters).";
    }

    if (!author.trim() || author.trim().length < 2) {
      newErrors.author = "Author name is required (at least 2 characters).";
    }

    if (!category) {
      newErrors.category = "Please select a category.";
    }

    if (!description.trim() || description.trim().length < 10) {
      newErrors.description = "Please provide a meaningful description (at least 10 characters).";
    }

    const copiesNum = Number(totalCopies);
    if (!totalCopies || isNaN(copiesNum) || copiesNum < 1) {
      newErrors.totalCopies = "Total copies must be a number of at least 1.";
    }

    if (!uploadedUrl && !imagePreview) {
      newErrors.image = "Please upload a book cover image.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      notify.error("Session Required", "You must be signed in to add books.");
      router.replace("/login?callbackUrl=/add-book");
      return;
    }

    if (isUploading) {
      notify.info("Upload in Progress", "Please wait until the cover image finishes uploading.");
      return;
    }

    if (!validate()) {
      notify.error("Form Incomplete", "Please correct the highlighted fields before submitting.");
      return;
    }

    setIsSubmitting(true);

    try {
      const numCopies = Math.max(1, Number(totalCopies) || 1);
      const finalImageUrl = uploadedUrl || imagePreview || undefined;


      const mappedGenre: BookGenre =
        category === "Others" ? "Non-Fiction" : (category as BookGenre);


      const token = await getJwt(true);

      const payload = {
        title: title.trim(),
        author: author.trim(),
        category,
        genre: mappedGenre,
        description: description.trim(),
        coverImage: finalImageUrl,
        totalCopies: numCopies,
        availableCopies: numCopies,
        addedBy: {
          name: user.name || "Registered Reader",
          email: user.email || "reader@booknook.local",
        },
      };


      try {
        await api.post("/books", payload, {
          token: token || undefined,
        });
      } catch (backendError) {


        console.warn("Express backend response:", backendError);
      }


      addBook({
        title: title.trim(),
        author: author.trim(),
        genre: mappedGenre,
        category,
        description: description.trim(),
        coverImage: finalImageUrl,
        totalCopies: numCopies,
        availableCopies: numCopies,
        addedBy: {
          name: user.name || "Registered Reader",
          email: user.email || "reader@booknook.local",
        },
      });


      notify.success(
        "Book Added Successfully",
        `"${title.trim()}" has been cataloged and placed onto your shelf.`
      );


      router.push("/my-books");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unable to catalog book. Please try again.";
      notify.error("Submission Failed", errorMessage);
      setIsSubmitting(false);
    }
  };


  if (isPending || isAuthLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-28 flex flex-col items-center justify-center gap-4 text-center">
        <Spinner size="lg" />
        <div>
          <p className="font-heading font-serif text-lg font-bold text-foreground">
            Verifying Reader Membership
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Validating authentication credentials for acquisitions access...
          </p>
        </div>
      </div>
    );
  }


  if (!user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Back button */}
      <div className="mb-6">
        <Link
          href="/my-books"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-[#8fd9a8] transition-colors"
        >
          <RiArrowLeftLine className="size-4" />
          <span>Back to My Books</span>
        </Link>
      </div>

      {/* Page Heading */}
      <SectionHeading
        eyebrow="Community Acquisitions"
        title="Add a Book to the Library"
        description="Share a volume from your shelf with fellow patrons. Complete the book details, upload a high-resolution cover image, and confirm your catalog entry."
      />

      {/* Main Form Container */}
      <div className="mt-8 rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-xl relative overflow-hidden">
        {/* Top decorative accent glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#8fd9a8]/60 to-transparent" />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Read-Only Patron Identity Session Section */}
          <div className="p-4 rounded-2xl bg-background border border-border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#e0915a] flex items-center gap-1.5">
                <RiUser3Line className="size-4" />
                Contributing Patron (From Session)
              </span>
              <span className="text-[11px] text-muted-foreground flex items-center gap-1 bg-card px-2.5 py-0.5 rounded-full border border-border">
                <RiLockLine className="size-3 text-[#8fd9a8]" />
                Read-Only
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* User Name */}
              <div>
                <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                  Patron Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={user.name || "Anonymous Reader"}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-card border border-border text-xs text-foreground font-medium cursor-not-allowed select-none opacity-90 focus:outline-none"
                  />
                  <RiUser3Line className="size-3.5 text-muted-foreground absolute left-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* User Email */}
              <div>
                <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                  Patron Email
                </label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={user.email || ""}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-card border border-border text-xs text-foreground font-medium cursor-not-allowed select-none opacity-90 focus:outline-none"
                  />
                  <RiMailLine className="size-3.5 text-muted-foreground absolute left-3 top-2.5 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Book Title & Author Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Title */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Book Title <span className="text-[#e0915a]">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. The Left Hand of Darkness"
                className={`w-full px-3.5 py-2.5 rounded-2xl bg-background border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 transition-all ${
                  errors.title
                    ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20"
                    : "border-border focus:border-[#8fd9a8] focus:ring-[#8fd9a8]"
                }`}
              />
              {errors.title && (
                <p className="text-[11px] text-rose-400 mt-1 font-medium">{errors.title}</p>
              )}
            </div>

            {/* Author */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Author Name <span className="text-[#e0915a]">*</span>
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. Ursula K. Le Guin"
                className={`w-full px-3.5 py-2.5 rounded-2xl bg-background border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 transition-all ${
                  errors.author
                    ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20"
                    : "border-border focus:border-[#8fd9a8] focus:ring-[#8fd9a8]"
                }`}
              />
              {errors.author && (
                <p className="text-[11px] text-rose-400 mt-1 font-medium">{errors.author}</p>
              )}
            </div>
          </div>

          {/* Category Select & Total Copies Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category Select: Fiction, Science, History, Kids, Others */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Category <span className="text-[#e0915a]">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryType)}
                className={`w-full px-3.5 py-2.5 rounded-2xl bg-background border text-sm text-foreground focus:outline-none focus:ring-1 transition-all ${
                  errors.category
                    ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20"
                    : "border-border focus:border-[#8fd9a8] focus:ring-[#8fd9a8]"
                }`}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-[11px] text-rose-400 mt-1 font-medium">{errors.category}</p>
              )}
            </div>

            {/* Total Copies (number, min 1) */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Total Copies in Circulation <span className="text-[#e0915a]">*</span>
              </label>
              <input
                type="number"
                min={1}
                value={totalCopies}
                onChange={(e) => setTotalCopies(e.target.value)}
                placeholder="1"
                className={`w-full px-3.5 py-2.5 rounded-2xl bg-background border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 transition-all ${
                  errors.totalCopies
                    ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20"
                    : "border-border focus:border-[#8fd9a8] focus:ring-[#8fd9a8]"
                }`}
              />
              {errors.totalCopies ? (
                <p className="text-[11px] text-rose-400 mt-1 font-medium">{errors.totalCopies}</p>
              ) : (
                <p className="text-[11px] text-muted-foreground mt-1">
                  Must be at least 1 copy available for reader loan.
                </p>
              )}
            </div>
          </div>

          {/* Book Image Upload (ImgBB with NEXT_PUBLIC_IMGBB_KEY, preview, upload progress) */}
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1.5">
              Book Cover Image <span className="text-[#e0915a]">*</span>
            </label>

            {/* Hidden native input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Upload Box / Preview Area */}
            {!imagePreview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 hover:border-[#8fd9a8] hover:bg-[#8fd9a8]/5 ${
                  errors.image ? "border-rose-500 bg-rose-500/5" : "border-border bg-background/50"
                }`}
              >
                <div className="size-14 rounded-2xl bg-[#15251d] border border-[#1f362b] text-[#8fd9a8] flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <RiUploadCloud2Line className="size-7" />
                </div>
                <p className="text-sm font-semibold text-foreground">
                  Click to select book cover image
                </p>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  Uploads directly to ImgBB CDN with live preview. PNG, JPG, or WEBP up to 10MB.
                </p>
              </div>
            ) : (
              <div className="rounded-3xl border border-border bg-background p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-5">
                {/* Image Thumbnail */}
                <div className="relative aspect-[2/3] w-28 rounded-2xl overflow-hidden bg-[#15251d] border border-border shrink-0 shadow-md">
                  <Image
                    src={imagePreview}
                    alt="Cover preview"
                    fill
                    className="object-cover"
                    unoptimized={imagePreview.startsWith("data:") || imagePreview.startsWith("blob:")}
                  />
                  {uploadedUrl && !isUploading && (
                    <div className="absolute top-1.5 right-1.5 size-5 rounded-full bg-[#8fd9a8] text-[#0e1a14] flex items-center justify-center shadow">
                      <RiCheckLine className="size-3 font-bold" />
                    </div>
                  )}
                </div>

                {/* Status & Actions */}
                <div className="flex-1 w-full text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div>
                      <h4 className="text-xs font-bold text-foreground">
                        {imageFile?.name || "Book Cover Graphic"}
                      </h4>
                      <p className="text-[11px] text-muted-foreground">
                        {imageFile
                          ? `${(imageFile.size / 1024).toFixed(1)} KB`
                          : "Cover asset ready"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="inline-flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 font-medium self-center sm:self-auto py-1 px-2.5 rounded-full hover:bg-rose-500/10 transition-colors"
                    >
                      <RiCloseLine className="size-4" />
                      <span>Remove</span>
                    </button>
                  </div>

                  {/* Upload Progress State */}
                  {isUploading ? (
                    <div className="space-y-1.5 mt-2">
                      <div className="flex items-center justify-between text-[11px] text-[#8fd9a8] font-semibold">
                        <span className="flex items-center gap-1.5">
                          <Spinner size="sm" />
                          <span>Uploading cover to ImgBB...</span>
                        </span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#5bb37b] to-[#8fd9a8] transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  ) : uploadedUrl ? (
                    <div className="flex items-center gap-1.5 text-xs text-[#8fd9a8] font-medium mt-1">
                      <RiCheckLine className="size-4 shrink-0" />
                      <span>Ready for publication • Hosted CDN URL secured</span>
                    </div>
                  ) : uploadError ? (
                    <div className="text-xs text-rose-400 font-medium mt-1">
                      <span>{uploadError}</span>
                    </div>
                  ) : null}
                </div>
              </div>
            )}

            {errors.image && (
              <p className="text-[11px] text-rose-400 mt-1.5 font-medium">{errors.image}</p>
            )}
          </div>

          {/* Short Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-foreground">
                Short Description <span className="text-[#e0915a]">*</span>
              </label>
              <span className="text-[11px] text-muted-foreground">
                {description.length} characters
              </span>
            </div>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a concise literary synopsis or reading guide summary for this edition..."
              className={`w-full px-3.5 py-2.5 rounded-2xl bg-background border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 transition-all ${
                errors.description
                  ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20"
                  : "border-border focus:border-[#8fd9a8] focus:ring-[#8fd9a8]"
              }`}
            />
            {errors.description && (
              <p className="text-[11px] text-rose-400 mt-1 font-medium">{errors.description}</p>
            )}
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
            <Link href="/my-books">
              <button
                type="button"
                className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel and return to My Books
              </button>
            </Link>

            <BookNookButton
              type="submit"
              size="default"
              disabled={isSubmitting || isUploading}
              className="gap-2 font-bold px-8 shadow-lg shadow-[#8fd9a8]/20 w-full sm:w-auto"
            >
              <RiBookMarkedLine className="size-4" />
              <span>{isSubmitting ? "Cataloging Book..." : "Add Book to Library"}</span>
            </BookNookButton>
          </div>
        </form>
      </div>
    </div>
  );
}
