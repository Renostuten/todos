import React from 'react'

import { useState } from 'react'
import { updateTodoItem, deleteTodoItem, updateTodoItemDetails, toggleTodoItem } from '../services/api'
import { useTodos } from '../context/TodoContext'

export default function TodoItemRow({
  item,
}) {
  const [editItemId, setEditItemId] = useState(null);
  const [editItemForm, setEditItemForm] = useState({
    id: 0,
    listId: 0,
    title: "",
    done: false,
  });

  const [editItemDetailsId, setEditItemDetailsId] = useState(null);
  const [editItemDetailsForm, setEditItemDetailsForm] = useState({
    id: 0,
    listId: 0,
    priority: 0,
    note: "",
  });

  const { data, loadTodos } = useTodos();

  function handleStartEditItem(item) {
    setEditItemId(item.id);
    setEditItemForm({
      id: item.id,
      listId: item.listId,
      title: item.title,
      done: item.done,
    });
  }

  async function handleUpdateItem(event) {
    event.preventDefault();
    if (!editItemForm.title.trim()) {
      alert('Please enter a title for the todo item.');
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
    } catch (error) {
      console.error('Error updating todo item:', error);
    }
  }

  async function handleDeleteItem(event, id) {
    event.preventDefault();
    const confirmed = window.confirm('Are you sure you want to delete this todo item?');
    if (!confirmed) {
      return;
    }

    try {
      await deleteTodoItem(id);

      if (editItemId === id) {
        setEditItemId(null);
      }

      await loadTodos();
    } catch (error) {
      console.error('Error deleting todo item:', error);
    }
  }

  function handleStartEditItemDetails(item) {
      setEditItemDetailsId(item.id);
      setEditItemDetailsForm({
        id: item.id,
        listId: item.listId,
        priority: item.priority ?? 0,
        note: item.note ?? "",
      });
    }
  
  async function handleUpdateItemDetails(event) {
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
    } catch (error) {
      console.error('Error updating todo item details:', error);
    }
  }

  async function handleToggleItem(item) {
    try {
      await toggleTodoItem({
        id: item.id,
        listId: item.listId,
        done: !item.done,
      });
      await loadTodos();
    } catch (error) {
      console.error('Error toggling todo item:', error);
    }
  }

  const priorityMap = Object.fromEntries(
    data.priorityLevels.map((level) => [level.id, level.title])
  );

  return (
    <li className="todo-item">
      {editItemId === item.id ? (
        <form onSubmit={(e) => handleUpdateItem(e)} className="todo-item-edit">
          <div className="todo-item-edit-top">
            <textarea
              type="text"
              value={editItemForm.title}
              onChange={(e) => setEditItemForm({ ...editItemForm, title: e.target.value })}
              placeholder="Item title"
            />
            <label>
              Done
              <input
                type="checkbox"
                checked={editItemForm.done}
                onChange={(e) => setEditItemForm({ ...editItemForm, done: e.target.checked })}
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
            <button onClick={(e) => handleDeleteItem(e, item.id)} title="Delete item">🗑</button>
          </div>
        </div>
      )}

      {editItemDetailsId === item.id && (
        <form onSubmit={(e) => handleUpdateItemDetails(e)} className="todo-item-edit-details">
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
            <textarea
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
