import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import Login from "../components/auth//Login";

describe("Login", () => {
  test("redirects to the backend Google OAuth start endpoint", async () => {
    const assignMock = vi.fn();

    Object.defineProperty(window, "location", {
      value: {
        ...window.location,
        assign: assignMock,
      },
      writable: true,
    });

    render(<Login />);

    await userEvent.click(
      screen.getByRole("button", { name: /sign in with google/i }),
    );

    expect(assignMock).toHaveBeenCalledWith(
      "https://localhost:7144/api/auth/google/start",
    );
  });
});