import { createContext, useContext, useEffect, useState } from "react";

import { getCurrentUser, logoutCurrentUser } from '../services/api'

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    async function restoreSession() {
      try {
        const user = await getCurrentUser()
        setCurrentUser(user)
        setLoginError('')
      } catch {
        setCurrentUser(null);
      } finally {
        setIsCheckingSession(false);
      }
    }

    restoreSession();
  }, []);

  function handleLoginSuccess(user) {
    setCurrentUser(user)
    setLoginError('')
  }

  async function handleLogout() {
      try {
        await logoutCurrentUser()
        setCurrentUser(null)
        setLoginError('')
      } catch (error) {
        console.error('Logout failed:', error)
      }
    }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isCheckingSession,
        isAuthenticated: !!currentUser,
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