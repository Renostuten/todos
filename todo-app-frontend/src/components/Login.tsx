interface LoginProps {
  onLoginError?: (message: string) => void;
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:5031/api";

export default function Login({ onLoginError }: LoginProps) {
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
