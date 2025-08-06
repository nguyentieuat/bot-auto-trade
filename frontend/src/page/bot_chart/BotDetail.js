import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import BotChart from './BotChart';
import BacktestStatsCard from './BacktestStatsCard';
import { calculateBacktestStats, calculateRecentStats } from '../../services/backTestStatsService';
import axios from 'axios';

const backendUrl = process.env.REACT_APP_API_URL;

const timeOptions = [
  { label: '3M', amount: 3, unit: 'month' },
  { label: '6M', amount: 6, unit: 'month' },
  { label: 'YTD', labelKey: 'YTD' },
  { label: 'All', labelKey: 'All' }
];

const BotDetail = ({ bot, onBack }) => {
  const [timeFilter, setTimeFilter] = useState('All');
  const [isPremiumSubscribed, setIsPremiumSubscribed] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [channelLinkFree, setChannelLinkFree] = useState('');
  const [channelLinkPre, setChannelLinkPre] = useState('');
  const [subscriptionPackages, setSubscriptionPackages] = useState([]);

  const [showPackageOptions, setShowPackageOptions] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (!token || !user) {
      setIsAuthenticated(false);
      return;
    }

    setIsAuthenticated(true);
    debugger
    axios
      .get(`${backendUrl}/api/subscriptions/${user.username}/${bot.name}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        const hasSubscribed = res.data.some((item) => item.name === bot.name);
        setIsPremiumSubscribed(hasSubscribed);
      })
      .catch((err) => {
        console.error('Failed to fetch user subscriptions:', err);
        setIsAuthenticated(false);
      });
  }, [bot.name]);

  useEffect(() => {
    if (!bot?.name) return;

    axios
      .get(`${backendUrl}/api/bot-chanel/${bot.name}`)
      .then((res) => {
        setChannelLinkFree(res.data?.channel_link_free || '');
        setChannelLinkPre(res.data?.channel_link_pre || '');
      })
      .catch((err) => {
        console.error('Failed to fetch bot channel links:', err);
      });

    axios
      .get(`${backendUrl}/api/subscription-packages`)
      .then((res) => {
        setSubscriptionPackages(res.data || []);
      })
      .catch((err) => {
        console.error('Failed to fetch subscription packages:', err);
      });
  }, [bot.name]);

  if (!bot) {
    return (
      <div className="container py-5 text-light text-center">
        <p>🔄 Loading bot details...</p>
      </div>
    );
  }

  const getFilteredStats = () => {
    if (timeFilter === 'All') return calculateBacktestStats(bot.data);
    if (timeFilter === 'YTD') {
      const startOfYear = new Date(new Date().getFullYear(), 0, 1);
      const recentData = bot.data.filter((d) => new Date(d.date) >= startOfYear);
      return calculateBacktestStats(recentData);
    }
    const option = timeOptions.find((opt) => opt.label === timeFilter);
    return calculateRecentStats(bot.data, { amount: option.amount, unit: option.unit });
  };

  const getFilteredChartData = () => {
    if (timeFilter === 'All') return bot.data;
    if (timeFilter === 'YTD') {
      const startOfYear = new Date(new Date().getFullYear(), 0, 1);
      return bot.data.filter((d) => new Date(d.date) >= startOfYear);
    }
    const option = timeOptions.find((opt) => opt.label === timeFilter);
    const cutoff = dayjs().subtract(option.amount, option.unit);
    return bot.data.filter((d) => dayjs(d.date).isAfter(cutoff));
  };

  const stats = getFilteredStats();
  const filteredChartData = getFilteredChartData();
  const telegramLink = isAuthenticated && isPremiumSubscribed ? channelLinkPre : channelLinkFree;

  const handleSubscription = () => {
    setShowPackageOptions(true);
  };

  const handlePackageClick = (pkgId) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    setSelectedPackageId(pkgId);
    setShowPackageOptions(true);
  };

  const confirmSubscription = () => {
    if (!selectedPackageId) {
      alert('Vui lòng chọn một gói trước.');
      return;
    }

    // TODO: Gửi đăng ký lên server tại đây
    alert(`Đăng ký gói thành công! (ID gói: ${selectedPackageId})`);
    // Có thể gọi API POST /api/subscribe nếu cần
  };

  return (
    <div className="container py-5">
      <h2 className="text-light mb-3">{bot.name}</h2>

      <div className="mb-3 text-end">
        <select
          className="form-select w-auto d-inline-block"
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value)}
        >
          {timeOptions.map((opt) => (
            <option key={opt.label} value={opt.label}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="row">
        <div className="col-md-9 mb-3">
          <BotChart data={filteredChartData} />
        </div>
        <div className="col-md-3 mb-3">
          <BacktestStatsCard stats={stats} />

          <div className="mt-5 text-center">
            <p className="text-light mb-3">
              📩 {isPremiumSubscribed ? 'Nhận tín hiệu nâng cao' : 'Nhận tín hiệu miễn phí'} qua Telegram
            </p>
            {telegramLink ? (
              <a
                href={telegramLink.replace(/^"|"$/g, '')}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-success"
              >
                👉 Tham gia nhóm Telegram
              </a>
            ) : (
              <p className="text-secondary">Không tìm thấy link Telegram</p>
            )}
            <p className="text-secondary mt-2" style={{ fontSize: '0.9rem' }}>
              {isPremiumSubscribed
                ? '* Bạn đang nhận các tín hiệu nâng cao từ bot này.'
                : '* Bạn sẽ nhận được các tín hiệu giao dịch miễn phí tại đây.'}
            </p>
          </div>

          {!isPremiumSubscribed && (
            <div className="mt-4 p-3 bg-dark text-light rounded">
              <h5 className="text-center mb-3">✨ Đăng ký nhận tín hiệu nâng cao</h5>

              {!showPackageOptions && (
                <button className="btn btn-primary w-100 mt-3" onClick={handleSubscription}>
                  🔐 Đăng ký ngay
                </button>
              )}

              {showPackageOptions && (
                <div className="mt-3">
                  <h6 className="text-light">Chọn gói đăng ký:</h6>
                  <ul className="list-group mb-3">
                    {subscriptionPackages.map((pkg) => (
                      <li
                        key={pkg.id}
                        onClick={() => setSelectedPackageId(pkg.id)}
                        className={`list-group-item d-flex justify-content-between align-items-center bg-dark text-light border-light ${selectedPackageId === pkg.id ? 'border-success border-2' : ''
                          }`}
                        style={{ cursor: 'pointer' }}
                      >
                        {pkg.duration_months} tháng
                        <span className="badge bg-info rounded-pill">
                          {parseFloat(pkg.base_price).toLocaleString()} VNĐ
                        </span>
                      </li>
                    ))}
                  </ul>
                  <button className="btn btn-success w-100" onClick={confirmSubscription}>
                    ✅ Xác nhận đăng ký
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <button className="btn btn-outline-secondary mb-4 mt-4" onClick={onBack}>
        ← Back to list
      </button>

      <p className="text-light mt-4">{bot.description}</p>

      {showLoginModal && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-dark text-light">
              <div className="modal-header">
                <h5 className="modal-title">🔒 Cần đăng nhập</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowLoginModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>Vui lòng đăng ký hoặc đăng nhập để sử dụng chức năng này.</p>
              </div>
              <div className="modal-footer">
                <a href="/login" className="btn btn-primary">Đăng nhập</a>
                <button className="btn btn-secondary" onClick={() => setShowLoginModal(false)}>Hủy</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BotDetail;
