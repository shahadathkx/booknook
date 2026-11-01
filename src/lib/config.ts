/**
 * Environment configuration for BookNook.
 * Reads environment variables with safe, sensible fallbacks.
 */
export const siteConfig = {
  appName: process.env.NEXT_PUBLIC_APP_NAME || "BookNook",
  libraryBranch: process.env.NEXT_PUBLIC_LIBRARY_BRANCH || "The Forest Hearth",
  defaultLoanDays: Number(process.env.NEXT_PUBLIC_DEFAULT_LOAN_DAYS) || 14,
  motto: process.env.NEXT_PUBLIC_LIBRARY_MOTTO || "Add, borrow, and return timeless stories.",
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:7000",
};
