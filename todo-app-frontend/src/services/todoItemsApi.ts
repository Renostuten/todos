import type {
  CreateTodoItemRequest,
  ToggleTodoItemRequest,
  UpdateTodoItemDetailsRequest,
  UpdateTodoItemRequest,
} from "../types/todo";

import { API_BASE_URL, fetchWithCredentials, parseJsonResponse } from "./http";

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
