import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BotGainChart from './bot_chart/BotGainChart';


const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const localUser = localStorage.getItem('user');
    if (!localUser) {
      navigate('/login-register');
      return;
    }

    const parsedUser = JSON.parse(localUser);

    // Mock data cho từng bot
    const mockChartData = [
      { date: '2025-07-01', gain: 100000, total_gain: 100000 },
      { date: '2025-07-02', gain: -20000, total_gain: 80000 },
      { date: '2025-07-03', gain: 50000, total_gain: 130000 },
      { date: '2025-07-04', gain: 0, total_gain: 130000 },
      { date: '2025-07-05', gain: -30000, total_gain: 100000 },
    ];

    // Gán cho mỗi bot dữ liệu mô phỏng
    const bots = ['Bot A', 'Bot B', 'Bot C'].map((name) => ({
      name,
      data: mockChartData,
    }));

    setUser({
      ...parsedUser,
      email: 'user@example.com',
      phone: '0987654321',
      capital: '100,000,000 VND',
      profit: '25,000,000 VND',
      bots,
    });
  }, [navigate]);

  if (!user) return <div className="text-center text-light">Đang tải thông tin...</div>;

  return (
    <div className="container text-light py-5">
      <h2 className="mb-4">Trang cá nhân</h2>
      <div className="card bg-dark p-4 text-white mb-4">
        <p><strong>Username:</strong> {user.username}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Số điện thoại:</strong> {user.phone}</p>
        <hr />
        <p><strong>Tổng vốn đầu tư:</strong> {user.capital}</p>
        <p><strong>Tổng lợi nhuận:</strong> {user.profit}</p>
      </div>

      <h4 className="text-info mb-3">Biểu đồ tổng lãi/lỗ</h4>
      <BotGainChart data={user.bots[0].data} /> {/* Giả sử lấy dữ liệu tổng từ bot đầu tiên */}

      <hr className="my-4" />

      {user.bots.map((bot, index) => (
        <div key={index} className="mb-5">
          <h5 className="text-warning">{bot.name}</h5>
          <BotGainChart data={bot.data} />
        </div>
      ))}
    </div>
  );
};

export default Profile;
