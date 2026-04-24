import type {
  CreateTodoItemRequest,
  ToggleTodoItemRequest,
  UpdateTodoItemDetailsRequest,
  UpdateTodoItemRequest,
} from "../types/todo";

import { API_BASE_URL, fetchWithCredentials, parseJsonResponse } from "./http";

/**
 * Creates a new todo item for a list through the `/todoitems` API.
 *
 * @param newItem - The item payload to create for a specific list.
 * @returns The id returned by the API for the newly created item.
 */
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

/**
 * Replaces a todo item's core fields through the `PUT /todoitems/{id}` endpoint.
 *
 * @param updatedItem - The full item payload to persist for the specified item id.
 * @returns A promise that resolves when the update request completes.
 */
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

/**
 * Removes a todo item through the `DELETE /todoitems/{id}` endpoint.
 *
 * @param id - The id of the todo item to delete.
 * @returns A promise that resolves when the item has been deleted.
 */
export async function deleteTodoItem(id: number): Promise<void> {
  const response = await fetchWithCredentials(`${API_BASE_URL}/todoitems/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete todo item");
  }
}

/**
 * Updates a todo item's note and priority through the item details patch endpoint.
 *
 * @param updatedItem - The details payload containing the item id, priority, and note changes.
 * @returns A promise that resolves when the details update succeeds.
 */
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

/**
 * Toggles a todo item's completion state through the dedicated toggle endpoint.
 *
 * @param updatedItem - The item id and completion state to send to the toggle endpoint.
 * @returns A promise that resolves when the item's completion state has been updated.
 */
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
