import React, { useEffect, useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
const backendUrl = process.env.REACT_APP_API_URL;

const WithdrawalHistory = ({ username, reloadTrigger  }) => {
    const [withdrawals, setWithdrawals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWithdrawals = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${backendUrl}/api/withdraw-history/${username}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                setWithdrawals(response.data);
            } catch (error) {
                console.error('Failed to fetch withdrawal history:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchWithdrawals();
    }, [reloadTrigger]);

    if (loading) return <p>Đang tải lịch sử rút tiền...</p>;

    if (withdrawals.length === 0) return <p>Bạn chưa có yêu cầu rút tiền nào.</p>;

    return (
        <div className="container mt-4">
            <h3>Lịch sử rút tiền</h3>
            <table className="table table-striped mt-3">
                <thead>
                    <tr>
                        <th>Số tiền</th>
                        <th>Thời gian yêu cầu</th>
                        <th>Thời gian xác nhận</th>
                        <th>Trạng thái</th>
                        <th>Ghi chú</th>
                    </tr>
                </thead>
                <tbody>
                    {withdrawals.map((w) => (
                        <tr key={w.id}>
                            <td>{Number(w.amount).toLocaleString()} đ</td>
                            <td>{dayjs(w.requested_at).format('DD/MM/YYYY HH:mm')}</td>
                            <td>{w.confirmed_at ? dayjs(w.confirmed_at).format('DD/MM/YYYY HH:mm') : '—'}</td>
                            <td>
                                {w.status === 'pending'
                                    ? 'Chờ xử lý'
                                    : w.status === 'confirmed'
                                        ? 'Đã xác nhận'
                                        : 'Thất bại'}
                            </td>
                            <td>{w.note || '—'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default WithdrawalHistory;
