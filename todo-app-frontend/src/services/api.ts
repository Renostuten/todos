import type {
  CreateTodoItemRequest,
  CreateTodoListRequest,
  TodoData,
  TodoList,
  ToggleTodoItemRequest,
  UpdateTodoItemDetailsRequest,
  UpdateTodoItemRequest,
  UpdateTodoListRequest,
} from "../types/todo";
import type { CurrentUser, SignupErrorResponse } from "../types/auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5031/api";

function fetchWithCredentials(url: string, options: RequestInit = {}) {
  return fetch(url, {
    credentials: "include",
    ...options,
  });
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

async function getErrorMessage(
  response: Response,
  fallbackMessage: string,
): Promise<string> {
  const errorData = (await response.json().catch(() => null)) as SignupErrorResponse | null;
  return errorData?.error ?? fallbackMessage;
}

export async function getTodoLists(): Promise<TodoData> {
  const response = await fetchWithCredentials(`${API_BASE_URL}/todolists`);

  if (!response.ok) {
    throw new Error("Failed to fetch todo lists");
  }

  return parseJsonResponse<TodoData>(response);
}

export async function getTodoListById(id: number): Promise<TodoList> {
  const response = await fetchWithCredentials(`${API_BASE_URL}/todolists/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch todo list");
  }

  return parseJsonResponse<TodoList>(response);
}

export async function getCurrentUser(): Promise<CurrentUser> {
  const response = await fetchWithCredentials(`${API_BASE_URL}/auth/me`);

  if (!response.ok) {
    throw new Error("Not authenticated");
  }

  return parseJsonResponse<CurrentUser>(response);
}

export async function createTodoLists(newList: CreateTodoListRequest): Promise<number> {
  const response = await fetchWithCredentials(`${API_BASE_URL}/todolists`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newList),
  });

  if (!response.ok) {
    throw new Error("Failed to create todo list");
  }

  return parseJsonResponse<number>(response);
}

export async function updateTodoLists(newList: UpdateTodoListRequest): Promise<void> {
  const response = await fetchWithCredentials(`${API_BASE_URL}/todolists/${newList.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newList),
  });

  if (!response.ok) {
    throw new Error("Failed to update todo list");
  }
}

export async function deleteTodoLists(id: number): Promise<void> {
  const response = await fetchWithCredentials(`${API_BASE_URL}/todolists/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete todo list");
  }
}

export async function createTodoItem(newItem: CreateTodoItemRequest): Promise<number> {
  const response = await fetchWithCredentials(`${API_BASE_URL}/todoitems`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newItem),
  });

  if (!response.ok) {
    throw new Error("Failed to create todo item");
  }

  return parseJsonResponse<number>(response);
}

export async function updateTodoItem(updatedItem: UpdateTodoItemRequest): Promise<void> {
  const response = await fetchWithCredentials(`${API_BASE_URL}/todoitems/${updatedItem.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedItem),
  });

  if (!response.ok) {
    throw new Error("Failed to update todo item");
  }
}

export async function deleteTodoItem(id: number): Promise<void> {
  const response = await fetchWithCredentials(`${API_BASE_URL}/todoitems/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete todo item");
  }
}

export async function updateTodoItemDetails(
  updatedItem: UpdateTodoItemDetailsRequest,
): Promise<void> {
  const response = await fetchWithCredentials(
    `${API_BASE_URL}/todoitems/updatedetail/${updatedItem.id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedItem),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to update todo item");
  }
}

export async function toggleTodoItem(updatedItem: ToggleTodoItemRequest): Promise<void> {
  const response = await fetchWithCredentials(
    `${API_BASE_URL}/todoitems/toggle/${updatedItem.id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedItem),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to update todo item");
  }
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
