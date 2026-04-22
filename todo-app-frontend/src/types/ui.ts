import type { Dispatch, SetStateAction } from "react";

import type { TodoList } from "./todo";

export type ActiveFormType = "editList" | "addItem" | null;
export type DueDateSort = "none" | "earliest" | "latest";
export type PrioritySort = "none" | "high-to-low" | "low-to-high";
export type ItemSort = "none" | "most-items" | "fewest-items";

export interface ActiveFormState {
  type: ActiveFormType;
  listId: number | null;
}

export interface TodoFiltersResult {
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  selectedFilterColour: string;
  setSelectedFilterColour: Dispatch<SetStateAction<string>>;
  startDueDate: string;
  setStartDueDate: Dispatch<SetStateAction<string>>;
  endDueDate: string;
  setEndDueDate: Dispatch<SetStateAction<string>>;
  dueDateSort: DueDateSort;
  setDueDateSort: Dispatch<SetStateAction<DueDateSort>>;
  prioritySort: PrioritySort;
  setPrioritySort: Dispatch<SetStateAction<PrioritySort>>;
  itemSort: ItemSort;
  setItemSort: Dispatch<SetStateAction<ItemSort>>;
  filteredLists: TodoList[];
}
