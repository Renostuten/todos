import { PieChart, Pie, Sector, Tooltip, Legend, ResponsiveContainer, XAxis, YAxis, BarChart, Bar } from "recharts";

function CustomSector(props) {
  return <Sector {...props} fill={props.payload.colour} />;
}

function renderCustomLabel(props) {
  const { cx, cy, midAngle, outerRadius, payload } = props;

  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 20;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill={payload.colour}
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={14}
    >
      {payload.name}
    </text>
  );
}

function isListFinished(list) {
  if (!list.items || list.items.length === 0) {
    return false;
  }

  return list.items.every((item) => item.done);
}

export default function Chart({ lists }) {
  const colourMap = {
    '#78909C': 'Grey',
    '#AB47BC': 'Purple',
    '#5C6BC0': 'Blue',
    '#26A69A': 'Teal',
    '#4CAF50': 'Green',
    '#D98B2B': 'Orange',
    '#E05C4D': 'Red',
  };

  const data = Object.entries(
    lists.reduce((acc, list) => {
      const colour = list.colour
      acc[colour] = (acc[colour] || 0) + 1;
      return acc;
    }, {})
  ).map(([colour, count]) => ({ name: colourMap[colour], value: count, colour: colour, fill: colour }));

  if (data.length === 0) {
    return <p>No items to display</p>;
  }

  const completedCount = lists.filter((list) => isListFinished(list)).length;
  const unfinishedCount = lists.length - completedCount;

  const completionData = [
    { name: "Finished", value: completedCount, fill: "#4CAF50" },
    { name: "Unfinished", value: unfinishedCount, fill: "#E05C4D" },
  ];

  return (
    <div className="chart-container">
      <div className="chart-box">
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
            >
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="chart-box">
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