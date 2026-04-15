import { useState } from 'react'
import '../App.css'

import { useAuth } from '../context/AuthContext'
import { useTodos } from '../context/TodoContext'

import CreateListForm from '../components/CreateListForm'
import Login from '../components/Login'
import TodoListCard from '../components/TodoListCard'
import Chart from '../components/Chart'
import Filter from '../components/Filter'

export default function Dashboard() {  
  const [showCreateListForm, setShowCreateListForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

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

  

  function getHighestPriority(list) {
    if (!list.items || list.items.length === 0) {
      return 0;
    }

    return Math.max(...list.items.map((item) => item.priority ?? 0));
  }

  const filteredLists = [...(data?.lists ?? [])]
    .filter((list) => {

      // Filter by search query
      if (searchQuery.trim() !== "" && !list.title.toLowerCase().includes(searchQuery.trim().toLowerCase())) {
        return false;
      }

      // Filter by colour
      if (selectedFilterColour !== "all" && list.colour !== selectedFilterColour) {
        return false;
      }

      // Filter by due date range
      if (startDueDate && (!list.dueDate || new Date(list.dueDate) < new Date(startDueDate))) {
        return false;
      }

      if (endDueDate && (!list.dueDate || new Date(list.dueDate) > new Date(endDueDate))) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      // Due date sort takes precedence
      if (dueDateSort === "earliest") {
        const aDate = a.dueDate ? new Date(a.dueDate) : new Date("9999-12-31");
        const bDate = b.dueDate ? new Date(b.dueDate) : new Date("9999-12-31");
        return aDate - bDate;
      }

      if (dueDateSort === "latest") {
        const aDate = a.dueDate ? new Date(a.dueDate) : new Date("0001-01-01");
        const bDate = b.dueDate ? new Date(b.dueDate) : new Date("0001-01-01");
        return bDate - aDate;
      }

      // Priority sort
      if (prioritySort === "high-to-low") {
        return getHighestPriority(b) - getHighestPriority(a);
      }

      if (prioritySort === "low-to-high") {
        return getHighestPriority(a) - getHighestPriority(b);
      }

      // Item count sort
      if (itemSort === "most-items") {
        return b.items.length - a.items.length;
      }

      if (itemSort === "fewest-items") {
        return a.items.length - b.items.length;
      }

      return 0;
    });

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

          {showCreateListForm && (
            <CreateListForm
              colours={data.colours}
              setShowCreateListForm={setShowCreateListForm}
            />
          )}

          <Chart lists={data?.lists ?? []} />

          <div className='todo-toolbar'>
            <input
              type="text"
              className="todo-search"
              placeholder="Search by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search todo lists by title"
            />

            <Filter/>
          </div>

          
        </div>

        {filteredLists.length === 0 ? (
          <p>{data.lists.length === 0 ? 'No todo lists yet.' : 'No matching lists found.'}</p>
        ) : (
          <section className="todo-grid">
            {filteredLists.map((list) => (
              <TodoListCard
                key={list.id}
                list={list}
              data={data}
            />
          ))}
        </section>
        )}
      </div>
    </>
  )
}