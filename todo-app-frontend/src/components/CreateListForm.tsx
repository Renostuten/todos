import {
  type ChangeEvent,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
  useState,
} from "react";

import { useTodos } from "../context/TodoContext";
import { createTodoLists } from "../services/api";
import type { TodoColour } from "../types/todo";

interface CreateListFormProps {
  colours: TodoColour[];
  setShowCreateListForm: Dispatch<SetStateAction<boolean>>;
}

export default function CreateListForm({
  colours,
  setShowCreateListForm,
}: CreateListFormProps) {
  const [title, setTitle] = useState("");
  const [selectedColour, setSelectedColour] = useState(colours[0]?.code ?? "");
  const [selectedDueDate, setSelectedDueDate] = useState("");

  const { loadTodos } = useTodos();

  async function handleCreateList(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) {
      alert("Please enter a title for the todo list.");
      return;
    }

    try {
      const newList = {
        title: title.trim(),
        colour: selectedColour || colours[0]?.code || "#4CAF50",
        dueDate: selectedDueDate || null,
      };

      await createTodoLists(newList);
      setTitle("");
      setSelectedColour(colours[0]?.code ?? "");
      setSelectedDueDate("");
      setShowCreateListForm(false);
      await loadTodos();
    } catch (error: unknown) {
      console.error("Error creating todo list:", error);
    }
  }

  return (
    <div className="create-list-panel">
      <h2>Create New Todo List</h2>
      <form
        onSubmit={(event) => {
          void handleCreateList(event);
        }}
        className="form-grid"
      >
        <input
          type="text"
          placeholder="List title"
          value={title}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setTitle(event.target.value)}
        />
        <select
          value={selectedColour}
          onChange={(event: ChangeEvent<HTMLSelectElement>) =>
            setSelectedColour(event.target.value)
          }
        >
          {colours.map((colour) => (
            <option key={colour.code} value={colour.code}>
              {colour.name}
            </option>
          ))}
        </select>

        <input
          type="datetime-local"
          value={selectedDueDate}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            setSelectedDueDate(event.target.value)
          }
        />

        <div className="create-list-actions">
          <button type="submit">Create List</button>
          <button
            type="button"
            onClick={() => setShowCreateListForm(false)}
            className="cancel-btn"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
