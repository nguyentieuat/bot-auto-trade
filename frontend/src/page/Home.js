import React, { useRef, useCallback } from 'react';
import BotDetail from './bot_chart/BotDetail';
import { useNavigate, useLocation } from 'react-router-dom';
import MultiCharts from './bot_chart/MultiCharts';
import axios from 'axios';

const backendUrl = process.env.REACT_APP_API_URL;
const LIMIT = 4;
const CACHE_KEY = 'cachedBotData';
const CACHE_EXPIRE_MS = 6 * 60 * 60 * 1000; // 6 tiếng

function Home() {
  const [allBots, setAllBots] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [hasMore, setHasMore] = React.useState(true);
  const [selectedBot, setSelectedBot] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [viewMode, setViewMode] = React.useState(() => localStorage.getItem('viewMode') || 'grid');

  const observer = useRef();
  const navigate = useNavigate();
  const location = useLocation();

  // Load viewMode
  React.useEffect(() => {
    localStorage.setItem('viewMode', viewMode);
  }, [viewMode]);

  // Fetch 1 page dữ liệu từ server
  const fetchBotsPage = async (pageIndex) => {
    try {
      setLoading(true);
      const res = await axios.get(`${backendUrl}/api/fbt-data`, {
        params: { offset: pageIndex * LIMIT, limit: LIMIT },
      });

      const botsObj = res.data.bots || {};
      const newBots = Object.entries(botsObj).map(([botName, data], index) => ({
        id: `${botName}-${pageIndex}-${index}`,
        name: botName,
        data: data.map((row) => ({
          date: row.date || row.Date || row.Datetime,
          gain: parseFloat(row.gain),
          total_gain: parseFloat(row.total_gain),
        })),
      }));

      const updated = [...(pageIndex === 0 ? [] : allBots), ...newBots];
      setAllBots(updated);
      setHasMore(res.data.hasMore);
      setPage((prev) => prev + 1);

      // ✅ CHỈ CACHE NẾU ĐÃ LOAD HẾT
      if (!res.data.hasMore) {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          timestamp: Date.now(),
          data: updated,
        }));
      }

    } catch (err) {
      console.error(err);
      setError('⚠ Failed to load bot data');
    } finally {
      setLoading(false);
    }
  };

  // Lần đầu vào trang -> thử lấy cache
  React.useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_EXPIRE_MS) {
        setAllBots(data);
        setHasMore(false); // Không load thêm nếu dùng cache toàn bộ
        return;
      } else {
        localStorage.removeItem(CACHE_KEY);
      }
    }

    fetchBotsPage(0); // Nếu không có cache thì fetch từ đầu
  }, []);

  // IntersectionObserver để load thêm
  const lastBotRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchBotsPage(page);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore, page]
  );

  // Route handling
  React.useEffect(() => {
    const match = location.pathname.match(/^\/bots\/(.+)$/);
    if (match && allBots.length > 0) {
      const name = match[1];
      const found = allBots.find((b) => b.name === name);
      if (found) setSelectedBot(found);
    }
  }, [location.pathname, allBots]);

  React.useEffect(() => {
    if (location.pathname === '/') setSelectedBot(null);
  }, [location.pathname]);

  React.useEffect(() => {
    if (selectedBot) window.scrollTo(0, 0);
  }, [selectedBot]);

  const viewModeLabel = viewMode === 'grid' ? 'Grid View' : 'List View';
  const viewModeIcon = viewMode === 'grid' ? 'fa-th' : 'fa-list';

  return (
    <div className="app-container d-flex flex-column min-vh-100" style={{ paddingTop: '10px' }}>
      <main className="app-content flex-grow-1">
        {selectedBot ? (
          <BotDetail bot={selectedBot} onBack={() => navigate('/')} />
        ) : (
          <>
            <div className="container text-end" style={{ paddingBottom: 16 }}>
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
            <MultiCharts
              setSelectedBot={setSelectedBot}
              viewMode={viewMode}
              bots={allBots}
              loading={loading}
              error={error}
              lastItemRef={lastBotRef}
            />
          </>
        )}
      </main>
    </div>
  );
}

export default Home;
