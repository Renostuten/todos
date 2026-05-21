import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import Login from "./Login";

const setLoginError = vi.fn();

let mockLoginError: string = "";

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    loginError: mockLoginError,
    setLoginError,
  }),
}));

describe("Login", () => {
  afterEach(() => {
    mockLoginError = "";
  });

  it("renders login page correctly", () => {
    render(<Login />);
    expect(screen.getByRole("heading", { name: /sign in to continue/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in with microsoft/i })).toBeInTheDocument();
  });

  it("redirects to Microsoft Easy Auth login", async () => {
    const assign = vi.fn();

    Object.defineProperty(window, "location", {
      value: {
        assign,
      },
      writable: true,
    });

    render(<Login />);

    await userEvent.click(
      screen.getByRole("button", { name: /sign in with microsoft/i })
    );

    expect(assign).toHaveBeenCalledWith(
      "https://dash-internal-todo-d4hxg2epe9esekc2.australiaeast-01.azurewebsites.net/.auth/login/aad"
    );
  });

  it("handles login errors gracefully", async () => {
    mockLoginError = "Failed to start Microsoft login";

    render(<Login />);

    expect(screen.getByText(/failed to start microsoft login/i)).toBeInTheDocument();
  });

  it("sets login error when redirect fails", async () => {
    const assign = vi.fn(() => {
      throw new Error("Redirect failed");
    });

    Object.defineProperty(window, "location", {
      value: { assign },
      writable: true,
    });

    render(<Login />);

    await userEvent.click(
      screen.getByRole("button", { name: /sign in with microsoft/i })
    );

    expect(setLoginError).toHaveBeenCalledWith(
      "Failed to start Microsoft login."
    );
  });
});