import React from 'react';
import BotChart from './BotChart';
import { useNavigate } from 'react-router-dom';

/**
 * MultiCharts - Hiển thị danh sách các bot dạng grid/list, hỗ trợ lazy load qua IntersectionObserver
 * @param {function} setSelectedBot - Hàm chọn bot để xem chi tiết
 * @param {string} viewMode - 'grid' | 'list'
 * @param {array} bots - danh sách bot đã fetch
 * @param {boolean} loading - đang tải dữ liệu
 * @param {string|null} error - lỗi nếu có
 * @param {function} lastItemRef - ref để observe phần tử cuối cho lazy loading
 */
const MultiCharts = ({ setSelectedBot, viewMode, bots, loading, error, lastItemRef }) => {
  const navigate = useNavigate();

  if (loading && bots.length === 0) return <p className="text-light text-center">⏳ Loading all charts...</p>;
  if (error) return <p className="text-danger text-center">{error}</p>;
  if (!bots || bots.length === 0) return <p className="text-warning text-center">🚫 No bot data available.</p>;

  const handleBotClick = (bot) => {
    setSelectedBot?.(bot);
    navigate(`/bots/${bot.name}`);
  };

  return (
    <div className="container">
      {viewMode === 'grid' ? (
        <div className="row g-4">
          {bots.map((bot, index) => {
            const isLast = index === bots.length - 1;
            return (
              <div className="col-md-6" key={bot.id} ref={isLast ? lastItemRef : null}>
                <div
                  className="bg-dark rounded-4 p-3 shadow"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleBotClick(bot)}
                >
                  <h5 className="text-light mb-3">{bot.name}</h5>
                  <BotChart data={bot.data} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="d-flex flex-column gap-4">
          {bots.map((bot, index) => {
            const isLast = index === bots.length - 1;
            return (
              <div
                key={bot.id}
                ref={isLast ? lastItemRef : null}
                className="bg-dark rounded-4 p-4 shadow"
                style={{ cursor: 'pointer' }}
                onClick={() => handleBotClick(bot)}
              >
                <h5 className="text-light mb-3">{bot.name}</h5>
                <BotChart data={bot.data} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MultiCharts;
