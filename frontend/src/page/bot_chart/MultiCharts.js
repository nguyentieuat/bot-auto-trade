import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BotChart from './BotChart';

const SCROLL_KEY = 'scrollY';

const MultiCharts = ({
  bots,
  viewMode,
  loading,
  error,
  onLoadMore,
  hasMore,
  setSelectedBot,
  onRendered,
  onBotClick
}) => {
  const navigate = useNavigate();

  const handleBotClick = (bot) => {
    localStorage.setItem(SCROLL_KEY, window.scrollY);
    setSelectedBot?.(bot);
    onBotClick?.(bot);
  };

  useEffect(() => {
    if (!loading && bots.length > 0 && typeof onRendered === 'function') {
      const timeout = setTimeout(() => {
        onRendered();
      }, 0);
      return () => clearTimeout(timeout);
    }
  }, [loading, bots, onRendered]);

  if (loading && bots.length === 0) {
    return <p className="text-light text-center">⏳ Loading all charts...</p>;
  }

  if (error) {
    return <p className="text-danger text-center">{error}</p>;
  }

  if (!bots || bots.length === 0) {
    return <p className="text-warning text-center">🚫 No bot data available.</p>;
  }

  return (
    <div className="container">
      {viewMode === 'grid' ? (
        <div className="row g-4">
          {bots?.map((bot) => (
            <div className="col-md-6" key={bot.name}>
              <div
                className="bg-dark rounded-4 p-3 shadow"
                style={{ cursor: 'pointer' }}
                onClick={() => handleBotClick(bot)}
              >
                <h5 className="text-light mb-3">{bot.name}</h5>
                <BotChart data={bot.data} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="d-flex flex-column gap-4">
          {bots?.map((bot) => (
            <div
              key={bot.name}
              className="bg-dark rounded-4 p-4 shadow"
              style={{ cursor: 'pointer' }}
              onClick={() => handleBotClick(bot)}
            >
              <h5 className="text-light mb-3">{bot.name}</h5>
              <BotChart data={bot.data} />
            </div>
          ))}
        </div>
      )}

      {hasMore && (
        <div className="text-center mt-4" style={{paddingBottom: '20px'}}>
          {loading ? (
            <div className="spinner-border text-info" role="status">
              <span className="visually-hidden">Loading more...</span>
            </div>
          ) : (
            <button className="btn btn-outline-light" onClick={onLoadMore}>
              + Load More Bots
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiCharts;
