import { renderHook, act } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import useTodoFilters from "./useTodoFilters";
import type { TodoList } from "../types/todo";

const lists: TodoList[] = [
  {
    id: 1,
    title: "Study database",
    colour: "#4CAF50",
    dueDate: "2026-05-20T10:00",
    items: [
      { id: 1, listId: 1, title: "SQL", done: false, priority: 2, note: null },
    ],
  },
  {
    id: 2,
    title: "Work task",
    colour: "#E05C4D",
    dueDate: "2026-05-25T10:00",
    items: [
      { id: 2, listId: 2, title: "Report", done: false, priority: 1, note: null },
      { id: 3, listId: 2, title: "Email", done: false, priority: 0, note: null },
    ],
  },
];

describe("useTodoFilters", () => {
  it("returns all lists by default", () => {
    const { result } = renderHook(() => useTodoFilters(lists));

    expect(result.current.filteredLists).toHaveLength(2);
  });

  it("filters lists by search query", () => {
    const { result } = renderHook(() => useTodoFilters(lists));

    act(() => {
      result.current.setSearchQuery("database");
    });

    expect(result.current.filteredLists).toHaveLength(1);
    expect(result.current.filteredLists[0]!.title).toBe("Study database");
  });

  it("filters lists by colour", () => {
    const { result } = renderHook(() => useTodoFilters(lists));

    act(() => {
      result.current.setSelectedFilterColour("#E05C4D");
    });

    expect(result.current.filteredLists).toHaveLength(1);
    expect(result.current.filteredLists[0]!.title).toBe("Work task");
  });

  it("sorts lists by most items", () => {
    const { result } = renderHook(() => useTodoFilters(lists));

    act(() => {
      result.current.setItemSort("most-items");
    });

    expect(result.current.filteredLists[0]!.title).toBe("Work task");
    expect(result.current.filteredLists[1]!.title).toBe("Study database");
  });

  it("filters lists by start due date", () => {
    const { result } = renderHook(() => useTodoFilters(lists));

    act(() => {
      result.current.setStartDueDate("2026-05-22T00:00");
    });

    expect(result.current.filteredLists).toHaveLength(1);
    expect(result.current.filteredLists[0]!.title).toBe("Work task");
  });

  it("filters lists by end due date", () => {
    const { result } = renderHook(() => useTodoFilters(lists));

    act(() => {
      result.current.setEndDueDate("2026-05-22T00:00");
    });

    expect(result.current.filteredLists).toHaveLength(1);
    expect(result.current.filteredLists[0]!.title).toBe("Study database");
  });

  it("sorts lists by earliest due date", () => {
    const { result } = renderHook(() => useTodoFilters(lists));

    act(() => {
      result.current.setDueDateSort("earliest");
    });

    expect(result.current.filteredLists[0]!.title).toBe("Study database");
    expect(result.current.filteredLists[1]!.title).toBe("Work task");
  });

  it("sorts lists by latest due date", () => {
    const { result } = renderHook(() => useTodoFilters(lists));

    act(() => {
      result.current.setDueDateSort("latest");
    });

    expect(result.current.filteredLists[0]!.title).toBe("Work task");
    expect(result.current.filteredLists[1]!.title).toBe("Study database");
  });

  it("sorts lists by highest priority first", () => {
    const { result } = renderHook(() => useTodoFilters(lists));

    act(() => {
      result.current.setPrioritySort("high-to-low");
    });

    expect(result.current.filteredLists[0]!.title).toBe("Study database");
    expect(result.current.filteredLists[1]!.title).toBe("Work task");
  });

  it("sorts lists by lowest priority first", () => {
    const { result } = renderHook(() => useTodoFilters(lists));

    act(() => {
      result.current.setPrioritySort("low-to-high");
    });

    expect(result.current.filteredLists[0]!.title).toBe("Work task");
    expect(result.current.filteredLists[1]!.title).toBe("Study database");
  });

  it("sorts lists by fewest items", () => {
    const { result } = renderHook(() => useTodoFilters(lists));

    act(() => {
      result.current.setItemSort("fewest-items");
    });

    expect(result.current.filteredLists[0]!.title).toBe("Study database");
    expect(result.current.filteredLists[1]!.title).toBe("Work task");
  });

  it("handles lists with no due date and no items when sorting", () => {
    const listsWithEmpty: TodoList[] = [
      ...lists,
      {
        id: 3,
        title: "Empty list",
        colour: "#4CAF50",
        dueDate: null,
        items: [],
      },
    ];

    const { result } = renderHook(() => useTodoFilters(listsWithEmpty));

    act(() => {
      result.current.setDueDateSort("earliest");
      result.current.setPrioritySort("high-to-low");
    });

    expect(result.current.filteredLists).toHaveLength(3);
  });
});