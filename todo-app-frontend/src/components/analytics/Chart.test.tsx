import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Chart from "./Chart";
import type { TodoList } from "../../types/todo";

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: ({
    data,
    label,
    shape,
  }: {
    data: Array<{ name: string; value: number; colour: string; fill: string }>;
    label?: (props: unknown) => React.ReactNode;
    shape?: (props: unknown) => React.ReactNode;
  }) => (
    <div data-testid="pie">
      {data.map((entry) => (
        <div key={entry.name}>
          {entry.name}: {entry.value}
        </div>
      ))}

      <div data-testid="custom-label">
        {label?.({
          cx: 100,
          cy: 100,
          midAngle: 0,
          outerRadius: 50,
          payload: data[0],
        })}
      </div>

      <div data-testid="custom-sector">
        {shape?.({
          payload: data[0],
          fill: "fallback-fill",
        })}
      </div>
    </div>
  ),
  BarChart: ({
    children,
    data,
  }: {
    children: React.ReactNode;
    data: Array<{ name: string; value: number }>;
  }) => (
    <div data-testid="bar-chart">
      {data.map((entry) => (
        <div key={entry.name}>
          {entry.name}: {entry.value}
        </div>
      ))}
      {children}
    </div>
  ),
  Bar: () => <div data-testid="bar" />,
  Legend: () => <div data-testid="legend" />,
  Tooltip: () => <div data-testid="tooltip" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  Sector: () => <div data-testid="sector" />,
}));

const lists: TodoList[] = [
  {
    id: 1,
    title: "Finished list",
    colour: "#4CAF50",
    dueDate: null,
    items: [
      {
        id: 1,
        listId: 1,
        title: "Done item",
        done: true,
        priority: 0,
        note: null,
      },
    ],
  },
  {
    id: 2,
    title: "Unfinished list",
    colour: "#E05C4D",
    dueDate: null,
    items: [
      {
        id: 2,
        listId: 2,
        title: "Incomplete item",
        done: false,
        priority: 1,
        note: null,
      },
    ],
  },
  {
    id: 3,
    title: "Empty list",
    colour: "#4CAF50",
    dueDate: null,
    items: [],
  },
];

describe("Chart", () => {
  it("shows empty state when there are no lists", () => {
    render(<Chart lists={[]} />);

    expect(screen.getByText(/no items to display/i)).toBeInTheDocument();
  });

  it("renders chart titles when lists exist", () => {
    render(<Chart lists={lists} />);

    expect(screen.getByText(/lists by colour/i)).toBeInTheDocument();
    expect(screen.getByText(/completion status/i)).toBeInTheDocument();
  });

  it("groups lists by colour", () => {
    render(<Chart lists={lists} />);

    expect(screen.getByText("Green: 2")).toBeInTheDocument();
    expect(screen.getByText("Red: 1")).toBeInTheDocument();
  });

  it("counts finished and unfinished lists", () => {
    render(<Chart lists={lists} />);

    expect(screen.getByText("Finished: 1")).toBeInTheDocument();
    expect(screen.getByText("Unfinished: 2")).toBeInTheDocument();
  });

  it("uses raw colour value when colour is not in colour map", () => {
    render(
      <Chart
        lists={[
          {
            id: 1,
            title: "Custom colour list",
            colour: "#123456",
            dueDate: null,
            items: [],
          },
        ]}
      />
    );

    expect(screen.getByText("#123456: 1")).toBeInTheDocument();
  });

  it("renders custom pie label and sector", () => {
    render(<Chart lists={lists} />);

    expect(screen.getByText("Green")).toBeInTheDocument();
    expect(screen.getByTestId("custom-sector")).toBeInTheDocument();
  });

  it("treats empty lists as unfinished", () => {
    render(
      <Chart
        lists={[
          {
            id: 1,
            title: "Empty",
            colour: "#4CAF50",
            dueDate: null,
            items: [],
          },
        ]}
      />
    );

    expect(screen.getByText("Finished: 0")).toBeInTheDocument();
    expect(screen.getByText("Unfinished: 1")).toBeInTheDocument();
  });

  it("counts only lists where every item is done as finished", () => {
    render(<Chart lists={lists} />);

    expect(screen.getByText("Finished: 1")).toBeInTheDocument();
    expect(screen.getByText("Unfinished: 2")).toBeInTheDocument();
  });

  it("uses grey when list colour is empty", () => {
    render(
      <Chart
        lists={[
          {
            id: 1,
            title: "No colour",
            colour: "",
            dueDate: null,
            items: [],
          },
        ]}
      />
    );

    expect(screen.getByText("Grey: 1")).toBeInTheDocument();
  });
});