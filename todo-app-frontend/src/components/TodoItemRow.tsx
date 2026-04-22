import { type ChangeEvent, type FormEvent, type MouseEvent, useMemo, useState } from "react";

import { useTodos } from "../context/TodoContext";
import {
  deleteTodoItem,
  toggleTodoItem,
  updateTodoItem,
  updateTodoItemDetails,
} from "../services/todoItemsApi";
import type { TodoItem } from "../types/todo";

interface TodoItemRowProps {
  item: TodoItem;
}

interface EditItemFormState {
  id: number;
  listId: number;
  title: string;
  done: boolean;
}

interface EditItemDetailsFormState {
  id: number;
  listId: number;
  priority: number;
  note: string;
}

export default function TodoItemRow({ item }: TodoItemRowProps) {
  const [editItemId, setEditItemId] = useState<number | null>(null);
  const [editItemForm, setEditItemForm] = useState<EditItemFormState>({
    id: 0,
    listId: 0,
    title: "",
    done: false,
  });

  const [editItemDetailsId, setEditItemDetailsId] = useState<number | null>(null);
  const [editItemDetailsForm, setEditItemDetailsForm] = useState<EditItemDetailsFormState>({
    id: 0,
    listId: 0,
    priority: 0,
    note: "",
  });

  const { data, loadTodos } = useTodos();

  function handleStartEditItem(currentItem: TodoItem) {
    setEditItemId(currentItem.id);
    setEditItemForm({
      id: currentItem.id,
      listId: currentItem.listId,
      title: currentItem.title,
      done: currentItem.done,
    });
  }

  async function handleUpdateItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editItemForm.title.trim()) {
      alert("Please enter a title for the todo item.");
      return;
    }

    try {
      await updateTodoItem({
        id: editItemForm.id,
        listId: editItemForm.listId,
        title: editItemForm.title.trim(),
        done: editItemForm.done,
      });
      setEditItemForm({
        id: 0,
        listId: 0,
        title: "",
        done: false,
      });
      setEditItemId(null);
      await loadTodos();
    } catch (error: unknown) {
      console.error("Error updating todo item:", error);
    }
  }

  async function handleDeleteItem(event: MouseEvent<HTMLButtonElement>, id: number) {
    event.preventDefault();

    const confirmed = window.confirm("Are you sure you want to delete this todo item?");
    if (!confirmed) {
      return;
    }

    try {
      await deleteTodoItem(id);

      if (editItemId === id) {
        setEditItemId(null);
      }

      await loadTodos();
    } catch (error: unknown) {
      console.error("Error deleting todo item:", error);
    }
  }

  function handleStartEditItemDetails(currentItem: TodoItem) {
    setEditItemDetailsId(currentItem.id);
    setEditItemDetailsForm({
      id: currentItem.id,
      listId: currentItem.listId,
      priority: currentItem.priority ?? 0,
      note: currentItem.note ?? "",
    });
  }

  async function handleUpdateItemDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await updateTodoItemDetails({
        id: editItemDetailsForm.id,
        listId: editItemDetailsForm.listId,
        priority: editItemDetailsForm.priority,
        note: editItemDetailsForm.note,
      });
      setEditItemDetailsForm({
        id: 0,
        listId: 0,
        priority: 0,
        note: "",
      });
      setEditItemDetailsId(null);
      await loadTodos();
    } catch (error: unknown) {
      console.error("Error updating todo item details:", error);
    }
  }

  async function handleToggleItem(currentItem: TodoItem) {
    try {
      await toggleTodoItem({
        id: currentItem.id,
        listId: currentItem.listId,
        done: !currentItem.done,
      });
      await loadTodos();
    } catch (error: unknown) {
      console.error("Error toggling todo item:", error);
    }
  }

  const priorityMap = useMemo<Record<number, string>>(() => {
    return (data?.priorityLevels ?? []).reduce<Record<number, string>>((accumulator, level) => {
      accumulator[level.id] = level.title;
      return accumulator;
    }, {});
  }, [data?.priorityLevels]);

  return (
    <li className="todo-item">
      {editItemId === item.id ? (
        <form
          onSubmit={(event) => {
            void handleUpdateItem(event);
          }}
          className="todo-item-edit"
        >
          <div className="todo-item-edit-top">
            <textarea
              value={editItemForm.title}
              onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                setEditItemForm({ ...editItemForm, title: event.target.value })
              }
              placeholder="Item title"
            />
            <label>
              Done
              <input
                type="checkbox"
                checked={editItemForm.done}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setEditItemForm({ ...editItemForm, done: event.target.checked })
                }
              />
            </label>
          </div>

          <div className="todo-item-actions">
            <button type="submit">Save</button>
            <button type="button" onClick={() => setEditItemId(null)}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="todo-item-view">
          <div>
            <strong
              className={item.done ? "todo-item-done" : ""}
              onClick={() => {
                void handleToggleItem(item);
              }}
              style={{ cursor: "pointer" }}
            >
              {item.done ? "[done]" : "[ ]"} {item.title}
            </strong>
            <div className="todo-item-metadata">
              <div>Priority: {priorityMap[item.priority ?? 0] ?? "Unknown"}</div>
              {item.note && <div>Note: {item.note}</div>}
            </div>
          </div>

          <div className="todo-item-actions">
            <button type="button" onClick={() => handleStartEditItem(item)} title="Edit item">
              Edit
            </button>
            <button
              type="button"
              onClick={() => handleStartEditItemDetails(item)}
              title="Edit details"
            >
              Details
            </button>
            <button
              type="button"
              onClick={(event) => {
                void handleDeleteItem(event, item.id);
              }}
              title="Delete item"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {editItemDetailsId === item.id && (
        <form
          onSubmit={(event) => {
            void handleUpdateItemDetails(event);
          }}
          className="todo-item-edit-details"
        >
          <label className="todo-item-edit-details-group">
            Priority
            <select
              className="todo-item-edit-details-input"
              value={editItemDetailsForm.priority}
              onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                setEditItemDetailsForm({
                  ...editItemDetailsForm,
                  priority: Number(event.target.value),
                })
              }
            >
              {(data?.priorityLevels ?? []).map((level) => (
                <option key={level.id} value={level.id}>
                  {level.title}
                </option>
              ))}
            </select>
          </label>

          <label className="todo-item-edit-details-group">
            Note
            <textarea
              className="todo-item-edit-details-input"
              value={editItemDetailsForm.note}
              onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                setEditItemDetailsForm({ ...editItemDetailsForm, note: event.target.value })
              }
              placeholder="Optional note"
            />
          </label>

          <div className="todo-item-actions">
            <button type="submit">Save</button>
            <button type="button" onClick={() => setEditItemDetailsId(null)}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </li>
  );
}
