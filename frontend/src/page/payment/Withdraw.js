import React, { useState } from 'react';
import axios from 'axios';
import WithdrawalHistory from './WithdrawalHistory';

const backendUrl = process.env.REACT_APP_API_URL;

const Withdraw = ({ user }) => {
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusCode, setStatusCode] = useState(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${backendUrl}/api/withdraw/${user.username}`,
        { amount: parseFloat(amount) },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(res.data.message || '✅ Yêu cầu rút tiền đã được gửi. Vui lòng chờ phê duyệt.');
      setStatusCode(res.status);
      setAmount('');
      setReloadTrigger((prev) => prev + 1);
    } catch (err) {
      const errorMsg = err.response?.data?.message || '❌ Có lỗi xảy ra trong quá trình rút tiền.';
      setStatusCode(err.response?.status || 500);
      setMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="container mt-5">
        <div className="card shadow-sm p-4">
          <h3 className="mb-3 text-warning">
            🏦 Yêu cầu rút tiền
          </h3>

          <form onSubmit={handleWithdraw}>
            <div className="mb-3">
              <label htmlFor="amount" className="form-label fw-medium">
                Nhập số tiền muốn rút:
              </label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Ví dụ: 100000"
                className="form-control"
                min={0}
                disabled={loading}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-warning w-100"
              disabled={loading || !amount}
            >
              {loading ? 'Đang xử lý...' : 'Gửi yêu cầu rút tiền'}
            </button>
          </form>

          {message && (
            <div
              className={`alert mt-3 ${statusCode >= 400 ? 'alert-danger' : 'alert-success'}`}
              role="alert"
            >
              {message}
            </div>
          )}
        </div>
      </div>

      <WithdrawalHistory username={user.username} reloadTrigger={reloadTrigger} />
    </>
  );
};

export default Withdraw;
