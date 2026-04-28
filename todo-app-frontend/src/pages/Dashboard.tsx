import { type ChangeEvent, useState } from "react";

import "../App.css";

import Chart from "../components/analytics/Chart";
import CreateListForm from "../components/todolist/CreateListForm";
import Filter from "../components/todolist/Filter";
import Login from "../components/auth/Login";
import TodoListCard from "../components/todolist/TodoListCard";
import { useAuth } from "../context/AuthContext";
import { useTodos } from "../context/TodoContext";
import useTodoFilters from "../hooks/useTodoFilters";

/**
 * Displays the signed-in dashboard, including auth actions, list creation, filtering, and analytics.
 */
export default function Dashboard() {
  const [showCreateListForm, setShowCreateListForm] = useState(false);

  const { currentUser, isCheckingSession, handleLogout, loginError, setLoginError } =
    useAuth();
  const { data, loading, error } = useTodos();

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
    return <p>Checking sign-in status...</p>;
  }

  if (!currentUser) {
    return (
      <div className="todo-app login-page">
        <div className="todo-header">
          <div className="todo-header-top">
            <h1>Sign in to continue</h1>
          </div>
          <div className="auth-row">
            <Login onLoginError={setLoginError} />
          </div>
          {loginError && <div className="login-error">{loginError}</div>}
        </div>
      </div>
    );
  }

  if (loading || !data) {
    return <p>Loading your todo lists...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="todo-app">
      <div className="todo-header">
        <div className="todo-header-top">
          <h1>Todos</h1>
          <button
            type="button"
            className="fab-btn"
            onClick={(event) => {
              event.preventDefault();
              setShowCreateListForm((prev) => !prev);
            }}
            aria-label={showCreateListForm ? "Hide create list form" : "Show create list form"}
          >
            {showCreateListForm ? "x" : "+"}
          </button>
        </div>

        <div className="auth-row">
          <div className="user-badge">
            Signed in as <strong>{currentUser.email}</strong>
            <button
              type="button"
              className="logout-btn"
              onClick={(event) => {
                event.preventDefault();
                void handleLogout();
              }}
            >
              Logout
            </button>
          </div>
          {loginError && <div className="login-error">{loginError}</div>}
        </div>

        {showCreateListForm && (
          <CreateListForm
            colours={data.colours}
            setShowCreateListForm={setShowCreateListForm}
          />
        )}

        <Chart lists={data.lists} />

        <div className="todo-toolbar">
          <input
            type="text"
            className="todo-search"
            placeholder="Search by title..."
            value={searchQuery}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setSearchQuery(event.target.value)}
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
        <p>{data.lists.length === 0 ? "No todo lists yet." : "No matching lists found."}</p>
      ) : (
        <section className="todo-grid">
          {filteredLists.map((list) => (
            <TodoListCard key={list.id} list={list} />
          ))}
        </section>
      )}
    </div>
  );
}
