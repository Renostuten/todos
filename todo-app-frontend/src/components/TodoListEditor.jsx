import React from 'react'

import { useState } from 'react'
import { createTodoItem, updateTodoLists } from '../services/api'
import { useTodos } from '../context/TodoContext'

export default function TodoListEditor({
  list,
  activeForm,
  setActiveForm,
}) {
  const [editForm, setEditForm] = useState({
    id: 0,
    title: "",
    colour: "#4CAF50",
    dueDate: "",
  });

  const [addItemForm, setAddItemForm] = useState({
    listId: 0,
    title: "",
  });

  const { data, loadTodos } = useTodos();

  function handleStartEdit(list) {
    setActiveForm({
      type: 'editList',
      listId: list.id
    });
    setEditForm({
      id: list.id,
      title: list.title,
      colour: list.colour,
      dueDate: list.dueDate ? list.dueDate.split('T')[0] : '',
    });
  }

  async function handleUpdateList(event) {
    event.preventDefault();
    if (!editForm.title.trim()) {
      alert('Please enter a title for the todo list.');
      return;
    }

    try {
      const newList = {
        id: editForm.id,
        title: editForm.title.trim(),
        colour: editForm.colour,
        dueDate: editForm.dueDate || null,
      };
      await updateTodoLists(newList);
      setActiveForm({ type: null, listId: null });
      await loadTodos();
    } catch (error) {
      console.error('Error updating todo list:', error);
    }
  }

  function handleStartAddItem(list) {
    setActiveForm({
      type: 'addItem',
      listId: list.id
    });
    setAddItemForm({
      listId: list.id,
      title: "",
    });
  }

  async function handleCreateItem(event) {
    event.preventDefault();
    if (!addItemForm.title.trim()) {
      alert('Please enter a title for the todo item.');
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
    } catch (error) {
      console.error('Error creating todo item:', error);
    }
  }

  return (
    <>
      <button onClick={() => handleStartEdit(list)} style={{ marginRight: '10px' }}>
        Update List
      </button>
      <button onClick={() => handleStartAddItem(list)}>Add Todo</button>

      {activeForm.type === 'addItem' && activeForm.listId === list.id && (
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
            onClick={() => setActiveForm({ type: null, listId: null })}
            style={{ marginLeft: '8px' }}
          >
            Cancel
          </button>
        </form>
      )}

      {activeForm.type === 'editList' && activeForm.listId === list.id && (
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
            onClick={() => setActiveForm({ type: null, listId: null })}
            style={{ marginLeft: '8px' }}
          >
            Cancel
          </button>
        </form>
      )}
    </>
  )
}
