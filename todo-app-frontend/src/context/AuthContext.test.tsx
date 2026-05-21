import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { AuthProvider, useAuth } from "./AuthContext";
import { getCurrentUser, logoutCurrentUser } from "../services/authApi";

vi.mock("../services/authApi", () => ({
  getCurrentUser: vi.fn(),
  logoutCurrentUser: vi.fn(),
}));

const mockGetCurrentUser = vi.mocked(getCurrentUser);
const mockLogoutCurrentUser = vi.mocked(logoutCurrentUser);

function TestConsumer() {
  const {
    currentUser,
    isCheckingSession,
    isAuthenticated,
    authStatus,
    handleLoginSuccess,
    handleLogout,
  } = useAuth();

  return (
    <div>
      <p>user: {currentUser?.email ?? "none"}</p>
      <p>checking: {String(isCheckingSession)}</p>
      <p>authenticated: {String(isAuthenticated)}</p>
      <p>status: {authStatus}</p>

      <button
        type="button"
        onClick={() =>
          handleLoginSuccess({
            userId: "1",
            email: "user@test.com",
            userName: "Test User",
          })
        }
      >
        login success
      </button>

      <button type="button" onClick={handleLogout}>
        logout
      </button>
    </div>
  );
}

describe("AuthProvider", () => {
  it("restores authenticated user on load", async () => {
    mockGetCurrentUser.mockResolvedValue({
      userId: "1",
      email: "user@test.com",
      userName: "Test User",
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByText("checking: true")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("user: user@test.com")).toBeInTheDocument();
    });

    expect(screen.getByText("checking: false")).toBeInTheDocument();
    expect(screen.getByText("authenticated: true")).toBeInTheDocument();
    expect(screen.getByText("status: authenticated")).toBeInTheDocument();
  });

  it("sets unauthenticated state when restore session fails", async () => {
    mockGetCurrentUser.mockRejectedValue(new Error("Unauthorized"));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("status: unauthenticated")).toBeInTheDocument();
    });

    expect(screen.getByText("user: none")).toBeInTheDocument();
    expect(screen.getByText("checking: false")).toBeInTheDocument();
    expect(screen.getByText("authenticated: false")).toBeInTheDocument();
  });

  it("sets signupRequired when backend says signup is required", async () => {
    mockGetCurrentUser.mockRejectedValue(new Error("signup_required"));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("status: signupRequired")).toBeInTheDocument();
    });
  });

  it("updates auth state after handleLoginSuccess", async () => {
    mockGetCurrentUser.mockRejectedValue(new Error("Unauthorized"));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("status: unauthenticated")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: /login success/i }));

    expect(screen.getByText("user: user@test.com")).toBeInTheDocument();
    expect(screen.getByText("authenticated: true")).toBeInTheDocument();
    expect(screen.getByText("status: authenticated")).toBeInTheDocument();
  });

  it("logs out the current user", async () => {
    mockGetCurrentUser.mockResolvedValue({
      userId: "1",
      email: "user@test.com",
      userName: "Test User",
    });

    mockLogoutCurrentUser.mockResolvedValue(undefined);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("status: authenticated")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: /logout/i }));

    await waitFor(() => {
      expect(screen.getByText("status: unauthenticated")).toBeInTheDocument();
    });

    expect(screen.getByText("user: none")).toBeInTheDocument();
  });

  function InvalidConsumer() {
    useAuth();
    return null;
  }

  it("throws when useAuth is used outside AuthProvider", () => {
    expect(() => render(<InvalidConsumer />)).toThrow(
        "useAuth must be used within AuthProvider"
    );
  });
});