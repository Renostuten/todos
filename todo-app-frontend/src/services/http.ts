import type { SignupErrorResponse } from "../types/auth";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5031/api";

/**
 * Wraps fetch so API requests automatically include the authentication cookie/session.
 *
 * @param url - The request URL to call.
 * @param options - Additional fetch options to merge into the request.
 * @returns The fetch promise with credentials included by default.
 */
export function fetchWithCredentials(url: string, options: RequestInit = {}) {
  return fetch(url, {
    credentials: "include",
    ...options,
  });
}

/**
 * Parses a successful JSON response into the caller's expected data shape.
 *
 * @param response - The HTTP response containing JSON content.
 * @returns The parsed response body cast to the requested type.
 */
export async function parseJsonResponse<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

/**
 * Extracts an API error message payload when available and falls back to a default message.
 *
 * @param response - The failed HTTP response that may contain an error payload.
 * @param fallbackMessage - The message to use when the response body has no usable error text.
 * @returns The API-provided error message or the supplied fallback.
 */
export async function getErrorMessage(
  response: Response,
  fallbackMessage: string,
): Promise<string> {
  const errorData = (await response.json().catch(() => null)) as SignupErrorResponse | null;
  return errorData?.error ?? fallbackMessage;
}
