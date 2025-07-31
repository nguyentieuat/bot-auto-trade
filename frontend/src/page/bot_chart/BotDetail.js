import React, { useState } from 'react';
import dayjs from 'dayjs';
import BotChart from './BotChart';
import BacktestStatsCard from './BacktestStatsCard';
import { calculateBacktestStats, calculateRecentStats } from '../../services/backTestStatsService';

const timeOptions = [
  { label: '3M', amount: 3, unit: 'month' },
  { label: '6M', amount: 6, unit: 'month' },
  { label: 'YTD', labelKey: 'YTD' },
  { label: 'All', labelKey: 'All' }
];

const BotDetail = ({ bot, onBack }) => {
  const [timeFilter, setTimeFilter] = useState('All');

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
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const recentData = bot.data.filter(d => new Date(d.date) >= startOfYear);
      return calculateBacktestStats(recentData);
    }

    const option = timeOptions.find(opt => opt.label === timeFilter);
    return calculateRecentStats(bot.data, { amount: option.amount, unit: option.unit });
  };

  const getFilteredChartData = () => {
    if (timeFilter === 'All') return bot.data;

    if (timeFilter === 'YTD') {
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      return bot.data.filter(d => new Date(d.date) >= startOfYear);
    }

    const option = timeOptions.find(opt => opt.label === timeFilter);
    const cutoff = dayjs().subtract(option.amount, option.unit);
    return bot.data.filter(d => dayjs(d.date).isAfter(cutoff));
  };

  const stats = getFilteredStats();
  const filteredChartData = getFilteredChartData();

  return (
    <div className="container py-5">
      <h2 className="text-light mb-3">{bot.name}</h2>

      <div className="mb-3 text-end">
        <select
          className="form-select w-auto d-inline-block"
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value)}
        >
          {timeOptions.map(opt => (
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
          {/* Đăng ký nhận tín hiệu miễn phí */}
          <div className="mt-5 text-center">
            <p className="text-light mb-3">📩 Nhận tín hiệu miễn phí qua Telegram</p>
            <a
              href="https://t.me/+1D_KzPVHtNwxZDA9"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-success"
            >
              👉 Tham gia nhóm Telegram
            </a>
            <p className="text-secondary mt-2" style={{ fontSize: '0.9rem' }}>
              * Bạn sẽ nhận được các tín hiệu giao dịch miễn phí tại đây.
            </p>
          </div>
        </div>
      </div>
<button className="btn btn-outline-secondary mb-4" onClick={onBack}>
        ← Back to list
      </button>

      <p className="text-light mt-4">{bot.description}</p>
    </div>
  );
};

export default BotDetail;
