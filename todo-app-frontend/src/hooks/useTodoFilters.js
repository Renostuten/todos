import { useMemo, useState } from "react";

function getHighestPriority(list) {
  if (!list.items || list.items.length === 0) {
    return 0;
  }

  return Math.max(...list.items.map((item) => item.priority ?? 0));
}

export default function useTodoFilters(lists) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilterColour, setSelectedFilterColour] = useState("all");
  const [startDueDate, setStartDueDate] = useState("");
  const [endDueDate, setEndDueDate] = useState("");
  const [dueDateSort, setDueDateSort] = useState("none");
  const [prioritySort, setPrioritySort] = useState("none");
  const [itemSort, setItemSort] = useState("none");

  const filteredLists = useMemo(() => {
    return [...lists]
      .filter((list) => {
        if (
          searchQuery.trim() !== "" &&
          !list.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
        ) {
          return false;
        }

        if (
          selectedFilterColour !== "all" &&
          list.colour !== selectedFilterColour
        ) {
          return false;
        }

        if (
          startDueDate &&
          (!list.dueDate || new Date(list.dueDate) < new Date(startDueDate))
        ) {
          return false;
        }

        if (
          endDueDate &&
          (!list.dueDate || new Date(list.dueDate) > new Date(endDueDate))
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (dueDateSort === "earliest") {
          const aDate = a.dueDate ? new Date(a.dueDate) : new Date("9999-12-31");
          const bDate = b.dueDate ? new Date(b.dueDate) : new Date("9999-12-31");
          return aDate - bDate;
        }

        if (dueDateSort === "latest") {
          const aDate = a.dueDate ? new Date(a.dueDate) : new Date("0001-01-01");
          const bDate = b.dueDate ? new Date(b.dueDate) : new Date("0001-01-01");
          return bDate - aDate;
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