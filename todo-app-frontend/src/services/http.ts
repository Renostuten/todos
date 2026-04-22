import type { SignupErrorResponse } from "../types/auth";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5031/api";

export function fetchWithCredentials(url: string, options: RequestInit = {}) {
  return fetch(url, {
    credentials: "include",
    ...options,
  });
}

export async function parseJsonResponse<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

export async function getErrorMessage(
  response: Response,
  fallbackMessage: string,
): Promise<string> {
  const errorData = (await response.json().catch(() => null)) as SignupErrorResponse | null;
  return errorData?.error ?? fallbackMessage;
}
