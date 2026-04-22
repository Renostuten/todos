import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";

import { getCurrentUser, logoutCurrentUser } from "../services/api";
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

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
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

  function handleLoginSuccess(user: CurrentUser) {
    setCurrentUser(user);
    setLoginError("");
  }

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

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
