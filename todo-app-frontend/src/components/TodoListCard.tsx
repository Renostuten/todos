import { type MouseEvent, useState } from "react";

import { useTodos } from "../context/TodoContext";
import { deleteTodoLists } from "../services/todoListsApi";
import type { ActiveFormState } from "../types/ui";
import type { TodoList } from "../types/todo";
import TodoItemRow from "./TodoItemRow";
import TodoListEditor from "./TodoListEditor";

interface TodoListCardProps {
  list: TodoList;
}

export default function TodoListCard({ list }: TodoListCardProps) {
  const [activeForm, setActiveForm] = useState<ActiveFormState>({
    type: null,
    listId: null,
  });

  const { loadTodos } = useTodos();

  const allDone = list.items.length > 0 && list.items.every((item) => item.done);
  const completionPercentage =
    list.items.length === 0
      ? 0
      : Math.round((list.items.filter((item) => item.done).length / list.items.length) * 100);

  async function handleDeleteList(event: MouseEvent<HTMLButtonElement>, id: number) {
    event.preventDefault();

    const confirmed = window.confirm("Are you sure you want to delete this todo list?");
    if (!confirmed) {
      return;
    }

    try {
      await deleteTodoLists(id);

      if (activeForm.listId === id) {
        setActiveForm({ type: null, listId: null });
      }

      await loadTodos();
    } catch (error: unknown) {
      console.error("Error deleting todo list:", error);
    }
  }

  return (
    <div className="todo-list-card" style={{ borderColor: list.colour || "#4CAF50" }}>
      <button
        onClick={(event) => {
          void handleDeleteList(event, list.id);
        }}
        className="todo-list-delete-button"
        title="Delete list"
      >
        x
      </button>
      <div className="todo-list-header">
        <span className="todo-list-completion">{completionPercentage}%</span>
        <h2 className={allDone ? "todo-list-all-done" : ""}>{list.title}</h2>
      </div>

      {list.dueDate && (
        <div className="todo-list-duedate">
          Due: {new Date(list.dueDate).toLocaleDateString("en-GB")}{" "}
          {new Date(list.dueDate).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      )}

      <TodoListEditor list={list} activeForm={activeForm} setActiveForm={setActiveForm} />

      {list.items.length === 0 ? (
        <p>No todo items in this list.</p>
      ) : (
        <ul>
          {list.items.map((item) => (
            <TodoItemRow key={item.id} item={item} />
          ))}
        </ul>
      )}
    </div>
  );
}
