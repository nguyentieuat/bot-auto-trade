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
  const [activeTab, setActiveTab] = useState("dashboard");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);

  const [userBotSubcribedGains, setUserBotSubcribedGains] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  const fetchUserBotSubcribedGains = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${backendUrl}/users/${user.username}/subscribed-bots/gains`, {
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



  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (windowWidth >= 768) {
      setSidebarOpen(true);
    } else {
      setSidebarOpen(false);
    }
  }, [windowWidth]);

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
      {/* Nút Hamburger cho mobile */}
      {!sidebarOpen && (
        <button
          className="btn btn-primary d-md-none position-fixed"
          style={{
            top: 80,
            left: 0,
            zIndex: 1100,
            borderTopRightRadius: '8px',
            borderBottomRightRadius: '8px',
            padding: '0.25rem 0.5rem',
            width: '36px',
            height: '36px',
          }}
          onClick={() => setSidebarOpen(true)}
          aria-label="Mở menu"
        >
          <i className="bi bi-arrow-right-short" style={{ fontSize: '1.5rem', lineHeight: 1 }}></i>
        </button>
      )}
      {/* Sidebar */}
      <div
        className="bg-primary text-white p-4 d-flex flex-column position-fixed d-md-block"
        style={{
          width: 260,
          zIndex: 1020,          // thấp hơn Nav (1030)
          transition: "left 0.3s ease",
          left: sidebarOpen ? 0 : -260,
          top: '60px',           // cách Nav xuống 56px
          bottom: 0,
        }}
      >
        {/* Nút đóng sidebar trên mobile */}
        <button
          className="btn btn-light d-md-none mb-3 align-self-end"
          onClick={() => setSidebarOpen(false)}
          aria-label="Đóng menu"
        >
          &times;
        </button>

        <div className="text-center mb-4">
          <h5>{user?.username}</h5>
        </div>

        <ul className="nav flex-column">
          {[
            { key: "dashboard", label: "Dashboard" },
            { key: "account", label: "Quản Lý Tài Khoản" },
            { key: "personal", label: "Thông Tin Cá Nhân" },
            { key: "deposit", label: "Nạp tiền" },
            { key: "withdraw", label: "Rút tiền" },
          ].map((tab) => (
            <li key={tab.key} className="nav-item mb-2">
              <button
                className={`btn w-100 text-start ${activeTab === tab.key
                  ? "btn-light text-dark"
                  : "btn-primary text-white"
                  }`}
                onClick={() => {
                  setActiveTab(tab.key);
                  if (window.innerWidth < 768) {
                    setSidebarOpen(false);
                  }
                }}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Overlay nền tối khi sidebar mở trên mobile */}
      {/* {sidebarOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-md-none"
          style={{ zIndex: 1098 }}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )} */}

      {/* Main content */}


      {activeTab === 'dashboard' && (
        <div
          className="flex-grow-1 p-4"
          style={{
            marginLeft:
              window.innerWidth >= 768 ? 260 : (sidebarOpen ? 260 : 0)
          }}
        >
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

        </div>)}

      {activeTab === 'personal' && <AccountManagement user={user} sidebarOpen={sidebarOpen} />}
      {activeTab === 'account' && <DashboardInvestSection user={user} sidebarOpen={sidebarOpen} />}
      {activeTab === 'deposit' && <Deposit user={user} sidebarOpen={sidebarOpen} />}
      {activeTab === 'withdraw' && <Withdraw user={user} sidebarOpen={sidebarOpen} />}
    </div>
  );
};

export default Profile;
