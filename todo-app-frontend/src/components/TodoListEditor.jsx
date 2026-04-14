import React from 'react'

export default function TodoListEditor({
  list,
  data,
  editingListId,
  addItemtoListId,
  editForm,
  addItemForm,
  handleStartEdit,
  handleStartAddItem,
  handleCreateItem,
  handleUpdateList,
  setAddItemToListId,
  setEditingListId,
  setEditForm,
  setAddItemForm,
}) {
  return (
    <>
      <button onClick={() => handleStartEdit(list)} style={{ marginRight: '10px' }}>
        Update List
      </button>
      <button onClick={() => handleStartAddItem(list)}>Add Todo</button>

      {addItemtoListId === list.id && (
        <form onSubmit={(e) => handleCreateItem(e)} className='todo-list-form'>
          <div style={{ marginBottom: '8px' }}>
            <textarea
              type="text"
              value={addItemForm.title}
              onChange={(e) => setAddItemForm({ ...addItemForm, title: e.target.value })}
              placeholder="Todo title"
            />
          </div>

          <button type="submit">Create Todo</button>
          <button
            type="button"
            onClick={() => setAddItemToListId(null)}
            style={{ marginLeft: '8px' }}
          >
            Cancel
          </button>
        </form>
      )}

      {editingListId === list.id && (
        <form onSubmit={(e) => handleUpdateList(e)} className="todo-list-form">
          <div style={{ marginBottom: '8px' }}>
            <textarea
              type="text"
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              placeholder="List title"
            />
          </div>

          <div style={{ marginBottom: '8px' }}>
            <select
              value={editForm.colour}
              onChange={(e) => setEditForm({ ...editForm, colour: e.target.value })}
            >
              {(data.colours ?? []).map((colour) => (
                <option key={colour.code} value={colour.code}>
                  {colour.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '8px' }}>
            <input
              type="datetime-local"
              value={editForm.dueDate}
              onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
            />
          </div>

          <button type="submit">Save</button>
          <button
            type="button"
            onClick={() => setEditingListId(null)}
            style={{ marginLeft: '8px' }}
          >
            Cancel
          </button>
        </form>
      )}
    </>
  )
}
