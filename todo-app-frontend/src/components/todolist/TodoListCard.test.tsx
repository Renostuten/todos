import { render, screen } from "@testing-library/react";
import { TodoList } from "../../types/todo";
import TodoListCard from "./TodoListCard";
import { describe, expect, it, vi } from "vitest";
import { userEvent } from "@testing-library/user-event/dist/cjs/setup/index.js";
import { deleteTodoLists } from "../../services/todoListsApi";

const mockList: TodoList = {
  id: 1,
  title: "Test List",
  colour: "#4CAF50",
  dueDate: "2026-12-31T23:59",
  items: [],
};

const mockLoadTodos = vi.fn();

vi.mock("../../context/TodoContext", () => ({
  useTodos: () => ({
    loadTodos: mockLoadTodos,
  }),
}));

vi.mock("../../services/todoListsApi", () => ({
  deleteTodoLists: vi.fn(),
}));

const mockDeleteTodoLists = vi.mocked(deleteTodoLists);

vi.mock("../todoitem/TodoItemRow", () => ({
  default: ({ item }: { item: { title: string } }) => (
    <li>{item.title}</li>
  ),
}));
  
vi.mock("./TodoListEditor", () => ({
  default: () => <div>TodoListEditor</div>,
}));

function renderTodoListCard(list: TodoList = mockList) {
  render(<TodoListCard list={list} />);
}

describe("TodoListCard", () => {
  it("renders the empty todo list card", () => {
    renderTodoListCard();

    expect(screen.getByText("Test List")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /x/i })).toBeInTheDocument();
    expect(screen.getByText(/0%/i)).toBeInTheDocument();
    expect(screen.getByText(/Due:\s*31\/12\/2026/i)).toBeInTheDocument();
    expect(screen.getByText(/no todo items in this list/i)).toBeInTheDocument();
  });

  it("renders todo items when list has items", () => {
    renderTodoListCard({
      ...mockList,
      items: [
        { id: 1, listId: 1, title: "Item 1", done: false, priority: 0, note: null },
        { id: 2, listId: 1, title: "Item 2", done: true, priority: 2, note: null },
      ],
    });

    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
    expect(screen.queryByText(/no todo items/i)).not.toBeInTheDocument();
  });

  it("displays the correct completion percentage", () => {
    renderTodoListCard({
      ...mockList,
      items: [
        { id: 1, listId: 1, title: "Item 1", done: false, priority: 0, note: null },
        { id: 2, listId: 1, title: "Item 2", done: true, priority: 2, note: null },
      ],
    });

    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("does not show due date when list has no due date", () => {
    renderTodoListCard({
      ...mockList,
      dueDate: null,
    });

    expect(screen.queryByText(/due:/i)).not.toBeInTheDocument();
  });

  it("does not delete list when user cancels confirmation", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);

    renderTodoListCard();

    await userEvent.click(screen.getByRole("button", { name: /x/i }));

    expect(mockDeleteTodoLists).not.toHaveBeenCalled();
    expect(mockLoadTodos).not.toHaveBeenCalled();
  });

  it("deletes list and reloads todos when user confirms", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    mockDeleteTodoLists.mockResolvedValue(undefined);
    mockLoadTodos.mockResolvedValue(undefined);

    renderTodoListCard();

    await userEvent.click(screen.getByRole("button", { name: /x/i }));

    expect(mockDeleteTodoLists).toHaveBeenCalledWith(mockList.id);
    expect(mockLoadTodos).toHaveBeenCalled();
  });
});
  