import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DepositHistory from './DepositHistory';

const backendUrl = process.env.REACT_APP_API_URL;

const Deposit = ({ user, sidebarOpen }) => {
    const [amount, setAmount] = useState('');
    const [bankInfo, setBankInfo] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [reloadTrigger, setReloadTrigger] = useState(0);

    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchBankInfo = async () => {
            try {
                const res = await axios.get(`${backendUrl}/wallet/system-bank-info`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setBankInfo(res.data);
            } catch (err) {
                console.error('Lỗi khi lấy thông tin ngân hàng:', err);
                setErrorMessage('Không thể tải thông tin ngân hàng.');
            }
        };

        fetchBankInfo();
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSuccessMessage('');
        setErrorMessage('');

        if (!amount || Number(amount) <= 0) {
            setErrorMessage('Vui lòng nhập số tiền hợp lệ.');
            setIsSubmitting(false);
            return;
        }

        try {
            await axios.post(`${backendUrl}/deposit/${user.username}`, { amount }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setSuccessMessage('✅ Lệnh nạp tiền đã được gửi thành công. Vui lòng chờ xác nhận.');
            setAmount('');
            setReloadTrigger((prev) => prev + 1);
        } catch (err) {
            console.error('Lỗi khi nạp tiền:', err);
            setErrorMessage('Đã xảy ra lỗi khi gửi lệnh nạp tiền.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container-fluid mt-4" style={{
            marginLeft: sidebarOpen && window.innerWidth >= 768 ? 260 : 0,
            transition: 'margin-left 0.3s ease',
        }}>
            <h2 className="mb-4">💰 Nạp tiền</h2>

            <form onSubmit={handleSubmit} className="mb-3">
                <div className="mb-2 w-50">
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Nhập số tiền muốn nạp"
                        className="form-control"
                        disabled={isSubmitting}
                        min="1000"
                    />
                </div>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Đang xử lý...' : 'Tôi đã chuyển tiền thành công'}
                </button>
            </form>

            {successMessage && <div className="alert alert-success">{successMessage}</div>}
            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

            {bankInfo && (
                <div className="row mt-4">
                    {/* Thông tin tài khoản - chiếm 60% */}
                    <div className="col-12 col-md-7">
                        <div className="bg-light text-dark p-3 rounded shadow h-100">
                            <h5>Thông tin tài khoản hệ thống:</h5>
                            <p><strong>Ngân hàng:</strong> {bankInfo.bank_name}</p>
                            <p><strong>Số tài khoản:</strong> {bankInfo.account_number}</p>
                            <p><strong>Chủ tài khoản:</strong> {bankInfo.account_holder}</p>
                            <p>
                                <strong>Nội dung chuyển khoản:</strong><br />
                                <span className="text-danger">NAPTIEN_{user.username.toUpperCase()}</span>
                            </p>
                        </div>
                    </div>

                    {/* QR Code - chiếm 40% */}
                    {bankInfo.qr_code && (
                        <div className="col-12 col-md-5 d-flex flex-column align-items-center mt-3 mt-md-0">
                            <h6>Mã QR chuyển khoản</h6>
                            <img
                                src={bankInfo.qr_code}
                                alt="QR chuyển khoản"
                                style={{
                                    width: '100%',
                                    maxWidth: '250px',
                                    border: '1px solid #ccc',
                                    borderRadius: '8px'
                                }}
                            />
                        </div>
                    )}
                </div>
            )}

            <DepositHistory username={user.username} reloadTrigger={reloadTrigger} />
        </div>
    );
};

export default Deposit;
