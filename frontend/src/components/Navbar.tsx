import React from 'react';

interface NavbarProps {
  activeScreen: 'inicio' | 'jogo' | 'ranking';
  onNavigate: (screen: 'inicio' | 'jogo' | 'ranking') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeScreen, onNavigate }) => {
  return (
    <nav className="navbar navbar-expand-md bg-white fixed-top shadow-sm border-bottom">
      <div className="container">
        <a
          className="navbar-brand d-flex align-items-center gap-2"
          href="#"
          onClick={(e) => { e.preventDefault(); onNavigate('inicio'); }}
        >
          <div className="d-flex gap-1">
            <span className="rounded-circle" style={{ width: '10px', height: '10px', backgroundColor: 'var(--genius-green)' }}></span>
            <span className="rounded-circle" style={{ width: '10px', height: '10px', backgroundColor: 'var(--genius-red)' }}></span>
            <span className="rounded-circle" style={{ width: '10px', height: '10px', backgroundColor: 'var(--genius-yellow)' }}></span>
            <span className="rounded-circle" style={{ width: '10px', height: '10px', backgroundColor: 'var(--genius-blue)' }}></span>
          </div>
          <span className="text-dark" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 300, fontSize: '1.1rem' }}>Genius</span>
        </a>

        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto gap-1">
            {[
              { key: 'inicio' as const, label: 'Início', icon: 'bi-house' },
              { key: 'jogo' as const, label: 'Jogo', icon: 'bi-controller' },
              { key: 'ranking' as const, label: 'Ranking', icon: 'bi-trophy' },
            ].map(({ key, label, icon }) => (
              <li className="nav-item" key={key}>
                <a
                  className={`nav-link d-flex align-items-center gap-1 rounded-pill px-3 ${
                    activeScreen === key
                      ? 'active fw-semibold text-dark bg-light'
                      : 'text-secondary'
                  }`}
                  href="#"
                  onClick={(e) => { e.preventDefault(); onNavigate(key); }}
                >
                  <i className={`bi ${icon}`}></i>
                  <span>{label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
};
