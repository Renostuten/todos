import { useState } from "react";

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
}) {
  const [showFilter, setShowFilter] = useState(false);

  return (
    <div className="filter-wrapper">
      <button onClick={() => setShowFilter(!showFilter)}>
        {showFilter ? "Hide" : "Show"} Filter
      </button>

      {showFilter && (
        <div className="filter-panel">
          <div className="filter-field">
            <label>
              Colour:
              <select
                value={selectedFilterColour}
                onChange={(e) => setSelectedFilterColour(e.target.value)}
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
                onChange={(e) => setDueDateSort(e.target.value)}
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
                onChange={(e) => setStartDueDate(e.target.value)}
              />
            </label>

            <label>
              End due date:
              <input
                type="date"
                value={endDueDate}
                onChange={(e) => setEndDueDate(e.target.value)}
              />
            </label>

            <label>
              Priority:
              <select
                value={prioritySort}
                onChange={(e) => setPrioritySort(e.target.value)}
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
                onChange={(e) => setItemSort(e.target.value)}
              >
                <option value="none">None</option>
                <option value="most-items">Most items</option>
                <option value="fewest-items">Fewest items</option>
              </select>
            </label>

            <button
              type="button"
              onClick={() => {
                setSelectedColour("all");
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