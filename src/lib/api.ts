/**
 * API Client wrapper for BookNook backend service.
 * Targets NEXT_PUBLIC_API_URL (default: http://localhost:7000)
 * Automatically attaches JWT Bearer token from local storage / cookies.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:7000";

const TOKEN_STORAGE_KEY = "booknook_jwt_token";

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  token?: string;
  params?: Record<string, string | number | boolean | undefined>;
  body?: any;
}

/**
 * Get the current JWT token from storage or memory
 */
export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return (
      localStorage.getItem(TOKEN_STORAGE_KEY) ||
      sessionStorage.getItem(TOKEN_STORAGE_KEY) ||
      null
    );
  } catch {
    return null;
  }
}

/**
 * Store the JWT token for subsequent API requests
 */
export function setStoredToken(token: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch (err) {
    console.error("Failed to persist JWT token:", err);
  }
}

/**
 * Core fetch wrapper with Bearer token authentication
 */
export async function apiClient<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, body, token, headers: customHeaders, ...customConfig } = options;

  // Build query string if params are provided
  let url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  // Resolve JWT token
  const authToken = token || getStoredToken();

  const headers = new Headers(customHeaders);

  // Set default JSON Content-Type if body is not FormData
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  if (!isFormData && !headers.has("Content-Type") && body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  // Attach Authorization: Bearer <token>
  if (authToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${authToken.replace(/^Bearer\s+/i, "")}`);
  }

  const config: RequestInit = {
    ...customConfig,
    headers,
  };

  if (body !== undefined) {
    config.body = isFormData ? body : JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);

    // Parse JSON or text response
    const contentType = response.headers.get("content-type");
    let responseData: any = null;
    if (contentType && contentType.includes("application/json")) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    if (!response.ok) {
      const errorMessage =
        (typeof responseData === "object" && responseData?.message) ||
        (typeof responseData === "string" && responseData) ||
        response.statusText ||
        `HTTP Error ${response.status}`;

      throw new ApiError(errorMessage, response.status, responseData);
    }

    return responseData as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    const message = error instanceof Error ? error.message : "Network request failed";
    throw new ApiError(message, 0);
  }
}

/**
 * Convenient typed HTTP methods
 */
export const api = {
  get: <T = any>(endpoint: string, options?: RequestOptions) =>
    apiClient<T>(endpoint, { ...options, method: "GET" }),

  post: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    apiClient<T>(endpoint, { ...options, method: "POST", body }),

  put: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    apiClient<T>(endpoint, { ...options, method: "PUT", body }),

  patch: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    apiClient<T>(endpoint, { ...options, method: "PATCH", body }),

  delete: <T = any>(endpoint: string, options?: RequestOptions) =>
    apiClient<T>(endpoint, { ...options, method: "DELETE" }),

  setToken: setStoredToken,
  getToken: getStoredToken,
};
