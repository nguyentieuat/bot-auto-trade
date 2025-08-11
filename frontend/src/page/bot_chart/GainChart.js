import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend
} from 'recharts';
import dayjs from 'dayjs';

const COLORS = [
  '#28a745', // green
  '#007bff', // blue
  '#ffc107', // yellow
  '#dc3545', // red
  '#6f42c1', // purple
  '#17a2b8', // cyan
];

const GainChart = ({ data, mode = 'day' }) => {
  debugger
  const groupedMap = new Map();

  data.forEach(item => {
    const date = dayjs(item.date);
    let key, displayKey;

    if (mode === 'year') {
      key = date.format('YYYY');
      displayKey = key;
    } else if (mode === 'month') {
      key = date.format('YYYY-MM');
      displayKey = date.format('MMM YYYY');
    } else {
      key = date.format('YYYY-MM-DD');
      displayKey = date.format('DD/MM/YYYY');
    }

    if (!groupedMap.has(key)) {
      const entry = { displayDate: displayKey };
      Object.keys(item).forEach(k => {
        if (k !== 'date') {
          entry[k] = item[k] || 0;
        }
      });
      groupedMap.set(key, entry);
    } else {
      const existing = groupedMap.get(key);
      Object.keys(item).forEach(k => {
        if (k !== 'date') {
          existing[k] = (existing[k] || 0) + (item[k] || 0);
        }
      });
    }
  });

  const groupedData = Array.from(groupedMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, value]) => value);

  // Lấy tất cả keys cần hiển thị line (trừ displayDate)
  const chartKeys = Object.keys(groupedData[0] || {}).filter(k => k !== 'displayDate');

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={groupedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="displayDate" />
        <YAxis />
        <Tooltip
          formatter={(value, name) => [`${value.toFixed(2)}`, name]}
        />
        <Legend />
        {chartKeys.map((key, index) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            name={key}
            stroke={COLORS[index % COLORS.length]}
            dot={groupedData.length < 100}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default GainChart;
