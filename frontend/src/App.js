import React from 'react';
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

const bgStyle = {
  backgroundImage: "url('/assets/images/bg-tech.jpg')",
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundAttachment: 'fixed',
  backgroundRepeat: 'no-repeat',
  minHeight: '100vh',
  color: 'white'
};

function App() {
  return (
    <div className="App" style={bgStyle}>
      <Router>
        <Nav />   {/*  HIỂN THỊ NAV Ở MỌI TRANG */}
        <main style={{ paddingTop: '75px' }}> {/* để tránh bị đè bởi Nav fixed-top */}
          <Routes>
            <Route path="/*" element={<Home />} />
            <Route path="/bots/:name" element={<Home />} />
            <Route path="/tham-gia" element={<JoinNow />} />
            <Route path="/login-register" element={<LoginRegister />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
        <Footer /> {/*  Footer cho mọi trang (nếu cần) */}
      </Router>
    </div>
  );
}

export default App;
