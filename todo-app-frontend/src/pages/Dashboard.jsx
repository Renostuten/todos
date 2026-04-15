import { useState } from 'react'
import '../App.css'

import { useAuth } from '../context/AuthContext'
import { useTodos } from '../context/TodoContext'

import useTodoFilters from '../hooks/useTodoFilters'

import CreateListForm from '../components/CreateListForm'
import Login from '../components/Login'
import TodoListCard from '../components/TodoListCard'
import Chart from '../components/Chart'
import Filter from '../components/Filter'

export default function Dashboard() {  
  const [showCreateListForm, setShowCreateListForm] = useState(false)

  const {
    currentUser,
    isCheckingSession,
    handleLogout, 
    loginError,
    setLoginError,
    handleLoginSuccess
  } = useAuth();

  const { data } = useTodos();

  const {
    searchQuery,
    setSearchQuery,
    selectedFilterColour,
    setSelectedFilterColour,
    startDueDate,
    setStartDueDate,
    endDueDate,
    setEndDueDate,
    dueDateSort,
    setDueDateSort,
    prioritySort,
    setPrioritySort,
    itemSort,
    setItemSort,
    filteredLists,
  } = useTodoFilters(data?.lists ?? []);

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
            <div className="user-badge">
              Signed in as <strong>{currentUser.email}</strong>
              <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </div>
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

            <Filter
              selectedFilterColour={selectedFilterColour}
              setSelectedFilterColour={setSelectedFilterColour}
              startDueDate={startDueDate}
              setStartDueDate={setStartDueDate}
              endDueDate={endDueDate}
              setEndDueDate={setEndDueDate}
              dueDateSort={dueDateSort}
              setDueDateSort={setDueDateSort}
              prioritySort={prioritySort}
              setPrioritySort={setPrioritySort}
              itemSort={itemSort}
              setItemSort={setItemSort}
            />
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