import { Link, useSearchParams } from "react-router-dom";

export default function Errors() {
  const authErrorMessages: Record<string, string> = {
    google_login_failed: "Google sign-in failed. Please try again.",
    external_login_info_missing: "We could not complete your Google sign-in session.",
    missing_google_claims: "Google did not return the required account details.",
    pending_signup_missing: "Your signup session expired. Please sign in again.",
  };

  const [searchParams] = useSearchParams();
  const code = searchParams.get("code") ?? "unknown_error";

  const message =
    authErrorMessages[code] ??
    "Something went wrong while signing you in.";

  return (
    <main className="auth-error-page">
      <section className="auth-error-card">
        <h1>Sign-in failed</h1>
        <p>{message}</p>

        <Link to="/">Return to login</Link>
      </section>
    </main>
  );
}