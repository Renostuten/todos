import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import Login from "../pages/Login";

const setLoginError = vi.fn();

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    loginError: "",
    setLoginError,
  }),
}));

describe("Login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
      "https://dash-internal-todo-d4hxg2epe9esekc2.australiaeast-01.azurewebsites.net//.auth/login/aad"
    );
  });
});