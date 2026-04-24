import { useMemo, useState } from "react";

import type { TodoList } from "../types/todo";
import type { DueDateSort, ItemSort, PrioritySort, TodoFiltersResult } from "../types/ui";

/**
 * Finds the highest item priority in a list so lists can be sorted by urgency.
 *
 * @param list - The todo list whose items are being inspected.
 * @returns The highest priority value found, or `0` when the list has no items.
 */
function getHighestPriority(list: TodoList) {
  if (list.items.length === 0) {
    return 0;
  }

  return Math.max(...list.items.map((item) => item.priority ?? 0));
}

/**
 * Encapsulates dashboard search, filter, and sorting state for todo lists.
 *
 * @param lists - The source todo lists to filter and sort for display.
 * @returns Filter state setters plus the derived list collection for the dashboard.
 */
export default function useTodoFilters(lists: TodoList[]): TodoFiltersResult {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilterColour, setSelectedFilterColour] = useState("all");
  const [startDueDate, setStartDueDate] = useState("");
  const [endDueDate, setEndDueDate] = useState("");
  const [dueDateSort, setDueDateSort] = useState<DueDateSort>("none");
  const [prioritySort, setPrioritySort] = useState<PrioritySort>("none");
  const [itemSort, setItemSort] = useState<ItemSort>("none");

  const filteredLists = useMemo(() => {
    return [...lists]
      .filter((list) => {
        if (
          searchQuery.trim() !== "" &&
          !list.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
        ) {
          return false;
        }

        if (selectedFilterColour !== "all" && list.colour !== selectedFilterColour) {
          return false;
        }

        if (
          startDueDate &&
          (!list.dueDate || new Date(list.dueDate) < new Date(startDueDate))
        ) {
          return false;
        }

        if (endDueDate && (!list.dueDate || new Date(list.dueDate) > new Date(endDueDate))) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (dueDateSort === "earliest") {
          const aDate = a.dueDate
            ? new Date(a.dueDate)
            : new Date("9999-12-31");
          const bDate = b.dueDate
            ? new Date(b.dueDate)
            : new Date("9999-12-31");
          return aDate.getTime() - bDate.getTime();
        }

        if (dueDateSort === "latest") {
          const aDate = a.dueDate
            ? new Date(a.dueDate)
            : new Date("0001-01-01");
          const bDate = b.dueDate
            ? new Date(b.dueDate)
            : new Date("0001-01-01");
          return bDate.getTime() - aDate.getTime();
        }

        if (prioritySort === "high-to-low") {
          return getHighestPriority(b) - getHighestPriority(a);
        }

        if (prioritySort === "low-to-high") {
          return getHighestPriority(a) - getHighestPriority(b);
        }

        if (itemSort === "most-items") {
          return b.items.length - a.items.length;
        }

        if (itemSort === "fewest-items") {
          return a.items.length - b.items.length;
        }

        return 0;
      });
  }, [
    lists,
    searchQuery,
    selectedFilterColour,
    startDueDate,
    endDueDate,
    dueDateSort,
    prioritySort,
    itemSort,
  ]);

  return {
    searchQuery,
    setSearchQuery,
    selectedFilterColour,
    setSelectedFilterColour,
    startDueDate,
    setStartDueDate,
    endDueDate,
    setEndDueDate,
    dueDateSort,
    setDueDateSort,
    prioritySort,
    setPrioritySort,
    itemSort,
    setItemSort,
    filteredLists,
  };
}
