import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BotGainChart from './bot_chart/BotGainChart';
import AccountManagement from './account/AccountManagement';
import DashboardInvestSection from './account/DashboardInvestSection';

const Profile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const localUser = localStorage.getItem('user');
    if (!localUser) {
      navigate('/login-register');
      return;
    }

    const parsedUser = JSON.parse(localUser);

    const mockChartData = [
      { date: '2025-07-01', gain: 100000, total_gain: 100000 },
      { date: '2025-07-02', gain: -20000, total_gain: 80000 },
      { date: '2025-07-03', gain: 50000, total_gain: 130000 },
      { date: '2025-07-04', gain: 0, total_gain: 130000 },
      { date: '2025-07-05', gain: -30000, total_gain: 100000 },
    ];

    const bots = ['Bot A', 'Bot B', 'Bot C', 'Bot D', 'Bot E'].map((name, i) => ({
      name,
      data: mockChartData,
      capital: 10_000_000 + i * 5_000_000, // số thực để biểu đồ xử lý
    }));

    const mockInvestmentHistory = [
      { botName: 'Bot A', amount: 10_000_000, startDate: '2025-07-01', status: 'Đang chạy' },
      { botName: 'Bot B', amount: 15_000_000, startDate: '2025-07-02', status: 'Đang chạy' },
      { botName: 'Bot C', amount: 20_000_000, startDate: '2025-07-03', status: 'Tạm dừng' },
    ];

    setUser({
      ...parsedUser,
      capital: 100_000_000, 
      profit: '25,000,000 VND',
      bots,
      investmentHistory: mockInvestmentHistory,
    });
  }, [navigate]);

  if (!user) return <div className="text-center text-light">Đang tải thông tin...</div>;

  return (
    <div className="d-flex bg-light text-dark min-vh-100">
      {/* Sidebar */}
      <div className="bg-primary p-4" style={{ width: '260px' }}>
        <div className="text-center mb-4">
          {/* <img src="/path-to-avatar.png" alt="Avatar" className="rounded-circle mb-2" width="80" /> */}
          <h5>{user.username}</h5>
        </div>
        <ul className="nav flex-column">
          <li className="nav-item mb-2">
            <button className={`btn w-100 text-start ${activeTab === 'dashboard' ? 'btn-light text-dark' : 'btn-primary'}`} onClick={() => setActiveTab('dashboard')}>
              Dashboard
            </button>
          </li>
          <li className="nav-item mb-2">
            <button className={`btn w-100 text-start ${activeTab === 'account' ? 'btn-light text-dark' : 'btn-primary'}`} onClick={() => setActiveTab('account')}>
              Quản Lý Tài Khoản
            </button>
          </li>
          <li className="nav-item mb-2">
            <button className={`btn w-100 text-start ${activeTab === 'personal' ? 'btn-light text-dark' : 'btn-primary'}`} onClick={() => setActiveTab('personal')}>
              Thông Tin Cá Nhân
            </button>
          </li>
          {/* Thêm các tab khác tương tự */}
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 p-4">
        {activeTab === 'dashboard' && (
          <div>
            <h2 className="mb-4">Dashboard Tổng Quan</h2>

            <h4 className="text-info mb-3">Biểu đồ tổng lãi/lỗ</h4>
            <BotGainChart data={user.bots[0].data} />

            <hr className="my-4" />

            {user.bots.map((bot, index) => (
              <div key={index} className="mb-5">
                <h5 className="text-warning">{bot.name}</h5>
                <BotGainChart data={bot.data} />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'personal' && <AccountManagement user={user} />}

        {activeTab === 'account' && <DashboardInvestSection
          user={user}
          totalCapital={user.capital}
          investmentHistory={user.investmentHistory}
          onInvest={(data) => {
            alert(`Đã đặt lệnh: ${data.botName} - ${data.amount.toLocaleString()} đ`);
            // Thêm cập nhật thực tế nếu cần
          }}
        />}

      </div>
    </div>
  );
};

export default Profile;
