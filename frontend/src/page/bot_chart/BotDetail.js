import React, { useState, useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import axios from 'axios';

import BotChart from './BotChart';
import BacktestStatsCard from './BacktestStatsCard';
import {
  calculateBacktestStats,
  calculateRecentStats
} from '../../services/backTestStatsService';

const backendUrl = process.env.REACT_APP_API_URL;

const timeOptions = [
  { label: '3M', amount: 3, unit: 'month' },
  { label: '6M', amount: 6, unit: 'month' },
  { label: 'YTD', labelKey: 'YTD' },
  { label: 'All', labelKey: 'All' }
];

const BotDetail = ({ bot, onBack }) => {
  const [timeFilter, setTimeFilter] = useState('All');
  const [showPackageOptions, setShowPackageOptions] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPremiumSubscribed, setIsPremiumSubscribed] = useState(false);
  const [userCapital, setUserCapital] = useState(0.0);
  const [channelLinks, setChannelLinks] = useState({ free: '', premium: '' });
  const [subscriptionPackages, setSubscriptionPackages] = useState([]);

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    const isAuth = token && user;
    setIsAuthenticated(!!isAuth);

    const fetchData = async () => {
      const requests = [];

      if (isAuth) {
        requests.push(
          axios.get(`${backendUrl}/users/${user.username}/info`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${backendUrl}/subscriptions/${user.username}/${bot.name}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${backendUrl}/subscription-bot-price/${bot.name}`)
        );
      }

      // Luôn luôn fetch link kênh bot
      const botLinksReq = axios.get(`${backendUrl}/bot-chanel/${bot.name}`);

      try {
        const allResults = await Promise.allSettled([...requests, botLinksReq]);

        if (isAuth) {
          const [userInfoRes, subscriptionRes, packagesRes] = allResults;

          if (userInfoRes.status === 'fulfilled') {
            const capital = parseFloat(userInfoRes.value?.data?.total_capital ?? 0);
            setUserCapital(capital);
          }

          if (subscriptionRes.status === 'fulfilled') {
            setIsPremiumSubscribed(subscriptionRes.value?.data?.bot_name === bot.name);
          }

          if (packagesRes.status === 'fulfilled') {
            setSubscriptionPackages(packagesRes.value?.data || []);
          }
        }

        const botLinksRes = allResults[allResults.length - 1]; // Luôn là cuối mảng
        if (botLinksRes.status === 'fulfilled') {
          const data = botLinksRes.value?.data || {};
          setChannelLinks({
            free: data.channel_link_free || '',
            premium: data.channel_link_pre || ''
          });
        }
      } catch (err) {
        console.error('Lỗi khi fetch dữ liệu bot:', err);
      }
    };

    fetchData();
  }, [bot?.name]);


  const stats = useMemo(() => {
    if (!bot?.data) return null;
    debugger
    console.log(bot.data)
    if (timeFilter === 'All') return calculateBacktestStats(bot.data);
    if (timeFilter === 'YTD') {
      const startOfYear = new Date(new Date().getFullYear(), 0, 1);
      return calculateBacktestStats(bot.data.filter((d) => new Date(d.date) >= startOfYear));
    }
    const option = timeOptions.find((opt) => opt.label === timeFilter);
    return calculateRecentStats(bot.data, { amount: option.amount, unit: option.unit });
  }, [timeFilter, bot?.data]);

  const filteredChartData = useMemo(() => {
    if (!bot?.data) return [];

    if (timeFilter === 'All') return bot.data;
    if (timeFilter === 'YTD') {
      const startOfYear = new Date(new Date().getFullYear(), 0, 1);
      return bot.data.filter((d) => new Date(d.date) >= startOfYear);
    }
    const option = timeOptions.find((opt) => opt.label === timeFilter);
    const cutoff = dayjs().subtract(option.amount, option.unit);
    return bot.data.filter((d) => dayjs(d.date).isAfter(cutoff));
  }, [timeFilter, bot?.data]);

  const handleSubscription = () => {
    if (!isAuthenticated) return setShowLoginModal(true);
    setShowPackageOptions(true);
  };

  const confirmSubscription = async () => {
    const selectedPkg = subscriptionPackages.find((pkg) => pkg.months === selectedPackageId);
    if (!selectedPkg) return alert('Vui lòng chọn một gói hợp lệ.');

    const finalPrice = parseFloat(selectedPkg.final_price);
    if (userCapital < finalPrice) return alert('⚠️ Số dư không đủ để đăng ký gói này.');

    try {
      setIsSubscribing(true);
      await axios.post(
        `${backendUrl}/subscribe/${user.username}/${bot.name}`,
        { months: selectedPkg.months, final_price: finalPrice },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('🎉 Đăng ký thành công!');
      setIsPremiumSubscribed(true);
      setUserCapital((prev) => prev - finalPrice);
      setShowPackageOptions(false);
    } catch (err) {
      console.error('Lỗi khi đăng ký:', err);
      alert('❌ Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setIsSubscribing(false);
    }
  };

  const linkChannel = isAuthenticated && isPremiumSubscribed ? channelLinks.premium : channelLinks.free;

  if (!bot) {
    return (
      <div className="container py-5 text-light text-center">
        <p>🔄 Loading bot details...</p>
      </div>
    );
  }

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
            <option key={opt.label} value={opt.label}>{opt.label}</option>
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
              📩 {isPremiumSubscribed ? 'Nhận tín hiệu nâng cao' : 'Nhận tín hiệu miễn phí'} qua Group
            </p>

            {linkChannel ? (
              <a
                href={linkChannel.replace(/^"|"$/g, '')}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-success"
              >
                👉 Tham gia Group nhận tín hiệu
              </a>
            ) : (
              <p className="text-secondary">Không tìm thấy link Group tín hiệu</p>
            )}

            <p className="mt-2 small" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              {isPremiumSubscribed
                ? '* Bạn đang nhận các tín hiệu nâng cao từ bot này.'
                : '* Bạn sẽ nhận được các tín hiệu giao dịch miễn phí tại đây.'}
            </p>
          </div>

          {!isPremiumSubscribed && (
            <div className="mt-4 p-3 bg-dark text-light rounded">
              <h5 className="text-center mb-3">✨ Đăng ký nhận tín hiệu nâng cao</h5>

              {!showPackageOptions ? (
                <button className="btn btn-primary w-100 mt-3" onClick={handleSubscription}>
                  🔐 Đăng ký ngay
                </button>
              ) : (
                <>
                  <h6 className="text-light">Chọn gói đăng ký:</h6>
                  <ul className="list-group mb-3">
                    {subscriptionPackages.map((pkg) => (
                      <li
                        key={pkg.months}
                        onClick={() => setSelectedPackageId(pkg.months)}
                        className={`list-group-item d-flex justify-content-between align-items-center bg-dark text-light border-light ${selectedPackageId === pkg.months ? 'border-warning border-3 shadow-lg' : ''
                          }`}
                        style={{ cursor: 'pointer' }}
                      >
                        {pkg.months} tháng
                        <span className="badge bg-info rounded-pill">
                          {parseFloat(pkg.final_price).toLocaleString()} VNĐ
                        </span>
                      </li>
                    ))}
                  </ul>
                  <button
                    className="btn btn-success w-100"
                    onClick={confirmSubscription}
                    disabled={isSubscribing}
                  >
                    {isSubscribing ? '🔄 Đang xử lý...' : '✅ Xác nhận đăng ký'}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="text-start">
        <button
          className="btn btn-outline-light mb-4 mt-4 px-4 py-2 fw-semibold"
          style={{ borderRadius: '8px', fontSize: '1rem' }}
          onClick={onBack}
        >
          ← Trở về danh sách
        </button>
      </div>

      <p className="text-light mt-4">{bot.description}</p>

      {showLoginModal && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-dark text-light">
              <div className="modal-header">
                <h5 className="modal-title">🔒 Cần đăng nhập</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowLoginModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Vui lòng đăng ký hoặc đăng nhập để sử dụng chức năng này.</p>
              </div>
              <div className="modal-footer">
                <a href="/login-register" className="btn btn-primary">Đăng nhập</a>
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