import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginRegister = () => {
    const API_URL = process.env.REACT_APP_API_URL;

    const [isLogin, setIsLogin] = useState(true);
    const [form, setForm] = useState({
        username: '',
        password: '',
        email: '',
        phone: ''
    });
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const validateForm = () => {
        const newErrors = {};
        if (!form.username.trim()) newErrors.username = 'Trường này là bắt buộc.';
        if (!form.password.trim()) newErrors.password = 'Trường này là bắt buộc.';

        if (!isLogin) {
            if (!form.email.trim()) newErrors.email = 'Email là bắt buộc.';
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
                newErrors.email = 'Email không hợp lệ.';

            if (!form.phone.trim()) newErrors.phone = 'Số điện thoại là bắt buộc.';
            else if (!/^[0-9]{9,15}$/.test(form.phone))
                newErrors.phone = 'Số điện thoại không hợp lệ.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

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
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    return (
        <div className="container py-5" style={{ maxWidth: 400 }}>
            <h2 className="text-center text-light mb-4">{isLogin ? 'Đăng nhập' : 'Đăng ký'}</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    className={`form-control mb-2 ${errors.username ? 'is-invalid' : ''}`}
                    placeholder={isLogin ? 'Username / Email / Số điện thoại' : 'Username'}
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                />
                {errors.username && <div className="invalid-feedback d-block">{errors.username}</div>}

                {!isLogin && (
                    <>
                        <input
                            type="email"
                            className={`form-control mb-2 ${errors.email ? 'is-invalid' : ''}`}
                            placeholder="Email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                        />
                        {errors.email && <div className="invalid-feedback d-block">{errors.email}</div>}

                        <input
                            type="tel"
                            className={`form-control mb-2 ${errors.phone ? 'is-invalid' : ''}`}
                            placeholder="Số điện thoại"
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        />
                        {errors.phone && <div className="invalid-feedback d-block">{errors.phone}</div>}
                    </>
                )}

                <input
                    type="password"
                    className={`form-control mb-2 ${errors.password ? 'is-invalid' : ''}`}
                    placeholder="Mật khẩu"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                {errors.password && <div className="invalid-feedback d-block">{errors.password}</div>}

                <button className="btn btn-info w-100 rounded-pill mt-3" type="submit">
                    {isLogin ? 'Đăng nhập' : 'Đăng ký'}
                </button>
            </form>

            <div className="text-center mt-3">
                <button
                    className="btn btn-link text-light"
                    onClick={() => {
                        setIsLogin(!isLogin);
                        setErrors({});
                    }}
                >
                    {isLogin ? 'Chưa có tài khoản? Đăng ký' : 'Đã có tài khoản? Đăng nhập'}
                </button>
            </div>
        </div>
    );
};

export default LoginRegister;
