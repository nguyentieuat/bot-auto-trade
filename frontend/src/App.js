import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './page/Home';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import JoinNow from './page/JoinNow';
import './App.css';
import LoginRegister from './page/LoginRegister';
import Profile from './page/Profile';
import Nav from './page/Nav';
import Footer from './page/Footer';
import AdminTransactions from './page/admin/AdminTransactions';
import InvestmentOrdersPage from './page/admin/InvestmentOrdersPage';
import AdminDashboard from './page/admin/AdminDashboard';
import BotDetailPage from './page/BotDetailPage';
const backendUrl = process.env.REACT_APP_API_URL;

const bgStyle = {
  backgroundImage: "url('/assets/images/background.png')",
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundAttachment: 'fixed',
  backgroundRepeat: 'no-repeat',
  minHeight: '100vh',
  color: 'white'
};

function App() {
  useEffect(() => {
    const checkUserSession = async () => {
      const token = localStorage.getItem('token');
      if (!token) return; // không có token thì thôi

      try {
        const res = await fetch(`${backendUrl}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          // Token hết hạn, hoặc user không tồn tại
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // Có thể điều hướng về trang login nếu cần
        } else {
          const user = await res.json();
          localStorage.setItem('user', JSON.stringify(user));
        }
      } catch (err) {
        console.error('Lỗi khi kiểm tra user:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    };

    checkUserSession();
  }, []);

  return (
    <div className="App" >
      <Router>
        <Nav />   {/*  HIỂN THỊ NAV Ở MỌI TRANG */}
        <main style={{ paddingTop: '80px' }}> {/* để tránh bị đè bởi Nav fixed-top */}
          <Routes>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/*" element={<Home />} />
            <Route path="/bots/:name" element={<BotDetailPage />} />
            <Route path="/tham-gia" element={<JoinNow />} />
            <Route path="/login-register" element={<LoginRegister />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin/transactions" element={<AdminTransactions />} />
            <Route path="/admin/investment" element={<InvestmentOrdersPage />} />
          </Routes>
        </main>
        <Footer /> {/*  Footer cho mọi trang (nếu cần) */}
      </Router>
    </div>
  );
}

export default App;
