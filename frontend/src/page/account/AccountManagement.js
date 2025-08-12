import React, { useState, useEffect } from 'react';

const backendUrl = process.env.REACT_APP_API_URL;

const AccountManagement = ({ user, sidebarOpen }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  const [formData, setFormData] = useState({
    bank: '',
    accountNumber: '',
    address: '',
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (userProfile) {
      setFormData({
        bank: userProfile.bank || '',
        accountNumber: userProfile.bank_account || '',
        address: userProfile.address || '',
      });
    }
  }, [userProfile]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const [infoRes, profileRes] = await Promise.all([
          fetch(`${backendUrl}/users/${user.username}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${backendUrl}/users/${user.username}/info`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!infoRes.ok || !profileRes.ok) throw new Error('Lỗi khi tải dữ liệu.');

        const [infoData, profileData] = await Promise.all([
          infoRes.json(),
          profileRes.json(),
        ]);

        setUserInfo(infoData);
        setUserProfile(profileData);
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu:', err);
        alert('Không thể tải dữ liệu người dùng.');
      }
    };

    fetchData();
  }, [user]);

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePasswordChange = (e) => {
    setPasswordData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSaveInfo = async () => {
    try {
      const res = await fetch(`${backendUrl}/users/${user.username}/info`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Cập nhật thất bại');

      alert('Cập nhật thông tin thành công!');
      setIsEditingInfo(false);
      setUserProfile((prev) => ({ ...prev, ...formData }));
    } catch (error) {
      alert(`Lỗi: ${error.message}`);
    }
  };

  const handleCancelInfo = () => {
    if (userProfile) {
      setFormData({
        bank: userProfile.bank || '',
        accountNumber: userProfile.bank_account || '',
        address: userProfile.address || '',
      });
    }
    setIsEditingInfo(false);
  };

  const handleSavePassword = async () => {
    const { oldPassword, newPassword, confirmPassword } = passwordData;
    if (newPassword !== confirmPassword) {
      return alert('Mật khẩu xác nhận không khớp!');
    }

    try {
      const res = await fetch(`${backendUrl}/users/${user.username}/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Đổi mật khẩu thất bại');

      alert('Đổi mật khẩu thành công!');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setIsEditingPassword(false);
    } catch (error) {
      alert(`Lỗi: ${error.message}`);
    }
  };

  const handleCancelPassword = () => {
    setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    setIsEditingPassword(false);
  };

  const maskEmail = (email) => {
    if (!email) return '';
    const [name, domain] = email.split('@');
    const maskedName = name.length > 2 ? `${name[0]}***${name.slice(-1)}` : `${name[0]}*`;
    const maskedDomain = domain.length > 2 ? `${domain[0]}***${domain.slice(-1)}` : `${domain[0]}*`;
    return `${maskedName}@${maskedDomain}`;
  };

  const maskPhone = (phone) => {
    return phone ? phone.replace(/.(?=.{4})/g, '*') : '';
  };

  return (
    <div className="container-fluid mt-4" style={{
      marginLeft: sidebarOpen && window.innerWidth >= 768 ? 260 : 0,
      transition: 'margin-left 0.3s ease',
    }}>
      <h2 className="mb-4">Quản Lý Tài Khoản</h2>

      {/* Thông tin cơ bản */}
      <div className="card bg-white p-4 text-dark shadow-sm border-0 mb-4">
        <h5 className="mb-4 text-primary">Thông tin cơ bản</h5>
        <div className="row g-4">
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label fw-bold">Tên Đăng Nhập</label>
              <input type="text" className="form-control" value={userInfo?.username ?? ''} disabled />
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Email</label>
              <input type="email" className="form-control" value={maskEmail(userInfo?.email)} disabled />
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Số Điện Thoại</label>
              <input type="text" className="form-control" value={maskPhone(userInfo?.phone)} disabled />
            </div>
          </div>

          <div className="col-md-6">
            {['bank', 'accountNumber', 'address'].map((field, idx) => (
              <div className="mb-3" key={field}>
                <label className="form-label fw-bold">
                  {{
                    bank: 'Ngân Hàng',
                    accountNumber: 'STK',
                    address: 'Địa chỉ',
                  }[field]}
                </label>
                <input
                  type="text"
                  className="form-control"
                  name={field}
                  value={formData[field] ?? ''}
                  disabled={!isEditingInfo}
                  onChange={handleInputChange}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="text-end">
          {isEditingInfo ? (
            <div className="d-flex gap-2 justify-content-end">
              <button className="btn btn-outline-secondary" onClick={handleCancelInfo}>Hủy</button>
              <button className="btn btn-primary" onClick={handleSaveInfo}>Lưu</button>
            </div>
          ) : (
            <button className="btn btn-outline-primary" onClick={() => setIsEditingInfo(true)}>Chỉnh Sửa</button>
          )}
        </div>
      </div>

      {/* Đổi mật khẩu */}
      <div className="card bg-white p-4 text-dark shadow-sm border-0 mb-4">
        <h5 className="mb-4 text-primary">Đổi Mật Khẩu</h5>
        <div className="row g-4">
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label fw-bold">Mật Khẩu Hiện Tại</label>
              <input
                type="password"
                className="form-control"
                name="oldPassword"
                placeholder="Nhập mật khẩu"
                value={passwordData.oldPassword}
                disabled={!isEditingPassword}
                onChange={handlePasswordChange}
              />
            </div>
          </div>

          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label fw-bold">Mật Khẩu Mới</label>
              <input
                type="password"
                className="form-control mb-2"
                name="newPassword"
                placeholder="Nhập mật khẩu mới"
                value={passwordData.newPassword}
                disabled={!isEditingPassword}
                onChange={handlePasswordChange}
              />
              <input
                type="password"
                className="form-control"
                name="confirmPassword"
                placeholder="Xác nhận mật khẩu"
                value={passwordData.confirmPassword}
                disabled={!isEditingPassword}
                onChange={handlePasswordChange}
              />
            </div>

            <div className="text-end">
              {isEditingPassword ? (
                <div className="d-flex gap-2 justify-content-end">
                  <button className="btn btn-outline-secondary" onClick={handleCancelPassword}>Hủy</button>
                  <button className="btn btn-primary" onClick={handleSavePassword}>Lưu</button>
                </div>
              ) : (
                <button className="btn btn-outline-primary" onClick={() => setIsEditingPassword(true)}>Chỉnh Sửa</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountManagement;
