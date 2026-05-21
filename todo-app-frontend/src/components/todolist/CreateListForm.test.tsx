import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import CreateListForm from "./CreateListForm";
import { createTodoLists } from "../../services/todoListsApi";

const mockLoadTodos = vi.fn();
const mockSetShowCreateListForm = vi.fn();

vi.mock("../../context/TodoContext", () => ({
  useTodos: () => ({
    loadTodos: mockLoadTodos,
  }),
}));

vi.mock("../../services/todoListsApi", () => ({
  createTodoLists: vi.fn(),
}));

const mockCreateTodoLists = vi.mocked(createTodoLists);

const colours = [
  { code: "#ff0000", name: "Red" },
  { code: "#0000ff", name: "Blue" },
];

function renderCreateListForm() {
  render(
    <CreateListForm
      colours={colours}
      setShowCreateListForm={mockSetShowCreateListForm}
    />
  );
}

describe("CreateListForm", () => {
  it("renders the create list form", () => {
    renderCreateListForm();

    expect(
      screen.getByRole("heading", { name: /create new todo list/i })
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(/list title/i)
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /create list/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /cancel/i })
    ).toBeInTheDocument();
  });

  it("shows alert when title is empty", async () => {
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    renderCreateListForm();

    await userEvent.click(
      screen.getByRole("button", { name: /create list/i })
    );

    expect(alertSpy).toHaveBeenCalledWith(
      "Please enter a title for the todo list."
    );

    expect(mockCreateTodoLists).not.toHaveBeenCalled();
    expect(mockLoadTodos).not.toHaveBeenCalled();
    expect(mockSetShowCreateListForm).not.toHaveBeenCalled();
  });

  it("creates a todo list with title, colour, and due date", async () => {
    mockCreateTodoLists.mockResolvedValue(1);
    mockLoadTodos.mockResolvedValue(undefined);

    renderCreateListForm();

    await userEvent.type(
      screen.getByPlaceholderText(/list title/i),
      "My new list"
    );

    await userEvent.selectOptions(
      screen.getByRole("combobox"),
      "#0000ff"
    );

    const dueDateInput = screen.getByDisplayValue("");

    await userEvent.type(dueDateInput, "2026-05-21T10:30");

    await userEvent.click(
      screen.getByRole("button", { name: /create list/i })
    );

    await waitFor(() => {
      expect(mockCreateTodoLists).toHaveBeenCalledWith({
        title: "My new list",
        colour: "#0000ff",
        dueDate: "2026-05-21T10:30",
      });
    });

    expect(mockSetShowCreateListForm).toHaveBeenCalledWith(false);
    expect(mockLoadTodos).toHaveBeenCalled();
  });

  it("trims the title before creating the todo list", async () => {
    mockCreateTodoLists.mockResolvedValue(1);
    mockLoadTodos.mockResolvedValue(undefined);

    renderCreateListForm();

    await userEvent.type(
      screen.getByPlaceholderText(/list title/i),
      "   Trimmed title   "
    );

    await userEvent.click(
      screen.getByRole("button", { name: /create list/i })
    );

    await waitFor(() => {
      expect(mockCreateTodoLists).toHaveBeenCalledWith({
        title: "Trimmed title",
        colour: "#ff0000",
        dueDate: null,
      });
    });
  });

  it("closes the form when cancel is clicked", async () => {
    renderCreateListForm();

    await userEvent.click(
      screen.getByRole("button", { name: /cancel/i })
    );

    expect(mockSetShowCreateListForm).toHaveBeenCalledWith(false);
  });

  it("does not close the form or reload todos when creation fails", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    mockCreateTodoLists.mockRejectedValue(new Error("Create failed"));

    renderCreateListForm();

    await userEvent.type(
      screen.getByPlaceholderText(/list title/i),
      "Failed list"
    );

    await userEvent.click(
      screen.getByRole("button", { name: /create list/i })
    );

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    expect(mockSetShowCreateListForm).not.toHaveBeenCalled();
    expect(mockLoadTodos).not.toHaveBeenCalled();
  });
});