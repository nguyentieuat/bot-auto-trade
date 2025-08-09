import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import BotDetail from './bot_chart/BotDetail';
const backendUrl = process.env.REACT_APP_API_URL;

const BotDetailPage = () => {
    const { name } = useParams();
    const navigate = useNavigate();
    const [bot, setBot] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBot = async () => {
            try {
                const res = await axios.get(`${backendUrl}/api/bots/${name}`);
                const { bot } = res.data;
                setBot(bot);

            } catch (err) {
                console.error(err);
                setError('⚠ Lỗi khi tải dữ liệu bot.');
            } finally {
                setLoading(false);
            }
        };

        fetchBot();
    }, [name]);

    if (loading) return <div className="container text-light py-5">⏳ Đang tải dữ liệu bot...</div>;
    if (error) return <div className="container text-danger py-5">{error}</div>;

    return <BotDetail bot={bot} onBack={() => navigate('/')} />;
};

export default BotDetailPage;
