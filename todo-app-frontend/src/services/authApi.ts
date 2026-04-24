import type { CurrentUser } from "../types/auth";

import {
  API_BASE_URL,
  fetchWithCredentials,
  getErrorMessage,
  parseJsonResponse,
} from "./http";

/**
 * Fetches the currently authenticated user from the session-backed `/auth/me` endpoint.
 *
 * @returns The authenticated user tied to the current session.
 */
export async function getCurrentUser(): Promise<CurrentUser> {
  const response = await fetchWithCredentials(`${API_BASE_URL}/auth/me`);

  if (!response.ok) {
    throw new Error("Not authenticated");
  }

  return parseJsonResponse<CurrentUser>(response);
}

/**
 * Creates a frontend account record after OAuth by calling the `/auth/signup` endpoint.
 *
 * @param userName - The username chosen during the signup completion flow.
 * @returns The created current-user payload returned by the API.
 */
export async function signupUser(userName: string): Promise<CurrentUser> {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ userName }),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "Signup failed."));
  }

  return parseJsonResponse<CurrentUser>(response);
}

/**
 * Signs the current user out through the backend logout endpoint and clears the server session.
 *
 * @returns A promise that resolves when the logout request succeeds.
 */
export async function logoutCurrentUser(): Promise<void> {
  const response = await fetchWithCredentials(`${API_BASE_URL}/Users/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    throw new Error("Logout failed");
  }
}
