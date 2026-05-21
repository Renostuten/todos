import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TodoProvider, useTodos } from "./TodoContext";
import { getTodoLists } from "../services/todoListsApi";
import type { CurrentUser } from "../types/auth";
import type { TodoData } from "../types/todo";

let mockCurrentUser: CurrentUser | null = {
  userId: "1",
  email: "user@test.com",
  userName: "Test User",
};

vi.mock("./AuthContext", () => ({
  useAuth: () => ({
    currentUser: mockCurrentUser,
  }),
}));

vi.mock("../services/todoListsApi", () => ({
  getTodoLists: vi.fn(),
}));

const mockGetTodoLists = vi.mocked(getTodoLists);

const mockTodoData: TodoData = {
  colours: [
    { code: "#4CAF50", name: "Green" },
    { code: "#E05C4D", name: "Red" },
  ],
  priorityLevels: [
    { id: 1, title: "Low" },
    { id: 2, title: "Medium" },
    { id: 3, title: "High" },
  ],
  lists: [
    {
      id: 1,
      title: "Test List",
      colour: "#4CAF50",
      dueDate: null,
      items: [],
    },
  ],
};

function TestConsumer() {
  const { data, loading, error, loadTodos, setData } = useTodos();

  return (
    <div>
      <p>loading: {String(loading)}</p>
      <p>error: {error ?? "none"}</p>
      <p>list count: {data?.lists.length ?? 0}</p>
      <p>first list: {data?.lists[0]?.title ?? "none"}</p>

      <button type="button" onClick={() => void loadTodos()}>
        reload
      </button>

      <button
        type="button"
        onClick={() =>
          setData({
            colours: [],
            priorityLevels: [],
            lists: [],
          })
        }
      >
        clear data
      </button>
    </div>
  );
}

function renderTodoProvider() {
  render(
    <TodoProvider>
      <TestConsumer />
    </TodoProvider>
  );
}

describe("TodoProvider", () => {
  afterEach(() => {
    mockCurrentUser = {
      userId: "1",
      email: "user@test.com",
      userName: "Test User",
    };
  });

  it("loads todo data when a user is authenticated", async () => {
    mockGetTodoLists.mockResolvedValue(mockTodoData);

    renderTodoProvider();

    await waitFor(() => {
      expect(screen.getByText("first list: Test List")).toBeInTheDocument();
    });

    expect(screen.getByText("list count: 1")).toBeInTheDocument();
    expect(screen.getByText("error: none")).toBeInTheDocument();
    expect(mockGetTodoLists).toHaveBeenCalled();
  });

  it("sets error when loading todo data fails with an Error", async () => {
    mockGetTodoLists.mockRejectedValue(new Error("Failed from API"));

    renderTodoProvider();

    await waitFor(() => {
      expect(screen.getByText("error: Failed from API")).toBeInTheDocument();
    });

    expect(screen.getByText("list count: 0")).toBeInTheDocument();
  });

  it("sets fallback error message when thrown value is not an Error", async () => {
    mockGetTodoLists.mockRejectedValue("bad failure");

    renderTodoProvider();

    await waitFor(() => {
      expect(
        screen.getByText("error: Failed to load todo lists")
      ).toBeInTheDocument();
    });
  });

  it("does not load todo data when there is no current user", async () => {
    mockCurrentUser = null;

    renderTodoProvider();

    await waitFor(() => {
      expect(screen.getByText("loading: false")).toBeInTheDocument();
    });

    expect(screen.getByText("list count: 0")).toBeInTheDocument();
    expect(screen.getByText("error: none")).toBeInTheDocument();
    expect(mockGetTodoLists).not.toHaveBeenCalled();
  });

  it("reloads todos when loadTodos is called", async () => {
    mockGetTodoLists.mockResolvedValue(mockTodoData);

    renderTodoProvider();

    await waitFor(() => {
      expect(screen.getByText("first list: Test List")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: /reload/i }));

    expect(mockGetTodoLists).toHaveBeenCalledTimes(2);
  });

  it("exposes setData to consumers", async () => {
    mockGetTodoLists.mockResolvedValue(mockTodoData);

    renderTodoProvider();

    await waitFor(() => {
      expect(screen.getByText("list count: 1")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: /clear data/i }));

    expect(screen.getByText("list count: 0")).toBeInTheDocument();
  });

  it("throws when useTodos is used outside TodoProvider", () => {
    function InvalidConsumer() {
      useTodos();
      return null;
    }

    expect(() => render(<InvalidConsumer />)).toThrow(
      "useTodos must be used within a TodoProvider"
    );
  });
});