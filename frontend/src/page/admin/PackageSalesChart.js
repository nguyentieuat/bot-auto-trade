import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const backendUrl = process.env.REACT_APP_API_URL;
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'];

export default function PackageSalesChart() {
    const [data, setData] = useState([]);
    const [totalRevenue, setTotalRevenue] = useState(0);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        fetch(`${backendUrl}/api/admin/analytics/package-sales`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        })
            .then(res => res.json())
            .then(res => {
                const formatted = (res.rows || []).map(item => ({
                    ...item,
                    total_revenue: parseFloat(item.total_revenue),
                    subscriptions_count: parseFloat(item.subscriptions_count),
                }));
                setData(formatted);

                const total = formatted.reduce((sum, pkg) => sum + pkg.total_revenue, 0);
                setTotalRevenue(total);
            })
            .catch(console.error);
    }, []);

    return (
        <div className="w-full h-[450px]">
            <h2 className="text-xl font-semibold mb-2">Doanh thu theo gói</h2>
            <p className="text-sm text-gray-600 mb-4">
                Tổng doanh thu: {totalRevenue.toLocaleString('vi-VN')} VND
            </p>
            <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="total_revenue"
                        nameKey="package_name"
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value) =>
                            `${parseFloat(value).toLocaleString('vi-VN')} VND`
                        }
                    />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
