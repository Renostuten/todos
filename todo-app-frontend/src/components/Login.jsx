import React from 'react'

export default function Login({ onLoginError }) {
  const handleGoogleLogin = () => {
    try {
      window.location.href = 'http://localhost:5031/api/auth/google/start'
    } catch (error) {
      console.error(error)
      onLoginError?.('Failed to start Google login.')
    }
  }

  return (
    <button type="button" onClick={handleGoogleLogin} className="google-button">
      <img
        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
        alt="Google"
        className="google-icon"
      />
      Sign in with Google
    </button>
  )
}