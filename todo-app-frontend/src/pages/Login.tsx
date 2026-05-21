import { useAuth } from "../context/AuthContext";

const API_BASE_URL =
  "https://dash-internal-todo-d4hxg2epe9esekc2.australiaeast-01.azurewebsites.net";

/**
 * Renders the Google sign-in button and starts the backend OAuth flow when clicked.
 *
 * @param onLoginError - Optional callback for surfacing login-start failures to the parent.
 * @returns The login button UI for starting Google authentication.
 */
export default function Login() {
  const { loginError, setLoginError } =
      useAuth();


  /**
   * Redirects the browser to the backend endpoint that initiates Google authentication.
   */
  const handleGoogleLogin = () => {
    try {
      window.location.assign(`${API_BASE_URL}/.auth/login/aad`);
    } catch (error: unknown) {
      console.error(error);
      setLoginError("Failed to start Microsoft login.");
    }
  };

  return (
    <div className="todo-app login-page">
      <div className="todo-header">
        <div className="todo-header-top">
          <h1>Sign in to continue</h1>
        </div>
        <div className="auth-row">
          <button type="button" onClick={handleGoogleLogin} className="google-button">
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              className="google-icon"
            />
            Sign in with Microsoft
          </button>
        </div>
        {loginError && <div className="login-error">{loginError}</div>}
      </div>
    </div>
  );
}
