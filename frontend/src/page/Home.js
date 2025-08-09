import React, { useRef, useCallback, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BotDetail from './bot_chart/BotDetail';
import MultiCharts from './bot_chart/MultiCharts';
import axios from 'axios';

const backendUrl = process.env.REACT_APP_API_URL;
const LIMIT = 4;
const CACHE_KEY = 'cachedBotData';
const SCROLL_KEY = 'scrollY';
const CACHE_EXPIRE_MS = 6 * 60 * 60 * 1000;

function Home() {
  const [bots, setBots] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedBot, setSelectedBot] = useState(null);
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('viewMode') || 'grid');
  const [restoring, setRestoring] = useState(false);
  const [modeChanging, setModeChanging] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const scrollRef = useRef(null);
  const didFetch = useRef(false);

  // Check pathname and sync selectedBot
  useEffect(() => {
    const parts = location.pathname.split('/');
    if (parts[1] === 'bots' && parts[2]) {
      const botName = decodeURIComponent(parts[2]);
      const found = bots.find((b) => b.name === botName);
      if (found) {
        setSelectedBot(found);
      }
    } else {
      setSelectedBot(null);
    }
  }, [location.pathname, bots]);

  // Fetch with cache
  const fetchBotsPage = useCallback(async (pageNumber) => {
    try {
      setLoading(true);
      setError('');

      // Nếu pageNumber === 0 => thử load cache
      if (pageNumber === 0) {
        const cache = localStorage.getItem(CACHE_KEY);
        if (cache) {
          const { data, timestamp, hasMore } = JSON.parse(cache);
          if (Date.now() - timestamp < CACHE_EXPIRE_MS) {
            const transformedBots = data.map((bot, index) => ({
              id: bot.id ?? `${bot.name}-cached-${index}`,
              name: bot.name,
              data: Array.isArray(bot.data)
                ? bot.data
                  .filter(row => row.date || row.Date || row.Datetime)
                  .map(row => ({
                    date: row.date || row.Date || row.Datetime,
                    gain: isNaN(parseFloat(row.gain)) ? 0 : parseFloat(row.gain),
                    total_gain: isNaN(parseFloat(row.total_gain)) ? 0 : parseFloat(row.total_gain),
                  }))
                : [],
            }));

            cachedDataRef.current = transformedBots;

            if (location.state?.fromHome) {
              // Back từ detail → render đúng số trang đã xem
              const lastPage = location.state?.lastPage || 1;
              setBots(transformedBots.slice(0, lastPage * LIMIT));
              setPage(lastPage);
              setHasMore(transformedBots.length > lastPage * LIMIT);
            } else {
              // Lần đầu vào home → chỉ lấy LIMIT bot đầu
              setBots(transformedBots.slice(0, LIMIT));
              setPage(1);
              setHasMore(hasMore);
            }
            return;
          }
        }
      }

      // Fetch thêm từ API
      const offset = pageNumber * LIMIT;
      const res = await axios.get(`${backendUrl}/api/fbt-data?limit=${LIMIT}&offset=${offset}`);
      const botsObj = res.data.bots || {};

      const transformedBots = Object.entries(botsObj).map(([botName, data], index) => ({
        id: `${botName}-${pageNumber}-${index}`,
        name: botName,
        data: data.map((row) => ({
          date: row.date || row.Date || row.Datetime,
          gain: parseFloat(row.gain),
          total_gain: parseFloat(row.total_gain),
        })),
      }));

      const updatedBots = pageNumber === 0 ? transformedBots : [...bots, ...transformedBots];
      setBots(updatedBots);
      setPage((prev) => prev + 1);
      setHasMore(res.data.hasMore);

      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          data: updatedBots,
          timestamp: Date.now(),
          hasMore: res.data.hasMore
        })
      );
    } catch (err) {
      setError('Failed to load bots.');
    } finally {
      setLoading(false);
    }
  }, [bots]);


  // Initial load only once
  useEffect(() => {
    if (!didFetch.current) {
      didFetch.current = true;
      const queryParams = new URLSearchParams(location.search);
      const isBackFromDetail = queryParams.get('fromHome') === 'true';
      const lastPage = parseInt(queryParams.get('lastPage') || '1', 10);

      if (isBackFromDetail) {
        // Fetch lại đủ số trang đã xem
        for (let p = 0; p < lastPage; p++) {
          fetchBotsPage(p);
        }
      } else {
        // Lần đầu load
        fetchBotsPage(0);
      }
    }
  }, [fetchBotsPage, location.state]);

  // Restore scroll when selectedBot is closed
  const handleBack = () => {
    setRestoring(true);
    window.history.pushState({}, '', `/?fromHome=true&lastPage=${page}`);
    navigate('/');
    setSelectedBot(null);

    const savedScrollY = parseInt(localStorage.getItem(SCROLL_KEY), 10);
    if (!isNaN(savedScrollY)) {
      setTimeout(() => window.scrollTo(0, savedScrollY), 0);
    }
  };
  const cachedDataRef = useRef(null);
  const handleLoadMore = () => {
    // Nếu còn data trong cache chưa render hết
    if (cachedDataRef.current && bots.length < cachedDataRef.current.length) {
      const nextBots = cachedDataRef.current.slice(
        bots.length,
        bots.length + LIMIT
      );
      setBots(prev => [...prev, ...nextBots]);
      setPage(prev => prev + 1);
      const { hasMore: cachedHasMore } = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
      setHasMore(cachedHasMore);
    } else {
      // Nếu cache hết thì fetch API tiếp
      fetchBotsPage(page);
    }
  };

  const handleRendered = () => {
    const savedScrollY = parseInt(localStorage.getItem(SCROLL_KEY), 10);
    if (!isNaN(savedScrollY)) {
      window.scrollTo(0, savedScrollY);
      localStorage.removeItem(SCROLL_KEY);
    }
    setRestoring(false);
  };

  const handleBotClick = (bot) => {
    localStorage.setItem(SCROLL_KEY, window.scrollY);
    setSelectedBot(bot);
    window.history.pushState({}, '', `/bots/${bot.name}`);
  };

  const viewModeLabel = viewMode === 'grid' ? 'Grid View' : 'List View';
  const viewModeIcon = viewMode === 'grid' ? 'fa-th' : 'fa-list';

  const handleChangeViewMode = (mode) => {
    if (viewMode === mode) return; // Không đổi nếu đang cùng mode
    setModeChanging(true);
    setViewMode(mode);
    localStorage.setItem('viewMode', mode);

    // Giả lập delay nhỏ để spinner hiển thị (300ms)
    setTimeout(() => {
      setModeChanging(false);
    }, 300);
  };
  return (
    <div ref={scrollRef}>
      {selectedBot ? (
        <BotDetail bot={selectedBot} onBack={handleBack} />
      ) : (
        <>
          <div className="container text-end" style={{ paddingTop: 10, paddingBottom: 10 }}>
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
              <ul className="dropdown-menu dropdown-menu-end custom-dropdown">
                <li>
                  <button className="dropdown-item" onClick={() => handleChangeViewMode('grid')}>
                    <i className="fas fa-th me-2"></i> Grid View
                  </button>
                </li>
                <li>
                  <button className="dropdown-item" onClick={() => handleChangeViewMode('list')}>
                    <i className="fas fa-list me-2"></i> List View
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {(restoring || modeChanging) && (
            <div className="overlay-loading">
              <div className="spinner-border text-light" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}
          <MultiCharts
            bots={bots}
            viewMode={viewMode}
            loading={loading}
            error={error}
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
            setSelectedBot={setSelectedBot}
            onRendered={handleRendered}
            onBotClick={handleBotClick} // optional: can pass explicitly
          />
        </>
      )}
    </div>
  );
}

export default Home;
