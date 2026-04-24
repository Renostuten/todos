interface LoginProps {
  onLoginError?: (message: string) => void;
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:5031/api";

/**
 * Renders the Google sign-in button and starts the backend OAuth flow when clicked.
 *
 * @param onLoginError - Optional callback for surfacing login-start failures to the parent.
 * @returns The login button UI for starting Google authentication.
 */
export default function Login({ onLoginError }: LoginProps) {
  /**
   * Redirects the browser to the backend endpoint that initiates Google authentication.
   */
  const handleGoogleLogin = () => {
    try {
      window.location.href = `${API_BASE_URL}/auth/google/start`;
    } catch (error: unknown) {
      console.error(error);
      onLoginError?.("Failed to start Google login.");
    }
  };

  return (
    <button type="button" onClick={handleGoogleLogin} className="google-button">
      <img
        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
        alt="Google"
        className="google-icon"
      />
      Sign in with Google
    </button>
  );
}
