import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './styles/custom.scss';
import Dashboard from './pages/Dashboard';
import Stats from './pages/Stats';

import Livestream from './pages/Livestream';

// Bootstrap JS importieren
import * as bootstrap from 'bootstrap';
function App() {

  useEffect(() => {
    const offcanvasElement = document.getElementById('offcanvasNavbar');
    if (!offcanvasElement) return;
  
    const bsOffcanvas = bootstrap.Offcanvas.getOrCreateInstance(offcanvasElement);
  
    const links = offcanvasElement.querySelectorAll('.nav-link');
    links.forEach(link => {
      link.addEventListener('click', () => {
        bsOffcanvas.hide();
  
        // Sicherstellen, dass der Backdrop entfernt wird
        const backdrop = document.querySelector('.offcanvas-backdrop');
        if (backdrop) backdrop.remove();
      });
    });

    // Cleanup: EventListener entfernen
    return () => {
      links.forEach(link => {
        link.removeEventListener('click', () => bsOffcanvas.hide());
      });
    };
  }, []);

  return (
    <Router>
      <div className="App bg-dark min-vh-100">
        {/* Bootstrap Navbar */}
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow border-bottom border-secondary">
          <div className="container-fluid">
            {/* Brand */}
            <Link className="navbar-brand fw-bold text-white" to="/">
              <i className="bi bi-plant me-2"></i>GrowHub
            </Link>

            {/* Hamburger Button für Mobile Offcanvas */}
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="offcanvas"
              data-bs-target="#offcanvasNavbar"
              aria-controls="offcanvasNavbar"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>

            {/* Offcanvas für Mobile */}
            <div
              className="offcanvas offcanvas-start bg-dark"
              tabIndex="-1"
              id="offcanvasNavbar"
              aria-labelledby="offcanvasNavbarLabel"
            >
              <div className="offcanvas-header border-bottom border-secondary">
                <h5 className="offcanvas-title text-primary fw-bold fs-4" id="offcanvasNavbarLabel">
                  <i className="bi bi-plant me-2"></i>GrowHub
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  data-bs-dismiss="offcanvas"
                  aria-label="Close"
                ></button>
              </div>
              <div className="offcanvas-body d-sm-none">
                <ul className="navbar-nav justify-content-start flex-grow-1">
                  <li className="nav-item mb-3">
                    <Link className="nav-link text-light fw-semibold fs-5 py-3 px-3 rounded-3 hover-bg-primary transition-all" to="/">
                      <i className="bi bi-speedometer2 me-3"></i>Dashboard
                    </Link>
                  </li>
                  <li className="nav-item mb-3">
                    <Link className="nav-link text-light fw-semibold fs-5 py-3 px-3 rounded-3 hover-bg-primary transition-all" to="/stats">
                      <i className="bi bi-graph-up me-3"></i>Statistik
                    </Link>
                  </li>
                  <li className="nav-item mb-3">
                    <Link className="nav-link text-light fw-semibold fs-5 py-3 px-3 rounded-3 hover-bg-primary transition-all" to="/livestream">
                      <i className="bi bi-camera-video me-3"></i>Livestream
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Desktop-Links */}
            <div className="collapse navbar-collapse">
              <ul className="navbar-nav ms-auto">
                <li className="nav-item">
                  <Link className="nav-link text-light fw-semibold hover-text-primary" to="/">Dashboard</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link text-light fw-semibold hover-text-primary" to="/stats">Statistik</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link text-light fw-semibold hover-text-primary" to="/livestream">Livestream</Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="container mt-4 text-light">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/livestream" element={<Livestream />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
