import React, { useState, useEffect } from 'react';
import navItems from './data/navData';
import { Link, useLocation } from 'react-router-dom';
const backendUrl = process.env.REACT_APP_API_URL;

const Nav = () => {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')));
  const location = useLocation(); // bắt sự thay đổi đường dẫn để reload user

  useEffect(() => {
    setUser(JSON.parse(localStorage.getItem('user')));
  }, [location]); // khi URL thay đổi → load lại user từ localStorage

  return (
    <nav className="navbar navbar-expand-lg py-3 fixed-top bg-dark shadow">
      <div className="container">
        <Link to="/" className="navbar-brand d-flex align-items-center gap-2">
          <img
            src="/assets/images/logo.png"
            alt="Smooth - Kiến tạo giá trị"
            style={{ height: '40px' }}
          />
          <span
            className="fw-bold"
            style={{
              fontFamily: "'Orbitron', sans-serif",
              color: '#0ff',
              textShadow: '0 0 10px #0ff, 0 0 20px #0ff',
            }}
          >
            Smooth
          </span>
        </Link>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav ms-auto gap-3">
            {navItems.map((item, index) => (
              <li className="nav-item" key={index}>
                <a
                  className="nav-link text-light"
                  href={item.href}
                  {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          <a href="/tham-gia" className="btn btn-outline-light ms-4 rounded-pill px-4">
            Tham gia ngay →
          </a>

          {user ? (
            <div className="dropdown position-absolute end-0 top-50 translate-middle-y me-3" style={{ zIndex: 1000 }}>
              <button
                className="btn btn-success dropdown-toggle rounded-pill px-4"
                type="button"
                id="userMenu"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="fas fa-user me-1"></i> {user.username}
              </button>
              <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userMenu">
                <li>
                  <Link className="dropdown-item" to="/profile">
                    Trang cá nhân
                  </Link>
                </li>
                <li>
                  <button
                    className="dropdown-item text-danger"
                    onClick={() => {
                      localStorage.removeItem('user');
                      localStorage.removeItem('token');
                      window.location.href = '/';
                    }}
                  >
                    Đăng xuất
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <Link
              to="/login-register"
              className="btn btn-info rounded-pill px-4 position-absolute end-0 top-50 translate-middle-y me-3"
              style={{ zIndex: 1000 }}
            >
              <i className="fas fa-user"></i>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Nav;
