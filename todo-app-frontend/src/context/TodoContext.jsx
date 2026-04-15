import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { getTodoLists } from "../services/api";

const TodoContext = createContext();

export function TodoProvider({ children }) {
  const { currentUser } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadTodos = useCallback(async () => {
    if (!currentUser) {
      setData(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await getTodoLists();
      setData(res);
    } catch (error) {
      setError(error.message || "Failed to load todo lists");
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  return (
    <TodoContext.Provider 
      value={{
        data,
        setData,
        loadTodos,
        loading,
        error,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
}

export const useTodos = () => {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodos must be used within a TodoProvider');
  }
  return context;
};