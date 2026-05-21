import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import TodoListEditor from "./TodoListEditor";
import type { TodoList } from "../../types/todo";
import type { ActiveFormState } from "../../types/ui";
import { createTodoItem } from "../../services/todoItemsApi";
import { updateTodoLists } from "../../services/todoListsApi";

const mockLoadTodos = vi.fn();

vi.mock("../../context/TodoContext", () => ({
  useTodos: () => ({
    data: {
      colours: [
        { code: "#4CAF50", name: "Green" },
        { code: "#E05C4D", name: "Red" },
      ],
    },
    loadTodos: mockLoadTodos,
  }),
}));

vi.mock("../../services/todoItemsApi", () => ({
  createTodoItem: vi.fn(),
}));

vi.mock("../../services/todoListsApi", () => ({
  updateTodoLists: vi.fn(),
}));

const mockCreateTodoItem = vi.mocked(createTodoItem);
const mockUpdateTodoLists = vi.mocked(updateTodoLists);

const mockList: TodoList = {
  id: 0,
  title: "Test List",
  colour: "#4CAF50",
  dueDate: "2026-12-31T23:59:00",
  items: [],
};

function renderTodoListEditor(
  activeForm: ActiveFormState = { type: null, listId: null },
  setActiveForm = vi.fn()
) {
  render(
    <TodoListEditor
      list={mockList}
      activeForm={activeForm}
      setActiveForm={setActiveForm}
    />
  );

  return { setActiveForm };
}

describe("TodoListEditor", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders update list and add todo buttons", () => {
    renderTodoListEditor();

    expect(
      screen.getByRole("button", { name: /update list/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /add todo/i })
    ).toBeInTheDocument();
  });

  it("starts edit list mode when Update List is clicked", async () => {
    const setActiveForm = vi.fn();

    renderTodoListEditor({ type: null, listId: null }, setActiveForm);

    await userEvent.click(
      screen.getByRole("button", { name: /update list/i })
    );

    expect(setActiveForm).toHaveBeenCalledWith({
      type: "editList",
      listId: mockList.id,
    });
  });

  it("starts add item mode when Add Todo is clicked", async () => {
    const setActiveForm = vi.fn();

    renderTodoListEditor({ type: null, listId: null }, setActiveForm);

    await userEvent.click(
      screen.getByRole("button", { name: /add todo/i })
    );

    expect(setActiveForm).toHaveBeenCalledWith({
      type: "addItem",
      listId: mockList.id,
    });
  });

  it("renders add item form when add item form is active", () => {
    renderTodoListEditor({ type: "addItem", listId: mockList.id });

    expect(
      screen.getByPlaceholderText(/todo title/i)
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /create todo/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /cancel/i })
    ).toBeInTheDocument();
  });

  it("shows alert when creating item with empty title", async () => {
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    renderTodoListEditor({ type: "addItem", listId: mockList.id });

    await userEvent.click(
      screen.getByRole("button", { name: /create todo/i })
    );

    expect(alertSpy).toHaveBeenCalledWith(
      "Please enter a title for the todo item."
    );

    expect(mockCreateTodoItem).not.toHaveBeenCalled();
  });

  it("creates todo item and reloads todos", async () => {
    const setActiveForm = vi.fn();

    mockCreateTodoItem.mockResolvedValue(1);
    mockLoadTodos.mockResolvedValue(undefined);

    renderTodoListEditor(
      { type: "addItem", listId: mockList.id },
      setActiveForm
    );

    await userEvent.type(
      screen.getByPlaceholderText(/todo title/i),
      "New todo item"
    );

    await userEvent.click(
      screen.getByRole("button", { name: /create todo/i })
    );

    await waitFor(() => {
      expect(mockCreateTodoItem).toHaveBeenCalledWith({
        listId: mockList.id,
        title: "New todo item",
      });
    });

    expect(setActiveForm).toHaveBeenCalledWith({
      type: null,
      listId: null,
    });

    expect(mockLoadTodos).toHaveBeenCalled();
  });

  it("cancels add item form", async () => {
    const setActiveForm = vi.fn();

    renderTodoListEditor(
      { type: "addItem", listId: mockList.id },
      setActiveForm
    );

    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(setActiveForm).toHaveBeenCalledWith({
      type: null,
      listId: null,
    });
  });

  it("renders edit list form when edit list form is active", () => {
    renderTodoListEditor({ type: "editList", listId: mockList.id });

    expect(
      screen.getByPlaceholderText(/list title/i)
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /save/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /cancel/i })
    ).toBeInTheDocument();
  });

  it("shows alert when saving list with empty title", async () => {
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    renderTodoListEditor({ type: "editList", listId: mockList.id });

    await userEvent.clear(screen.getByPlaceholderText(/list title/i));

    await userEvent.click(screen.getByRole("button", { name: /save/i }));

    expect(alertSpy).toHaveBeenCalledWith(
      "Please enter a title for the todo list."
    );

    expect(mockUpdateTodoLists).not.toHaveBeenCalled();
  });

  it("updates list and reloads todos", async () => {
    const setActiveForm = vi.fn();

    mockUpdateTodoLists.mockResolvedValue(undefined);
    mockLoadTodos.mockResolvedValue(undefined);

    renderTodoListEditor(
        { type: "editList", listId: mockList.id },
        setActiveForm
    );

    const titleInput = screen.getByPlaceholderText(/list title/i);

    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, "Updated List");

    await userEvent.selectOptions(screen.getByRole("combobox"), "#E05C4D");

    const dueDateInput = document.querySelector(
        'input[type="datetime-local"]'
    ) as HTMLInputElement;

    await userEvent.type(dueDateInput, "2026-12-31T23:59");

    await userEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
        expect(mockUpdateTodoLists).toHaveBeenCalledWith({
        id: mockList.id,
        title: "Updated List",
        colour: "#E05C4D",
        dueDate: "2026-12-31T23:59",
        });
    });

    expect(setActiveForm).toHaveBeenCalledWith({
        type: null,
        listId: null,
    });

    expect(mockLoadTodos).toHaveBeenCalled();
    });

  it("cancels edit list form", async () => {
    const setActiveForm = vi.fn();

    renderTodoListEditor(
      { type: "editList", listId: mockList.id },
      setActiveForm
    );

    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(setActiveForm).toHaveBeenCalledWith({
      type: null,
      listId: null,
    });
  });
});