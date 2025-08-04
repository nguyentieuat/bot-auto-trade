import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1', '#a4de6c', '#d0ed57', '#999'];

const CapitalDistributionChart = ({ bots, totalCapital }) => {
  const botData = bots
    .filter(bot => bot.capital > 0)
    .map(bot => ({
      name: bot.name,
      value: bot.capital || 0
    }));

  const totalDistributed = botData.reduce((sum, item) => sum + item.value, 0);
  const remainingCapital = Math.max(totalCapital - totalDistributed, 0);

  const data = [
    ...botData,
    { name: 'Vốn còn lại', value: remainingCapital }
  ];

  if (data.every(item => item.value === 0)) {
    return <p className="text-muted">Chưa có dữ liệu phân bổ vốn.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          fill="#8884d8"
          label
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CapitalDistributionChart;
