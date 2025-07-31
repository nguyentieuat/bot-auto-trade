import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BotChart from './BotChart';
import { useNavigate } from 'react-router-dom';

/**
 * Component to display all bot charts with grid or list view.
 * Allows lazy loading and navigation to detail page on click.
 *
 * @param {function} setSelectedBot - Callback to set selected bot
 * @param {string} viewMode - 'grid' or 'list' layout mode
 */
const MultiCharts = ({ setSelectedBot, viewMode }) => {
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleCount, setVisibleCount] = useState(4);

  const navigate = useNavigate();

  // Fetch all bots from backend API
  useEffect(() => {
    axios
      .get('http://localhost:3001/api/fbt-data')
      .then((res) => {
        const formatted = res.data.map((bot) => ({
          id: bot.filename,
          name: bot.filename.replace('.csv', ''),
          data: bot.data.map((row) => ({
            date: row.Date || row.Datetime,
            gain: row.gain,
            total_gain: row.total_gain
          }))
        }));
        setBots(formatted);
      })
      .catch((err) => {
        console.error(err);
        setError('⚠ Failed to load bot data');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Scroll-based incremental load
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 300) {
        setVisibleCount(prev => Math.min(prev + 2, bots.length));
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [bots.length]);

  if (loading) return <p className="text-light text-center">⏳ Loading all charts...</p>;
  if (error) return <p className="text-danger text-center">{error}</p>;
  if (bots.length === 0) return <p className="text-warning text-center">🚫 No bot data available.</p>;

  const visibleBots = bots.slice(0, visibleCount);

  // Navigate to detail and update selectedBot
  const handleBotClick = (bot) => {
    setSelectedBot?.(bot);
    navigate(`/bots/${bot.name}`);
  };

  return (
    <div className="container">
      {/* Grid layout: 2 charts per row */}
      {viewMode === 'grid' ? (
        <div className="row g-4">
          {visibleBots.map((bot) => (
            <div className="col-md-6" key={bot.id}>
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
        // List layout: stacked vertically
        <div className="d-flex flex-column gap-4">
          {visibleBots.map((bot) => (
            <div
              key={bot.id}
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
    </div>
  );
};

export default MultiCharts;
