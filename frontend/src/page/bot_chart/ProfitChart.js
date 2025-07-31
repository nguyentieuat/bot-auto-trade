import React, { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from 'recharts';
import dayjs from 'dayjs';

const ProfitChart = ({ data }) => {
  const [range, setRange] = useState('3m');

  const filterDataByRange = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [];

    let cumulativeProfit = 0;

    const formattedData = data.map(item => {
      const profit = parseFloat(item.profit || 0);
      cumulativeProfit += profit;
      return {
        date: item.date,
        profit: cumulativeProfit,
      };
    });

    const now = dayjs();
    let startDate;

    switch (range) {
      case '3m':
        startDate = now.subtract(3, 'month');
        break;
      case '6m':
        startDate = now.subtract(6, 'month');
        break;
      case 'ytd':
        startDate = dayjs().startOf('year');
        break;
      case 'all':
      default:
        return formattedData;
    }

    return formattedData.filter(item =>
      dayjs(item.date).isAfter(startDate)
    );
  }, [data, range]);

  return (
    <div className="bg-dark p-3 rounded shadow">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 className="text-light mb-0">📈 Cumulative Profit</h5>
        <select
          className="form-select form-select-sm w-auto bg-secondary text-light border-0"
          value={range}
          onChange={(e) => setRange(e.target.value)}
        >
          <option value="3m">Last 3M</option>
          <option value="6m">Last 6M</option>
          <option value="ytd">YTD</option>
          <option value="all">All</option>
        </select>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={filterDataByRange}>
          <CartesianGrid stroke="#333" />
          <XAxis dataKey="date" tick={{ fill: '#ccc', fontSize: 12 }} />
          <YAxis tick={{ fill: '#ccc', fontSize: 12 }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#222', borderColor: '#888' }}
            labelFormatter={(label) => `Date: ${label}`}
            formatter={(value) => [`$${value.toFixed(2)}`, 'Profit']}
          />
          <Line type="monotone" dataKey="profit" stroke="#00ffcc" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProfitChart;
