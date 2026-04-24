import {
  Bar,
  BarChart,
  Legend,
  Pie,
  PieChart,
  type PieLabelRenderProps,
  type PieSectorShapeProps,
  ResponsiveContainer,
  Sector,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { TodoList } from "../../types/todo";

interface ChartProps {
  lists: TodoList[];
}

interface ColourChartDatum {
  name: string;
  value: number;
  colour: string;
  fill: string;
}

interface CompletionChartDatum {
  name: string;
  value: number;
  fill: string;
}

/**
 * Keeps pie slices coloured with the source list colour instead of the chart theme.
 *
 * @param props - The Recharts sector props for the current pie slice.
 * @returns A sector element using the list colour when available.
 */
function CustomSector(props: PieSectorShapeProps) {
  const payload = props.payload as ColourChartDatum | undefined;

  return <Sector {...props} fill={payload?.colour ?? props.fill} />;
}

/**
 * Positions readable labels outside each pie slice for the colour breakdown chart.
 *
 * @param props - The Recharts label props for the current pie slice.
 * @returns A positioned SVG text label, or `null` when the chart data is incomplete.
 */
function renderCustomLabel(props: PieLabelRenderProps) {
  const { cx, cy, midAngle, outerRadius } = props;
  const chartPayload = props.payload as ColourChartDatum | undefined;

  if (
    cx === undefined ||
    cy === undefined ||
    midAngle === undefined ||
    outerRadius === undefined ||
    !chartPayload
  ) {
    return null;
  }

  const radian = Math.PI / 180;
  const radius = outerRadius + 20;
  const x = cx + radius * Math.cos(-midAngle * radian);
  const y = cy + radius * Math.sin(-midAngle * radian);

  return (
    <text
      x={x}
      y={y}
      fill={chartPayload.colour}
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={14}
    >
      {chartPayload.name}
    </text>
    );
}

/**
 * Treats a list as finished only when it has items and every item is complete.
 *
 * @param list - The todo list being checked for completion.
 * @returns `true` when every item is done and the list is not empty.
 */
function isListFinished(list: TodoList) {
  if (list.items.length === 0) {
    return false;
  }

  return list.items.every((item) => item.done);
}

/**
 * Visualizes list colour distribution and overall completion status for the dashboard.
 *
 * @param lists - The todo lists to summarize in the charts.
 * @returns The analytics widgets shown on the dashboard.
 */
export default function Chart({ lists }: ChartProps) {
  const colourMap: Record<string, string> = {
    "#78909C": "Grey",
    "#AB47BC": "Purple",
    "#5C6BC0": "Blue",
    "#26A69A": "Teal",
    "#4CAF50": "Green",
    "#D98B2B": "Orange",
    "#E05C4D": "Red",
  };

  const data: ColourChartDatum[] = Object.entries(
    lists.reduce<Record<string, number>>((accumulator, list) => {
      const colour = list.colour || "#78909C";
      accumulator[colour] = (accumulator[colour] || 0) + 1;
      return accumulator;
    }, {}),
  ).map(([colour, count]) => ({
    name: colourMap[colour] ?? colour,
    value: count,
    colour,
    fill: colour,
  }));

  if (data.length === 0) {
    return <p>No items to display</p>;
  }

  const completedCount = lists.filter((list) => isListFinished(list)).length;
  const unfinishedCount = lists.length - completedCount;

  const completionData: CompletionChartDatum[] = [
    { name: "Finished", value: completedCount, fill: "#4CAF50" },
    { name: "Unfinished", value: unfinishedCount, fill: "#E05C4D" },
  ];

  return (
    <div className="chart-container">
      <div className="chart-box">
        <h3 className="chart-title">Lists by Colour</h3>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={renderCustomLabel}
              shape={CustomSector}
            />
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="chart-box">
        <h3 className="chart-title">Completion Status</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={completionData}>
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
