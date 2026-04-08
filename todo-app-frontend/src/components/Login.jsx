import React, { useRef, useEffect } from 'react'

export default function Login({ onLoginSuccess, onLoginError }) {
  const buttonRef = useRef(null)

  const initializedRef = useRef(false)

  useEffect(() => {
    const initializeGoogle = async () => {
      if (initializedRef.current || !window.google || !buttonRef.current) return

      initializedRef.current = true

      window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: async (response) => {
        try {
          const res = await fetch("http://localhost:5031/api/auth/google", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              credential: response.credential,
            }),
          });

          if (!res.ok) {
            throw new Error("Google login failed");
          }

          const data = await res.json();
          onLoginSuccess?.(data);
        } catch (error) {
            console.error(error)
            onLoginError?.('Google login failed. Please try again.')
          }
        },
      })

      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
      })
    }

    initializeGoogle()
    const intervalId = window.setInterval(() => {
      initializeGoogle()
    }, 250)

    return () => window.clearInterval(intervalId)
  }, [onLoginSuccess, onLoginError])

  return <div ref={buttonRef} />
}