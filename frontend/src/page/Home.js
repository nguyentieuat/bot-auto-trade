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
  const [error, setError] = useState('');
  const [selectedBot, setSelectedBot] = useState(null);
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('viewMode') || 'grid');
  const [restoring, setRestoring] = useState(false);
  const [modeChanging, setModeChanging] = useState(false);

  const [initialLoading, setInitialLoading] = useState(true);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const scrollRef = useRef(null);
  const didFetch = useRef(false);
  const cachedDataRef = useRef(null);

  // Sync bot name from URL
  useEffect(() => {
    const parts = location.pathname.split('/');
    if (parts[1] === 'bots' && parts[2]) {
      const botName = decodeURIComponent(parts[2]);
      const found = bots.find((b) => b.name === botName);
      if (found) setSelectedBot(found);
    } else {
      setSelectedBot(null);
    }
  }, [location.pathname, bots]);

  // Fetch bot data (with caching)
  const fetchBotsPage = useCallback(async (pageNumber) => {
    try {
      pageNumber === 0 ? setInitialLoading(true) : setLoadMoreLoading(true);
      setError('');

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
              const lastPage = location.state?.lastPage || 1;
              setBots(transformedBots.slice(0, lastPage * LIMIT));
              setPage(lastPage);
              setHasMore(transformedBots.length > lastPage * LIMIT);
            } else {
              setBots(transformedBots.slice(0, LIMIT));
              setPage(1);
              setHasMore(hasMore);
            }
            return;
          }
        }
      }

      const offset = pageNumber * LIMIT;
      const res = await axios.get(`${backendUrl}/fbt-data?limit=${LIMIT}&offset=${offset}`);
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
          hasMore: res.data.hasMore,
        })
      );
    } catch (err) {
      setError('Failed to load bots.');
    } finally {
      pageNumber === 0 ? setInitialLoading(false) : setLoadMoreLoading(false);
    }
  }, [bots]);

  useEffect(() => {
    if (!didFetch.current) {
      didFetch.current = true;
      const queryParams = new URLSearchParams(location.search);
      const isBackFromDetail = queryParams.get('fromHome') === 'true';
      const lastPage = parseInt(queryParams.get('lastPage') || '1', 10);

      if (isBackFromDetail) {
        for (let p = 0; p < lastPage; p++) fetchBotsPage(p);
      } else {
        fetchBotsPage(0);
      }
    }
  }, [fetchBotsPage, location.search]);

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

  const handleLoadMore = () => {
    if (cachedDataRef.current && bots.length < cachedDataRef.current.length) {
      const nextBots = cachedDataRef.current.slice(bots.length, bots.length + LIMIT);
      setBots(prev => [...prev, ...nextBots]);
      setPage(prev => prev + 1);
      const { hasMore: cachedHasMore } = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
      setHasMore(cachedHasMore);
    } else {
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

  const handleChangeViewMode = (mode) => {
    if (viewMode === mode) return;
    setModeChanging(true);
    setViewMode(mode);
    localStorage.setItem('viewMode', mode);
    setTimeout(() => setModeChanging(false), 300);
  };

  const viewModeLabel = viewMode === 'grid' ? 'Grid View' : 'List View';
  const viewModeIcon = viewMode === 'grid' ? 'fa-th' : 'fa-list';

  return (
    <div ref={scrollRef}>
      {selectedBot ? (
        <BotDetail bot={selectedBot} onBack={handleBack} />
      ) : (
        <>
          {/* Phần giới thiệu */}
          <div className="container mt-4">
            <h2 className="font-tech">🤖 Tổng quan Bot Giao dịch Tự động</h2>
            <p className="text-light text-center mx-auto" style={{ maxWidth: '720px' }}>
              Hệ thống này hiển thị các bot giao dịch tự động đang hoạt động. Mỗi bot đại diện cho một chiến lược riêng biệt
              và biểu đồ thể hiện hiệu suất qua thời gian (<strong>gain</strong>, <strong>total gain</strong>).
            </p>
            <p>
              Hãy đăng ký nhận tín hiệu giao dịch từ các bot để nắm bắt nhanh cơ hội đầu tư.{' '}
              <a href="/tham-gia" className="text-link">Tham gia ngay.</a>
            </p>
          </div>

          {/* Nút chuyển View */}
          <div className="container text-end" style={{ paddingTop: 10, paddingBottom: 10 }}>
            <div className="dropdown d-inline">
              <button className="btn btn-sm btn-outline-light dropdown-toggle" type="button" data-bs-toggle="dropdown">
                <i className={`fas ${viewModeIcon} me-2`}></i> {viewModeLabel}
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

          {/* Loading overlay */}
          {(initialLoading || restoring || modeChanging) && (
            <div className="overlay-loading">
              <div className="spinner-border text-light" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}

          {/* Danh sách bot */}
          <MultiCharts
            bots={bots}
            viewMode={viewMode}
            loading={initialLoading}
            loadMoreLoading={loadMoreLoading}
            error={error}
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
            setSelectedBot={setSelectedBot}
            onRendered={handleRendered}
            onBotClick={handleBotClick}
          />
        </>
      )}
    </div>
  );
}

export default Home;
