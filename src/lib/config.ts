



export const siteConfig = {
  appName: process.env.NEXT_PUBLIC_APP_NAME || "BookNook",
  libraryBranch: process.env.NEXT_PUBLIC_LIBRARY_BRANCH || "The Forest Hearth",
  defaultLoanDays: Number(process.env.NEXT_PUBLIC_DEFAULT_LOAN_DAYS) || 14,
  motto: process.env.NEXT_PUBLIC_LIBRARY_MOTTO || "Add, borrow, and return timeless stories.",
  apiUrl: process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "",
};

export function getApiBaseUrl(): string {
  const apiUrl = siteConfig.apiUrl;
  if (!apiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL must be configured.");
  }
  return apiUrl;
}
