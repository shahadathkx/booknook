export type BookGenre =
  | "Classic Literature"
  | "Fiction"
  | "Science Fiction"
  | "Fantasy"
  | "Mystery & Thriller"
  | "Non-Fiction"
  | "Philosophy"
  | "Biography"
  | "Science"
  | "History"
  | "Kids";

export type BookStatus = "available" | "borrowed";

export interface BorrowRecord {
  id?: string;
  borrowerName: string;
  borrowerEmail?: string;
  borrowedAt: string;
  dueDate: string;
  notes?: string;
}

export interface BorrowItem {
  id: string;
  bookId: string;
  title: string;
  author?: string;
  coverImage?: string;
  coverTheme?: BookCoverTheme;
  borrowDate: string;
  returnDate: string;
}

export interface BookCoverTheme {
  name: string;
  gradientClass: string;
  accentColor: string;
  textColor: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  genre: BookGenre;
  category?: string;
  isbn: string;
  publishedYear: number;
  description: string;
  coverTheme: BookCoverTheme;
  coverImage?: string;
  status: BookStatus;
  currentBorrow?: BorrowRecord | null;
  addedAt: string;
  addedBy?:
    | {
        name: string;
        email: string;
      }
    | string;
  availableCopies?: number;
  totalCopies?: number;
}

export type BookFilterStatus = "all" | "available" | "borrowed";

export interface AddBookInput {
  title: string;
  author: string;
  genre: BookGenre;
  category?: string;
  isbn?: string;
  publishedYear?: number;
  description: string;
  coverImage?: string;
  totalCopies?: number;
  availableCopies?: number;
  addedBy?:
    | {
        name: string;
        email: string;
      }
    | string;
  coverThemeName?: string;
}

export interface BorrowBookInput {
  borrowerName: string;
  borrowerEmail?: string;
  loanDurationDays: number;
  notes?: string;
}
