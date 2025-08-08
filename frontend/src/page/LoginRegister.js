import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginRegister = () => {
    const API_URL = process.env.REACT_APP_API_URL;
    const navigate = useNavigate();

    const [isLogin, setIsLogin] = useState(true);
    const [form, setForm] = useState({ username: '', password: '', email: '', phone: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: '' })); // clear error while typing
    };

    const validateForm = () => {
        const newErrors = {};
        const { username, password, email, phone } = form;

        if (!username.trim()) newErrors.username = 'Trường này là bắt buộc.';
        if (!password.trim()) newErrors.password = 'Trường này là bắt buộc.';

        if (!isLogin) {
            if (!email.trim()) newErrors.email = 'Email là bắt buộc.';
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
                newErrors.email = 'Email không hợp lệ.';

            if (!phone.trim()) newErrors.phone = 'Số điện thoại là bắt buộc.';
            else if (!/^[0-9]{9,15}$/.test(phone))
                newErrors.phone = 'Số điện thoại không hợp lệ.';
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
                : form;

            const res = await axios.post(url, body);

            if (isLogin) {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(res.data.user));
                navigate('/profile');
            } else {
                alert('Đăng ký thành công! Vui lòng đăng nhập.');
                setIsLogin(true);
                setForm({ username: '', password: '', email: '', phone: '' });
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
                        setForm({ username: '', password: '', email: '', phone: '' });
                    }}
                >
                    {isLogin ? 'Chưa có tài khoản? Đăng ký' : 'Đã có tài khoản? Đăng nhập'}
                </button>
            </div>
        </div>
    );
};

export default LoginRegister;
