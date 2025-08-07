import React, { useState, useEffect } from 'react';
const backendUrl = process.env.REACT_APP_API_URL;

const AccountManagement = ({ user }) => {
    const [userProfile, setUserProfile] = useState(null);
    const [userInfo, setUserInfo] = useState(null)
    const [isEditingInfo, setIsEditingInfo] = useState(false);
    const [isEditingPassword, setIsEditingPassword] = useState(false);

    const [bank, setBank] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [telegramID, setTelegramID] = useState("");
    const [address, setAddress] = useState("");

    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const token = localStorage.getItem('token');

    useEffect(() => {
        if (userProfile) {
            setBank(userProfile.bank || "");
            setAccountNumber(userProfile.bank_account || "");
            setTelegramID(userProfile.telegram_id || "");
            setAddress(userProfile.address || "");
        }
    }, [userProfile]);

    useEffect(() => {
        if (!user) return;

        const fetchUserInfo = async () => {
            try {
                const res = await fetch(`${backendUrl}/api/users/${user.username}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) throw new Error("Không thể tải thông tin người dùng.");
                const data = await res.json();
                setUserInfo(data);
            } catch (err) {
                console.error("Lỗi fetchUserInfo:", err);
            }
        };

        const fetchUserProfile = async () => {
            try {
                const res = await fetch(`${backendUrl}/api/users/${user.username}/info`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) throw new Error("Không thể tải profile người dùng.");
                const data = await res.json();
                setUserProfile(data);
            } catch (err) {
                console.error("Lỗi fetchUserProfile:", err);
            }
        };

        fetchUserInfo();
        fetchUserProfile();
    }, [user]);

    const handleSaveInfo = async () => {
        try {
            const res = await fetch(`${backendUrl}/api/users/${user.username}/info`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`, // Gửi token
                },
                body: JSON.stringify({ bank, accountNumber, telegramID, address }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Cập nhật thất bại");

            alert("Cập nhật thông tin thành công!");
            setIsEditingInfo(false);
        } catch (error) {
            alert(`Lỗi: ${error.message}`);
        }
    };

    const handleCancelInfo = () => {
        setIsEditingInfo(false);
        setBank(userProfile.bank || "");
        setAccountNumber(userProfile.accountNumber || "");
    };

    const handleSavePassword = async () => {
        if (newPassword !== confirmPassword) {
            alert("Mật khẩu xác nhận không khớp!");
            return;
        }

        try {
            const res = await fetch(`${backendUrl}/api/users/${user.username}/change-password`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`, // Gửi token
                },
                body: JSON.stringify({ oldPassword, newPassword }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Đổi mật khẩu thất bại");

            alert("Đổi mật khẩu thành công!");
            setIsEditingPassword(false);
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error) {
            alert(`Lỗi: ${error.message}`);
        }
    };

    const handleCancelPassword = () => {
        setIsEditingPassword(false);
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
    };

    return (
        <div>
            <h2 className="mb-4">Quản Lý Tài Khoản</h2>

            {/* Thông tin cơ bản */}
            <div className="card bg-white p-4 text-dark shadow-sm border-0 mb-4">
                <h5 className="mb-4 text-primary text-start w-100">Thông tin cơ bản</h5>
                <div className="row g-4">
                    <div className="col-md-6">
                        <div className="mb-3">
                            <label className="form-label fw-bold text-start w-100">Tên Đăng Nhập</label>
                            <input type="text" className="form-control" value={userInfo?.username} disabled />
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-bold text-start w-100">Email</label>
                            <input type="email" className="form-control" value={
                                userInfo?.email
                                    ? (() => {
                                        const [name, domain] = userInfo.email.split("@");
                                        const maskedName = name.length > 2
                                            ? `${name[0]}***${name[name.length - 1]}`
                                            : `${name[0]}*`;
                                        const maskedDomain = domain.length > 2
                                            ? `${domain[0]}***${domain[domain.length - 1]}`
                                            : `${domain[0]}*`;
                                        return `${maskedName}@${maskedDomain}`;
                                    })()
                                    : ''
                            } disabled />
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-bold text-start w-100">Số Điện Thoại</label>
                            <input type="text" className="form-control" value={userInfo?.phone ? userInfo.phone.replace(/.(?=.{4})/g, "*") : ""} disabled />
                        </div>


                    </div>

                    <div className="col-md-6">
                        <div className="mb-3">
                            <label className="form-label fw-bold text-start w-100">Ngân Hàng</label>
                            <input
                                type="text"
                                className="form-control"
                                value={bank}
                                disabled={!isEditingInfo}
                                onChange={(e) => setBank(e.target.value)}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-bold text-start w-100">STK</label>
                            <input
                                type="text"
                                className="form-control"
                                value={accountNumber}
                                disabled={!isEditingInfo}
                                onChange={(e) => setAccountNumber(e.target.value)}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-bold text-start w-100">Tele ID</label>
                            <input
                                type="text"
                                className="form-control"
                                value={telegramID}
                                disabled={!isEditingInfo}
                                onChange={(e) => setTelegramID(e.target.value)}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-bold text-start w-100">Address</label>
                            <input
                                type="text"
                                className="form-control"
                                value={address}
                                disabled={!isEditingInfo}
                                onChange={(e) => setAddress(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="text-end">
                    {isEditingInfo ? (
                        <div className="d-flex gap-2 mt-4 justify-content-end">
                            <button onClick={handleCancelInfo} className="btn btn-outline-secondary">
                                Hủy
                            </button>
                            <button onClick={handleSaveInfo} className="btn btn-primary">
                                Lưu
                            </button>
                        </div>
                    ) : (
                        <button className="btn btn-outline-primary" onClick={() => setIsEditingInfo(true)}>
                            Chỉnh Sửa
                        </button>
                    )}
                </div>
            </div>

            {/* Đổi mật khẩu */}
            <div className="card bg-white p-4 text-dark shadow-sm border-0 mb-4">
                <h5 className="mb-4 text-primary text-start w-100">Đổi Mật Khẩu</h5>
                <div className="row g-4">
                    <div className="col-md-6">
                        <div className="mb-3">
                            <label className="form-label fw-bold text-start w-100">Mật Khẩu Hiện Tại</label>
                            <input
                                type="password"
                                className="form-control"
                                placeholder="Nhập mật khẩu"
                                value={oldPassword}
                                disabled={!isEditingPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="mb-3">
                            <label className="form-label fw-bold text-start w-100">Mật Khẩu Mới</label>
                            <input
                                type="password"
                                className="form-control mb-2"
                                placeholder="Nhập mật khẩu mới"
                                value={newPassword}
                                disabled={!isEditingPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <input
                                type="password"
                                className="form-control"
                                placeholder="Xác nhận mật khẩu"
                                value={confirmPassword}
                                disabled={!isEditingPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>

                        <div className="text-end">
                            {isEditingPassword ? (
                                <div className="d-flex gap-2 mt-4 justify-content-end">
                                    <button onClick={handleCancelPassword} className="btn btn-outline-secondary">
                                        Hủy
                                    </button>
                                    <button onClick={handleSavePassword} className="btn btn-primary">
                                        Lưu
                                    </button>
                                </div>
                            ) : (
                                <button className="btn btn-outline-primary" onClick={() => setIsEditingPassword(true)}>
                                    Chỉnh Sửa
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountManagement;
