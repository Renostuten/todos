import React from 'react'
import TodoItemRow from './TodoItemRow'
import TodoListEditor from './TodoListEditor'

export default function TodoListCard({
  list,
  priorityMap,
  data,
  editingListId,
  addItemtoListId,
  editItemId,
  editItemDetailsId,
  editForm,
  addItemForm,
  editItemForm,
  editItemDetailsForm,
  setEditForm,
  setAddItemForm,
  setEditItemForm,
  setEditItemDetailsForm,
  handleDeleteList,
  handleStartEdit,
  handleStartAddItem,
  handleCreateItem,
  handleStartEditItem,
  handleUpdateItem,
  handleDeleteItem,
  handleStartEditItemDetails,
  handleUpdateItemDetails,
  handleUpdateList,
  setAddItemToListId,
  setEditingListId,
  setEditItemId,
  setEditItemDetailsId,
  handleToggleItem,
}) {
  const allDone = list.items.length > 0 && list.items.every(item => item.done);
  const completionPercentage = list.items.length === 0 
    ? 0 
    : Math.round((list.items.filter(item => item.done).length / list.items.length) * 100);

  return (
    <div
      key={list.id}
      className="todo-list-card"
      style={{ borderColor: list.colour }}
    >
      <button
        onClick={() => handleDeleteList(list.id)}
        className="todo-list-delete-button"
        title="Delete list"
      >
        x
      </button>
      <div className="todo-list-header">
        <span className="todo-list-completion">{completionPercentage}%</span>
        <h2 className={allDone ? 'todo-list-all-done' : ''}>{list.title}</h2>
      </div>

      {list.dueDate && (
        <div className="todo-list-duedate">
          Due: {new Date(list.dueDate).toLocaleDateString('en-GB')} {new Date(list.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      )}

      <TodoListEditor
        list={list}
        data={data}
        editingListId={editingListId}
        addItemtoListId={addItemtoListId}
        editForm={editForm}
        addItemForm={addItemForm}
        handleStartEdit={handleStartEdit}
        handleStartAddItem={handleStartAddItem}
        handleCreateItem={handleCreateItem}
        handleUpdateList={handleUpdateList}
        setAddItemToListId={setAddItemToListId}
        setEditingListId={setEditingListId}
        setEditForm={setEditForm}
        setAddItemForm={setAddItemForm}
      />

      {list.items.length === 0 ? (
        <p>No todo items in this list.</p>
      ) : (
        <ul>
          {list.items.map((item) => (
            <TodoItemRow
              key={item.id}
              item={item}
              data={data}
              editItemId={editItemId}
              editItemDetailsId={editItemDetailsId}
              editItemForm={editItemForm}
              editItemDetailsForm={editItemDetailsForm}
              priorityMap={priorityMap}
              setEditItemForm={setEditItemForm}
              setEditItemDetailsForm={setEditItemDetailsForm}
              setEditItemId={setEditItemId}
              setEditItemDetailsId={setEditItemDetailsId}
              handleStartEditItem={handleStartEditItem}
              handleUpdateItem={handleUpdateItem}
              handleDeleteItem={handleDeleteItem}
              handleStartEditItemDetails={handleStartEditItemDetails}
              handleUpdateItemDetails={handleUpdateItemDetails}
              handleToggleItem={handleToggleItem}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
