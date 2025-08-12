import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    calculateBacktestStats,
} from '../services/backTestStatsService';

import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

const backendUrl = process.env.REACT_APP_API_URL;
const CACHE_KEY = 'cachedBotData';
const LIMIT = 4;
const CACHE_EXPIRE_MS = 6 * 60 * 60 * 1000;

const CompareBotCharts = () => {
    const [bots, setBots] = useState([]);
    const [topBot, setTopBot] = useState(null);
    const [selectedBot, setSelectedBot] = useState(null);
    const [isChartLoading, setIsChartLoading] = useState(false);

    useEffect(() => {
        if (selectedBot) {
            // Giả định chart sẽ render trong vòng vài ms (next render tick)
            const timeout = setTimeout(() => {
                setIsChartLoading(false);
            }, 800); // nhỏ thôi để tránh flash loading
            return () => clearTimeout(timeout);
        }
    }, [selectedBot]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                let pageNumber = 0;
                let cached = JSON.parse(localStorage.getItem(CACHE_KEY));
                let useCache = false;

                if (cached && Date.now() - cached.timestamp < CACHE_EXPIRE_MS) {
                    useCache = true;
                }

                let data = cached?.data || [];
                let hasMore = cached?.hasMore ?? true;
                pageNumber = pageNumber + data.length / LIMIT;

                while (hasMore) {
                    const offset = data.length;
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
                    pageNumber = pageNumber + 1;
                    // Cập nhật lại hasMore từ API nếu có
                    hasMore = res.data?.hasMore ?? (transformedBots.length === LIMIT);
                    data = [...data, ...transformedBots];
                }


                // localStorage.setItem(
                //     CACHE_KEY,
                //     JSON.stringify({
                //         data: data,
                //         hasMore,
                //         timestamp: Date.now(),
                //     })
                // );

                // Nhóm dữ liệu theo bot_id hoặc bot_name
                const groupedBots = data.reduce((acc, cur) => {
                    const key = cur.name || 'unknown';
                    if (!acc[key]) acc[key] = [];
                    acc[key].push(cur.data);
                    return acc;
                }, {});

                const botsStats = Object.entries(groupedBots).map(
                    ([name, botData]) => {
                        const stats = calculateBacktestStats(botData[0]);
                        return {
                            name,
                            stats,
                            equity: botData[0],
                        };
                    }
                );

                setBots(botsStats);

                // Bot có Sharpe cao nhất
                const bestBot = botsStats.reduce((prev, current) =>
                    current.stats.sharpe_ratio > prev.stats.sharpe_ratio
                        ? current
                        : prev
                );
                setTopBot(bestBot);


            } catch (err) {
                console.error('Error fetching bot data:', err);
            }
        };

        fetchData();
    }, []);

    if (!topBot) return <div>Loading...</div>;

    const chartData = () => {
        if (!selectedBot) return [];

        const mapData = (data) =>
            data.reduce((acc, cur) => {
                acc[cur.date] = cur;
                return acc;
            }, {});

        const topMap = mapData(topBot.equity);
        const selMap = mapData(selectedBot.equity);

        const allDatesSet = new Set([
            ...topBot.equity.map((d) => d.date),
            ...selectedBot.equity.map((d) => d.date),
        ]);
        const allDates = Array.from(allDatesSet).sort();

        return allDates.map((date) => ({
            date,
            gain_topBot: topMap[date] ? parseFloat(topMap[date].gain) : 0,
            gain_selectedBot: selMap[date] ? parseFloat(selMap[date].gain) : 0,
            total_gain_topBot: topMap[date]
                ? parseFloat(topMap[date].total_gain)
                : 0,
            total_gain_selectedBot: selMap[date]
                ? parseFloat(selMap[date].total_gain)
                : 0,
        }));
    };

    const renderCustomLabel = ({ value, x, y, width }) => (
        <text x={x + width / 2} y={y - 5} fill="#f8f5f5ff" textAnchor="middle" fontSize={12}>
            {value.toFixed(2)}
        </text>
    );

    const getYearStartDates = (data) => {
        const yearMap = new Map();

        data.forEach((d) => {
            const year = new Date(d.date).getFullYear();
            if (!yearMap.has(year)) {
                yearMap.set(year, d.date); // lấy ngày đầu tiên trong năm
            }
        });

        return Array.from(yearMap.values());
    };

    return (
        <div className="compare-bot-wrapper mt-5 mb-5">
            <div className="container bg-dark rounded-4 p-4 shadow">
                <h2>
                    🔝 Bot có Sharpe Ratio cao nhất:{' '}
                    <strong>{topBot.name}</strong>
                </h2>

                <div className="row mt-3">
                    <div className="col-md-5">
                        <h5>{topBot.name}</h5>
                        <StatsTable stats={topBot.stats} />
                    </div>

                    <div className="col-md-7">
                        <select
                            className="form-select mb-3"
                            onChange={(e) => {
                                const bot = bots.find((b) => b.name === e.target.value);
                                setSelectedBot(bot);
                                setIsChartLoading(true);
                            }}
                        >
                            <option value="">-- Chọn bot để so sánh --</option>
                            {bots
                                .filter((bot) => bot.name !== topBot.name)
                                .map((bot) => (
                                    <option key={bot.name} value={bot.name}>
                                        {bot.name}
                                    </option>
                                ))}
                        </select>

                        {isChartLoading && (
                            <div className="d-flex justify-content-center my-4">
                                <div className="spinner-border text-light" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        )}

                        {selectedBot && !isChartLoading && (
                            <>
                                {/* 🆕 Bar Chart So sánh chỉ số */}
                                <div style={{ width: '100%', height: 300 }} className="mt-4">
                                    <h6>📊 So sánh các chỉ số</h6>
                                    <ResponsiveContainer>
                                        <BarChart
                                            data={[
                                                {
                                                    name: 'Sharpe Ratio',
                                                    [topBot.name]: topBot.stats.sharpe_ratio,
                                                    [selectedBot.name]: selectedBot.stats.sharpe_ratio,
                                                },
                                                {
                                                    name: 'Return (%)',
                                                    [topBot.name]: topBot.stats.return_pct,
                                                    [selectedBot.name]: selectedBot.stats.return_pct,
                                                },
                                                {
                                                    name: 'Profit/Year',
                                                    [topBot.name]: topBot.stats.profit_per_year,
                                                    [selectedBot.name]: selectedBot.stats.profit_per_year,
                                                },
                                                {
                                                    name: 'Drawdown',
                                                    [topBot.name]: topBot.stats.max_drawdown,
                                                    [selectedBot.name]: selectedBot.stats.max_drawdown,
                                                },
                                                {
                                                    name: 'Hitrate (%)',
                                                    [topBot.name]: topBot.stats.hitrate,
                                                    [selectedBot.name]: selectedBot.stats.hitrate,
                                                },
                                            ]}
                                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            {/* Tooltip removed */}
                                            <Legend />
                                            <Bar dataKey={topBot.name} fill="#8884d8" label={renderCustomLabel} />
                                            <Bar dataKey={selectedBot.name} fill="#82ca9d" label={renderCustomLabel} />
                                        </BarChart>
                                    </ResponsiveContainer>

                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="row mt-5">
                    {selectedBot && !isChartLoading && (
                        <>
                            <div style={{ width: '100%', height: 300 }} className="col-md-6">
                                <h6>📊 So sánh Tổng Gain theo ngày</h6>
                                <ResponsiveContainer>
                                    <LineChart data={chartData()}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="date"
                                            tickFormatter={(dateStr) => new Date(dateStr).getFullYear()}
                                            ticks={getYearStartDates(chartData())}
                                        />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="total_gain_topBot"
                                            stroke="#8884d8"
                                            name={topBot.name}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="total_gain_selectedBot"
                                            stroke="#82ca9d"
                                            name={selectedBot.name}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const StatsTable = ({ stats }) => {
    const rows = [
        { label: '📈 Profit/Year', value: `$${stats.profit_per_year}` },
        { label: '💹 Return (%)', value: `${stats.return_pct}%` },
        { label: '📊 Sharpe Ratio', value: stats.sharpe_ratio },
        { label: '📉 Max Drawdown', value: stats.max_drawdown },
        { label: '🎯 Hitrate', value: `${stats.hitrate}%` },
    ];

    return (
        <div className="bg-dark text-white rounded-3 shadow p-3">
            <h6 className="text-light mb-3">📊 Performance Stats</h6>
            {rows.map(({ label, value }) => (
                <div key={label} className="d-flex justify-content-between mb-1">
                    <span>{label}</span>
                    <span className="fw-bold">{value}</span>
                </div>
            ))}
        </div>
    );
};

export default CompareBotCharts;
