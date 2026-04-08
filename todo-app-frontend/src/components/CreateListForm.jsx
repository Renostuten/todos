import React from 'react'

export default function CreateListForm({
  title,
  setTitle,
  selectedColour,
  setSelectedColour,
  selectedDueDate,
  setSelectedDueDate,
  colours,
  handleCreateList,
  onCancel,
}) {
  return (
    <div className="create-list-panel">
      <h2>Create New Todo List</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleCreateList()
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
          <button type="button" onClick={onCancel} className="cancel-btn">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
