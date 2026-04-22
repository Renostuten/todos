import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { useAuth } from "./AuthContext";
import { getTodoLists } from "../services/todoListsApi";
import type { TodoData } from "../types/todo";

interface TodoContextValue {
  data: TodoData | null;
  setData: Dispatch<SetStateAction<TodoData | null>>;
  loadTodos: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const TodoContext = createContext<TodoContextValue | undefined>(undefined);

interface TodoProviderProps {
  children: ReactNode;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Failed to load todo lists";
}

export function TodoProvider({ children }: TodoProviderProps) {
  const { currentUser } = useAuth();

  const [data, setData] = useState<TodoData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTodos = useCallback(async () => {
    if (!currentUser) {
      setData(null);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await getTodoLists();
      setData(response);
    } catch (caughtError: unknown) {
      setError(getErrorMessage(caughtError));
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    void loadTodos();
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

export function useTodos() {
  const context = useContext(TodoContext);

  if (!context) {
    throw new Error("useTodos must be used within a TodoProvider");
  }

  return context;
}
