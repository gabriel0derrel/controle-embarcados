import React from 'react';

interface NavbarProps {
  activeScreen: 'inicio' | 'jogo' | 'resultado';
  onNavigate: (screen: 'inicio' | 'jogo' | 'resultado') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeScreen, onNavigate }) => {
  return (
    <nav className="navbar navbar-expand-md navbar-dark bg-dark fixed-top shadow-sm border-bottom border-3" style={{ borderColor: 'var(--genius-blue)' }}>
      <div className="container px-4">
        {/* Brand */}
        <a 
          className="navbar-brand fw-bold d-flex align-items-center gap-2" 
          href="#"
          onClick={(e) => { e.preventDefault(); onNavigate('inicio'); }}
        >
          <span className="d-inline-block rounded-circle" style={{ width: '12px', height: '12px', backgroundColor: 'var(--genius-red)' }}></span>
          <span className="d-inline-block rounded-circle" style={{ width: '12px', height: '12px', backgroundColor: 'var(--genius-blue)' }}></span>
          <span className="d-inline-block rounded-circle" style={{ width: '12px', height: '12px', backgroundColor: 'var(--genius-yellow)' }}></span>
          <span className="d-inline-block rounded-circle" style={{ width: '12px', height: '12px', backgroundColor: 'var(--genius-green)' }}></span>
          <span className="ms-1">Genius IoT</span>
        </a>

        {/* Toggle Button */}
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav" 
          aria-controls="navbarNav" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Nav Links */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-md-0">
            <li className="nav-item">
              <a 
                className={`nav-link ${activeScreen === 'inicio' ? 'active fw-semibold text-white' : 'text-secondary'}`} 
                href="#"
                onClick={(e) => { e.preventDefault(); onNavigate('inicio'); }}
              >
                Início
              </a>
            </li>
            <li className="nav-item">
              <a 
                className={`nav-link ${activeScreen === 'jogo' ? 'active fw-semibold text-white' : 'text-secondary'}`} 
                href="#"
                onClick={(e) => { e.preventDefault(); onNavigate('jogo'); }}
              >
                Jogo
              </a>
            </li>
            <li className="nav-item">
              <a 
                className={`nav-link ${activeScreen === 'resultado' ? 'active fw-semibold text-white' : 'text-secondary'}`} 
                href="#"
                onClick={(e) => { e.preventDefault(); onNavigate('resultado'); }}
              >
                Ranking
              </a>
            </li>
          </ul>

          {/* Right status */}
          <div className="d-flex align-items-center gap-3">
            <span className="badge bg-success d-flex align-items-center gap-1">
              <span className="material-symbols-outlined fs-6" style={{ fontVariationSettings: "'FILL' 1" }}>wifi</span>
              ESP32 Conectado
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
};
