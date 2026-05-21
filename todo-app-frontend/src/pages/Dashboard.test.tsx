import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import Dashboard from "./Dashboard";
import { AuthStatus, CurrentUser } from "../types/auth";

const mockNavigate = vi.fn();
const mockHandleLogout = vi.fn();
const mockSetLoginError = vi.fn();

type MockAuth = {
  currentUser: CurrentUser | null;
  isCheckingSession: boolean;
  handleLogout: () => Promise<void>;
  loginError: string;
  setLoginError: (value: string) => void;
  authStatus: AuthStatus;
};

let mockAuth: MockAuth = {
  currentUser: {
    userId: "1",
    email: "user@test.com",
    userName: "Test User",
  },
  isCheckingSession: false,
  handleLogout: mockHandleLogout,
  loginError: "",
  setLoginError: mockSetLoginError,
  authStatus: "authenticated",
};

let mockTodos = {
  data: {
    colours: ["red", "blue"],
    lists: [
      {
        id: "list-1",
        title: "Work tasks",
        colour: "red",
        items: [],
      },
      {
        id: "list-2",
        title: "Study tasks",
        colour: "blue",
        items: [],
      },
    ],
  },
  loading: false,
  error: "",
};

let mockFilteredLists = mockTodos.data.lists;

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("../context/AuthContext", () => ({
  useAuth: () => mockAuth,
}));

vi.mock("../context/TodoContext", () => ({
  useTodos: () => mockTodos,
}));

vi.mock("../hooks/useTodoFilters", () => ({
  default: () => ({
    searchQuery: "",
    setSearchQuery: vi.fn(),
    selectedFilterColour: "",
    setSelectedFilterColour: vi.fn(),
    startDueDate: "",
    setStartDueDate: vi.fn(),
    endDueDate: "",
    setEndDueDate: vi.fn(),
    dueDateSort: "",
    setDueDateSort: vi.fn(),
    prioritySort: "",
    setPrioritySort: vi.fn(),
    itemSort: "",
    setItemSort: vi.fn(),
    filteredLists: mockFilteredLists,
  }),
}));

vi.mock("../components/analytics/Chart", () => ({
  default: () => <div>Chart component</div>,
}));

vi.mock("../components/todolist/CreateListForm", () => ({
  default: () => <div>Create list form</div>,
}));

vi.mock("../components/todolist/Filter", () => ({
  default: () => <div>Filter component</div>,
}));

vi.mock("../components/todolist/TodoListCard", () => ({
  default: ({ list }: { list: { title: string } }) => (
    <article>{list.title}</article>
  ),
}));

describe("Dashboard", () => {
  afterEach(() => {
    vi.clearAllMocks();

    mockAuth = {
      currentUser: {
        userId: "1",
        email: "user@test.com",
        userName: "Test User",
      },
      isCheckingSession: false,
      handleLogout: mockHandleLogout,
      loginError: "",
      setLoginError: mockSetLoginError,
      authStatus: "authenticated",
    };

    mockTodos = {
      data: {
        colours: ["red", "blue"],
        lists: [
          {
            id: "list-1",
            title: "Work tasks",
            colour: "red",
            items: [],
          },
          {
            id: "list-2",
            title: "Study tasks",
            colour: "blue",
            items: [],
          },
        ],
      },
      loading: false,
      error: "",
    };

    mockFilteredLists = mockTodos.data.lists;
  });

  it("shows checking message while auth session is being checked", () => {
    mockAuth.isCheckingSession = true;
    mockAuth.authStatus = "checking";

    render(<Dashboard />);

    expect(
      screen.getByText(/checking sign-in status/i)
    ).toBeInTheDocument();
  });

  it("navigates to signup when signup is required", async () => {
    mockAuth.authStatus = "signupRequired";

    render(<Dashboard />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/signup");
    });
  });

  it("navigates to login when unauthenticated", async () => {
    mockAuth.authStatus = "unauthenticated";
    mockAuth.currentUser = null;

    render(<Dashboard />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });

  it("returns null when there is no current user", () => {
    mockAuth.currentUser = null;
    mockAuth.authStatus = "authenticated";

    const { container } = render(<Dashboard />);

    expect(container).toBeEmptyDOMElement();
  });

  it("shows loading message while todo lists are loading", () => {
    mockTodos.loading = true;
    mockTodos.data = null as never;

    render(<Dashboard />);

    expect(
      screen.getByText(/loading your todo lists/i)
    ).toBeInTheDocument();
  });

  it("shows todo loading error", () => {
    mockTodos.error = "Failed to load todo lists.";

    render(<Dashboard />);

    expect(
      screen.getByText(/failed to load todo lists/i)
    ).toBeInTheDocument();
  });

  it("renders dashboard content for authenticated user", () => {
    render(<Dashboard />);

    expect(
      screen.getByRole("heading", { name: /todos/i })
    ).toBeInTheDocument();

    expect(screen.getByText(/signed in as/i)).toBeInTheDocument();
    expect(screen.getByText("user@test.com")).toBeInTheDocument();

    expect(screen.getByText("Chart component")).toBeInTheDocument();
    expect(screen.getByText("Filter component")).toBeInTheDocument();

    expect(screen.getByText("Work tasks")).toBeInTheDocument();
    expect(screen.getByText("Study tasks")).toBeInTheDocument();
  });

  it("shows login error when loginError exists", () => {
    mockAuth.loginError = "Login failed.";

    render(<Dashboard />);

    expect(screen.getByText(/login failed/i)).toBeInTheDocument();
  });

  it("toggles create list form", async () => {
    render(<Dashboard />);

    expect(screen.queryByText(/create list form/i)).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: /show create list form/i })
    );

    expect(screen.getByText(/create list form/i)).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: /hide create list form/i })
    );

    expect(screen.queryByText(/create list form/i)).not.toBeInTheDocument();
  });

  it("calls handleLogout when logout button is clicked", async () => {
    render(<Dashboard />);

    await userEvent.click(
      screen.getByRole("button", { name: /logout/i })
    );

    expect(mockHandleLogout).toHaveBeenCalled();
  });

  it("shows empty list message when there are no todo lists", () => {
    mockTodos.data = {
      colours: ["red", "blue"],
      lists: [],
    };

    mockFilteredLists = [];

    render(<Dashboard />);

    expect(screen.getByText(/no todo lists yet/i)).toBeInTheDocument();
  });

  it("shows no matching lists message when filters remove all lists", () => {
    mockFilteredLists = [];

    render(<Dashboard />);

    expect(screen.getByText(/no matching lists found/i)).toBeInTheDocument();
  });
});