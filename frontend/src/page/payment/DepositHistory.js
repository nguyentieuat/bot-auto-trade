import React, { useEffect, useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';

const backendUrl = process.env.REACT_APP_API_URL;

const DepositHistory = ({ username, reloadTrigger }) => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      setHasError(false);

      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${backendUrl}/api/deposit-history/${username}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setHistory(res.data.deposits || []);
      } catch (err) {
        console.error('Failed to fetch deposit history:', err);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (username) fetchHistory();
  }, [reloadTrigger, username]);

  return (
    <div className="mt-5">
      <h4 className="text-primary">📜 Lịch sử nạp tiền</h4>

      {isLoading ? (
        <div className="text-center mt-4">
          <div className="spinner-border text-info" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
          <p className="mt-2">Đang tải dữ liệu...</p>
        </div>
      ) : hasError ? (
        <div className="alert alert-danger mt-3">
          ❌ Không thể tải lịch sử nạp tiền. Vui lòng thử lại sau.
        </div>
      ) : history.length === 0 ? (
        <div className="alert alert-warning mt-3">
          ⚠️ Hiện chưa có giao dịch nạp tiền nào.
        </div>
      ) : (
        <div className="table-responsive mt-3">
          <table className="table table-striped table-hover align-middle text-center">
            <thead className="table-light">
              <tr>
                <th>Thời gian</th>
                <th>Số tiền</th>
                <th>Trạng thái</th>
                <th>Phương thức</th>
                <th>Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id}>
                  <td>{dayjs(item.requested_at).format('HH:mm DD/MM/YYYY')}</td>
                  <td>{Number(item.amount).toLocaleString()} đ</td>
                  <td>
                    {item.status === 'pending' && <span className="badge bg-warning text-dark">⏳ Chờ xác nhận</span>}
                    {item.status === 'confirmed' && <span className="badge bg-success">✅ Đã nạp</span>}
                    {item.status === 'failed' && <span className="badge bg-danger">❌ Thất bại</span>}
                  </td>
                  <td>{item.method || '-'}</td>
                  <td>{item.note || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DepositHistory;
