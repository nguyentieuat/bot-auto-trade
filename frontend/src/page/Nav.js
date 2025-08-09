import React, { useState, useEffect, useRef } from 'react';
import navItems from './data/navData';
import { Link, useLocation } from 'react-router-dom';
const backendUrl = process.env.REACT_APP_API_URL;

const Nav = () => {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')));
  const location = useLocation(); // bắt sự thay đổi đường dẫn để reload user

  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const collapseRef = useRef(null);
  // Bắt sự kiện click ngoài để đóng menu
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        collapseRef.current &&
        !collapseRef.current.contains(event.target) &&
        !event.target.classList.contains('navbar-toggler') &&
        !event.target.closest('.navbar-toggler')
      ) {
        setIsNavCollapsed(true);
      }
    }

    if (!isNavCollapsed) {
      document.addEventListener('click', handleClickOutside);
    } else {
      document.removeEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isNavCollapsed]);

  const toggleNav = () => {
    setIsNavCollapsed(!isNavCollapsed);
  };

  useEffect(() => {
    setUser(JSON.parse(localStorage.getItem('user')));
  }, [location]);

  return (
    <nav className="navbar navbar-expand-lg py-3 bg-dark fixed-top">
      <div className="container">
        {/* Logo */}
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

        {/* Toggle Button for Mobile */}
        <button
          className="navbar-toggler custom-toggler"
          type="button"
          aria-controls="navbarNav"
          aria-expanded={!isNavCollapsed}
          aria-label="Toggle navigation"
          onClick={toggleNav}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Collapsible Nav Links */}
        <div
          className={`collapse navbar-collapse ${isNavCollapsed ? '' : 'show'}`}
          id="navbarNav"
          ref={collapseRef}
        >
          <ul className="navbar-nav ms-auto gap-lg-3">
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

          {/* Button - Tham Gia Ngay */}
          <a href="/tham-gia" className="btn btn-outline-light ms-lg-4 mt-3 mt-lg-0 rounded-pill px-4">
            Tham gia ngay →
          </a>

          {/* User Dropdown / Login Button */}
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
