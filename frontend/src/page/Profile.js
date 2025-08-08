import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GainChart from './bot_chart/GainChart';
import AccountManagement from './account/AccountManagement';
import DashboardInvestSection from './account/DashboardInvestSection';
import Deposit from './payment/Deposit';
import Withdraw from './payment/Withdraw';

const backendUrl = process.env.REACT_APP_API_URL;

const Profile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userBotSubcribedGains, setUserBotSubcribedGains] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  const fetchUserBotSubcribedGains = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${backendUrl}/api/users/${user.username}/subscribed-bots/gains`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Lỗi API: ${res.status}`);
      }

      const data = await res.json();
      setUserBotSubcribedGains(data);
    } catch (err) {
      console.error("Lỗi khi fetch gains:", err);
      setError("Không thể tải dữ liệu lãi/lỗ. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.username) {
      fetchUserBotSubcribedGains();
    }
  }, [user?.username]);

  if (!user) {
    return (
      <div className="text-center text-light py-5">
        <div className="spinner-border text-light" role="status"></div>
        <p className="mt-3">Đang tải thông tin người dùng...</p>
      </div>
    );
  }

  return (
    <div className="d-flex bg-light text-dark min-vh-100">
      {/* Sidebar */}
      <div className="bg-primary p-4" style={{ width: '260px' }}>
        <div className="text-center mb-4">
          <h5>{user.username}</h5>
        </div>
        <ul className="nav flex-column">
          {[
            { key: 'dashboard', label: 'Dashboard' },
            { key: 'account', label: 'Quản Lý Tài Khoản' },
            { key: 'personal', label: 'Thông Tin Cá Nhân' },
            { key: 'deposit', label: 'Nạp tiền' },
            { key: 'withdraw', label: 'Rút tiền' }
          ].map(tab => (
            <li key={tab.key} className="nav-item mb-2">
              <button
                className={`btn w-100 text-start ${activeTab === tab.key ? 'btn-light text-dark' : 'btn-primary'}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 p-4">
        {activeTab === 'dashboard' && (
          <div>
            <h2 className="text-info mb-3">Tăng trưởng bot đăng kí tín hiệu</h2>

            {loading ? (
              <div className="d-flex align-items-center text-muted">
                <div className="spinner-border spinner-border-sm me-2" role="status" />
                Đang tải dữ liệu...
              </div>
            ) : error ? (
              <div className="alert alert-danger">{error}</div>
            ) : userBotSubcribedGains?.length > 0 ? (
              userBotSubcribedGains.map((bot, index) => (
                <div key={index} className="mb-5">
                  <h5 className="text-warning">{bot.name}</h5>
                  <GainChart data={bot.daily_stats} mode={
                    bot.daily_stats.length >= 1000
                      ? 'year'
                      : bot.daily_stats.length >= 100
                        ? 'month'
                        : 'day'
                  } />
                </div>
              ))
            ) : (
              <p className="text-muted">Chưa có bot nào được đăng ký theo dõi.</p>
            )}
          </div>
        )}

        {activeTab === 'personal' && <AccountManagement user={user} />}
        {activeTab === 'account' && <DashboardInvestSection user={user} />}
        {activeTab === 'deposit' && <Deposit user={user} />}
        {activeTab === 'withdraw' && <Withdraw user={user} />}
      </div>
    </div>
  );
};

export default Profile;
