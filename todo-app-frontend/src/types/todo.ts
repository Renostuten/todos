export interface TodoItem {
  id: number;
  listId: number;
  title: string;
  done: boolean;
  priority: number;
  note: string | null;
}

export interface TodoList {
  id: number;
  title: string;
  colour: string | null;
  dueDate: string | null;
  items: TodoItem[];
}

export interface TodoColour {
  code: string;
  name: string;
}

export interface PriorityLevel {
  id: number;
  title: string;
}

export interface TodoData {
  priorityLevels: PriorityLevel[];
  colours: TodoColour[];
  lists: TodoList[];
}

export interface CreateTodoListRequest {
  title: string;
  colour: string;
  dueDate: string | null;
}

export interface UpdateTodoListRequest extends CreateTodoListRequest {
  id: number;
}

export interface CreateTodoItemRequest {
  listId: number;
  title: string;
}

export interface UpdateTodoItemRequest {
  id: number;
  listId: number;
  title: string;
  done: boolean;
}

export interface UpdateTodoItemDetailsRequest {
  id: number;
  listId: number;
  priority: number;
  note: string;
}

export interface ToggleTodoItemRequest {
  id: number;
  listId: number;
  done: boolean;
}
