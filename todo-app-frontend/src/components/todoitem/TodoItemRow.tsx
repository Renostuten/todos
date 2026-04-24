import { type ChangeEvent, type FormEvent, type MouseEvent, useMemo, useState } from "react";

import { useTodos } from "../../context/TodoContext";
import {
  deleteTodoItem,
  toggleTodoItem,
  updateTodoItem,
  updateTodoItemDetails,
} from "../../services/todoItemsApi";
import type { TodoItem } from "../../types/todo";

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

/**
 * Displays a todo item row with completion toggling plus inline editing for core fields and details.
 *
 * @param item - The todo item to render and manage inline.
 * @returns The todo item row UI with view and edit states.
 */
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

  /**
   * Opens the main item editor with the selected item's current title and completion state.
   *
   * @param currentItem - The item whose editable fields should populate the main edit form.
   */
  function handleStartEditItem(currentItem: TodoItem) {
    setEditItemId(currentItem.id);
    setEditItemForm({
      id: currentItem.id,
      listId: currentItem.listId,
      title: currentItem.title,
      done: currentItem.done,
    });
  }

  /**
   * Persists edits to an item's title/completion fields and refreshes the list data.
   *
   * @param event - The form submission event from the main item editor.
   * @returns A promise that resolves after the item update workflow completes.
   */
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

  /**
   * Confirms item deletion, closes any active inline editor for that item, and reloads todos.
   *
   * @param event - The click event from the delete-item button.
   * @param id - The id of the todo item to delete.
   * @returns A promise that resolves after the deletion workflow completes.
   */
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

  /**
   * Opens the secondary editor for an item's priority and note fields.
   *
   * @param currentItem - The item whose detail fields should populate the details form.
   */
  function handleStartEditItemDetails(currentItem: TodoItem) {
    setEditItemDetailsId(currentItem.id);
    setEditItemDetailsForm({
      id: currentItem.id,
      listId: currentItem.listId,
      priority: currentItem.priority ?? 0,
      note: currentItem.note ?? "",
    });
  }

  /**
   * Saves the item's note and priority details, then refreshes the shared todo payload.
   *
   * @param event - The form submission event from the item details editor.
   * @returns A promise that resolves after the detail update workflow completes.
   */
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

  /**
   * Flips an item's completion state through the toggle API and reloads the updated list.
   *
   * @param currentItem - The item whose completion state should be inverted.
   * @returns A promise that resolves after the toggle request completes.
   */
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

  /**
   * Maps priority ids from the shared metadata payload to readable labels for display.
   *
   * @returns A lookup object from priority id to its display label.
   */
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
