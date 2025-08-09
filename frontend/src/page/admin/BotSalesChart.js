import { useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
    ResponsiveContainer, Legend, LabelList
} from 'recharts';

const backendUrl = process.env.REACT_APP_API_URL;

export default function BotSalesChart() {
    const [data, setData] = useState([]);
    const [totalRevenue, setTotalRevenue] = useState(0);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        fetch(`${backendUrl}/api/admin/analytics/bot-sales`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        })
            .then(res => res.json())
            .then(res => {
                const filtered = (res.rows || [])
                    .filter(item => parseFloat(item.total_revenue) > 0)
                    .map(item => ({
                        ...item,
                        total_revenue: parseFloat(item.total_revenue),
                        subscriptions_count: parseFloat(item.subscriptions_count),
                    }));

                setData(filtered);

                const total = filtered.reduce((sum, bot) => sum + bot.total_revenue, 0);
                setTotalRevenue(total);
            })
            .catch(console.error);
    }, []);

    return (
        <div className="w-full h-[450px]">
            <h2 className="text-xl font-semibold mb-2">Thống kê doanh thu theo bot</h2>
            <p className="text-sm text-gray-600 mb-4">
                Tổng doanh thu: {totalRevenue.toLocaleString('vi-VN')} VND
            </p>
            <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data} barCategoryGap={20}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total_revenue" fill="#8884d8" name="Doanh thu (VND)">
                        <LabelList dataKey="total_revenue" position="top" formatter={(value) => value.toLocaleString('vi-VN')} />
                    </Bar>
                    <Bar dataKey="subscriptions_count" fill="#82ca9d" name="Số lượt đăng ký">
                        <LabelList dataKey="subscriptions_count" position="top" />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
