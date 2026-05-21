import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import TodoItemRow from "./TodoItemRow";
import type { TodoItem } from "../../types/todo";
import {
  deleteTodoItem,
  toggleTodoItem,
  updateTodoItem,
  updateTodoItemDetails,
} from "../../services/todoItemsApi";

const mockLoadTodos = vi.fn();

vi.mock("../../context/TodoContext", () => ({
  useTodos: () => ({
    data: {
      priorityLevels: [
        { id: 0, title: "Low" },
        { id: 1, title: "Medium" },
        { id: 2, title: "High" },
      ],
    },
    loadTodos: mockLoadTodos,
  }),
}));

vi.mock("../../services/todoItemsApi", () => ({
  deleteTodoItem: vi.fn(),
  toggleTodoItem: vi.fn(),
  updateTodoItem: vi.fn(),
  updateTodoItemDetails: vi.fn(),
}));

const mockDeleteTodoItem = vi.mocked(deleteTodoItem);
const mockToggleTodoItem = vi.mocked(toggleTodoItem);
const mockUpdateTodoItem = vi.mocked(updateTodoItem);
const mockUpdateTodoItemDetails = vi.mocked(updateTodoItemDetails);

const mockItem: TodoItem = {
  id: 1,
  listId: 10,
  title: "Test todo item",
  done: false,
  priority: 2,
  note: "Test note",
};

function renderTodoItemRow(item: TodoItem = mockItem) {
  render(<TodoItemRow item={item} />);
}

describe("TodoItemRow", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders todo item details", () => {
    renderTodoItemRow();

    expect(screen.getByText(/☐ test todo item/i)).toBeInTheDocument();
    expect(screen.getByText(/priority: high/i)).toBeInTheDocument();
    expect(screen.getByText(/note: test note/i)).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /edit/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /details/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /delete/i })
    ).toBeInTheDocument();
  });

  it("renders completed item with checked icon", () => {
    renderTodoItemRow({
      ...mockItem,
      done: true,
    });

    expect(screen.getByText(/☑ test todo item/i)).toBeInTheDocument();
  });

  it("renders unknown priority when priority is missing from metadata", () => {
    renderTodoItemRow({
      ...mockItem,
      priority: 99,
    });

    expect(screen.getByText(/priority: unknown/i)).toBeInTheDocument();
  });

  it("does not render note when item has no note", () => {
    renderTodoItemRow({
      ...mockItem,
      note: null,
    });

    expect(screen.queryByText(/note:/i)).not.toBeInTheDocument();
  });

  it("toggles todo item completion when title is clicked", async () => {
    mockToggleTodoItem.mockResolvedValue(undefined);
    mockLoadTodos.mockResolvedValue(undefined);

    renderTodoItemRow();

    await userEvent.click(screen.getByText(/test todo item/i));

    expect(mockToggleTodoItem).toHaveBeenCalledWith({
      id: mockItem.id,
      listId: mockItem.listId,
      done: true,
    });

    expect(mockLoadTodos).toHaveBeenCalled();
  });

  it("opens edit item form when Edit is clicked", async () => {
    renderTodoItemRow();

    await userEvent.click(screen.getByRole("button", { name: /edit/i }));

    expect(screen.getByPlaceholderText(/item title/i)).toHaveValue(
      "Test todo item"
    );

    expect(screen.getByLabelText(/done/i)).not.toBeChecked();

    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("shows alert when saving item with empty title", async () => {
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    renderTodoItemRow();

    await userEvent.click(screen.getByRole("button", { name: /edit/i }));

    await userEvent.clear(screen.getByPlaceholderText(/item title/i));

    await userEvent.click(screen.getByRole("button", { name: /save/i }));

    expect(alertSpy).toHaveBeenCalledWith(
      "Please enter a title for the todo item."
    );

    expect(mockUpdateTodoItem).not.toHaveBeenCalled();
  });

  it("updates todo item and reloads todos", async () => {
    mockUpdateTodoItem.mockResolvedValue(undefined);
    mockLoadTodos.mockResolvedValue(undefined);

    renderTodoItemRow();

    await userEvent.click(screen.getByRole("button", { name: /edit/i }));

    const titleInput = screen.getByPlaceholderText(/item title/i);

    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, "Updated todo item");

    await userEvent.click(screen.getByLabelText(/done/i));

    await userEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(mockUpdateTodoItem).toHaveBeenCalledWith({
        id: mockItem.id,
        listId: mockItem.listId,
        title: "Updated todo item",
        done: true,
      });
    });

    expect(mockLoadTodos).toHaveBeenCalled();
  });

  it("cancels edit item form", async () => {
    renderTodoItemRow();

    await userEvent.click(screen.getByRole("button", { name: /edit/i }));

    expect(screen.getByPlaceholderText(/item title/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(screen.queryByPlaceholderText(/item title/i)).not.toBeInTheDocument();
  });

  it("does not delete item when confirmation is cancelled", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);

    renderTodoItemRow();

    await userEvent.click(screen.getByRole("button", { name: /delete/i }));

    expect(mockDeleteTodoItem).not.toHaveBeenCalled();
    expect(mockLoadTodos).not.toHaveBeenCalled();
  });

  it("deletes item and reloads todos when confirmation is accepted", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);

    mockDeleteTodoItem.mockResolvedValue(undefined);
    mockLoadTodos.mockResolvedValue(undefined);

    renderTodoItemRow();

    await userEvent.click(screen.getByRole("button", { name: /delete/i }));

    expect(mockDeleteTodoItem).toHaveBeenCalledWith(mockItem.id);
    expect(mockLoadTodos).toHaveBeenCalled();
  });

  it("opens details form when Details is clicked", async () => {
    renderTodoItemRow();

    await userEvent.click(screen.getByRole("button", { name: /details/i }));

    expect(screen.getByLabelText(/priority/i)).toHaveValue("2");
    expect(screen.getByPlaceholderText(/optional note/i)).toHaveValue(
      "Test note"
    );
  });

  it("updates item details and reloads todos", async () => {
    mockUpdateTodoItemDetails.mockResolvedValue(undefined);
    mockLoadTodos.mockResolvedValue(undefined);

    renderTodoItemRow();

    await userEvent.click(screen.getByRole("button", { name: /details/i }));

    await userEvent.selectOptions(screen.getByLabelText(/priority/i), "1");

    const noteInput = screen.getByPlaceholderText(/optional note/i);

    await userEvent.clear(noteInput);
    await userEvent.type(noteInput, "Updated note");

    await userEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(mockUpdateTodoItemDetails).toHaveBeenCalledWith({
        id: mockItem.id,
        listId: mockItem.listId,
        priority: 1,
        note: "Updated note",
      });
    });

    expect(mockLoadTodos).toHaveBeenCalled();
  });

  it("cancels details form", async () => {
    renderTodoItemRow();

    await userEvent.click(screen.getByRole("button", { name: /details/i }));

    expect(screen.getByPlaceholderText(/optional note/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(
      screen.queryByPlaceholderText(/optional note/i)
    ).not.toBeInTheDocument();
  });
});