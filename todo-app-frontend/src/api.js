const BASE_URL = 'http://localhost:5031/api';

function fetchWithCredentials(url, options = {}) {
  return fetch(url, {
    credentials: 'include',
    ...options,
  });
}

export async function getTodoLists() {
  const response = await fetchWithCredentials(`${BASE_URL}/todolists`);

  if (!response.ok) {
    throw new Error('Failed to fetch todo lists');
  }

  return response.json();
}

export async function getTodoListById(id) {
  const response = await fetchWithCredentials(`${BASE_URL}/todolists/${id}`);

  if (!response.ok) {
    throw new Error('Failed to fetch todo list');
  }

  return response.json();
}

export async function getCurrentUser() {
  const response = await fetchWithCredentials(`${BASE_URL}/auth/me`);

  if (!response.ok) {
    throw new Error('Not authenticated');
  }

  return response.json();
}

export async function createTodoLists(newList) {
  const response = await fetchWithCredentials(`${BASE_URL}/todolists`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newList),
  });

  if (!response.ok) {
    throw new Error('Failed to create todo lists');
  }

  return response.json();
}

export async function updateTodoLists(newList) {
  const response = await fetchWithCredentials(`${BASE_URL}/todolists/${newList.id}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newList),
  });

  if (!response.ok) {
    throw new Error('Failed to update todo list');
  }
}

export async function deleteTodoLists(id) {
  const response = await fetchWithCredentials(`${BASE_URL}/todolists/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete todo list');
  }
}

export async function createTodoItem(newItem) {
  const response = await fetchWithCredentials(`${BASE_URL}/todoitems`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newItem),
  });

    if (!response.ok) {
        throw new Error('Failed to create todo item');
    }
  return response.json();
}

export async function updateTodoItem(updatedItem) {
  const response = await fetchWithCredentials(`${BASE_URL}/todoitems/${updatedItem.id}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedItem),
  });

  if (!response.ok) {
    throw new Error('Failed to update todo item');
  }
}

export async function deleteTodoItem(id) {
  const response = await fetchWithCredentials(`${BASE_URL}/todoitems/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete todo item');
  }
}

export async function updateTodoItemDetails(updatedItem) {
  const response = await fetchWithCredentials(`${BASE_URL}/todoitems/updatedetail/${updatedItem.id}`, {
    method: 'PATCH',
    headers: { 
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedItem),
  });

  if (!response.ok) {
    throw new Error('Failed to update todo item');
  }
}

export async function toggleTodoItem(updatedItem) {
  const response = await fetchWithCredentials(`${BASE_URL}/todoitems/toggle/${updatedItem.id}`, {
    method: 'PATCH',
    headers: { 
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedItem),
  });

  if (!response.ok) {
    throw new Error('Failed to update todo item');
  }
}