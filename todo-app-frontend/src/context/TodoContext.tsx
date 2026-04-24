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

/**
 * Normalizes unknown fetch failures into a user-facing message for the todo context.
 *
 * @param error - The caught error from a todo loading request.
 * @returns A readable message to show in the UI.
 */
function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Failed to load todo lists";
}

/**
 * Provides the loaded todo data plus refresh, loading, and error state for authenticated users.
 *
 * @param children - The application subtree that consumes todo data.
 * @returns The todo context provider wrapped around the given children.
 */
export function TodoProvider({ children }: TodoProviderProps) {
  const { currentUser } = useAuth();

  const [data, setData] = useState<TodoData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches the current user's todo payload and resets state when no session is available.
   *
   * @returns A promise that resolves after the context state has been refreshed.
   */
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

/**
 * Returns the shared todo context and ensures consumers are wrapped in the provider.
 *
 * @returns The current todo context value for the active component tree.
 */
export function useTodos() {
  const context = useContext(TodoContext);

  if (!context) {
    throw new Error("useTodos must be used within a TodoProvider");
  }

  return context;
}
