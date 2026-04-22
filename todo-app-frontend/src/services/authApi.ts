import type { CurrentUser } from "../types/auth";

import {
  API_BASE_URL,
  fetchWithCredentials,
  getErrorMessage,
  parseJsonResponse,
} from "./http";

export async function getCurrentUser(): Promise<CurrentUser> {
  const response = await fetchWithCredentials(`${API_BASE_URL}/auth/me`);

  if (!response.ok) {
    throw new Error("Not authenticated");
  }

  return parseJsonResponse<CurrentUser>(response);
}

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
