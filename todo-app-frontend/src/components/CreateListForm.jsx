import React from 'react'
import { useState } from 'react'
import { createTodoLists} from '../services/api'
import { useTodos } from '../context/TodoContext'

export default function CreateListForm({
  colours,
  setShowCreateListForm,
}) {
  const [title, setTitle] = useState('')
  const [selectedColour, setSelectedColour] = useState('#4CAF50')
  const [selectedDueDate, setSelectedDueDate] = useState('')

  const { data, loadTodos } = useTodos();

  async function handleCreateList(event) {
    event.preventDefault();
    if (!title) {
      alert('Please enter a title for the todo list.');
      return;
    }

    try {
      const newList = {
        title: title.trim(),
        colour: selectedColour,
        dueDate: selectedDueDate || null,
      };
      await createTodoLists(newList);
      setTitle('');
      setSelectedColour(data.colours[0].code);
      setSelectedDueDate('');
      setShowCreateListForm(false);
      await loadTodos();
    } catch (error) {
      console.error('Error creating todo list:', error);
    }
  }

  return (
    <div className="create-list-panel">
      <h2>Create New Todo List</h2>
      <form
        onSubmit={(e) => {
          handleCreateList(e)
        }}
        className="form-grid"
      >
        <input
          type="text"
          placeholder="List title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <select
          value={selectedColour}
          onChange={(e) => setSelectedColour(e.target.value)}
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
          onChange={(e) => setSelectedDueDate(e.target.value)}
        />

        <div className="create-list-actions">
          <button type="submit">Create List</button>
          <button type="button" onClick={() => setShowCreateListForm(false)} className="cancel-btn">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
