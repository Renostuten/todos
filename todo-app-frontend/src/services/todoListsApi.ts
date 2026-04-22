import type { CreateTodoListRequest, TodoData, TodoList, UpdateTodoListRequest } from "../types/todo";

import { API_BASE_URL, fetchWithCredentials, parseJsonResponse } from "./http";

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
