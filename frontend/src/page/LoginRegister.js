import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import PrivacyPolicyAndTerms from './PrivacyPolicyAndTerms'; // import page

const LoginRegister = () => {
    const API_URL = process.env.REACT_APP_API_URL;
    const navigate = useNavigate();

    const [isLogin, setIsLogin] = useState(true);
    const [form, setForm] = useState({ username: '', password: '', email: '', phone: '', agree: false });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPolicy, setShowPolicy] = useState(false); // modal state

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const newErrors = {};
        const { username, password, email, phone, agree } = form;
        const emailRegexStrict = /^(?!\.)(?!.*\.\.)[a-zA-Z0-9._%+-]+(?<!\.)@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

        if (!username.trim()) newErrors.username = 'Trường này là bắt buộc.';
        if (!password.trim()) newErrors.password = 'Trường này là bắt buộc.';

        if (!isLogin) {
            if (!email.trim()) newErrors.email = 'Email là bắt buộc.';
            else if (!emailRegexStrict.test(email))
                newErrors.email = 'Email không hợp lệ.';

            if (!phone.trim()) newErrors.phone = 'Số điện thoại là bắt buộc.';
            else if (!/^[0-9]{9,15}$/.test(phone))
                newErrors.phone = 'Số điện thoại không hợp lệ.';

            if (!agree) newErrors.agree = 'Bạn cần đồng ý với chính sách để tiếp tục.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        try {
            const url = isLogin ? `${API_URL}/api/login` : `${API_URL}/api/register`;
            const body = isLogin
                ? { account: form.username, password: form.password }
                : { username: form.username, password: form.password, email: form.email, phone: form.phone };

            const res = await axios.post(url, body);

            if (isLogin) {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(res.data.user));
                navigate('/profile');
            } else {
                alert('Đăng ký thành công! Vui lòng đăng nhập.');
                setIsLogin(true);
                setForm({ username: '', password: '', email: '', phone: '', agree: false });
            }
        } catch (err) {
            const message = err.response?.data?.message || 'Có lỗi xảy ra';
            alert(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5" style={{ maxWidth: 400 }}>
            <h2 className="text-center text-light mb-4">{isLogin ? 'Đăng nhập' : 'Đăng ký'}</h2>

            <form onSubmit={handleSubmit}>
                <input
                    name="username"
                    type="text"
                    className={`form-control mb-2 ${errors.username ? 'is-invalid' : ''}`}
                    placeholder={isLogin ? 'Username / Email / SĐT' : 'Username'}
                    value={form.username}
                    onChange={handleChange}
                    disabled={loading}
                />
                {errors.username && <div className="invalid-feedback d-block">{errors.username}</div>}

                {!isLogin && (
                    <>
                        <input
                            name="email"
                            type="email"
                            className={`form-control mb-2 ${errors.email ? 'is-invalid' : ''}`}
                            placeholder="Email"
                            value={form.email}
                            onChange={handleChange}
                            disabled={loading}
                        />
                        {errors.email && <div className="invalid-feedback d-block">{errors.email}</div>}

                        <input
                            name="phone"
                            type="tel"
                            className={`form-control mb-2 ${errors.phone ? 'is-invalid' : ''}`}
                            placeholder="Số điện thoại"
                            value={form.phone}
                            onChange={handleChange}
                            disabled={loading}
                        />
                        {errors.phone && <div className="invalid-feedback d-block">{errors.phone}</div>}
                    </>
                )}

                <input
                    name="password"
                    type="password"
                    className={`form-control mb-2 ${errors.password ? 'is-invalid' : ''}`}
                    placeholder="Mật khẩu"
                    value={form.password}
                    onChange={handleChange}
                    disabled={loading}
                />
                {errors.password && <div className="invalid-feedback d-block">{errors.password}</div>}

                {/* Checkbox Đồng ý Chính sách */}
                {!isLogin && (
                    <div className="form-check mt-2">
                        <input
                            className={`form-check-input ${errors.agree ? 'is-invalid' : ''}`}
                            type="checkbox"
                            id="agree"
                            name="agree"
                            checked={form.agree}
                            onChange={handleChange}
                            disabled={loading}
                        />
                        <label className="form-check-label text-light" htmlFor="agree">
                            Tôi đồng ý với{' '}
                            <button
                                type="button"
                                className="btn btn-link p-0"
                                style={{ color: '#0dcaf0' }}
                                onClick={() => setShowPolicy(true)}
                            >
                                Chính sách & Quyền riêng tư
                            </button>
                        </label>
                        {errors.agree && <div className="invalid-feedback d-block">{errors.agree}</div>}
                    </div>
                )}

                <button
                    className="btn btn-info w-100 rounded-pill mt-3 d-flex justify-content-center align-items-center"
                    type="submit"
                    disabled={loading}
                >
                    {loading && (
                        <span className="spinner-border spinner-border-sm me-2" role="status" />
                    )}
                    {isLogin ? 'Đăng nhập' : 'Đăng ký'}
                </button>
            </form>

            <div className="text-center mt-3">
                <button
                    className="btn btn-link text-light"
                    type="button"
                    disabled={loading}
                    onClick={() => {
                        setIsLogin(!isLogin);
                        setErrors({});
                        setForm({ username: '', password: '', email: '', phone: '', agree: false });
                    }}
                >
                    {isLogin ? 'Chưa có tài khoản? Đăng ký' : 'Đã có tài khoản? Đăng nhập'}
                </button>
            </div>

            {/* Modal Chính sách */}
            {showPolicy && (
                <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Chính sách & Quyền riêng tư</h5>
                                <button type="button" className="btn-close" onClick={() => setShowPolicy(false)}></button>
                            </div>
                            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                                <PrivacyPolicyAndTerms onClose={() => setShowPolicy(false)}/>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowPolicy(false)}>Đóng</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoginRegister;
