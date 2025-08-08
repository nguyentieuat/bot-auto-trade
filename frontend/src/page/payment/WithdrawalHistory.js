import React, { useEffect, useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';

const backendUrl = process.env.REACT_APP_API_URL;

const WithdrawalHistory = ({ username, reloadTrigger }) => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchWithdrawals = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${backendUrl}/api/withdraw-history/${username}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setWithdrawals(response.data || []);
      } catch (err) {
        setError('Không thể tải lịch sử rút tiền. Vui lòng thử lại sau.');
        console.error('Lỗi khi lấy dữ liệu rút tiền:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWithdrawals();
  }, [reloadTrigger, username]);

  return (
    <div className="container mt-5">
      <h4>📤 Lịch sử rút tiền</h4>

      {loading && <p className="text-muted">Đang tải dữ liệu...</p>}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && withdrawals.length === 0 && (
        <p className="text-muted">Bạn chưa có yêu cầu rút tiền nào.</p>
      )}

      {!loading && !error && withdrawals.length > 0 && (
        <div className="table-responsive">
          <table className="table table-striped table-hover mt-3">
            <thead className="table-light">
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
                  <td>{dayjs(w.requested_at).format('HH:mm - DD/MM/YYYY')}</td>
                  <td>{w.confirmed_at ? dayjs(w.confirmed_at).format('HH:mm - DD/MM/YYYY') : '—'}</td>
                  <td>
                    {w.status === 'pending' && <span className="text-warning">⏳ Chờ xử lý</span>}
                    {w.status === 'confirmed' && <span className="text-success">✅ Đã xác nhận</span>}
                    {w.status === 'failed' && <span className="text-danger">❌ Thất bại</span>}
                  </td>
                  <td>{w.note || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default WithdrawalHistory;
