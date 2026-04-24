import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";

import { getCurrentUser, logoutCurrentUser } from "../services/authApi";
import type { CurrentUser } from "../types/auth";

interface AuthContextValue {
  currentUser: CurrentUser | null;
  setCurrentUser: Dispatch<SetStateAction<CurrentUser | null>>;
  isCheckingSession: boolean;
  isAuthenticated: boolean;
  handleLoginSuccess: (user: CurrentUser) => void;
  handleLogout: () => Promise<void>;
  loginError: string;
  setLoginError: Dispatch<SetStateAction<string>>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Provides the authenticated user, session state, and login/logout actions to the app.
 *
 * @param children - The application subtree that consumes auth state.
 * @returns The auth context provider wrapped around the given children.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    /**
     * Restores an existing authenticated session when the app first loads.
     */
    async function restoreSession() {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
        setLoginError("");
      } catch {
        setCurrentUser(null);
      } finally {
        setIsCheckingSession(false);
      }
    }

    void restoreSession();
  }, []);

  /**
   * Stores the signed-in user after a successful authentication flow.
   *
   * @param user - The authenticated user returned by the backend.
   */
  function handleLoginSuccess(user: CurrentUser) {
    setCurrentUser(user);
    setLoginError("");
  }

  /**
   * Ends the current session and clears auth state from the frontend context.
   */
  async function handleLogout() {
    try {
      await logoutCurrentUser();
      setCurrentUser(null);
      setLoginError("");
    } catch (error: unknown) {
      console.error("Logout failed:", error);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isCheckingSession,
        isAuthenticated: Boolean(currentUser),
        handleLoginSuccess,
        handleLogout,
        loginError,
        setLoginError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Returns the shared auth context and enforces usage inside the auth provider tree.
 *
 * @returns The current auth context value for the active component tree.
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
