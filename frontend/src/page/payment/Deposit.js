import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DepositHistory from './DepositHistory';

const backendUrl = process.env.REACT_APP_API_URL;

const Deposit = ({ user }) => {
    const [amount, setAmount] = useState('');
    const [bankInfo, setBankInfo] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [reloadTrigger, setReloadTrigger] = useState(0);

    const token = localStorage.getItem("token");
    
    useEffect(() => {
        axios.get(`${backendUrl}/api/wallet/system-bank-info`, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        })
            .then(res => setBankInfo(res.data))
            .catch(err => console.error(err));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSuccessMessage('');
        try {
            await axios.post(`${backendUrl}/api/deposit/${user.username}`, { amount }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            setSuccessMessage('✅ Lệnh nạp tiền đã được gửi thành công. Vui lòng chờ xác nhận.');
            setAmount('');
            setReloadTrigger(prev => prev + 1);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div className="container mt-4">
                <h2>💰 Nạp tiền</h2>

                <form onSubmit={handleSubmit} className="mb-3">
                    <input
                        type="number"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        placeholder="Nhập số tiền muốn nạp"
                        className="form-control mb-2 w-50"
                        disabled={isSubmitting}
                    />
                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Đang xử lý...' : 'Tôi đã chuyển tiền thành công'}
                    </button>
                </form>

                {/* Thông báo thành công */}
                {successMessage && (
                    <div className="alert alert-success mt-2">
                        {successMessage}
                    </div>
                )}

                {/* Luôn hiển thị thông tin tài khoản nếu có */}
                {bankInfo && (
                    <div className="d-flex gap-4 align-items-start mt-4">
                        <div className="bg-light text-dark p-3 rounded shadow w-50">
                            <h5>Thông tin tài khoản hệ thống:</h5>
                            <p><strong>Ngân hàng:</strong> {bankInfo.bank_name}</p>
                            <p><strong>Số tài khoản:</strong> {bankInfo.account_number}</p>
                            <p><strong>Chủ tài khoản:</strong> {bankInfo.account_holder}</p>
                            <p><strong>Nội dung chuyển khoản:</strong> <br />
                                <span className="text-danger">NAPTIEN_{user.username.toUpperCase()}</span>
                            </p>
                        </div>

                        {bankInfo.qr_code && (
                            <div>
                                <h6>Mã QR chuyển khoản</h6>
                                <img
                                    src={bankInfo.qr_code}
                                    alt="QR chuyển khoản"
                                    style={{ width: '200px', border: '1px solid #ccc', borderRadius: '8px' }}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>

            <DepositHistory username={user.username} reloadTrigger={reloadTrigger}/>
        </>
    );
};

export default Deposit;
