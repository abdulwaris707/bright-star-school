/**
 * Native fetch wrapper for Bright Star API.
 * Handles JSON serialization, attaches Bearer token from localStorage,
 * and throws readable errors.
 */

const API_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/+$/, "")
    : (typeof import.meta !== "undefined" && import.meta.env?.PROD ? "/api" : "http://localhost:4000/api"));

export interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  params?: Record<string, string | number | boolean | undefined>;
  body?: any;
}

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export function getAuthToken(): string | null {
  try {
    return (
      localStorage.getItem("bright_star_token") ||
      localStorage.getItem("token") ||
      null
    );
  } catch {
    return null;
  }
}

export function setAuthToken(token: string): void {
  try {
    localStorage.setItem("bright_star_token", token);
  } catch {}
}

export function removeAuthToken(): void {
  try {
    localStorage.removeItem("bright_star_token");
    localStorage.removeItem("token");
    localStorage.removeItem("bright_star_user");
  } catch {}
}

export function getSavedUser(): { id: number; username: string; role: string; fullName: string } | null {
  try {
    const raw = localStorage.getItem("bright_star_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setSavedUser(user: { id: number; username: string; role: string; fullName: string }): void {
  try {
    localStorage.setItem("bright_star_user", JSON.stringify(user));
  } catch {}
}

export async function apiFetch<T = unknown>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { params, headers, ...customConfig } = options;

  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  let url = `${API_BASE_URL}${cleanEndpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const token = getAuthToken();
  if (token) {
    requestHeaders["Authorization"] = `Bearer ${token}`;
  }

  let serializedBody = customConfig.body;
  if (
    serializedBody !== undefined &&
    serializedBody !== null &&
    typeof serializedBody !== "string" &&
    !(typeof FormData !== "undefined" && serializedBody instanceof FormData)
  ) {
    serializedBody = JSON.stringify(serializedBody);
  }

  const config: RequestInit = {
    ...customConfig,
    body: serializedBody,
    headers: {
      ...requestHeaders,
      ...headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const contentType = response.headers.get("content-type");
    const isJson = contentType && contentType.includes("application/json");

    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const errorMessage =
        (typeof data === "object" && data !== null && (data as { message?: string; error?: string }).message) ||
        (typeof data === "object" && data !== null && (data as { message?: string; error?: string }).error) ||
        `Request failed with status ${response.status} (${response.statusText || "Error"})`;

      throw new ApiError(errorMessage, response.status, data);
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    const message = error instanceof Error ? error.message : "Network error occurred";
    throw new ApiError(message, 0);
  }
}

export const api = {
  get: <T = unknown>(endpoint: string, options?: ApiRequestOptions) =>
    apiFetch<T>(endpoint, { ...options, method: "GET" }),

  post: <T = unknown>(endpoint: string, body?: unknown, options?: ApiRequestOptions) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  put: <T = unknown>(endpoint: string, body?: unknown, options?: ApiRequestOptions) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  patch: <T = unknown>(endpoint: string, body?: unknown, options?: ApiRequestOptions) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  delete: <T = unknown>(endpoint: string, options?: ApiRequestOptions) =>
    apiFetch<T>(endpoint, { ...options, method: "DELETE" }),
};

export default api;
