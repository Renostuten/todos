import { type ChangeEvent, type FormEvent, useState } from "react";

import { signupUser } from "../services/authApi";

export default function Signup() {
  const [userName, setUserName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!userName.trim()) {
      setError("Username is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      await signupUser(userName);
      window.location.href = "/";
    } catch (caughtError: unknown) {
      console.error(caughtError);
      setError("Signup failed. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="signup-page">
      <h1>Complete your signup</h1>
      <form
        onSubmit={(event) => {
          void handleSubmit(event);
        }}
        className="google-signup-form"
      >
        <div className="signup-input-group">
          <label htmlFor="userName">Username:</label>
          <input
            id="userName"
            type="text"
            value={userName}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setUserName(event.target.value)}
          />
        </div>

        {error && <p>{error}</p>}

        <button type="submit" disabled={isSubmitting} className="google-signup-btn">
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>
    </div>
  );
}
