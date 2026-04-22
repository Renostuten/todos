import {
  type ChangeEvent,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
  useState,
} from "react";

import { useTodos } from "../context/TodoContext";
import { createTodoItem, updateTodoLists } from "../services/api";
import type { TodoList } from "../types/todo";
import type { ActiveFormState } from "../types/ui";

interface TodoListEditorProps {
  list: TodoList;
  activeForm: ActiveFormState;
  setActiveForm: Dispatch<SetStateAction<ActiveFormState>>;
}

interface EditListFormState {
  id: number;
  title: string;
  colour: string;
  dueDate: string;
}

interface AddItemFormState {
  listId: number;
  title: string;
}

function toDateTimeLocalValue(dateString: string | null) {
  return dateString ? dateString.slice(0, 16) : "";
}

export default function TodoListEditor({
  list,
  activeForm,
  setActiveForm,
}: TodoListEditorProps) {
  const [editForm, setEditForm] = useState<EditListFormState>({
    id: 0,
    title: "",
    colour: "#4CAF50",
    dueDate: "",
  });

  const [addItemForm, setAddItemForm] = useState<AddItemFormState>({
    listId: 0,
    title: "",
  });

  const { data, loadTodos } = useTodos();
  const colours = data?.colours ?? [];

  function handleStartEdit(currentList: TodoList) {
    setActiveForm({
      type: "editList",
      listId: currentList.id,
    });
    setEditForm({
      id: currentList.id,
      title: currentList.title,
      colour: currentList.colour || "#4CAF50",
      dueDate: toDateTimeLocalValue(currentList.dueDate),
    });
  }

  async function handleUpdateList(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editForm.title.trim()) {
      alert("Please enter a title for the todo list.");
      return;
    }

    try {
      const updatedList = {
        id: editForm.id,
        title: editForm.title.trim(),
        colour: editForm.colour,
        dueDate: editForm.dueDate || null,
      };

      await updateTodoLists(updatedList);
      setActiveForm({ type: null, listId: null });
      await loadTodos();
    } catch (error: unknown) {
      console.error("Error updating todo list:", error);
    }
  }

  function handleStartAddItem(currentList: TodoList) {
    setActiveForm({
      type: "addItem",
      listId: currentList.id,
    });
    setAddItemForm({
      listId: currentList.id,
      title: "",
    });
  }

  async function handleCreateItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!addItemForm.title.trim()) {
      alert("Please enter a title for the todo item.");
      return;
    }

    try {
      await createTodoItem({
        listId: addItemForm.listId,
        title: addItemForm.title.trim(),
      });
      setAddItemForm({
        listId: 0,
        title: "",
      });
      setActiveForm({ type: null, listId: null });
      await loadTodos();
    } catch (error: unknown) {
      console.error("Error creating todo item:", error);
    }
  }

  return (
    <>
      <button type="button" onClick={() => handleStartEdit(list)} style={{ marginRight: "10px" }}>
        Update List
      </button>
      <button type="button" onClick={() => handleStartAddItem(list)}>
        Add Todo
      </button>

      {activeForm.type === "addItem" && activeForm.listId === list.id && (
        <form
          onSubmit={(event) => {
            void handleCreateItem(event);
          }}
          className="todo-list-form"
        >
          <div style={{ marginBottom: "8px" }}>
            <textarea
              value={addItemForm.title}
              onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                setAddItemForm({ ...addItemForm, title: event.target.value })
              }
              placeholder="Todo title"
            />
          </div>

          <button type="submit">Create Todo</button>
          <button
            type="button"
            onClick={() => setActiveForm({ type: null, listId: null })}
            style={{ marginLeft: "8px" }}
          >
            Cancel
          </button>
        </form>
      )}

      {activeForm.type === "editList" && activeForm.listId === list.id && (
        <form
          onSubmit={(event) => {
            void handleUpdateList(event);
          }}
          className="todo-list-form"
        >
          <div style={{ marginBottom: "8px" }}>
            <textarea
              value={editForm.title}
              onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                setEditForm({ ...editForm, title: event.target.value })
              }
              placeholder="List title"
            />
          </div>

          <div style={{ marginBottom: "8px" }}>
            <select
              value={editForm.colour}
              onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                setEditForm({ ...editForm, colour: event.target.value })
              }
            >
              {colours.map((colour) => (
                <option key={colour.code} value={colour.code}>
                  {colour.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: "8px" }}>
            <input
              type="datetime-local"
              value={editForm.dueDate}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setEditForm({ ...editForm, dueDate: event.target.value })
              }
            />
          </div>

          <button type="submit">Save</button>
          <button
            type="button"
            onClick={() => setActiveForm({ type: null, listId: null })}
            style={{ marginLeft: "8px" }}
          >
            Cancel
          </button>
        </form>
      )}
    </>
  );
}
