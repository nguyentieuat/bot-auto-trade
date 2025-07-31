// components/chart/BotGainChart.jsx
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

const BotGainChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="gain" stroke="#00d4ff" name="Lãi trong ngày" />
        <Line type="monotone" dataKey="total_gain" stroke="#82ca9d" name="Tổng lãi" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default BotGainChart;
