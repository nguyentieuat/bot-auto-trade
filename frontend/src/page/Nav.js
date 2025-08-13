import React, { useState, useEffect, useRef } from 'react';
import navItems from './data/navData';
import { Link, useLocation } from 'react-router-dom';

const Nav = () => {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')));
  const location = useLocation();
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const collapseRef = useRef(null);

  useEffect(() => {
    setUser(JSON.parse(localStorage.getItem('user')));
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        collapseRef.current &&
        !collapseRef.current.contains(event.target) &&
        !event.target.closest('.navbar-toggler')
      ) {
        setIsNavCollapsed(true);
      }
    };

    if (!isNavCollapsed) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isNavCollapsed]);

  const toggleNav = () => setIsNavCollapsed((prev) => !prev);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  return (
    <nav className="navbar navbar-expand-lg py-3 bg-dark fixed-top">
      <div className="container d-flex align-items-center justify-content-between">
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

        {/* Right-side (toggle + user) */}
        <div className="d-flex align-items-center gap-2">
          {/* Mobile: User Button */}
          <div className="d-block d-lg-none">
            {user ? (
              <div className="dropdown">
                <button
                  className="btn btn-success dropdown-toggle rounded-pill px-3 py-1"
                  type="button"
                  id="userMenuMobile"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="fas fa-user"></i>
                </button>
                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userMenuMobile">
                  <li>
                    <Link className="dropdown-item" to="/profile">Trang cá nhân</Link>
                  </li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                      Đăng xuất
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <Link to="/login-register" className="btn btn-info rounded-pill px-3 py-1">
                <i className="fas fa-user"></i>
              </Link>
            )}
          </div>

          {/* Toggle for mobile */}
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
        </div>

        {/* Collapsible Menu */}
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

          {/* CTA: Tham gia ngay */}
          <a
            href="/tham-gia"
            className="btn btn-outline-light ms-lg-4 mt-3 mt-lg-0 rounded-pill px-4"
          >
            Tham gia ngay →
          </a>
        </div>

        {/* Desktop: User Button (outside collapse) */}
        <div className="d-none d-lg-block ms-3">
          {user ? (
            <div className="dropdown">
              <button
                className="btn btn-success dropdown-toggle rounded-pill px-4"
                type="button"
                id="userMenuDesktop"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="fas fa-user me-1"></i> {user.username}
              </button>
              <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userMenuDesktop">
                <li>
                  <Link className="dropdown-item" to="/profile">Trang cá nhân</Link>
                </li>
                <li>
                  <button className="dropdown-item text-danger" onClick={handleLogout}>
                    Đăng xuất
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <Link to="/login-register" className="btn btn-info rounded-pill px-4">
              <i className="fas fa-user"></i>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Nav;
