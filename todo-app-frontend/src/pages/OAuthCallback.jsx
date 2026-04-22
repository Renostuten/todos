import { useEffect } from "react"
import { signInWithGoogle } from "../services/api"

export default function OAuthCallback() {
  console.log("OAuth callback page loaded")
  useEffect(() => {
    const processLogin = async () => {
      try {
        const hash = window.location.hash.substring(1)
        const params = new URLSearchParams(hash)

        const accessToken = params.get("access_token")
        const returnedState = params.get("state")
        const storedState = sessionStorage.getItem("google_oauth_state")

        if (!accessToken || !returnedState || returnedState !== storedState) {
          console.log("1")
          window.location.href = "/"
          return
        }

        sessionStorage.removeItem("google_oauth_state")

        console.log("Access Token:", accessToken)

        const response = await signInWithGoogle(accessToken)

        console.log("API Response:", response)

        if (!response.success) {
          console.log("2")
          window.location.href = "/"
          return
        }

        window.history.replaceState({}, document.title, "/")

        window.location.href = "/"
      } catch (err) {
        console.log("3")
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