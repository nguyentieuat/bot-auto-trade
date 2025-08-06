import React, { useEffect, useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
const backendUrl = process.env.REACT_APP_API_URL;

const DepositHistory = ({ username, reloadTrigger }) => {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const token = localStorage.getItem('token'); // hoặc nơi bạn lưu token
                const res = await axios.get(`${backendUrl}/api/deposit-history/${username}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setHistory(res.data.deposits);
            } catch (err) {
                console.error('Failed to fetch deposit history:', err);
            }
        };

        fetchHistory();
    }, [reloadTrigger]);

    return (
        <div className="mt-4">
            <h4>Lịch sử nạp tiền</h4>
            <table className="table table-striped w-75 mt-3 mx-auto">
                <thead>
                    <tr>
                        <th>Thời gian</th>
                        <th>Số tiền</th>
                        <th>Trạng thái</th>
                        <th>Phương thức</th>
                        <th>Ghi chú</th>
                    </tr>
                </thead>
                <tbody>
                    {history.length === 0 ? (
                        <tr><td colSpan="5">Chưa có giao dịch nào.</td></tr>
                    ) : (
                        history.map((item) => (
                            <tr key={item.id}>
                                <td>{dayjs(item.requested_at).format('HH:mm DD/MM/YYYY')}</td>
                                <td>{Number(item.amount).toLocaleString()} đ</td>
                                <td>
                                    {item.status === 'pending' && <span className="text-warning">⏳ Chờ xác nhận</span>}
                                    {item.status === 'confirmed' && <span className="text-success">✅ Đã nạp</span>}
                                    {item.status === 'failed' && <span className="text-danger">❌ Thất bại</span>}
                                </td>
                                <td>{item.method}</td>
                                <td>{item.note || '-'}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default DepositHistory;
