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
            const res = await axios.post(`${backendUrl}/api/withdraw/${user.username}`, { amount }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            setMessage(res.data.message || 'Yêu cầu rút tiền đã được gửi. Vui lòng chờ quản trị viên phê duyệt.');
            setStatusCode(res.status);
            setAmount(''); 
            setReloadTrigger(prev => prev + 1);
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Đã xảy ra lỗi trong quá trình rút tiền.';
            setStatusCode(err.response?.status || 500);
            setMessage(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="container mt-4">
                <h2>🏦 Withdraw</h2>
                <form onSubmit={handleWithdraw} className="mb-3">
                    <input
                        type="number"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        placeholder="Enter amount to withdraw"
                        className="form-control mb-2"
                    />
                    <button type="submit" className="btn btn-warning" disabled={loading}>
                        {loading ? 'Processing...' : 'Request Withdraw'}
                    </button>
                </form>
                {message && (
                    <div className={`alert ${statusCode >= 400 ? 'alert-danger' : 'alert-success'}`}>
                        {message}
                    </div>
                )}
            </div>
            <WithdrawalHistory username={user.username} reloadTrigger={reloadTrigger}/>
        </>
    );
};

export default Withdraw;
