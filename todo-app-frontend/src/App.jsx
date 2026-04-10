import { useState, useEffect } from 'react'
import './App.css'

import { 
  getTodoLists, 
  getCurrentUser, 
  createTodoLists, 
  updateTodoLists, 
  deleteTodoLists, 
  createTodoItem, 
  updateTodoItem, 
  deleteTodoItem, 
  updateTodoItemDetails,
  toggleTodoItem
} from './api'
import CreateListForm from './components/CreateListForm'
import Login from './components/Login'
import TodoListCard from './components/TodoListCard'
import Chart from './components/Chart'

function App() {
  const [data, setData] = useState(null)

  const [title, setTitle] = useState('')
  const [selectedColour, setSelectedColour] = useState('#4CAF50')
  const [selectedDueDate, setSelectedDueDate] = useState('')
  const [showCreateListForm, setShowCreateListForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentUser, setCurrentUser] = useState(null)
  const [loginError, setLoginError] = useState('')
  const [isCheckingSession, setIsCheckingSession] = useState(true)

  const [editingListId, setEditingListId] = useState(null);
  const [editForm, setEditForm] = useState({
    id: 0,
    title: "",
    colour: "#4CAF50",
    dueDate: "",
  });

  const [addItemtoListId, setAddItemToListId] = useState(null);
  const [addItemForm, setAddItemForm] = useState({
    listId: 0,
    title: "",
  });

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

  async function loadTodos() {
    try {
      const res = await getTodoLists()
      console.log(res)
      setData(res)
    } catch (error) {
      console.error('Error fetching todo lists:', error)
    }
  }

  async function restoreSession() {
    try {
      const user = await getCurrentUser()
      setCurrentUser(user)
      setLoginError('')
    } catch {
      setCurrentUser(null)
    } finally {
      setIsCheckingSession(false)
    }
  }

  function handleLoginSuccess(user) {
    setCurrentUser(user)
    setLoginError('')
  }

  async function handleLogout() {
    try {
      await fetch('http://localhost:5031/api/Users/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({}),
      })
      setCurrentUser(null)
      setData(null)
      setShowCreateListForm(false)
      setLoginError('')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  useEffect(() => {
    restoreSession()
  }, [])

  useEffect(() => {
    if (!currentUser) {
      return
    }

    loadTodos()
  }, [currentUser])

  if (isCheckingSession) {
    return <p>Checking sign-in status...</p>
  }

  if (!currentUser) {
    return (
      <div className="todo-app login-page">
        <div className="todo-header">
          <div className="todo-header-top">
            <h1>Sign in to continue</h1>
          </div>
          <div className="auth-row">
            <Login onLoginSuccess={handleLoginSuccess} onLoginError={setLoginError} />
          </div>
          {loginError && <div className="login-error">{loginError}</div>}
        </div>
      </div>
    )
  }

  if (!data) {
    return <p>Loading your todo lists...</p>
  }

  const priorityMap = Object.fromEntries(
    data.priorityLevels.map((level) => [level.id, level.title])
  );

  const filteredLists = data.lists.filter((list) =>
    list.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  async function handleCreateList() {
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

  function handleStartEdit(list) {
    setEditingListId(list.id);
    setEditForm({
      id: list.id,
      title: list.title,
      colour: list.colour,
      dueDate: list.dueDate ? list.dueDate.split('T')[0] : '',
    });
  }

  async function handleUpdateList() {
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
      await loadTodos();
    } catch (error) {
      console.error('Error updating todo list:', error);
    }
  }

  async function handleDeleteList(id) {
    const confirmed = window.confirm('Are you sure you want to delete this todo list?');
    if (!confirmed) {
      return;
    }

    try {
      await deleteTodoLists(id);

      if (editingListId === id) {
        setEditingListId(null);
      }

      await loadTodos();
    } catch (error) {
      console.error('Error deleting todo list:', error);
    }
  }

  function handleStartAddItem(list) {
    setAddItemToListId(list.id);
    setAddItemForm({
      listId: list.id,
      title: "",
    });
  }

  async function handleCreateItem() {
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
      setAddItemToListId(null);
      await loadTodos();
    } catch (error) {
      console.error('Error creating todo item:', error);
    }
  }

  function handleStartEditItem(item) {
    setEditItemId(item.id);
    setEditItemForm({
      id: item.id,
      listId: item.listId,
      title: item.title,
      done: item.done,
    });
  }

  async function handleUpdateItem() {
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

  async function handleDeleteItem(id) {
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

  return (
    <>
      <div className="todo-app" >
        <div className="todo-header">
          <div className="todo-header-top">
            <h1>Todos</h1>
            <button
              className="fab-btn"
              onClick={() => setShowCreateListForm((prev) => !prev)}
              aria-label={showCreateListForm ? 'Hide create list form' : 'Show create list form'}
            >
              {showCreateListForm ? '✕' : '+'}
            </button>
          </div>

          <div className="auth-row">
            {currentUser ? (
              <div className="user-badge">
                Signed in as <strong>{currentUser.email}</strong>
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
              </div>
            ) : (
              <Login onLoginSuccess={handleLoginSuccess} onLoginError={setLoginError} />
            )}
            {loginError && <div className="login-error">{loginError}</div>}
          </div>

          <Chart lists={data?.lists ?? []} />

          <input
            type="text"
            className="todo-search"
            placeholder="Search by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search todo lists by title"
          />
        </div>

        {showCreateListForm && (
          <CreateListForm
            title={title}
            setTitle={setTitle}
            selectedColour={selectedColour}
            setSelectedColour={setSelectedColour}
            selectedDueDate={selectedDueDate}
            setSelectedDueDate={setSelectedDueDate}
            colours={data.colours}
            handleCreateList={handleCreateList}
            onCancel={() => setShowCreateListForm(false)}
          />
        )}

        {filteredLists.length === 0 ? (
          <p>{data.lists.length === 0 ? 'No todo lists yet.' : 'No matching lists found.'}</p>
        ) : (
          <section className="todo-grid">
            {filteredLists.map((list) => (
              <TodoListCard
                key={list.id}
                list={list}
                priorityMap={priorityMap}
              data={data}
              editingListId={editingListId}
              addItemtoListId={addItemtoListId}
              editItemId={editItemId}
              editItemDetailsId={editItemDetailsId}
              editForm={editForm}
              addItemForm={addItemForm}
              editItemForm={editItemForm}
              editItemDetailsForm={editItemDetailsForm}
              setEditForm={setEditForm}
              setAddItemForm={setAddItemForm}
              setEditItemForm={setEditItemForm}
              setEditItemDetailsForm={setEditItemDetailsForm}
              handleDeleteList={handleDeleteList}
              handleStartEdit={handleStartEdit}
              handleStartAddItem={handleStartAddItem}
              handleCreateItem={handleCreateItem}
              handleStartEditItem={handleStartEditItem}
              handleUpdateItem={handleUpdateItem}
              handleDeleteItem={handleDeleteItem}
              handleStartEditItemDetails={handleStartEditItemDetails}
              handleUpdateItemDetails={handleUpdateItemDetails}
              handleUpdateList={handleUpdateList}
              setAddItemToListId={setAddItemToListId}
              setEditingListId={setEditingListId}
              setEditItemId={setEditItemId}
              setEditItemDetailsId={setEditItemDetailsId}
              handleToggleItem={handleToggleItem}
            />
          ))}
        </section>
        )}
      </div>
    </>
  )
}

export default App
