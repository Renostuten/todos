import { afterEach, describe, expect, it, vi } from "vitest";
import Filter from "./Filter";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const setSelectedFilterColour = vi.fn();
const setStartDueDate = vi.fn();
const setEndDueDate = vi.fn();
const setDueDateSort = vi.fn();
const setPrioritySort = vi.fn();
const setItemSort = vi.fn();

function renderFilter() {
  render(
    <Filter
      selectedFilterColour="all"
      setSelectedFilterColour={setSelectedFilterColour}
      startDueDate=""
      setStartDueDate={setStartDueDate}
      endDueDate=""
      setEndDueDate={setEndDueDate}
      dueDateSort="none"
      setDueDateSort={setDueDateSort}
      prioritySort="none"
      setPrioritySort={setPrioritySort}
      itemSort="none"
      setItemSort={setItemSort}
    />
  );
}

describe("Filter", () => {
  it("renders the filter button", () => {
    renderFilter();

    expect(
      screen.getByRole("button", { name: /show filter/i })
    ).toBeInTheDocument();
  });

  it("shows the filter panel when the button is clicked", async () => {
    renderFilter();

    await userEvent.click(screen.getByRole("button", { name: /show filter/i }));

    expect(
      screen.getByRole("combobox", { name: /Colour:/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("combobox", { name: /Due date sort:/i })
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(/Start due date:/i)
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(/End due date:/i)
    ).toBeInTheDocument();

    expect(
      screen.getByRole("combobox", { name: /Priority:/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("combobox", { name: /Items:/i })
    ).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /Clear filters/i })).toBeInTheDocument();
  });

  it("hides the filter panel when hide filter is clicked", async () => {
    renderFilter();

    await userEvent.click(screen.getByRole("button", { name: /show filter/i }));

    expect(screen.getByLabelText(/colour/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /hide filter/i }));

    expect(screen.queryByLabelText(/colour/i)).not.toBeInTheDocument();
  });

  it("updates filter values when controls change", async () => {
    renderFilter();

    await userEvent.click(screen.getByRole("button", { name: /show filter/i }));

    await userEvent.selectOptions(screen.getByLabelText(/colour/i), "#4CAF50");
    expect(setSelectedFilterColour).toHaveBeenCalledWith("#4CAF50");

    await userEvent.selectOptions(screen.getByLabelText(/due date sort/i), "earliest");
    expect(setDueDateSort).toHaveBeenCalledWith("earliest");

    await userEvent.type(screen.getByLabelText(/start due date/i), "2026-05-21");
    expect(setStartDueDate).toHaveBeenCalledWith("2026-05-21");

    await userEvent.type(screen.getByLabelText(/end due date/i), "2026-05-30");
    expect(setEndDueDate).toHaveBeenCalledWith("2026-05-30");

    await userEvent.selectOptions(screen.getByLabelText(/priority/i), "high-to-low");
    expect(setPrioritySort).toHaveBeenCalledWith("high-to-low");

    await userEvent.selectOptions(screen.getByLabelText(/items/i), "most-items");
    expect(setItemSort).toHaveBeenCalledWith("most-items");
  });

  it("clears all filters", async () => {
    renderFilter();

    await userEvent.click(screen.getByRole("button", { name: /show filter/i }));

    await userEvent.click(screen.getByRole("button", { name: /clear filters/i }));

    expect(setSelectedFilterColour).toHaveBeenCalledWith("all");
    expect(setDueDateSort).toHaveBeenCalledWith("none");
    expect(setStartDueDate).toHaveBeenCalledWith("");
    expect(setEndDueDate).toHaveBeenCalledWith("");
    expect(setPrioritySort).toHaveBeenCalledWith("none");
    expect(setItemSort).toHaveBeenCalledWith("none");
  });
});