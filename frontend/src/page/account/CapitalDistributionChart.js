import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff8042',
  '#8dd1e1', '#a4de6c', '#d0ed57', '#999',
];

const CapitalDistributionChart = ({ investmentSummary }) => {
  // Nếu investmentSummary chưa có (null/undefined), hiển thị loading
  if (!investmentSummary) {
    return <p className="text-muted">Đang tải dữ liệu phân bổ vốn...</p>;
  }

  // Tạo dữ liệu với optional chaining và giá trị mặc định
  const data = [
    { name: 'Vốn đang chờ', value: parseFloat(investmentSummary?.total_pending ?? 0) / 1000000 },
    { name: 'Vốn đã xác nhận', value: parseFloat(investmentSummary?.total_confirmed ?? 0) / 1000000 },
    { name: 'Vốn đang chạy', value: parseFloat(investmentSummary?.total_starting ?? 0) / 1000000 },
    { name: 'Vốn còn lại', value: parseFloat(investmentSummary?.remaining_capital ?? 0) / 1000000 },
  ];

  // Kiểm tra tất cả giá trị có phải bằng 0 không
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
          label
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name) => [`${value.toLocaleString()} triệu`, name]}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CapitalDistributionChart;
