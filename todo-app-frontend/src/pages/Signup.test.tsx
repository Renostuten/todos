import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import Signup from "./Signup";
import { signupUser } from "../services/authApi";

let mockAuthStatus = "signupRequired";
let mockIsCheckingSession = false;

const mockNavigate = vi.fn();

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    authStatus: mockAuthStatus,
    isCheckingSession: mockIsCheckingSession,
  }),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("../services/authApi", () => ({
  signupUser: vi.fn(),
}));

const mockSignupUser = vi.mocked(signupUser);

describe("Signup", () => {
  afterEach(() => {
    mockAuthStatus = "signupRequired";
    mockIsCheckingSession = false;
  });

  it("shows checking message while session is being checked", () => {
    mockIsCheckingSession = true;

    render(<Signup />);

    expect(
      screen.getByText(/checking signup access/i)
    ).toBeInTheDocument();
  });

  it("redirects to home when signup is not required", async () => {
    mockAuthStatus = "authenticated";

    render(<Signup />);

    expect(
      screen.getByText(/checking signup access/i)
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  it("renders signup form when signup is required", () => {
    render(<Signup />);

    expect(
      screen.getByRole("heading", { name: /complete your signup/i })
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(/username/i)
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /create account/i })
    ).toBeInTheDocument();
  });

  it("shows validation error when username is empty", async () => {
    render(<Signup />);

    await userEvent.click(
      screen.getByRole("button", { name: /create account/i })
    );

    expect(
      screen.getByText(/username is required/i)
    ).toBeInTheDocument();

    expect(mockSignupUser).not.toHaveBeenCalled();
  });

  it("signs up user and redirects home on success", async () => {
    mockSignupUser.mockResolvedValue({
      userId: "1",
      email: "user@test.com",
      userName: "user",
    });

    Object.defineProperty(window, "location", {
      value: {
        href: "",
      },
      writable: true,
    });

    render(<Signup />);

    await userEvent.type(
      screen.getByLabelText(/username/i),
      "user"
    );

    await userEvent.click(
      screen.getByRole("button", { name: /create account/i })
    );

    expect(mockSignupUser).toHaveBeenCalledWith("user");

    await waitFor(() => {
      expect(window.location.href).toBe("/");
    });
  });

  it("shows error when signup fails", async () => {
    mockSignupUser.mockRejectedValue(new Error("Signup failed"));

    render(<Signup />);

    await userEvent.type(
      screen.getByLabelText(/username/i),
      "user"
    );

    await userEvent.click(
      screen.getByRole("button", { name: /create account/i })
    );

    await waitFor(() => {
      expect(
        screen.getByText(/signup failed\. please try again/i)
      ).toBeInTheDocument();
    });

    expect(
      screen.getByRole("button", { name: /create account/i })
    ).not.toBeDisabled();
  });
});