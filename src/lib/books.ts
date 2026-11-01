import { Book } from "@/types/book";
import { INITIAL_BOOKS } from "@/lib/seed-data";

/**
 * Normalize a raw book object from the API (which may use `_id` from MongoDB)
 * into the client-side `Book` shape that always uses `id`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeBook(raw: any): Book {
  const { _id, id, ...rest } = raw;
  return { id: id ?? String(_id ?? ""), ...rest } as Book;
}

/**
 * Server-side data fetcher for New Arrivals.
 * Performs GET /books?sort=newest&limit=6 to the backend API,
 * with automatic fallback to seeded library inventory if the external service is offline.
 */
export async function getNewArrivals(limit: number = 6): Promise<Book[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:7000";

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1500);

    const res = await fetch(`${apiUrl}/books?sort=newest&limit=${limit}`, {
      signal: controller.signal,
      next: { revalidate: 60 },
    });
    clearTimeout(timeout);

    if (res.ok) {
      const json = await res.json();
      const items = Array.isArray(json) ? json : json?.books || json?.data;
      if (Array.isArray(items) && items.length > 0) {
        return items.slice(0, limit).map(normalizeBook);
      }
    }
  } catch {
    // Backend service not reachable or timed out; use seeded library stacks
  }

  // Sort newest first by addedAt
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

/**
 * Fetches books from the API (GET /books?search=...&category=...)
 * with automatic fallback to seeded library inventory if the external service is offline.
 */
export async function fetchBooks(params: FetchBooksParams = {}): Promise<Book[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:7000";
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
    // Backend service not reachable or timed out; filter seeded library inventory
  }

  // Local fallback
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

/**
 * Fetches a single book by ID from the API (GET /books/:id)
 * with automatic fallback to seeded library inventory.
 */
export async function fetchBookById(id: string): Promise<Book | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:7000";

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${apiUrl}/books/${id}`, {
      signal: controller.signal,
      headers: { "Content-Type": "application/json" },
    });
    clearTimeout(timeout);

    if (res.ok) {
      const json = await res.json();
      const book = json?.book || json?.data || json;
      if (book && (book.id || book._id)) {
        return normalizeBook(book);
      }
    }
  } catch {
    // API offline; fallback
  }

  return INITIAL_BOOKS.find((b) => b.id === id) || null;
}

