import { useEffect } from "react"
import { signInWithGoogle } from "../services/api"

export default function OAuthCallback() {
  useEffect(() => {
    const processLogin = async () => {
      try {
        const hash = window.location.hash.substring(1)
        const params = new URLSearchParams(hash)

        const accessToken = params.get("access_token")
        const returnedState = params.get("state")
        const storedState = sessionStorage.getItem("google_oauth_state")

        if (!accessToken || !returnedState || returnedState !== storedState) {
          window.location.href = "/"
          return
        }

        sessionStorage.removeItem("google_oauth_state")

        const response = await signInWithGoogle(accessToken)

        console.log("Login response:", response)

        if (!response.success) {
          window.location.href = "/"
          return
        }

        window.history.replaceState({}, document.title, "/")

        if (response.needsSignup) {
          window.location.href = "/signup"
          return
        }

        window.location.href = "/"
      } catch (err) {
        console.error(err)
        window.location.href = "/"
      }
    }

    processLogin()
  }, [])

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>Signing you in...</h2>
    </div>
  )
}