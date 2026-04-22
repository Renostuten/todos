import React from 'react'

// implicit grant login flow
export default function Login({ onLoginError }) {
  const generateState = () => {
    const bytes = new Uint8Array(32)
    window.crypto.getRandomValues(bytes)

    return btoa(String.fromCharCode(...bytes))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "")
  }

  const handleGoogleLogin = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    const redirectUri = "http://localhost:5173/oauth/callback"
    const state = generateState()

    sessionStorage.setItem("google_oauth_state", state)

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "token",
      scope: "openid email",
      state: state,
    })

    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
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