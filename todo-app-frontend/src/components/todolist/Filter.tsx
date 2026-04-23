import { type ChangeEvent, type Dispatch, type SetStateAction, useState } from "react";

import type { DueDateSort, ItemSort, PrioritySort } from "../../types/ui";

interface FilterProps {
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
}

export default function Filter({
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
}: FilterProps) {
  const [showFilter, setShowFilter] = useState(false);

  return (
    <div className="filter-wrapper">
      <button type="button" onClick={() => setShowFilter((prev) => !prev)}>
        {showFilter ? "Hide" : "Show"} Filter
      </button>

      {showFilter && (
        <div className="filter-panel">
          <div className="filter-field">
            <label>
              Colour:
              <select
                value={selectedFilterColour}
                onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                  setSelectedFilterColour(event.target.value)
                }
              >
                <option value="all">All</option>
                <option value="#78909C">Grey</option>
                <option value="#AB47BC">Purple</option>
                <option value="#5C6BC0">Blue</option>
                <option value="#26A69A">Teal</option>
                <option value="#4CAF50">Green</option>
                <option value="#D98B2B">Orange</option>
                <option value="#E05C4D">Red</option>
              </select>
            </label>

            <label>
              Due date sort:
              <select
                value={dueDateSort}
                onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                  setDueDateSort(event.target.value as DueDateSort)
                }
              >
                <option value="none">None</option>
                <option value="earliest">Earliest first</option>
                <option value="latest">Latest first</option>
              </select>
            </label>

            <label>
              Start due date:
              <input
                type="date"
                value={startDueDate}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setStartDueDate(event.target.value)
                }
              />
            </label>

            <label>
              End due date:
              <input
                type="date"
                value={endDueDate}
                onChange={(event: ChangeEvent<HTMLInputElement>) => setEndDueDate(event.target.value)}
              />
            </label>

            <label>
              Priority:
              <select
                value={prioritySort}
                onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                  setPrioritySort(event.target.value as PrioritySort)
                }
              >
                <option value="none">None</option>
                <option value="high-to-low">Highest priority first</option>
                <option value="low-to-high">Lowest priority first</option>
              </select>
            </label>

            <label>
              Items:
              <select
                value={itemSort}
                onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                  setItemSort(event.target.value as ItemSort)
                }
              >
                <option value="none">None</option>
                <option value="most-items">Most items</option>
                <option value="fewest-items">Fewest items</option>
              </select>
            </label>

            <button
              type="button"
              onClick={() => {
                setSelectedFilterColour("all");
                setDueDateSort("none");
                setStartDueDate("");
                setEndDueDate("");
                setPrioritySort("none");
                setItemSort("none");
              }}
            >
              Clear filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
