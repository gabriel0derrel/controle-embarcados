import React from 'react';

interface NavbarProps {
  activeScreen: 'inicio' | 'jogo' | 'resultado';
  onNavigate: (screen: 'inicio' | 'jogo' | 'resultado') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeScreen, onNavigate }) => {
  return (
    <nav className="navbar navbar-expand-md navbar-light bg-white fixed-top shadow-sm border-bottom" style={{ backgroundColor: '#ffffff' }}>
      <div className="container-fluid px-2 px-md-3">
        {/* Logo / Marca */}
        <a 
          className="navbar-brand fw-bold text-primary" 
          href="#"
          onClick={(e) => { e.preventDefault(); onNavigate('inicio'); }}
        >
          Genius IoT
        </a>

        {/* Botão de Toggle (Menu Mobile) */}
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

        {/* Links de Navegação */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-md-0 ms-4">
            <li className="nav-item">
              <a 
                className={`nav-link ${activeScreen === 'inicio' ? 'active fw-bold text-dark' : 'text-secondary'}`} 
                href="#"
                onClick={(e) => { e.preventDefault(); onNavigate('inicio'); }}
              >
                Início
              </a>
            </li>
            <li className="nav-item">
              <a 
                className={`nav-link ${activeScreen === 'jogo' ? 'active fw-bold text-dark' : 'text-secondary'}`} 
                href="#"
                onClick={(e) => { e.preventDefault(); onNavigate('jogo'); }}
              >
                Jogo
              </a>
            </li>
            <li className="nav-item">
              <a 
                className={`nav-link ${activeScreen === 'resultado' ? 'active fw-bold text-dark' : 'text-secondary'}`} 
                href="#"
                onClick={(e) => { e.preventDefault(); onNavigate('resultado'); }}
              >
                Ranking
              </a>
            </li>
          </ul>

          {/* Perfil do Usuário à Direita */}
          <div className="d-flex align-items-center gap-3">
            <a href="#" className="text-secondary" title="Minha Conta">
              <i className="bi bi-person-circle fs-4"></i>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};
