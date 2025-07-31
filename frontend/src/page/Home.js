import React from 'react';
import Nav from './Nav';
import Footer from './Footer';
import BotDetail from './bot_chart/BotDetail';
import { useNavigate, useLocation } from 'react-router-dom';
import MultiCharts from './bot_chart/MultiCharts';
import axios from 'axios';

function Home() {
  const [allBots, setAllBots] = React.useState([]);
  const [selectedBot, setSelectedBot] = React.useState(null);
  const [viewMode, setViewMode] = React.useState(() => {
    return localStorage.getItem('viewMode') || 'grid';
  });

  const navigate = useNavigate();
  const location = useLocation();

  // Save view mode to localStorage
  React.useEffect(() => {
    localStorage.setItem('viewMode', viewMode);
  }, [viewMode]);

  const API_URL = process.env.REACT_APP_API_URL;
  // Fetch all bot data once on mount
  React.useEffect(() => {
    axios.get(`${API_URL}/api/fbt-data`).then((res) => {
      const formatted = res.data.map((bot) => ({
        id: bot.filename,
        name: bot.filename.replace('.csv', ''),
        data: bot.data.map((row) => ({
          date: row.Date || row.Datetime,
          gain: row.gain,
          total_gain: row.total_gain,
        })),
      }));
      setAllBots(formatted);
    });
  }, []);

  // Set selected bot if URL is /bots/:name
  React.useEffect(() => {
    const match = location.pathname.match(/^\/bots\/(.+)$/);
    if (match && allBots.length > 0) {
      const name = match[1];
      const found = allBots.find((b) => b.name === name);
      if (found) setSelectedBot(found);
    }
  }, [location.pathname, allBots]);

  // Handle bot click → navigate + set selected
  const handleBotClick = (bot) => {
    navigate(`/bots/${bot.name}`);
    setSelectedBot(bot);
  };

  // Back to home
  const handleBack = () => {
    navigate('/');
    setSelectedBot(null);
  };

  // Reset selectedBot when URL is exactly "/"
  React.useEffect(() => {
    if (location.pathname === '/') {
      setSelectedBot(null);
    }
  }, [location.pathname]);

  // Scroll to top on detail view
  React.useEffect(() => {
    if (selectedBot) window.scrollTo(0, 0);
  }, [selectedBot]);

  const viewModeLabel = viewMode === 'grid' ? 'Grid View' : 'List View';
  const viewModeIcon = viewMode === 'grid' ? 'fa-th' : 'fa-list';

  return (
    <div className="app-container d-flex flex-column min-vh-100">

      <main className="app-content flex-grow-1" style={{ paddingTop: '90px' }}>
        {selectedBot ? (
          <BotDetail bot={selectedBot} onBack={handleBack} />
        ) : (
          <>
            {/* View mode toggle */}
            <div className="container text-end force-padding-bot1rem" style={{ paddingBottom: 16 }}>
              <div className="dropdown d-inline">
                <button
                  className="btn btn-sm btn-outline-light dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className={`fas ${viewModeIcon} me-2`}></i>
                  {viewModeLabel}
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <button className="dropdown-item" onClick={() => setViewMode('grid')}>
                      <i className="fas fa-th me-2"></i> Grid View
                    </button>
                  </li>
                  <li>
                    <button className="dropdown-item" onClick={() => setViewMode('list')}>
                      <i className="fas fa-list me-2"></i> List View
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            {/* All charts with click handler */}
            <MultiCharts
              setSelectedBot={handleBotClick} // Pass click handler
              viewMode={viewMode}
            />
          </>
        )}
      </main>

    </div>
  );
}

export default Home;
