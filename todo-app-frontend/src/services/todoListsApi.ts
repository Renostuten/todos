import type { CreateTodoListRequest, TodoData, TodoList, UpdateTodoListRequest } from "../types/todo";

import { API_BASE_URL, fetchWithCredentials, parseJsonResponse } from "./http";

/**
 * Fetches the full todo dashboard payload from the `/todolists` endpoint.
 *
 * @returns The todo dashboard data, including lists and lookup metadata.
 */
export async function getTodoLists(): Promise<TodoData> {
  const response = await fetchWithCredentials(`${API_BASE_URL}/todolists`);

  if (!response.ok) {
    throw new Error("Failed to fetch todo lists");
  }

  return parseJsonResponse<TodoData>(response);
}

/**
 * Fetches a single todo list by id from the `/todolists/{id}` endpoint.
 *
 * @param id - The id of the todo list to retrieve.
 * @returns The matching todo list returned by the API.
 */
export async function getTodoListById(id: number): Promise<TodoList> {
  const response = await fetchWithCredentials(`${API_BASE_URL}/todolists/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch todo list");
  }

  return parseJsonResponse<TodoList>(response);
}

/**
 * Creates a new todo list through the `/todolists` API.
 *
 * @param newList - The list payload to create.
 * @returns The id returned by the API for the newly created list.
 */
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

/**
 * Updates an existing todo list through the `PUT /todolists/{id}` endpoint.
 *
 * @param newList - The updated list values, including the target list id.
 * @returns A promise that resolves when the list update succeeds.
 */
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

/**
 * Deletes a todo list through the `DELETE /todolists/{id}` endpoint.
 *
 * @param id - The id of the todo list to delete.
 * @returns A promise that resolves when the list has been deleted.
 */
export async function deleteTodoLists(id: number): Promise<void> {
  const response = await fetchWithCredentials(`${API_BASE_URL}/todolists/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete todo list");
  }
}
