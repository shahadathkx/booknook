import { Book } from "@/types/book";
import { INITIAL_BOOKS } from "@/lib/seed-data";
import { getApiBaseUrl } from "@/lib/config";

const CANONICAL_BOOK_COVERS: Record<string, string> = {
  "to kill a mockingbird": "/images/books/bn-001.jpg",
  "1984": "/images/books/bn-002.jpg",
  "pride and prejudice": "/images/books/bn-003.jpg",
  "dune": "/images/books/bn-004.jpg",
  "the hobbit": "https://covers.openlibrary.org/b/isbn/9780547928227-L.jpg",
  "the silmarillion": "https://covers.openlibrary.org/b/isbn/9780618391110-L.jpg",
  "silmarillion": "https://covers.openlibrary.org/b/isbn/9780618391110-L.jpg",
  "the pragmatic programmer": "https://covers.openlibrary.org/b/isbn/9780135957059-L.jpg",
  "pragmatic programmer": "https://covers.openlibrary.org/b/isbn/9780135957059-L.jpg",
  "atomic habits": "https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg",
  "cosmos": "https://covers.openlibrary.org/b/isbn/9780345539434-L.jpg",
  "a people's history of the world": "https://covers.openlibrary.org/b/isbn/9781844672387-L.jpg",
  "people's history": "https://covers.openlibrary.org/b/isbn/9781844672387-L.jpg",
  "the little prince": "https://covers.openlibrary.org/b/isbn/9780156012195-L.jpg",
  "little prince": "https://covers.openlibrary.org/b/isbn/9780156012195-L.jpg",
  "thinking, fast and slow": "https://covers.openlibrary.org/b/isbn/9780374533557-L.jpg",
  "meditations": "https://covers.openlibrary.org/b/isbn/9780140449334-L.jpg",
  "the great gatsby": "https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg",
  "great gatsby": "https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg",
  "harry potter": "https://covers.openlibrary.org/b/isbn/9780590353427-L.jpg",
  "clean code": "https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg",
  "brave new world": "https://covers.openlibrary.org/b/isbn/9780060850524-L.jpg",
  "fahrenheit 451": "https://covers.openlibrary.org/b/isbn/9781451673319-L.jpg",
  "sapiens": "https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg",
  "lord of the rings": "https://covers.openlibrary.org/b/isbn/9780618640157-L.jpg",
};

export function resolveOriginalBookCover(
  title?: string,
  existingUrl?: string,
  isbn?: string
): string | undefined {
  const cleanTitle = (title || "").toLowerCase().trim();


  for (const [key, cover] of Object.entries(CANONICAL_BOOK_COVERS)) {
    if (cleanTitle.includes(key)) {
      return cover;
    }
  }


  if (existingUrl && existingUrl.trim()) {
    return existingUrl.trim();
  }


  if (isbn) {
    const cleanIsbn = isbn.replace(/[-\s]/g, "");
    if (/^\d{10,13}$/.test(cleanIsbn)) {
      return `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-L.jpg`;
    }
  }

  return undefined;
}






// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeBook(raw: any): Book {
  if (!raw) return raw;
  const { _id, id, image, coverImage, cover_image, imageUrl, ...rest } = raw;
  const rawImage = coverImage || image || cover_image || imageUrl || undefined;
  const resolvedImage = resolveOriginalBookCover(raw.title, rawImage, raw.isbn);
  const bookId = id ?? (typeof _id === "object" ? String(_id) : _id ? String(_id) : "");

  return {
    id: bookId,
    title: raw.title || "Untitled Volume",
    author: raw.author || "Unknown Author",
    genre: raw.genre || raw.category || "Fiction",
    category: raw.category || raw.genre || "Fiction",
    isbn: raw.isbn || `978-${bookId.slice(-9).padStart(9, "0")}`,
    publishedYear: Number(raw.publishedYear || raw.year || 2024),
    description: raw.description || "A volume in the BookNook catalog.",
    coverTheme: raw.coverTheme || {
      id: "emerald",
      label: "Emerald Hearth",
      gradientClass: "from-emerald-950 via-teal-950 to-slate-900",
    },
    coverImage: resolvedImage,
    image: resolvedImage,
    status: raw.status || (Number(raw.availableCopies ?? 1) > 0 ? "available" : "borrowed"),
    totalCopies: Number(raw.totalCopies ?? raw.copies ?? 1),
    availableCopies: Number(raw.availableCopies ?? raw.totalCopies ?? 1),
    addedAt: raw.addedAt || raw.createdAt || new Date().toISOString(),
    addedBy: raw.addedBy,
    currentBorrow: raw.currentBorrow ?? null,
    ...rest,
  } as Book;
}






export async function getNewArrivals(limit: number = 6): Promise<Book[]> {
  const apiUrl = getApiBaseUrl();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1500);

    const res = await fetch(`${apiUrl}/books?sort=newest&limit=${limit}`, {
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timeout);

    if (res.ok) {
      const json = await res.json();
      const items = Array.isArray(json) ? json : json?.books || json?.data;
      if (Array.isArray(items) && items.length > 0) {
        return items.slice(0, limit).map(normalizeBook);
      }
    }
  } catch {}


  return [...INITIAL_BOOKS]
    .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
    .slice(0, limit);
}

export interface FetchBooksParams {
  search?: string;
  category?: string;
  sort?: string;
  limit?: number;
}





export async function fetchBooks(params: FetchBooksParams = {}): Promise<Book[]> {
  const apiUrl = getApiBaseUrl();
  const query = new URLSearchParams();
  if (params.search?.trim()) query.set("search", params.search.trim());
  if (params.category && params.category !== "all" && params.category !== "All") {
    query.set("category", params.category);
  }
  if (params.sort) query.set("sort", params.sort);
  if (params.limit) query.set("limit", params.limit.toString());

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const queryString = query.toString();
    const url = `${apiUrl}/books${queryString ? `?${queryString}` : ""}`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "Content-Type": "application/json" },
    });
    clearTimeout(timeout);

    if (res.ok) {
      const json = await res.json();
      const items = Array.isArray(json) ? json : json?.books || json?.data;
      if (Array.isArray(items)) {
        return items.map(normalizeBook);
      }
    }
  } catch {

  }


  let list = [...INITIAL_BOOKS];

  if (params.category && params.category !== "all" && params.category !== "All") {
    const catLower = params.category.toLowerCase();
    list = list.filter(
      (b) =>
        (b.category && b.category.toLowerCase() === catLower) ||
        (b.genre && b.genre.toLowerCase() === catLower)
    );
  }

  if (params.search && params.search.trim()) {
    const q = params.search.toLowerCase().trim();
    list = list.filter((b) => {
      const matchTitle = b.title.toLowerCase().includes(q);
      const matchAuthor = b.author.toLowerCase().includes(q);
      const matchCategory = (b.category || b.genre).toLowerCase().includes(q);
      const matchDescription = b.description.toLowerCase().includes(q);
      return matchTitle || matchAuthor || matchCategory || matchDescription;
    });
  }

  return list;
}





export async function fetchBookById(
  id: string,
  requestHeaders?: HeadersInit
): Promise<Book | null> {
  if (!/^[a-f\d]{24}$/i.test(id)) {
    return INITIAL_BOOKS.find((book) => book.id === id) || null;
  }

  const apiUrl = getApiBaseUrl();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const headers = new Headers(requestHeaders);
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const res = await fetch(`${apiUrl}/books/${encodeURIComponent(id)}`, {
      signal: controller.signal,
      headers,
      cache: "no-store",
    });

    if (res.status === 404) {
      return null;
    }

    if (!res.ok) {
      throw new Error(`Could not load book details (HTTP ${res.status}).`);
    }

    const json = await res.json();
    const book = json?.book || json?.data || json;
    if (!book || typeof book !== "object" || !(book.id || book._id)) {
      throw new Error("The books API returned an invalid book details response.");
    }

    return normalizeBook(book);
  } finally {
    clearTimeout(timeout);
  }
}
