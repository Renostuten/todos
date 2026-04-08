import React from 'react'

export default function TodoItemRow({
  item,
  data,
  editItemId,
  editItemDetailsId,
  editItemForm,
  editItemDetailsForm,
  priorityMap,
  setEditItemForm,
  setEditItemDetailsForm,
  setEditItemId,
  setEditItemDetailsId,
  handleStartEditItem,
  handleUpdateItem,
  handleDeleteItem,
  handleStartEditItemDetails,
  handleUpdateItemDetails,
  handleToggleItem,
}) {
  return (
    <li className="todo-item">
      {editItemId === item.id ? (
        <form onSubmit={handleUpdateItem} className="todo-item-edit">
          <div className="todo-item-edit-top">
            <input
              type="text"
              value={editItemForm.title}
              onChange={(e) => setEditItemForm({ ...editItemForm, title: e.target.value })}
              placeholder="Item title"
            />
            <label>
              <input
                type="checkbox"
                checked={editItemForm.done}
                onChange={(e) => setEditItemForm({ ...editItemForm, done: e.target.checked })}
              />
              Done
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
              className={item.done ? 'todo-item-done' : ''}
              onClick={() => handleToggleItem(item)}
              style={{ cursor: 'pointer' }}
              >
              {item.done ? '✅' : '⬜'} {item.title}
            </strong>
            <div className="todo-item-metadata">
              <div>Priority: {priorityMap[item.priority ?? 0] ?? 'Unknown'}</div>
              {item.note && <div>Note: {item.note}</div>}
            </div>
          </div>

          <div className="todo-item-actions">
            <button onClick={() => handleStartEditItem(item)} title="Edit item">✎</button>
            <button onClick={() => handleStartEditItemDetails(item)} title="Edit details">⚙</button>
            <button onClick={() => handleDeleteItem(item.id)} title="Delete item">🗑</button>
          </div>
        </div>
      )}

      {editItemDetailsId === item.id && (
        <form onSubmit={handleUpdateItemDetails} className="todo-item-edit-details">
          <label className='todo-item-edit-details-group'>
            Priority
            <select
              className="todo-item-edit-details-input"
              value={editItemDetailsForm.priority}
              onChange={(e) =>
                setEditItemDetailsForm({ ...editItemDetailsForm, priority: Number(e.target.value) })
              }
            >
              {(data.priorityLevels ?? []).map((level) => (
                <option key={level.id} value={level.id}>
                  {level.title}
                </option>
              ))}
            </select>
          </label>

          <label className='todo-item-edit-details-group'>
            Note
            <input
              className="todo-item-edit-details-input"
              type="text"
              value={editItemDetailsForm.note}
              onChange={(e) => setEditItemDetailsForm({ ...editItemDetailsForm, note: e.target.value })}
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
  )
}
